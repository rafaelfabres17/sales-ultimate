import { client, createResponder } from "#base";
import { productService } from "#database";
import { icon, res } from "#functions";
import { menus } from "#menus";
import { ResponderType } from "@constatic/base";
import { sleep, toMs } from "@magicyan/discord";
import { z } from "zod";

createResponder({
  customId: "/purchase/:id/:action/:items",
  types: [ResponderType.Button],
  cache: "cached",
  parse: z.object({
    id: z.string(),
    action: z.enum(["confirm", "cancel"]),
    items: z.coerce.number(),
  }).parse,
  async run(interaction, { id, action, items }) {
    await interaction.deferUpdate();

    const { channel } = interaction;

    const product = await productService.get(id);
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

    switch (action) {
      case "confirm": {
        const { checkout_url, session_id } =
          await client.checkoutSessions.create({
            product_cart: [
              {
                product_id: product.id,
                quantity: items,
              },
            ],
            allowed_payment_method_types: [
              "pix",
              "apple_pay",
              "google_pay",
              "credit",
            ],
            billing_currency: "BRL",
            customization: {
              theme: "dark",
            },
          });

        await interaction.editReply(
          menus.product.checkout({
            product,
            checkout_url: String(checkout_url),
            session_id,
            items,
          }),
        );
        return;
      }
      case "cancel": {
        await interaction.editReply(
          res.warning(
            `${icon.warning} O carrinho foi cancelado pelo usuário.`,
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
