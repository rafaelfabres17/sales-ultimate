import { createResponder } from "#base";
import { productService } from "#database";
import { icon, res } from "#functions";
import { menus } from "#menus";
import { ResponderType } from "@constatic/base";
import { createLinkButton, findChannel } from "@magicyan/discord";
import { ChannelType } from "discord.js";

createResponder({
  customId: "/buy/:productId",
  types: [ResponderType.Button],
  cache: "cached",
  async run(interaction, { productId }) {
    await interaction.deferUpdate();

    const product = await productService.get(productId);
    if (!product) {
      await interaction.followUp(
        res.warning(`${icon.warning} Esse produto não está cadastrado.`),
      );
      return;
    }

    if (product.stock.length == 0) {
      await interaction.followUp(
        res.warning(
          `${icon.warning} Esse produto está sem estoque atualmente.`,
        ),
      );
      return;
    }

    const { guild, member } = interaction;

    const alreadyExists = findChannel(guild, ChannelType.GuildText).byName(
      `carrinho-${member.id}`,
    );

    if (alreadyExists) {
      await interaction.followUp(
        res.primary(
          `${icon.info} Você já possui um carrinho em andamento.`,
          createLinkButton({
            url: alreadyExists.url,
            label: "Ir para Carrinho",
          }),
        ),
      );
      return;
    }

    const cartCreated = await guild.channels.create({
      name: `carrinho-${member.id}`,
      permissionOverwrites: [
        {
          id: guild.roles.everyone.id,
          deny: ["ViewChannel", "SendMessages"],
        },
        {
          id: member.id,
          allow: ["ViewChannel"],
        },
      ],
    });

    const INIT_PRICE = product.price;
    const INIT_ITEMS = 1;

    const message = await cartCreated.send(
      menus.product.cart({
        product,
        items: INIT_ITEMS,
        price: INIT_PRICE,
      }),
    );

    await interaction.followUp(
      res.success(
        `${icon.check} Seu carrinho foi iniciado com sucesso.`,
        createLinkButton({
          url: message.url,
          label: "Ir para Carrinho",
        }),
      ),
    );
  },
});
