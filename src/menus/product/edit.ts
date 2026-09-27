import { ProductSchema } from "#database";
import { formatPrice, icon } from "#functions";
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

export function productEditMenu<R>(data: ProductSchema): R {
  const customId = (action: string) => `/product/${data.id}/edit/${action}`;

  const container = createContainer(
    constants.colors.primary,
    `# ${icon.cart} Informações sobre o Produto`,
    Separator.Default,
    createSection(
      brBuilder(`## ${icon.string} Nome`, data.name),
      new ButtonBuilder({
        customId: customId("name"),
        style: ButtonStyle.Primary,
        emoji: icon.pencil,
      }),
    ),
    createSection(
      brBuilder(`## ${icon.dollar} Preço`, formatPrice(data.price)),
      new ButtonBuilder({
        customId: customId("price"),
        style: ButtonStyle.Primary,
        emoji: icon.pencil,
      }),
    ),
    createSection(
      brBuilder(`## ${icon.truck} Estoque`, "Modificar o estoque do produto"),
      new ButtonBuilder({
        customId: customId("stock"),
        style: ButtonStyle.Primary,
        emoji: icon.pencil,
      }),
    ),
  );

  return {
    flags: ["Ephemeral", "IsComponentsV2"],
    components: [container],
  } satisfies InteractionReplyOptions as R;
}
