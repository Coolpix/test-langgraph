import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { Product } from "../domain/product.js";
import { InMemoryProductRepository } from "./product-repository.js";

describe("InMemoryProductRepository", () => {
  const sampleProduct = (): Product => ({
    id: "p-1",
    sku: "SKU-1",
    name: "Sample",
    price: 9.99,
    stock: 5,
    active: true,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  });

  it("creates and stores a product", () => {
    const repo = new InMemoryProductRepository();
    const product = sampleProduct();

    const created = repo.create(product);

    assert.strictEqual(created, product);
    assert.strictEqual(repo.findById(product.id), product);
    assert.deepStrictEqual(repo.findAll(), [product]);
  });

  it("finds a product by SKU", () => {
    const repo = new InMemoryProductRepository();
    const product = sampleProduct();
    repo.create(product);

    assert.strictEqual(repo.findBySku(product.sku), product);
    assert.strictEqual(repo.findBySku("UNKNOWN"), undefined);
  });

  it("updates an existing product", () => {
    const repo = new InMemoryProductRepository();
    const product = sampleProduct();
    repo.create(product);
    const updated: Product = { ...product, name: "Updated name" };

    const result = repo.update(product.id, updated);

    assert.strictEqual(result, updated);
    assert.strictEqual(repo.findById(product.id)?.name, "Updated name");
  });

  it("deletes a product", () => {
    const repo = new InMemoryProductRepository();
    const product = sampleProduct();
    repo.create(product);

    repo.delete(product.id);

    assert.strictEqual(repo.findById(product.id), undefined);
    assert.deepStrictEqual(repo.findAll(), []);
  });
});
