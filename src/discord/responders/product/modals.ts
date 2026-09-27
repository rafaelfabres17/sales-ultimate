import { client, createResponder } from "#base";
import { productService } from "#database";
import { addItem, formatPrice, icon, removeItem, res } from "#functions";
import { menus } from "#menus";
import { ResponderType } from "@constatic/base";
import { createLinkButton, modalFieldsToRecord } from "@magicyan/discord";
import { ChannelType, codeBlock } from "discord.js";
import { z } from "zod";

const createProductSchema = z.object({
  name: z.string(),
  price: z.coerce
    .number("O preço deve ser um número")
    .min(300, `O preço mínimo é de ${formatPrice(300)}`),
});

createResponder({
  customId: "/product/manage/:action",
  types: [ResponderType.ModalComponent],
  cache: "cached",
  parse: z.object({
    action: z.enum(["create", "edit", "display", "delete"]),
  }).parse,
  async run(interaction, { action }) {
    await interaction.update(
      res.primary(`${icon.spinning} Aguarde, estamos realizando essa ação...`),
    );

    const { fields } = interaction;

    switch (action) {
      case "create": {
        const result = modalFieldsToRecord(
          interaction,
          createProductSchema.safeParse,
        );
        if (!result.success) {
          const errors = z.prettifyError(result.error);
          await interaction.editReply(
            res.warning(
              `${icon.warning} Ocorreu um erro ao tentar validar os dados.`,
              errors,
            ),
          );
          return;
        }

        const { name, price } = result.data;
        const { product_id: productId } = await client.products.create({
          name,
          price: {
            currency: "BRL",
            price,
            type: "one_time_price",
          },
          tax_category: "digital_products",
        });

        await productService.set(productId, {
          id: productId,
          name,
          price,
          stock: [],
        });

        await interaction.editReply(
          res.success(
            `${icon.check} O produto foi criado com sucesso.`,
            codeBlock(productId),
          ),
        );
        return;
      }
      case "edit": {
        const id = fields.getTextInputValue("id");

        const product = await productService.get(id);
        if (!product) {
          await interaction.editReply(
            res.warning(`${icon.warning} Esse produto não está cadastrado.`),
          );
          return;
        }

        await interaction.editReply(menus.product.edit(product));
        return;
      }
      case "display": {
        const id = fields.getTextInputValue("id");

        const channel = fields
          .getSelectedChannels("channel", true, [ChannelType.GuildText])
          .first();
        if (!channel) {
          await interaction.editReply(
            res.warning(`${icon.warning} Esse canal não está mais disponível.`),
          );
          return;
        }

        const product = await productService.get(id);
        if (!product) {
          await interaction.editReply(
            res.warning(`${icon.warning} Esse produto não está cadastrado.`),
          );
          return;
        }

        const message = await channel.send(menus.product.buy(product));

        await interaction.editReply(menus.product.manage());
        await interaction.followUp(
          res.success(
            `${icon.check} O produto foi exibido com sucesso.`,
            createLinkButton({
              url: message.url,
              label: "Ir para Mensagem",
            }),
          ),
        );
        return;
      }
      case "delete": {
        const id = fields.getTextInputValue("id");

        const product = await productService.get(id);
        if (!product) {
          await interaction.editReply(
            res.warning(`${icon.warning} Esse produto não está cadastrado.`),
          );
          return;
        }

        await Promise.all([
          await client.products.archive(id),
          await productService.remove(id),
        ]).catch(async (err) => {
          console.log(err);
          await interaction.editReply(
            res.danger(
              `${icon.cancel} Ocorreu um erro ao tentar excluir o produto.`,
            ),
          );
        });

        await interaction.editReply(menus.product.manage());
        await interaction.followUp(
          res.success(`${icon.check} O produto foi excluído com sucesso.`),
        );
        return;
      }
    }
  },
});

createResponder({
  customId: "/product/:id/:action/:arg",
  types: [ResponderType.ModalComponent],
  cache: "cached",
  parse: z.object({
    id: z.string(),
    action: z.enum(["edit", "stock"]),
    arg: z.enum(["name", "price", "add", "remove"]),
  }).parse,
  async run(interaction, { id, action, arg }) {
    await interaction.update(
      res.primary(`${icon.spinning} Aguarde, estamos realizando essa ação...`),
    );

    const product = await productService.get(id);
    if (!product) {
      await interaction.editReply(
        res.warning(`${icon.warning} Esse produto não está cadastrado.`),
      );
      return;
    }

    const { fields } = interaction;

    switch (action) {
      case "edit": {
        switch (arg) {
          case "name": {
            const value = fields.getTextInputValue(arg);
            const newDoc = {
              ...product,
              [arg]: value,
            };

            await Promise.all([
              await client.products.update(id, { [arg]: value }),
              await productService.update(id, newDoc),
            ]).catch(async (err) => {
              console.log(err);
              await interaction.editReply(
                res.danger(
                  `${icon.cancel} Ocorreu um erro ao tentar atualizar o produto.`,
                ),
              );
            });

            await interaction.editReply(menus.product.edit(newDoc));
            return;
          }
          case "price": {
            const parsed = z.coerce
              .number("O preço deve ser um número")
              .min(300, `O preço mínimo é de ${formatPrice(300)}`)
              .safeParse(fields.getTextInputValue(arg));

            if (!parsed.success) {
              const errors = z.prettifyError(parsed.error);

              await interaction.editReply(menus.product.edit(product));
              await interaction.followUp(
                res.warning(
                  `${icon.warning} Ocorreu um erro ao tentar validar o preço.`,
                  errors,
                ),
              );
              return;
            }

            const newDoc = {
              ...product,
              [arg]: parsed.data,
            };

            await Promise.all([
              await client.products.update(id, {
                price: {
                  currency: "BRL",
                  price: parsed.data,
                  type: "one_time_price",
                },
              }),
              await productService.update(id, newDoc),
            ]).catch(async (err) => {
              console.log(err);
              await interaction.editReply(
                res.danger(
                  `${icon.cancel} Ocorreu um erro ao tentar atualizar o produto.`,
                ),
              );
            });

            await interaction.editReply(menus.product.edit(newDoc));
            return;
          }
        }
      }
      case "stock": {
        const stock = product.stock;
        const item = fields.getTextInputValue("item");

        switch (arg) {
          case "add": {
            if (stock.includes(item)) {
              await interaction.editReply(menus.product.stock(product));
              await interaction.followUp(
                res.warning(
                  `${icon.warning} Esse item já está adicionado ao estoque.`,
                ),
              );
              return;
            }

            const newStock = addItem(stock, item);
            const newDoc = {
              ...product,
              [action]: newStock,
            };

            await productService.update(id, newDoc).catch(async (err) => {
              console.log(err);
              await interaction.editReply(
                res.danger(
                  `${icon.cancel} Ocorreu um erro ao tentar atualizar o estoque.`,
                ),
              );
            });

            await interaction.editReply(menus.product.stock(newDoc));
            return;
          }
          case "remove": {
            if (!stock.includes(item)) {
              await interaction.editReply(menus.product.stock(product));
              await interaction.followUp(
                res.warning(
                  `${icon.warning} Esse item não está adicionado ao estoque.`,
                ),
              );
              return;
            }

            const newStock = removeItem(stock, item);
            const newDoc = {
              ...product,
              [action]: newStock,
            };

            await productService.update(id, newDoc).catch(async (err) => {
              console.log(err);
              await interaction.editReply(
                res.danger(
                  `${icon.cancel} Ocorreu um erro ao tentar atualizar o estoque.`,
                ),
              );
            });

            await interaction.editReply(menus.product.stock(newDoc));
            return;
          }
        }
      }
    }
  },
});
