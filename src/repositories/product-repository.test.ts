import { describe, it, beforeEach } from "node:test";
import assert from "node:assert";
import { InMemoryProductRepository } from "./product-repository.js";
import type { Product } from "../domain/product.js";

const baseProduct = (): Product => ({
  id: "p1",
  sku: "SKU-001",
  name: "Producto A",
  price: 19.99,
  stock: 10,
  active: true,
  createdAt: "2024-01-01T00:00:00.000Z",
  updatedAt: "2024-01-01T00:00:00.000Z",
});

describe("InMemoryProductRepository", () => {
  let repository: InMemoryProductRepository;

  beforeEach(() => {
    repository = new InMemoryProductRepository();
  });

  it("guarda y recupera un producto por id", () => {
    const product = baseProduct();
    repository.create(product);
    assert.deepStrictEqual(repository.findById("p1"), product);
  });

  it("devuelve todos los productos almacenados", () => {
    repository.create(baseProduct());
    repository.create({ ...baseProduct(), id: "p2", sku: "SKU-002", name: "Producto B" });
    assert.strictEqual(repository.findAll().length, 2);
  });

  it("busca por SKU exacto", () => {
    const product = baseProduct();
    repository.create(product);
    assert.deepStrictEqual(repository.findBySku("SKU-001"), product);
    assert.strictEqual(repository.findBySku("OTRO"), undefined);
  });

  it("actualiza un producto existente", () => {
    const product = baseProduct();
    repository.create(product);
    const updated: Product = { ...product, name: "Producto A actualizado", updatedAt: "2024-06-01T00:00:00.000Z" };
    assert.deepStrictEqual(repository.update("p1", updated), updated);
    assert.deepStrictEqual(repository.findById("p1"), updated);
  });

  it("elimina un producto por id", () => {
    repository.create(baseProduct());
    repository.delete("p1");
    assert.strictEqual(repository.findById("p1"), undefined);
  });
});
