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

export function productManageMenu<R>(): R {
  const customId = (action: string) => `/product/manage/${action}`;

  const container = createContainer(
    constants.colors.primary,
    `# ${icon.cart} Gerenciamento de Produto(s)`,
    Separator.Default,
    createSection(
      brBuilder(`## ${icon.add} Criar`, "Criar um Produto"),
      new ButtonBuilder({
        customId: customId("create"),
        style: ButtonStyle.Success,
        emoji: icon.add,
      }),
    ),
    createSection(
      brBuilder(`## ${icon.pencil} Editar`, "Editar um Produto"),
      new ButtonBuilder({
        customId: customId("edit"),
        style: ButtonStyle.Primary,
        emoji: icon.pencil,
      }),
    ),
    createSection(
      brBuilder(`## ${icon.show} Exibir`, "Exibir um Produto"),
      new ButtonBuilder({
        customId: customId("display"),
        style: ButtonStyle.Secondary,
        emoji: icon.show,
      }),
    ),
    createSection(
      brBuilder(`## ${icon.trash} Excluir`, "Excluir um Produto"),
      new ButtonBuilder({
        customId: customId("delete"),
        style: ButtonStyle.Danger,
        emoji: icon.trash,
      }),
    ),
  );

  return {
    flags: ["Ephemeral", "IsComponentsV2"],
    components: [container],
  } satisfies InteractionReplyOptions as R;
}
