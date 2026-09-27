import { ProductSchema } from "#database";
import { icon } from "#functions";
import {
  brBuilder,
  createContainer,
  createSection,
  Separator,
} from "@magicyan/discord";
import {
  ButtonBuilder,
  ButtonStyle,
  type InteractionReplyOptions,
} from "discord.js";

export function productStockMenu<R>(data: ProductSchema): R {
  const customId = (action: string) => `/product/${data.id}/stock/${action}`;

  const container = createContainer(
    constants.colors.primary,
    `# ${icon.truck} Informações sobre o Estoque`,
    Separator.Default,
    createSection(
      brBuilder(`## ${icon.add} Adicionar`, "Adicionar um item ao estoque"),
      new ButtonBuilder({
        customId: customId("add"),
        style: ButtonStyle.Success,
        emoji: icon.add,
      }),
    ),
    createSection(
      brBuilder(
        `## ${icon.show} Visualizar`,
        "Visualizar o estoque disponível",
      ),
      new ButtonBuilder({
        customId: customId("view"),
        style: ButtonStyle.Primary,
        emoji: icon.show,
        disabled: data.stock.length == 0,
      }),
    ),
    createSection(
      brBuilder(`## ${icon.remove} Remover`, "Remover um item do estoque"),
      new ButtonBuilder({
        customId: customId("remove"),
        style: ButtonStyle.Danger,
        emoji: icon.remove,
        disabled: data.stock.length == 0,
      }),
    ),
    createSection(
      brBuilder(`## ${icon.previous} Voltar`, "Voltar para o menu principal"),
      new ButtonBuilder({
        customId: customId("back"),
        style: ButtonStyle.Secondary,
        emoji: icon.previous,
      }),
    ),
  );

  return {
    flags: ["Ephemeral", "IsComponentsV2"],
    components: [container],
  } satisfies InteractionReplyOptions as R;
}
