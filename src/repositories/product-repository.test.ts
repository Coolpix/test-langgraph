import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { InMemoryProductRepository } from "./product-repository.js";
import type { Product } from "../domain/product.js";

function sampleProduct(id: string, sku: string, name: string): Product {
  return {
    id,
    sku,
    name,
    price: 1,
    stock: 0,
    active: true,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  };
}

describe("InMemoryProductRepository", () => {
  let repository: InMemoryProductRepository;

  beforeEach(() => {
    repository = new InMemoryProductRepository();
  });

  it("create almacena y devuelve el producto", () => {
    const product = sampleProduct("1", "SKU-1", "Producto 1");

    assert.deepEqual(repository.create(product), product);
    assert.equal(repository.findById("1"), product);
  });

  it("findAll devuelve todos los productos almacenados", () => {
    const a = sampleProduct("1", "SKU-1", "A");
    const b = sampleProduct("2", "SKU-2", "B");
    repository.create(a);
    repository.create(b);

    const all = repository.findAll().sort((x, y) => x.id.localeCompare(y.id));

    assert.deepEqual(all, [a, b]);
  });

  it("findById devuelve undefined cuando no existe", () => {
    assert.equal(repository.findById("inexistente"), undefined);
  });

  it("findBySku busca coincidencia exacta de SKU", () => {
    const product = sampleProduct("1", "SKU-1", "Producto 1");
    repository.create(product);

    assert.equal(repository.findBySku("SKU-1"), product);
    assert.equal(repository.findBySku("OTRO"), undefined);
  });

  it("update reemplaza el producto existente", () => {
    repository.create(sampleProduct("1", "SKU-1", "Producto 1"));
    const updated: Product = { ...sampleProduct("1", "SKU-1", "Producto 1"), name: "Actualizado" };

    assert.deepEqual(repository.update("1", updated), updated);
    assert.equal(repository.findById("1")?.name, "Actualizado");
  });

  it("delete elimina el producto", () => {
    repository.create(sampleProduct("1", "SKU-1", "Producto 1"));

    repository.delete("1");

    assert.equal(repository.findById("1"), undefined);
    assert.deepEqual(repository.findAll(), []);
  });
});
