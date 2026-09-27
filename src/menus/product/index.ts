import { productBuyMenu } from "./buy.js";
import { productCartMenu } from "./cart.js";
import { productCheckoutMenu } from "./checkout.js";
import { productEditMenu } from "./edit.js";
import { productManageMenu } from "./manage.js";
import { productStockMenu } from "./stock.js";

export const productMenus = {
  manage: productManageMenu,
  edit: productEditMenu,
  stock: productStockMenu,
  buy: productBuyMenu,
  cart: productCartMenu,
  checkout: productCheckoutMenu,
};
