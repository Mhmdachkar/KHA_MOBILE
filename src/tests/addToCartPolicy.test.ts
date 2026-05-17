import { describe, it, expect } from "vitest";
import { getAddToCartAction } from "@/lib/addToCartPolicy";

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
});
