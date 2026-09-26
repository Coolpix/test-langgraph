import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { BusinessError } from "../domain/product.js";
import { InMemoryProductRepository } from "../repositories/product-repository.js";
import { ProductService } from "./product-service.js";

function createService() {
  return new ProductService(new InMemoryProductRepository());
}

describe("ProductService", () => {
  describe("create", () => {
    it("creates an active product with provided stock", () => {
      const service = createService();

      const product = service.create({
        sku: "KB-001",
        name: "Mechanical keyboard",
        price: 79.9,
        stock: 12,
      });

      assert.equal(product.sku, "KB-001");
      assert.equal(product.name, "Mechanical keyboard");
      assert.equal(product.price, 79.9);
      assert.equal(product.stock, 12);
      assert.equal(product.active, true);
      assert.ok(typeof product.id === "string");
      assert.ok(product.createdAt);
      assert.ok(product.updatedAt);
    });

    it("defaults stock to zero", () => {
      const service = createService();

      const product = service.create({
        sku: "MOU-001",
        name: "Wireless mouse",
        price: 29.5,
      });

      assert.equal(product.stock, 0);
    });

    it("trims and uppercases SKU and trims name", () => {
      const service = createService();

      const product = service.create({
        sku: "  kb-002  ",
        name: "  Compact keyboard  ",
        price: 49.9,
        stock: 3,
      });

      assert.equal(product.sku, "KB-002");
      assert.equal(product.name, "Compact keyboard");
    });

    it("throws BusinessError when SKU is empty", () => {
      const service = createService();

      assert.throws(
        () => service.create({ sku: "   ", name: "Name", price: 10 }),
        (error) => error instanceof BusinessError && error.message === "El SKU es obligatorio"
      );
    });

    it("throws BusinessError when name is empty", () => {
      const service = createService();

      assert.throws(
        () => service.create({ sku: "SKU", name: "   ", price: 10 }),
        (error) => error instanceof BusinessError && error.message === "El nombre es obligatorio"
      );
    });

    it("throws BusinessError when price is not positive", () => {
      const service = createService();

      assert.throws(
        () => service.create({ sku: "SKU", name: "Name", price: 0 }),
        (error) => error instanceof BusinessError && error.message === "El precio debe ser un numero mayor que cero"
      );

      assert.throws(
        () => service.create({ sku: "SKU", name: "Name", price: -5 }),
        (error) => error instanceof BusinessError && error.message === "El precio debe ser un numero mayor que cero"
      );
    });

    it("throws BusinessError when stock is negative or not an integer", () => {
      const service = createService();

      assert.throws(
        () => service.create({ sku: "SKU", name: "Name", price: 10, stock: -1 }),
        (error) => error instanceof BusinessError && error.message === "El stock debe ser un entero mayor o igual que cero"
      );

      assert.throws(
        () => service.create({ sku: "SKU", name: "Name", price: 10, stock: 1.5 }),
        (error) => error instanceof BusinessError && error.message === "El stock debe ser un entero mayor o igual que cero"
      );
    });

    it("throws BusinessError when SKU already exists", () => {
      const service = createService();
      service.create({ sku: "UNIQUE", name: "First", price: 10 });

      assert.throws(
        () => service.create({ sku: "unique", name: "Second", price: 10 }),
        (error) => error instanceof BusinessError && error.message === "Ya existe un producto con el SKU UNIQUE"
      );
    });
  });

  describe("list", () => {
    it("returns only active products sorted by name by default", () => {
      const service = createService();
      const active = service.create({ sku: "A", name: "Zebra", price: 1 });
      service.create({ sku: "B", name: "Apple", price: 1 });
      service.update(active.id, { active: false });

      const result = service.list();

      assert.equal(result.length, 1);
      assert.equal(result[0].name, "Apple");
    });

    it("returns all products when includeInactive is true", () => {
      const service = createService();
      const active = service.create({ sku: "A", name: "Zebra", price: 1 });
      service.create({ sku: "B", name: "Apple", price: 1 });
      service.update(active.id, { active: false });

      const result = service.list(true);

      assert.equal(result.length, 2);
    });
  });

  describe("getById", () => {
    it("returns the product when it exists", () => {
      const service = createService();
      const created = service.create({ sku: "X", name: "X", price: 1 });

      const found = service.getById(created.id);

      assert.equal(found.id, created.id);
    });

    it("throws BusinessError when product is not found", () => {
      const service = createService();

      assert.throws(
        () => service.getById("missing-id"),
        (error) => error instanceof BusinessError && error.message === "Producto no encontrado"
      );
    });
  });

  describe("update", () => {
    it("updates name, price and stock", () => {
      const service = createService();
      const created = service.create({ sku: "U", name: "Old", price: 10, stock: 5 });

      const updated = service.update(created.id, {
        name: "New",
        price: 20,
        stock: 8,
      });

      assert.equal(updated.name, "New");
      assert.equal(updated.price, 20);
      assert.equal(updated.stock, 8);
      assert.notEqual(updated.updatedAt, created.updatedAt);
    });

    it("keeps current values when optional fields are omitted", () => {
      const service = createService();
      const created = service.create({ sku: "U", name: "Name", price: 10, stock: 5 });

      const updated = service.update(created.id, {});

      assert.equal(updated.name, "Name");
      assert.equal(updated.price, 10);
      assert.equal(updated.stock, 5);
    });

    it("throws BusinessError when product is not found", () => {
      const service = createService();

      assert.throws(
        () => service.update("missing-id", { name: "New" }),
        (error) => error instanceof BusinessError && error.message === "Producto no encontrado"
      );
    });

    it("throws BusinessError when name becomes empty", () => {
      const service = createService();
      const created = service.create({ sku: "U", name: "Name", price: 10 });

      assert.throws(
        () => service.update(created.id, { name: "   " }),
        (error) => error instanceof BusinessError && error.message === "El nombre es obligatorio"
      );
    });

    it("throws BusinessError when price is invalid", () => {
      const service = createService();
      const created = service.create({ sku: "U", name: "Name", price: 10 });

      assert.throws(
        () => service.update(created.id, { price: 0 }),
        (error) => error instanceof BusinessError && error.message === "El precio debe ser un numero mayor que cero"
      );
    });

    it("throws BusinessError when stock is invalid", () => {
      const service = createService();
      const created = service.create({ sku: "U", name: "Name", price: 10 });

      assert.throws(
        () => service.update(created.id, { stock: -1 }),
        (error) => error instanceof BusinessError && error.message === "El stock debe ser un entero mayor o igual que cero"
      );
    });

    it("throws BusinessError when deactivating a product with stock", () => {
      const service = createService();
      const created = service.create({ sku: "U", name: "Name", price: 10, stock: 5 });

      assert.throws(
        () => service.update(created.id, { active: false }),
        (error) => error instanceof BusinessError && error.message === "Un producto con stock no puede quedar inactivo"
      );
    });
  });

  describe("delete", () => {
    it("deletes a product without stock", () => {
      const service = createService();
      const created = service.create({ sku: "D", name: "Name", price: 10, stock: 0 });

      service.delete(created.id);

      assert.throws(
        () => service.getById(created.id),
        (error) => error instanceof BusinessError && error.message === "Producto no encontrado"
      );
    });

    it("throws BusinessError when deleting a product with stock", () => {
      const service = createService();
      const created = service.create({ sku: "D", name: "Name", price: 10, stock: 5 });

      assert.throws(
        () => service.delete(created.id),
        (error) => error instanceof BusinessError && error.message === "No se puede eliminar un producto con stock disponible"
      );
    });

    it("throws BusinessError when product is not found", () => {
      const service = createService();

      assert.throws(
        () => service.delete("missing-id"),
        (error) => error instanceof BusinessError && error.message === "Producto no encontrado"
      );
    });
  });
});
