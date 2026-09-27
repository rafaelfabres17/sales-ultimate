import { client, createResponder } from "#base";
import { productService } from "#database";
import { icon, res } from "#functions";
import { ResponderType } from "@constatic/base";
import { brBuilder, Separator, sleep, toMs } from "@magicyan/discord";
import { codeBlock } from "discord.js";
import { z } from "zod";

createResponder({
  customId: "/payment/:productId/:sessionId/:action/:items",
  types: [ResponderType.Button],
  cache: "cached",
  parse: z.object({
    productId: z.string(),
    sessionId: z.string(),
    action: z.enum(["confirm", "cancel"]),
    items: z.coerce.number(),
  }).parse,
  async run(interaction, { productId, sessionId, action, items }) {
    await interaction.deferUpdate();

    const { channel } = interaction;

    const product = await productService.get(productId);
    if (!product) {
      await interaction.followUp(
        res.warning(
          `${icon.warning} Esse produto não está cadastrado.`,
          "-# Esse carrinho será excluído em 30 segundos.",
        ),
      );
      await sleep(toMs(30, "seconds"));
      channel?.delete().catch(null);
      return;
    }

    const { payment_status } =
      await client.checkoutSessions.retrieve(sessionId);

    switch (action) {
      case "confirm": {
        if (payment_status !== "succeeded") {
          await interaction.followUp(
            res.primary(`${icon.info} O pagamento ainda não foi confirmado.`),
          );
          return;
        }

        const itemsToDelivery = product.stock.splice(0, items);
        const content = itemsToDelivery.map((item) => `📦 - ${item}`);

        await interaction.editReply(
          res.primary(
            `# ${icon.check} Pagamento aprovado com sucesso`,
            "Você tem 15min para salvar o seu pedido.",
            Separator.Large,
            codeBlock(brBuilder(content)),
          ),
        );
        await productService.update(product.id, {
          ...product,
          stock: product.stock,
        });
        await sleep(toMs(15, "minutes"));
        channel?.delete().catch(null);
        return;
      }
      case "cancel": {
        await interaction.editReply(
          res.warning(
            `${icon.warning} O pagamento foi cancelado pelo usuário.`,
            "-# Esse carrinho será excluído em 30 segundos.",
          ),
        );
        await sleep(toMs(30, "seconds"));
        channel?.delete().catch(null);
        return;
      }
    }
  },
});
