import { ProductSchema } from "#database";
import { formatPrice, formatStock, icon } from "#functions";
import {
  brBuilder,
  capitalize,
  createContainer,
  Separator,
} from "@magicyan/discord";
import {
  ButtonBuilder,
  ButtonStyle,
  type InteractionReplyOptions,
} from "discord.js";

export function productBuyMenu<R>(data: ProductSchema): R {
  const container = createContainer(
    constants.colors.primary,
    `# ${icon.cart} ${capitalize(data.name)}`,
    Separator.Default,
    brBuilder(
      `## ${icon.dollar} Preço`,
      formatPrice(data.price),
      `## ${icon.truck} Estoque`,
      formatStock(data.stock),
    ),
    Separator.Default,
    new ButtonBuilder({
      customId: `/buy/${data.id}`,
      style: ButtonStyle.Success,
      label: "Comprar Agora",
      emoji: icon.cart,
    }),
  );

  return {
    flags: ["Ephemeral", "IsComponentsV2"],
    components: [container],
  } satisfies InteractionReplyOptions as R;
}
