import { DatabaseSchema, db } from "#database";

async function get(id: string) {
  const document = await db.products.get(db.products.id(id));
  return document?.data;
}

type SetData = DatabaseSchema["products"]["AssignData"];
async function set(id: string, data: SetData) {
  return await db.products.set(db.products.id(id), data);
}

type UpdateData = DatabaseSchema["products"]["UpdateData"];
async function update(id: string, data: UpdateData) {
  return await db.products.update(db.products.id(id), data);
}

async function remove(id: string) {
  return await db.products.remove(db.products.id(id));
}

export const productService = {
  get,
  set,
  update,
  remove,
};
