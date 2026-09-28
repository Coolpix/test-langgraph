import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { InMemoryProductRepository } from "./product-repository.js";
import type { Product } from "../domain/product.js";

const makeProduct = (overrides: Partial<Product> = {}): Product => ({
  id: "p1",
  sku: "SKU-001",
  name: "Test",
  price: 10,
  stock: 5,
  active: true,
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
  ...overrides,
});

describe("InMemoryProductRepository", () => {
  let repository: InMemoryProductRepository;

  beforeEach(() => {
    repository = new InMemoryProductRepository();
  });

  it("creates and returns a product", () => {
    const product = makeProduct();

    assert.deepEqual(repository.create(product), product);
    assert.equal(repository.findAll().length, 1);
  });

  it("finds all stored products", () => {
    repository.create(makeProduct({ id: "p1", sku: "SKU-001" }));
    repository.create(makeProduct({ id: "p2", sku: "SKU-002" }));

    assert.equal(repository.findAll().length, 2);
  });

  it("finds a product by id", () => {
    const product = makeProduct({ id: "p1" });
    repository.create(product);

    assert.deepEqual(repository.findById("p1"), product);
    assert.equal(repository.findById("missing"), undefined);
  });

  it("finds a product by sku", () => {
    const product = makeProduct({ sku: "SKU-001" });
    repository.create(product);

    assert.deepEqual(repository.findBySku("SKU-001"), product);
    assert.equal(repository.findBySku("SKU-999"), undefined);
  });

  it("updates a product", () => {
    repository.create(makeProduct({ id: "p1", name: "Old" }));
    const updated = repository.update("p1", makeProduct({ id: "p1", name: "New" }));

    assert.equal(updated.name, "New");
    assert.equal(repository.findById("p1")?.name, "New");
  });

  it("deletes a product", () => {
    repository.create(makeProduct({ id: "p1" }));
    repository.delete("p1");

    assert.equal(repository.findById("p1"), undefined);
    assert.equal(repository.findAll().length, 0);
  });
});
