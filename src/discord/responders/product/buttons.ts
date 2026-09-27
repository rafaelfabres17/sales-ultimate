import { createResponder } from "#base";
import { productService } from "#database";
import { icon, res } from "#functions";
import { menus } from "#menus";
import { ResponderType } from "@constatic/base";
import {
  brBuilder,
  createLabel,
  createModalFields,
  createTextInput,
} from "@magicyan/discord";
import { ChannelSelectMenuBuilder, ChannelType, codeBlock } from "discord.js";
import { z } from "zod";

createResponder({
  customId: "/product/manage/:action",
  types: [ResponderType.Button],
  cache: "cached",
  parse: z.object({
    action: z.enum(["create", "edit", "display", "delete"]),
  }).parse,
  async run(interaction, { action }) {
    const { customId } = interaction;

    switch (action) {
      case "create": {
        await interaction.showModal({
          customId,
          title: "Criação de Produto",
          components: createModalFields(
            "- Sempre escrevar o preço em centavos.",
            createLabel(
              "Nome",
              "Por favor, informe um nome para o produto",
              createTextInput({
                customId: "name",
                placeholder: "Informe o nome aqui...",
                minLength: 1,
                maxLength: 100,
                required,
              }),
            ),
            createLabel(
              "Preço",
              "Por favor, informe um preço para o produto",
              createTextInput({
                customId: "price",
                placeholder: "Informe o preço aqui...",
                minLength: 1,
                maxLength: 10,
                required,
              }),
            ),
          ),
        });
        return;
      }
      case "edit": {
        await interaction.showModal({
          customId,
          title: "Edição de Produto",
          components: createModalFields(
            createLabel(
              "ID",
              "Por favor, informe o ID do produto",
              createTextInput({
                customId: "id",
                placeholder: "Informe o ID aqui...",
                minLength: 1,
                maxLength: 25,
                required,
              }),
            ),
          ),
        });
        return;
      }
      case "display": {
        await interaction.showModal({
          customId,
          title: "Exibição de Produto",
          components: createModalFields(
            createLabel(
              "ID",
              "Por favor, informe o ID do produto",
              createTextInput({
                customId: "id",
                placeholder: "Informe o ID aqui...",
                minLength: 1,
                maxLength: 25,
                required,
              }),
            ),
            createLabel(
              "Canal",
              "Por favor, selecione um canal",
              new ChannelSelectMenuBuilder({
                customId: "channel",
                channelTypes: [ChannelType.GuildText],
              }),
            ),
          ),
        });
        return;
      }
      case "delete": {
        await interaction.showModal({
          customId,
          title: "Exclusão de Produto",
          components: createModalFields(
            createLabel(
              "ID",
              "Por favor, informe o ID do produto",
              createTextInput({
                customId: "id",
                placeholder: "Informe o ID aqui...",
                minLength: 1,
                maxLength: 25,
                required,
              }),
            ),
          ),
        });
        return;
      }
    }
  },
});

createResponder({
  customId: "/product/:id/:action/:arg",
  types: [ResponderType.Button],
  cache: "cached",
  parse: z.object({
    id: z.string(),
    action: z.enum(["edit", "stock"]),
    arg: z.enum(["name", "price", "stock", "add", "view", "remove", "back"]),
  }).parse,
  async run(interaction, { id, action, arg }) {
    const { customId } = interaction;

    switch (action) {
      case "edit": {
        switch (arg) {
          case "name":
          case "price": {
            const title = arg == "name" ? "Edição de Nome" : "Edição de Preço";
            const label = arg == "name" ? "Nome" : "Preço";
            const placeholder =
              arg == "name"
                ? "Por favor, informe um novo nome para o produto."
                : "Por favor, informe um novo preço para o produto.";
            const maxLength = arg == "name" ? 100 : 10;

            await interaction.showModal({
              customId,
              title,
              components: createModalFields(
                createLabel(
                  label,
                  placeholder,
                  createTextInput({
                    customId: arg,
                    minLength: 1,
                    maxLength,
                    required,
                  }),
                ),
              ),
            });
            return;
          }
          case "stock": {
            await interaction.update(
              res.primary(
                `${icon.spinning} Aguarde, estamos buscando os dados...`,
              ),
            );

            const product = await productService.get(id);
            if (!product) {
              await interaction.editReply(
                res.warning(
                  `${icon.warning} Esse produto não está cadastrado.`,
                ),
              );
              return;
            }

            await interaction.editReply(menus.product.stock(product));
            return;
          }
        }
      }
      case "stock": {
        switch (arg) {
          case "add":
          case "remove": {
            const title =
              arg == "add" ? "Adição de Estoque" : "Remoção de Estoque";
            const placeholder =
              arg == "add"
                ? "Por favor, informe o item que será adicionado"
                : "Por favor informe o item que será removido";

            await interaction.showModal({
              customId,
              title,
              components: createModalFields(
                createLabel(
                  "Item",
                  placeholder,
                  createTextInput({
                    customId: "item",
                    minLength: 1,
                    maxLength: 1000,
                    required,
                  }),
                ),
              ),
            });
            return;
          }
          case "view": {
            await interaction.update(
              res.primary(
                `${icon.spinning} Aguarde, estamos buscando os dados...`,
              ),
            );

            const product = await productService.get(id);
            if (!product) {
              await interaction.editReply(
                res.warning(
                  `${icon.warning} Esse produto não está cadastrado.`,
                ),
              );
              return;
            }

            const stock = product.stock.map((item) => `📦 - ${item}`);
            const content = brBuilder(stock);

            await interaction.editReply(menus.product.stock(product));
            await interaction.followUp(res.primary(codeBlock(content)));
            return;
          }
          case "back": {
            await interaction.update(
              res.primary(
                `${icon.spinning} Aguarde, estamos buscando os dados...`,
              ),
            );

            const product = await productService.get(id);
            if (!product) {
              await interaction.editReply(
                res.warning(
                  `${icon.warning} Esse produto não está cadastrado.`,
                ),
              );
              return;
            }

            await interaction.editReply(menus.product.edit(product));
            return;
          }
        }
      }
    }
  },
});
