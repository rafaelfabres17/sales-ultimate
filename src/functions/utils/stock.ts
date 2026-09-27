export function addItem(stock: string[], item: string) {
  return [...stock, item];
}

export function removeItem(stock: string[], item: string) {
  return stock.filter((x) => x !== item);
}
