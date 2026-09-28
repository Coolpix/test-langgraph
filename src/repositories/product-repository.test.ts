import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { InMemoryProductRepository } from "./product-repository.js";
import type { Product } from "../domain/product.js";

function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: "id-1",
    sku: "SKU-1",
    name: "Product 1",
    price: 10,
    stock: 5,
    active: true,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("InMemoryProductRepository", () => {
  let repo: InMemoryProductRepository;

  beforeEach(() => {
    repo = new InMemoryProductRepository();
  });

  it("creates and finds a product by id", () => {
    const product = makeProduct();

    const created = repo.create(product);

    assert.equal(created, product);
    assert.equal(repo.findById(product.id), product);
  });

  it("returns undefined when product is not found by id", () => {
    assert.equal(repo.findById("missing"), undefined);
  });

  it("finds a product by sku", () => {
    const product = makeProduct({ sku: "ABC-123" });
    repo.create(product);

    assert.equal(repo.findBySku("ABC-123"), product);
  });

  it("returns undefined when product is not found by sku", () => {
    assert.equal(repo.findBySku("missing"), undefined);
  });

  it("finds all products", () => {
    const p1 = makeProduct({ id: "1", sku: "SKU-1" });
    const p2 = makeProduct({ id: "2", sku: "SKU-2" });
    repo.create(p1);
    repo.create(p2);

    const all = repo.findAll();

    assert.equal(all.length, 2);
    assert.ok(all.includes(p1));
    assert.ok(all.includes(p2));
  });

  it("updates a product", () => {
    const product = makeProduct();
    repo.create(product);
    const updated = makeProduct({ ...product, name: "Updated" });

    const result = repo.update(product.id, updated);

    assert.equal(result.name, "Updated");
    assert.equal(repo.findById(product.id)?.name, "Updated");
  });

  it("deletes a product", () => {
    const product = makeProduct();
    repo.create(product);

    repo.delete(product.id);

    assert.equal(repo.findById(product.id), undefined);
  });
});
