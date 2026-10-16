import { describe, it, beforeEach } from "node:test";
import assert from "node:assert";
import { InMemoryProductRepository } from "./product-repository.js";
import type { Product } from "../domain/product.js";

describe("InMemoryProductRepository", () => {
  let repository: InMemoryProductRepository;
  const sampleProduct: Product = {
    id: "p1",
    sku: "SKU-001",
    name: "Sample",
    price: 9.99,
    stock: 3,
    active: true,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  };

  beforeEach(() => {
    repository = new InMemoryProductRepository();
  });

  it("creates and stores a product", () => {
    const created = repository.create(sampleProduct);
    assert.strictEqual(created, sampleProduct);
    assert.strictEqual(repository.findById("p1"), sampleProduct);
  });

  it("returns all stored products", () => {
    repository.create(sampleProduct);
    repository.create({ ...sampleProduct, id: "p2", sku: "SKU-002", name: "Another" });
    const all = repository.findAll();
    assert.strictEqual(all.length, 2);
  });

  it("finds a product by SKU", () => {
    repository.create(sampleProduct);
    const found = repository.findBySku("SKU-001");
    assert.strictEqual(found, sampleProduct);
  });

  it("returns undefined when id is not found", () => {
    assert.strictEqual(repository.findById("missing"), undefined);
  });

  it("returns undefined when SKU is not found", () => {
    assert.strictEqual(repository.findBySku("MISSING"), undefined);
  });

  it("updates a stored product", () => {
    repository.create(sampleProduct);
    const updated: Product = { ...sampleProduct, name: "Updated" };
    repository.update("p1", updated);
    assert.strictEqual(repository.findById("p1")?.name, "Updated");
  });

  it("deletes a stored product", () => {
    repository.create(sampleProduct);
    repository.delete("p1");
    assert.strictEqual(repository.findById("p1"), undefined);
  });
});
