export type StockBadgeKind = "in_stock" | "low_stock" | "out_of_stock" | "preorder" | "unlimited";

export interface StockBadgeInfo {
  kind: StockBadgeKind;
  label: string;
  className: string;
  canPurchase: boolean;
}

export function getStockBadgeInfo(
  stockQuantity: number | null | undefined,
  isPreorder?: boolean
): StockBadgeInfo {
  if (isPreorder) {
    return {
      kind: "preorder",
      label: "Pre-order",
      className: "text-violet-700 bg-violet-50 border-violet-200",
      canPurchase: true,
    };
  }
  if (stockQuantity == null) {
    return {
      kind: "unlimited",
      label: "In Stock",
      className: "text-green-700 bg-green-50 border-green-200",
      canPurchase: true,
    };
  }
  if (stockQuantity === 0) {
    return {
      kind: "out_of_stock",
      label: "Out of Stock",
      className: "text-red-700 bg-red-50 border-red-200",
      canPurchase: false,
    };
  }
  if (stockQuantity <= 5) {
    return {
      kind: "low_stock",
      label: `Low Stock (${stockQuantity})`,
      className: "text-amber-700 bg-amber-50 border-amber-200",
      canPurchase: true,
    };
  }
  return {
    kind: "in_stock",
    label: "In Stock",
    className: "text-green-700 bg-green-50 border-green-200",
    canPurchase: true,
  };
}
