import { env } from "#env";
import { cert, initializeApp } from "firebase-admin/app";
import fs from "node:fs";
import { schema, Typesaurus } from "typesaurus";
import { ProductDocument } from "./documents/ProductDocument.js";

const accountFile = fs.readFileSync(env.FIREBASE_PATH, {
  encoding: "utf-8",
});

initializeApp({
  credential: cert(JSON.parse(accountFile)),
});

export const db = schema(({ collection }) => ({
  products: collection<ProductDocument>(),
}));

export type DatabaseSchema = Typesaurus.Schema<typeof db>;
export type ProductSchema = DatabaseSchema["products"]["Data"];

export * from "./functions/product.js";
