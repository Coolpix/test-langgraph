import { describe, it, beforeEach } from "node:test";
import assert from "node:assert";
import { ProductService } from "./product-service.js";
import { InMemoryProductRepository } from "../repositories/product-repository.js";
import { BusinessError } from "../domain/product.js";

describe("ProductService", () => {
  let repository: InMemoryProductRepository;
  let service: ProductService;

  beforeEach(() => {
    repository = new InMemoryProductRepository();
    service = new ProductService(repository);
  });

  describe("create", () => {
    it("normaliza el SKU, recorta el nombre y asigna stock por defecto", () => {
      const product = service.create({
        sku: " kb-001 ",
        name: " Teclado mecánico ",
        price: 79.9,
      });

      assert.strictEqual(product.sku, "KB-001");
      assert.strictEqual(product.name, "Teclado mecánico");
      assert.strictEqual(product.stock, 0);
      assert.strictEqual(product.active, true);
      assert.ok(product.id);
    });

    it("rechaza un SKU duplicado sin importar mayúsculas", () => {
      service.create({ sku: "ABC-1", name: "A", price: 1 });
      assert.throws(
        () => service.create({ sku: "abc-1", name: "B", price: 2 }),
        BusinessError
      );
    });

    it("rechaza SKU vacío", () => {
      assert.throws(
        () => service.create({ sku: "   ", name: "A", price: 1 }),
        BusinessError
      );
    });

    it("rechaza nombre vacío", () => {
      assert.throws(
        () => service.create({ sku: "ABC", name: "   ", price: 1 }),
        BusinessError
      );
    });

    it("rechaza precios no positivos o no finitos", () => {
      assert.throws(() => service.create({ sku: "A1", name: "A", price: 0 }), BusinessError);
      assert.throws(() => service.create({ sku: "A2", name: "A", price: -1 }), BusinessError);
      assert.throws(() => service.create({ sku: "A3", name: "A", price: NaN }), BusinessError);
    });

    it("rechaza stock negativo o no entero", () => {
      assert.throws(() => service.create({ sku: "A1", name: "A", price: 1, stock: -1 }), BusinessError);
      assert.throws(() => service.create({ sku: "A2", name: "A", price: 1, stock: 1.5 }), BusinessError);
    });
  });

  describe("list", () => {
    it("devuelve solo productos activos ordenados por nombre", () => {
      service.create({ sku: "B", name: "Banana", price: 1, stock: 0 });
      service.create({ sku: "A", name: "Apple", price: 1, stock: 0 });
      const inactive = service.create({ sku: "C", name: "Cherry", price: 1, stock: 0 });
      service.update(inactive.id, { active: false });

      const products = service.list();
      assert.deepStrictEqual(products.map((p) => p.name), ["Apple", "Banana"]);
    });

    it("puede incluir productos inactivos", () => {
      const product = service.create({ sku: "A", name: "A", price: 1, stock: 0 });
      service.update(product.id, { active: false });

      assert.strictEqual(service.list(true).length, 1);
      assert.strictEqual(service.list().length, 0);
    });

    it("devuelve un array vacío cuando no hay productos", () => {
      assert.deepStrictEqual(service.list(), []);
    });
  });

  describe("getById", () => {
    it("recupera un producto existente", () => {
      const created = service.create({ sku: "A", name: "A", price: 1 });
      assert.strictEqual(service.getById(created.id).id, created.id);
    });

    it("lanza error si no existe", () => {
      assert.throws(() => service.getById("inexistente"), BusinessError);
    });
  });

  describe("update", () => {
    it("actualiza todos los campos proporcionados respetando las reglas de negocio", () => {
      const created = service.create({ sku: "A", name: "A", price: 10, stock: 0 });
      const updated = service.update(created.id, {
        name: "B",
        price: 20,
        stock: 5,
        active: true,
      });

      assert.strictEqual(updated.name, "B");
      assert.strictEqual(updated.price, 20);
      assert.strictEqual(updated.stock, 5);
      assert.strictEqual(updated.active, true);
    });

    it("aplica actualizaciones parciales", () => {
      const created = service.create({ sku: "A", name: "A", price: 10, stock: 5 });
      const updated = service.update(created.id, { price: 15 });

      assert.strictEqual(updated.name, "A");
      assert.strictEqual(updated.price, 15);
      assert.strictEqual(updated.stock, 5);
    });

    it("impide desactivar un producto con stock", () => {
      const created = service.create({ sku: "A", name: "A", price: 10, stock: 5 });
      assert.throws(() => service.update(created.id, { active: false }), BusinessError);
    });

    it("valida los campos actualizados", () => {
      const created = service.create({ sku: "A", name: "A", price: 10, stock: 0 });
      assert.throws(() => service.update(created.id, { name: "   " }), BusinessError);
      assert.throws(() => service.update(created.id, { price: 0 }), BusinessError);
      assert.throws(() => service.update(created.id, { stock: -1 }), BusinessError);
    });

    it("lanza error si el producto no existe", () => {
      assert.throws(() => service.update("inexistente", { name: "X" }), BusinessError);
    });
  });

  describe("delete", () => {
    it("elimina un producto sin stock", () => {
      const created = service.create({ sku: "A", name: "A", price: 1, stock: 0 });
      service.delete(created.id);
      assert.throws(() => service.getById(created.id), BusinessError);
    });

    it("rechaza eliminar un producto con stock", () => {
      const created = service.create({ sku: "A", name: "A", price: 1, stock: 5 });
      assert.throws(() => service.delete(created.id), BusinessError);
    });

    it("lanza error si el producto no existe", () => {
      assert.throws(() => service.delete("inexistente"), BusinessError);
    });
  });
});
