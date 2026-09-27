export function formatPrice(amount: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amount / 100); // * Cents to Real
}

export function formatStock(stock: string[]) {
  return stock.length == 0
    ? "Vazio"
    : stock.length < 2
      ? "1 Item"
      : `${stock.length} Items`;
}
