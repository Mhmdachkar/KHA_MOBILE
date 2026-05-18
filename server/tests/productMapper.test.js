/**
 * Unit tests for server/lib/productMapper.js
 *
 * Tests:
 *  - bodyToRowColumns: field mapping, finiteOrNull, stripToUploadPath, gallery stripping
 *  - validateProductPayload (inline, mirrors server logic)
 *  - rowToPublicProduct: id resolution, image expansion, gallery merge
 */

import { describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import { bodyToRowColumns, rowToPublicProduct, storefrontIdFromRow } from "../lib/productMapper.js";

// ─── storefrontIdFromRow ──────────────────────────────────────────────────────

describe("storefrontIdFromRow", () => {
  it("returns legacy_override_id when set", () => {
    expect(storefrontIdFromRow({ id: 99, legacy_override_id: 42 })).toBe(42);
  });

  it("returns id when legacy_override_id is null", () => {
    expect(storefrontIdFromRow({ id: 99, legacy_override_id: null })).toBe(99);
  });

  it("returns id when legacy_override_id is undefined", () => {
    expect(storefrontIdFromRow({ id: 55 })).toBe(55);
  });
});

// ─── bodyToRowColumns ─────────────────────────────────────────────────────────

describe("bodyToRowColumns — price handling", () => {
  it("converts numeric price", () => {
    const result = bodyToRowColumns({ name: "A", price: 9.99, category: "Electronics" });
    expect(result.price).toBe(9.99);
  });

  it("converts string price to number", () => {
    const result = bodyToRowColumns({ name: "A", price: "29.99", category: "Electronics" });
    expect(result.price).toBe(29.99);
  });

  it("returns null for empty string price", () => {
    const result = bodyToRowColumns({ name: "A", price: "", category: "Electronics" });
    expect(result.price).toBeNull();
  });

  it("returns null for NaN price", () => {
    const result = bodyToRowColumns({ name: "A", price: "abc", category: "Electronics" });
    expect(result.price).toBeNull();
  });

  it("returns null for null price", () => {
    const result = bodyToRowColumns({ name: "A", price: null, category: "Electronics" });
    expect(result.price).toBeNull();
  });

  it("returns null for undefined price", () => {
    const result = bodyToRowColumns({ name: "A", category: "Electronics" });
    expect(result.price).toBeNull();
  });
});

describe("bodyToRowColumns — compare_at_price handling", () => {
  it("maps camelCase compareAtPrice", () => {
    const result = bodyToRowColumns({ name: "A", price: 50, compareAtPrice: 100, category: "X" });
    expect(result.compare_at_price).toBe(100);
  });

  it("returns null for empty compareAtPrice", () => {
    const result = bodyToRowColumns({ name: "A", price: 50, compareAtPrice: "", category: "X" });
    expect(result.compare_at_price).toBeNull();
  });

  it("returns null for null compareAtPrice", () => {
    const result = bodyToRowColumns({ name: "A", price: 50, compareAtPrice: null, category: "X" });
    expect(result.compare_at_price).toBeNull();
  });
});

describe("bodyToRowColumns — image URL stripping (stripToUploadPath)", () => {
  it("strips full https URL to relative /uploads/ path", () => {
    const result = bodyToRowColumns({
      name: "A", price: 10, category: "X",
      primaryImageUrl: "https://api.render.com/uploads/photo.jpg",
    });
    expect(result.primary_image_url).toBe("/uploads/photo.jpg");
  });

  it("keeps already-relative /uploads/ path unchanged", () => {
    const result = bodyToRowColumns({
      name: "A", price: 10, category: "X",
      primaryImageUrl: "/uploads/photo.jpg",
    });
    expect(result.primary_image_url).toBe("/uploads/photo.jpg");
  });

  it("keeps non-upload absolute URL unchanged", () => {
    const result = bodyToRowColumns({
      name: "A", price: 10, category: "X",
      primaryImageUrl: "https://cdn.example.com/img.png",
    });
    expect(result.primary_image_url).toBe("https://cdn.example.com/img.png");
  });

  it("accepts image field alias for primaryImageUrl", () => {
    const result = bodyToRowColumns({
      name: "A", price: 10, category: "X",
      image: "/uploads/thumb.jpg",
    });
    expect(result.primary_image_url).toBe("/uploads/thumb.jpg");
  });
});

describe("bodyToRowColumns — gallery images stripping", () => {
  it("strips full URLs in gallery array", () => {
    const result = bodyToRowColumns({
      name: "A", price: 10, category: "X",
      galleryImages: [
        "https://api.render.com/uploads/a.jpg",
        "https://api.render.com/uploads/b.jpg",
      ],
    });
    expect(result.gallery_images).toEqual(["/uploads/a.jpg", "/uploads/b.jpg"]);
  });

  it("filters empty strings from gallery", () => {
    const result = bodyToRowColumns({
      name: "A", price: 10, category: "X",
      galleryImages: ["/uploads/a.jpg", "", null, "/uploads/b.jpg"],
    });
    expect(result.gallery_images).toEqual(["/uploads/a.jpg", "/uploads/b.jpg"]);
  });

  it("defaults to empty array when no gallery", () => {
    const result = bodyToRowColumns({ name: "A", price: 10, category: "X" });
    expect(result.gallery_images).toEqual([]);
  });

  it("strips gallery URL from a different host (deployment host change edge case)", () => {
    const result = bodyToRowColumns({
      name: "A", price: 10, category: "X",
      galleryImages: [
        "https://old-host.onrender.com/uploads/photo.jpg",
        "https://new-host.netlify.app/uploads/other.jpg",
      ],
    });
    expect(result.gallery_images).toEqual(["/uploads/photo.jpg", "/uploads/other.jpg"]);
  });

  it("keeps non-upload CDN URLs in gallery unchanged", () => {
    const result = bodyToRowColumns({
      name: "A", price: 10, category: "X",
      galleryImages: ["https://cdn.example.com/image.png"],
    });
    expect(result.gallery_images).toEqual(["https://cdn.example.com/image.png"]);
  });
});

describe("bodyToRowColumns — rating clamping", () => {
  it("clamps rating above 5 to 5", () => {
    const result = bodyToRowColumns({ name: "A", price: 10, category: "X", rating: 9 });
    expect(result.rating).toBe(5);
  });

  it("clamps rating below 0 to 0", () => {
    const result = bodyToRowColumns({ name: "A", price: 10, category: "X", rating: -2 });
    expect(result.rating).toBe(0);
  });

  it("defaults to 4.5 for invalid rating", () => {
    const result = bodyToRowColumns({ name: "A", price: 10, category: "X", rating: "bad" });
    expect(result.rating).toBe(4.5);
  });

  it("accepts valid rating 4.5", () => {
    const result = bodyToRowColumns({ name: "A", price: 10, category: "X", rating: 4.5 });
    expect(result.rating).toBe(4.5);
  });
});

describe("bodyToRowColumns — flags and defaults", () => {
  it("defaults is_preorder to false", () => {
    expect(bodyToRowColumns({ name: "A", price: 10, category: "X" }).is_preorder).toBe(false);
  });

  it("defaults is_active to true", () => {
    expect(bodyToRowColumns({ name: "A", price: 10, category: "X" }).is_active).toBe(true);
  });

  it("maps isPreorder camelCase", () => {
    expect(bodyToRowColumns({ name: "A", price: 10, category: "X", isPreorder: true }).is_preorder).toBe(true);
  });

  it("maps isActive camelCase", () => {
    expect(bodyToRowColumns({ name: "A", price: 10, category: "X", isActive: false }).is_active).toBe(false);
  });

  it("defaults legacy_override_id to null", () => {
    expect(bodyToRowColumns({ name: "A", price: 10, category: "X" }).legacy_override_id).toBeNull();
  });

  it("maps legacyOverrideId", () => {
    expect(bodyToRowColumns({ name: "A", price: 10, category: "X", legacyOverrideId: 7 }).legacy_override_id).toBe(7);
  });

  it("defaults show_preorder_price to true when not preorder", () => {
    expect(bodyToRowColumns({ name: "A", price: 10, category: "X", isPreorder: false }).show_preorder_price).toBe(true);
  });

  it("defaults show_preorder_price to true when preorder and flag omitted", () => {
    expect(bodyToRowColumns({ name: "A", price: 10, category: "X", isPreorder: true }).show_preorder_price).toBe(true);
  });

  it("maps showPreorderPrice false when preorder", () => {
    expect(
      bodyToRowColumns({
        name: "A",
        price: 10,
        category: "X",
        isPreorder: true,
        showPreorderPrice: false,
      }).show_preorder_price
    ).toBe(false);
  });
});

// ─── validateProductPayload (inline mirror of server logic) ─────────────────

function validateProductPayload(c) {
  const errors = [];
  if (!c.name) errors.push("name is required");
  const price = c.price;
  if (price == null || !Number.isFinite(price) || price < 0) {
    errors.push(`valid price is required (received: ${JSON.stringify(price)})`);
  }
  if (c.is_preorder && price === 0) {
    errors.push("pre-order products cannot have a zero price");
  }
  if (!c.category) errors.push("category is required");
  if (c.compare_at_price != null && Number.isFinite(price) && c.compare_at_price <= price) {
    errors.push("compare_at_price must be greater than price when set");
  }
  // Variant key uniqueness
  if (Array.isArray(c.variants) && c.variants.length > 0) {
    const emptyKeys = c.variants.filter(v => !(v.key || '').trim());
    if (emptyKeys.length > 0) {
      errors.push(`all variant keys must be non-empty (${emptyKeys.length} variant(s) missing key)`);
    }
    const realKeys = c.variants.map(v => (v.key || '').trim()).filter(Boolean);
    if (new Set(realKeys).size !== realKeys.length) {
      errors.push('variant keys must be unique');
    }
  }
  // Color name uniqueness
  if (Array.isArray(c.colors) && c.colors.length > 0) {
    const names = c.colors.map(cl => (cl.name || '').trim()).filter(Boolean);
    if (new Set(names).size !== names.length) {
      errors.push('color names must be unique');
    }
  }
  // Size name uniqueness
  if (Array.isArray(c.sizes) && c.sizes.length > 0) {
    const names = c.sizes.map(s => (s.name || '').trim()).filter(Boolean);
    if (new Set(names).size !== names.length) {
      errors.push('size names must be unique');
    }
  }
  return errors;
}

describe("validateProductPayload (server BUG 2 fix)", () => {
  it("passes for valid product", () => {
    const c = bodyToRowColumns({ name: "Phone", price: 299, category: "Smartphones" });
    expect(validateProductPayload(c)).toEqual([]);
  });

  it("fails for missing name", () => {
    const c = bodyToRowColumns({ price: 10, category: "X" });
    expect(validateProductPayload(c)).toContain("name is required");
  });

  it("fails for null price", () => {
    const c = bodyToRowColumns({ name: "A", price: null, category: "X" });
    const errors = validateProductPayload(c);
    expect(errors.some((e) => e.includes("valid price"))).toBe(true);
  });

  it("error message includes received value", () => {
    const c = { name: "A", price: null, category: "X", is_preorder: false, compare_at_price: null };
    const errors = validateProductPayload(c);
    expect(errors[0]).toMatch(/received: null/);
  });

  it("fails for negative price", () => {
    const c = { name: "A", price: -1, category: "X", is_preorder: false, compare_at_price: null };
    const errors = validateProductPayload(c);
    expect(errors.some((e) => e.includes("valid price"))).toBe(true);
  });

  it("fails for missing category", () => {
    const c = bodyToRowColumns({ name: "A", price: 10 });
    expect(validateProductPayload(c)).toContain("category is required");
  });

  it("fails for preorder with zero price", () => {
    const c = bodyToRowColumns({ name: "A", price: 0, category: "X", isPreorder: true });
    expect(validateProductPayload(c)).toContain("pre-order products cannot have a zero price");
  });

  it("fails when compare_at_price <= price", () => {
    const c = bodyToRowColumns({ name: "A", price: 100, category: "X", compareAtPrice: 80 });
    const errors = validateProductPayload(c);
    expect(errors.some((e) => e.includes("compare_at_price"))).toBe(true);
  });

  it("passes when compare_at_price > price", () => {
    const c = bodyToRowColumns({ name: "A", price: 100, category: "X", compareAtPrice: 150 });
    expect(validateProductPayload(c)).toEqual([]);
  });

  it("passes when compare_at_price is null", () => {
    const c = bodyToRowColumns({ name: "A", price: 100, category: "X" });
    expect(validateProductPayload(c)).toEqual([]);
  });
});

// ─── validateProductPayload — variant/color/size uniqueness (Bug 6 fix) ──────

describe("validateProductPayload — variant/color/size uniqueness", () => {
  const base = { name: "A", price: 10, category: "X", is_preorder: false, compare_at_price: null };

  it("passes with unique variant keys", () => {
    const c = { ...base, variants: [{ key: "a" }, { key: "b" }] };
    expect(validateProductPayload(c)).toEqual([]);
  });

  it("fails when variant keys are empty", () => {
    const c = { ...base, variants: [{ key: "" }, { key: "b" }] };
    const errors = validateProductPayload(c);
    expect(errors.some(e => e.includes("non-empty"))).toBe(true);
  });

  it("fails when variant keys are duplicated", () => {
    const c = { ...base, variants: [{ key: "x" }, { key: "x" }] };
    const errors = validateProductPayload(c);
    expect(errors).toContain("variant keys must be unique");
  });

  it("passes with unique color names", () => {
    const c = { ...base, colors: [{ name: "Red" }, { name: "Blue" }] };
    expect(validateProductPayload(c)).toEqual([]);
  });

  it("fails when color names are duplicated", () => {
    const c = { ...base, colors: [{ name: "Black" }, { name: "Black" }] };
    const errors = validateProductPayload(c);
    expect(errors).toContain("color names must be unique");
  });

  it("passes with unique size names", () => {
    const c = { ...base, sizes: [{ name: "S" }, { name: "M" }] };
    expect(validateProductPayload(c)).toEqual([]);
  });

  it("fails when size names are duplicated", () => {
    const c = { ...base, sizes: [{ name: "L" }, { name: "L" }] };
    const errors = validateProductPayload(c);
    expect(errors).toContain("size names must be unique");
  });

  it("passes when no variants/colors/sizes", () => {
    expect(validateProductPayload(base)).toEqual([]);
  });
});

// ─── rowToPublicProduct ───────────────────────────────────────────────────────

const fakeReq = {
  get: (h) => (h === "host" ? "api.example.com" : null),
  protocol: "https",
};

const baseRow = {
  id: 1,
  legacy_override_id: null,
  name: "Test Product",
  title: "Test Title",
  description: "desc",
  price: "49.99",
  compare_at_price: null,
  primary_image_url: "/uploads/main.jpg",
  rating: "4.5",
  category: "Electronics",
  brand: null,
  video_url: null,
  is_preorder: false,
  show_preorder_price: true,
  is_active: true,
  features: [],
  specifications: [],
  variants: [],
  colors: [],
  sizes: [],
  connectivity_options: [],
  secondary_categories: [],
  gallery_images: [],
  stock_quantity: null,
};

describe("rowToPublicProduct", () => {
  let savedEnv;

  beforeEach(() => {
    savedEnv = process.env.API_PUBLIC_URL;
  });

  afterEach(() => {
    if (savedEnv === undefined) {
      delete process.env.API_PUBLIC_URL;
    } else {
      process.env.API_PUBLIC_URL = savedEnv;
    }
  });

  it("uses API_PUBLIC_URL to expand /uploads/ paths", () => {
    process.env.API_PUBLIC_URL = "https://api.render.com";
    const product = rowToPublicProduct(baseRow, fakeReq);
    expect(product.image).toBe("https://api.render.com/uploads/main.jpg");
  });

  it("falls back to request host when API_PUBLIC_URL not set", () => {
    delete process.env.API_PUBLIC_URL;
    const product = rowToPublicProduct(baseRow, fakeReq);
    expect(product.image).toBe("https://api.example.com/uploads/main.jpg");
  });

  it("maps price to number", () => {
    const product = rowToPublicProduct(baseRow, fakeReq);
    expect(product.price).toBe(49.99);
    expect(typeof product.price).toBe("number");
  });

  it("maps showPreorderPrice from row when false", () => {
    const row = { ...baseRow, is_preorder: true, show_preorder_price: false };
    const product = rowToPublicProduct(row, fakeReq);
    expect(product.isPreorder).toBe(true);
    expect(product.showPreorderPrice).toBe(false);
  });

  it("defaults showPreorderPrice true when column missing", () => {
    const row = { ...baseRow };
    delete row.show_preorder_price;
    const product = rowToPublicProduct(row, fakeReq);
    expect(product.showPreorderPrice).toBe(true);
  });

  it("sets id from dbId when no legacy_override_id", () => {
    const product = rowToPublicProduct(baseRow, fakeReq);
    expect(product.id).toBe(1);
    expect(product.dbId).toBe(1);
  });

  it("uses legacy_override_id as storefront id", () => {
    const row = { ...baseRow, id: 99, legacy_override_id: 7 };
    const product = rowToPublicProduct(row, fakeReq);
    expect(product.id).toBe(7);
    expect(product.dbId).toBe(99);
  });

  it("includes primary image in images array", () => {
    process.env.API_PUBLIC_URL = "https://api.render.com";
    const product = rowToPublicProduct(baseRow, fakeReq);
    expect(product.images).toContain("https://api.render.com/uploads/main.jpg");
  });

  it("merges gallery images deduplicating primary", () => {
    process.env.API_PUBLIC_URL = "https://api.render.com";
    const row = {
      ...baseRow,
      gallery_images: ["/uploads/main.jpg", "/uploads/extra.jpg"],
    };
    const product = rowToPublicProduct(row, fakeReq);
    const mainCount = product.images.filter(
      (u) => u === "https://api.render.com/uploads/main.jpg"
    ).length;
    expect(mainCount).toBe(1);
    expect(product.images).toContain("https://api.render.com/uploads/extra.jpg");
  });

  it("returns null compareAtPrice when not set", () => {
    const product = rowToPublicProduct(baseRow, fakeReq);
    expect(product.compareAtPrice).toBeNull();
  });

  it("returns numeric compareAtPrice when set", () => {
    const row = { ...baseRow, compare_at_price: "79.99" };
    const product = rowToPublicProduct(row, fakeReq);
    expect(product.compareAtPrice).toBe(79.99);
  });

  it("expands /uploads/ image URL inside colors JSONB array", () => {
    process.env.API_PUBLIC_URL = "https://api.render.com";
    const row = {
      ...baseRow,
      colors: [{ name: "Black", image: "/uploads/black.jpg", stock: "available" }],
    };
    const product = rowToPublicProduct(row, fakeReq);
    expect(product.colors[0].image).toBe("https://api.render.com/uploads/black.jpg");
  });

  it("expands /uploads/ image URL inside variants JSONB array", () => {
    process.env.API_PUBLIC_URL = "https://api.render.com";
    const row = {
      ...baseRow,
      variants: [{ key: "128gb", label: "128GB", price: 799, image: "/uploads/variant-128.jpg" }],
    };
    const product = rowToPublicProduct(row, fakeReq);
    expect(product.variants[0].image).toBe("https://api.render.com/uploads/variant-128.jpg");
  });

  it("leaves non-upload URLs inside colors unchanged", () => {
    process.env.API_PUBLIC_URL = "https://api.render.com";
    const row = {
      ...baseRow,
      colors: [{ name: "Red", image: "https://cdn.example.com/red.png" }],
    };
    const product = rowToPublicProduct(row, fakeReq);
    expect(product.colors[0].image).toBe("https://cdn.example.com/red.png");
  });

  it("handles colors JSONB with no image field gracefully", () => {
    process.env.API_PUBLIC_URL = "https://api.render.com";
    const row = {
      ...baseRow,
      colors: [{ name: "White", stock: "available" }],
    };
    const product = rowToPublicProduct(row, fakeReq);
    expect(product.colors[0].image).toBeUndefined();
  });
});
