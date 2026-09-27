import { ProductSchema } from "#database";
import { formatPrice, icon } from "#functions";
import {
  brBuilder,
  capitalize,
  createContainer,
  Separator,
  wrapButtons,
} from "@magicyan/discord";
import {
  ButtonBuilder,
  ButtonStyle,
  type InteractionReplyOptions,
} from "discord.js";

interface CartData {
  product: ProductSchema;
  price: number;
  items: number;
}

export function productCartMenu<R>(data: CartData): R {
  const container = createContainer(
    constants.colors.primary,
    `# ${icon.cart} ${capitalize(data.product.name)}`,
    Separator.Default,
    brBuilder(
      `## ${icon.card} Valor Total`,
      formatPrice(data.price),
      `## ${icon.truck} Item(s) há Receber`,
      formatItems(data.items),
    ),
    Separator.Default,
    wrapButtons(
      2,
      new ButtonBuilder({
        customId: `/item/${data.product.id}/add/${data.items}`,
        style: ButtonStyle.Success,
        label: "Adicionar Item",
        emoji: icon.add,
        disabled: data.items >= data.product.stock.length,
      }),
      new ButtonBuilder({
        customId: `/item/${data.product.id}/remove/${data.items}`,
        style: ButtonStyle.Danger,
        label: "Remover Item",
        emoji: icon.remove,
        disabled: data.items == 1,
      }),
      new ButtonBuilder({
        customId: `/purchase/${data.product.id}/confirm/${data.items}`,
        style: ButtonStyle.Success,
        label: "Confirmar Comprar",
        emoji: icon.check,
      }),
      new ButtonBuilder({
        customId: `/purchase/${data.product.id}/cancel/${data.items}`,
        style: ButtonStyle.Danger,
        label: "Cancelar Comprar",
        emoji: icon.cancel,
      }),
    ),
  );

  return {
    flags: ["Ephemeral", "IsComponentsV2"],
    components: [container],
  } satisfies InteractionReplyOptions as R;
}

function formatItems(amount: number) {
  return amount == 1 ? "1 Item" : `${amount} Items`;
}
