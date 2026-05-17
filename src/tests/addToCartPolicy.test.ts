import { describe, it, expect } from "vitest";
import {
  getAddToCartAction,
  showsInlineCardOptions,
  shortStorageLabel,
} from "@/lib/addToCartPolicy";

const base = { id: 1 };

describe("addToCartPolicy", () => {
  it("blocks out of stock", () => {
    expect(getAddToCartAction({ ...base, stockQuantity: 0 }, "grid").type).toBe("blocked");
  });

  it("redirects carousel when variants exist", () => {
    expect(
      getAddToCartAction({ ...base, variants: [{ key: "a", label: "A", price: 10 }] }, "carousel").type
    ).toBe("redirect_pdp");
  });

  it("opens picker on grid when variants exist", () => {
    expect(
      getAddToCartAction({ ...base, variants: [{ key: "a", label: "A", price: 10 }] }, "grid").type
    ).toBe("open_picker");
  });

  it("redirects when multiple colors on carousel", () => {
    expect(
      getAddToCartAction(
        {
          ...base,
          colors: [
            { name: "Black" },
            { name: "White" },
          ],
        },
        "carousel"
      ).type
    ).toBe("redirect_pdp");
  });

  it("allows direct add for simple product", () => {
    expect(getAddToCartAction({ ...base }, "grid").type).toBe("add_direct");
  });

  it("opens picker on grid for variant + multi-color smartphone", () => {
    expect(
      getAddToCartAction(
        {
          ...base,
          variants: [{ key: "128", label: "128GB", price: 800 }],
          colors: [{ name: "Black" }, { name: "White" }],
        },
        "grid"
      ).type
    ).toBe("open_picker");
  });

  it("uses inline card options on grid when choices exist", () => {
    const product = {
      ...base,
      variants: [{ key: "128", label: "128GB + 4GB RAM", price: 800, storage: "128GB" }],
      colors: [{ name: "Black" }, { name: "White" }],
    };
    expect(showsInlineCardOptions(product, "grid")).toBe(true);
    expect(showsInlineCardOptions(product, "carousel")).toBe(false);
  });

  it("shortStorageLabel prefers storage field", () => {
    expect(shortStorageLabel({ label: "128GB + 4GB RAM", storage: "128GB" })).toBe("128GB");
  });
});
