import { describe, it } from "node:test";
import assert from "node:assert";
import { InMemoryProductRepository } from "./product-repository.js";
import type { Product } from "../domain/product.js";

function sample(overrides: Partial<Product> = {}): Product {
  return {
    id: "id-1",
    sku: "SKU-1",
    name: "Sample",
    price: 9.99,
    stock: 5,
    active: true,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("InMemoryProductRepository", () => {
  it("stores and retrieves a product by id", () => {
    const repository = new InMemoryProductRepository();
    const product = sample();

    repository.create(product);

    assert.strictEqual(repository.findById("id-1"), product);
  });

  it("returns undefined for unknown id or sku", () => {
    const repository = new InMemoryProductRepository();

    assert.strictEqual(repository.findById("missing"), undefined);
    assert.strictEqual(repository.findBySku("MISSING"), undefined);
  });

  it("finds all created products", () => {
    const repository = new InMemoryProductRepository();

    repository.create(sample({ id: "1", sku: "A" }));
    repository.create(sample({ id: "2", sku: "B" }));

    assert.strictEqual(repository.findAll().length, 2);
  });

  it("finds a product by sku", () => {
    const repository = new InMemoryProductRepository();
    const product = sample({ id: "1", sku: "UNIQUE" });

    repository.create(product);

    assert.strictEqual(repository.findBySku("UNIQUE"), product);
  });

  it("updates an existing product", () => {
    const repository = new InMemoryProductRepository();
    repository.create(sample());

    repository.update("id-1", sample({ name: "Updated" }));

    assert.strictEqual(repository.findById("id-1")?.name, "Updated");
  });

  it("deletes a product", () => {
    const repository = new InMemoryProductRepository();
    repository.create(sample());

    repository.delete("id-1");

    assert.strictEqual(repository.findById("id-1"), undefined);
  });
});
