import { describe, it } from "node:test";
import assert from "node:assert";
import { ProductService } from "./product-service.js";
import { InMemoryProductRepository } from "../repositories/product-repository.js";
import { BusinessError } from "../domain/product.js";

function createService(): ProductService {
  return new ProductService(new InMemoryProductRepository());
}

describe("ProductService", () => {
  it("creates a product with normalized sku and default stock", () => {
    const service = createService();

    const product = service.create({ sku: " kb-001 ", name: "Keyboard", price: 79.9 });

    assert.strictEqual(product.sku, "KB-001");
    assert.strictEqual(product.name, "Keyboard");
    assert.strictEqual(product.stock, 0);
    assert.strictEqual(product.active, true);
    assert.ok(product.id);
    assert.ok(product.createdAt);
  });

  it("rejects an empty sku", () => {
    const service = createService();
    assert.throws(
      () => service.create({ sku: "   ", name: "X", price: 1 }),
      BusinessError,
    );
  });

  it("rejects an empty name", () => {
    const service = createService();
    assert.throws(
      () => service.create({ sku: "X", name: "   ", price: 1 }),
      BusinessError,
    );
  });

  it("rejects a non-positive price", () => {
    const service = createService();
    assert.throws(() => service.create({ sku: "X", name: "X", price: 0 }), BusinessError);
    assert.throws(() => service.create({ sku: "X", name: "X", price: -1 }), BusinessError);
    assert.throws(
      () => service.create({ sku: "X", name: "X", price: Number.NaN }),
      BusinessError,
    );
  });

  it("rejects invalid stock", () => {
    const service = createService();
    assert.throws(
      () => service.create({ sku: "X", name: "X", price: 1, stock: -1 }),
      BusinessError,
    );
    assert.throws(
      () => service.create({ sku: "X", name: "X", price: 1, stock: 1.5 }),
      BusinessError,
    );
  });

  it("rejects a duplicate sku", () => {
    const service = createService();
    service.create({ sku: "ABC-123", name: "First", price: 1 });

    assert.throws(
      () => service.create({ sku: "abc-123", name: "Second", price: 1 }),
      /Ya existe un producto con el SKU/,
    );
  });

  it("lists only active products sorted by name by default", () => {
    const service = createService();
    const zebra = service.create({ sku: "A", name: "Zebra", price: 1, stock: 0 });
    service.create({ sku: "B", name: "Apple", price: 1, stock: 0 });
    service.create({ sku: "C", name: "Mango", price: 1, stock: 0 });
    service.update(zebra.id, { active: false });

    const list = service.list();

    assert.deepStrictEqual(list.map((product) => product.name), ["Apple", "Mango"]);
  });

  it("optionally includes inactive products", () => {
    const service = createService();
    const inactive = service.create({ sku: "A", name: "Zebra", price: 1, stock: 0 });
    service.create({ sku: "B", name: "Apple", price: 1, stock: 0 });
    service.update(inactive.id, { active: false });

    const all = service.list(true);

    assert.strictEqual(all.length, 2);
    assert.ok(all.some((product) => product.name === "Zebra" && !product.active));
    assert.ok(all.some((product) => product.name === "Apple" && product.active));
  });

  it("gets a product by id", () => {
    const service = createService();
    const created = service.create({ sku: "X", name: "Y", price: 1 });

    const found = service.getById(created.id);

    assert.strictEqual(found.id, created.id);
  });

  it("throws when product is not found", () => {
    const service = createService();
    assert.throws(() => service.getById("missing"), /Producto no encontrado/);
  });

  it("updates allowed fields", () => {
    const service = createService();
    const created = service.create({ sku: "X", name: "Old", price: 10, stock: 5 });

    const updated = service.update(created.id, {
      name: "New",
      price: 20,
      stock: 0,
      active: false,
    });

    assert.strictEqual(updated.name, "New");
    assert.strictEqual(updated.price, 20);
    assert.strictEqual(updated.stock, 0);
    assert.strictEqual(updated.active, false);
  });

  it("preserves current values when update fields are omitted", () => {
    const service = createService();
    const created = service.create({ sku: "X", name: "Old", price: 10, stock: 3 });

    const updated = service.update(created.id, { price: 15 });

    assert.strictEqual(updated.name, "Old");
    assert.strictEqual(updated.price, 15);
    assert.strictEqual(updated.stock, 3);
    assert.strictEqual(updated.active, true);
  });

  it("prevents inactivating a product with stock", () => {
    const service = createService();
    const created = service.create({ sku: "X", name: "Y", price: 1, stock: 5 });

    assert.throws(
      () => service.update(created.id, { active: false }),
      /Un producto con stock no puede quedar inactivo/,
    );
  });

  it("deletes a product without stock", () => {
    const service = createService();
    const created = service.create({ sku: "X", name: "Y", price: 1, stock: 0 });

    service.delete(created.id);

    assert.throws(() => service.getById(created.id), /Producto no encontrado/);
  });

  it("prevents deleting a product with stock", () => {
    const service = createService();
    const created = service.create({ sku: "X", name: "Y", price: 1, stock: 5 });

    assert.throws(
      () => service.delete(created.id),
      /No se puede eliminar un producto con stock disponible/,
    );
  });
});
