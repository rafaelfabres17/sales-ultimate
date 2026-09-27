import { ProductSchema } from "#database";
import { icon } from "#functions";
import {
  createContainer,
  createLinkButton,
  Separator,
  wrapButtons,
} from "@magicyan/discord";
import {
  ButtonBuilder,
  ButtonStyle,
  type InteractionReplyOptions,
} from "discord.js";

interface CheckoutData {
  product: ProductSchema;
  checkout_url: string;
  session_id: string;
  items: number;
}

export function productCheckoutMenu<R>(data: CheckoutData): R {
  const container = createContainer(
    constants.colors.primary,
    `# ${icon.card} Pagamento`,
    `-# Realize o pagamento do ${data.product.name}`,

    Separator.Default,
    wrapButtons(
      3,
      createLinkButton({
        url: data.checkout_url,
        label: "Ir para Checkout",
      }),
      new ButtonBuilder({
        customId: `/payment/${data.product.id}/${data.session_id}/confirm/${data.items}`,
        style: ButtonStyle.Success,
        label: "Confirmar Pagamento",
        emoji: icon.check,
      }),
      new ButtonBuilder({
        customId: `/payment/${data.product.id}/${data.session_id}/cancel/${data.items}`,
        style: ButtonStyle.Danger,
        label: "Cancelar Pagamento",
        emoji: icon.cancel,
      }),
    ),
  );

  return {
    flags: ["Ephemeral", "IsComponentsV2"],
    components: [container],
  } satisfies InteractionReplyOptions as R;
}
