import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { ProductService } from "./product-service.js";
import { InMemoryProductRepository } from "../repositories/product-repository.js";
import { BusinessError } from "../domain/product.js";

describe("ProductService", () => {
  let service: ProductService;

  beforeEach(() => {
    service = new ProductService(new InMemoryProductRepository());
  });

  describe("create", () => {
    it("creates a product with default stock", () => {
      const product = service.create({ sku: " kb-001 ", name: "Keyboard", price: 79.9 });

      assert.equal(product.sku, "KB-001");
      assert.equal(product.name, "Keyboard");
      assert.equal(product.price, 79.9);
      assert.equal(product.stock, 0);
      assert.equal(product.active, true);
      assert.ok(product.id);
      assert.ok(product.createdAt);
      assert.ok(product.updatedAt);
    });

    it("normalizes sku to uppercase and trims name", () => {
      const product = service.create({ sku: "abc-123", name: "  Mouse  ", price: 10 });

      assert.equal(product.sku, "ABC-123");
      assert.equal(product.name, "Mouse");
    });

    it("rejects empty sku", () => {
      assert.throws(() => service.create({ sku: "   ", name: "Keyboard", price: 10 }), BusinessError);
    });

    it("rejects empty name", () => {
      assert.throws(() => service.create({ sku: "KB-001", name: "   ", price: 10 }), BusinessError);
    });

    it("rejects price equal to zero", () => {
      assert.throws(() => service.create({ sku: "KB-001", name: "Keyboard", price: 0 }), BusinessError);
    });

    it("rejects negative price", () => {
      assert.throws(() => service.create({ sku: "KB-001", name: "Keyboard", price: -1 }), BusinessError);
    });

    it("rejects non-finite price", () => {
      assert.throws(() => service.create({ sku: "KB-001", name: "Keyboard", price: NaN }), BusinessError);
      assert.throws(() => service.create({ sku: "KB-001", name: "Keyboard", price: Infinity }), BusinessError);
    });

    it("rejects negative stock", () => {
      assert.throws(() => service.create({ sku: "KB-001", name: "Keyboard", price: 10, stock: -1 }), BusinessError);
    });

    it("rejects non-integer stock", () => {
      assert.throws(() => service.create({ sku: "KB-001", name: "Keyboard", price: 10, stock: 1.5 }), BusinessError);
    });

    it("rejects duplicate sku", () => {
      service.create({ sku: "KB-001", name: "Keyboard", price: 10 });

      assert.throws(() => service.create({ sku: "kb-001", name: "Another", price: 20 }), BusinessError);
    });
  });

  describe("list", () => {
    it("returns only active products sorted by name by default", () => {
      const active1 = service.create({ sku: "B-001", name: "B Product", price: 10 });
      const active2 = service.create({ sku: "A-001", name: "A Product", price: 10 });
      const inactive = service.create({ sku: "C-001", name: "C Product", price: 10, stock: 0 });
      service.update(inactive.id, { active: false });

      const list = service.list();

      assert.deepEqual(list, [active2, active1]);
    });

    it("returns all products when includeInactive is true", () => {
      service.create({ sku: "A-001", name: "A Product", price: 10 });
      const inactive = service.create({ sku: "C-001", name: "C Product", price: 10, stock: 0 });
      service.update(inactive.id, { active: false });

      const list = service.list(true);

      assert.equal(list.length, 2);
    });
  });

  describe("getById", () => {
    it("returns product by id", () => {
      const product = service.create({ sku: "KB-001", name: "Keyboard", price: 10 });

      assert.equal(service.getById(product.id), product);
    });

    it("throws when product is not found", () => {
      assert.throws(() => service.getById("missing"), BusinessError);
    });
  });

  describe("update", () => {
    it("updates name, price and stock", () => {
      const product = service.create({ sku: "KB-001", name: "Keyboard", price: 10, stock: 5 });

      const updated = service.update(product.id, { name: "Updated Keyboard", price: 20, stock: 10 });

      assert.equal(updated.name, "Updated Keyboard");
      assert.equal(updated.price, 20);
      assert.equal(updated.stock, 10);
    });

    it("keeps current values when fields are undefined", () => {
      const product = service.create({ sku: "KB-001", name: "Keyboard", price: 10, stock: 5 });

      const updated = service.update(product.id, {});

      assert.equal(updated.name, "Keyboard");
      assert.equal(updated.price, 10);
      assert.equal(updated.stock, 5);
    });

    it("rejects empty name", () => {
      const product = service.create({ sku: "KB-001", name: "Keyboard", price: 10 });

      assert.throws(() => service.update(product.id, { name: "   " }), BusinessError);
    });

    it("rejects invalid price", () => {
      const product = service.create({ sku: "KB-001", name: "Keyboard", price: 10 });

      assert.throws(() => service.update(product.id, { price: 0 }), BusinessError);
      assert.throws(() => service.update(product.id, { price: -1 }), BusinessError);
      assert.throws(() => service.update(product.id, { price: NaN }), BusinessError);
    });

    it("rejects invalid stock", () => {
      const product = service.create({ sku: "KB-001", name: "Keyboard", price: 10 });

      assert.throws(() => service.update(product.id, { stock: -1 }), BusinessError);
      assert.throws(() => service.update(product.id, { stock: 1.5 }), BusinessError);
    });

    it("allows deactivating a product with zero stock", () => {
      const product = service.create({ sku: "KB-001", name: "Keyboard", price: 10, stock: 0 });

      const updated = service.update(product.id, { active: false });

      assert.equal(updated.active, false);
    });

    it("rejects deactivating a product with stock", () => {
      const product = service.create({ sku: "KB-001", name: "Keyboard", price: 10, stock: 5 });

      assert.throws(() => service.update(product.id, { active: false }), BusinessError);
    });

    it("reactivates a product", () => {
      const product = service.create({ sku: "KB-001", name: "Keyboard", price: 10, stock: 0 });
      service.update(product.id, { active: false });

      const updated = service.update(product.id, { active: true });

      assert.equal(updated.active, true);
    });

    it("throws when product is not found", () => {
      assert.throws(() => service.update("missing", { name: "X" }), BusinessError);
    });
  });

  describe("delete", () => {
    it("deletes a product with zero stock", () => {
      const product = service.create({ sku: "KB-001", name: "Keyboard", price: 10, stock: 0 });

      service.delete(product.id);

      assert.throws(() => service.getById(product.id), BusinessError);
    });

    it("rejects deleting a product with stock", () => {
      const product = service.create({ sku: "KB-001", name: "Keyboard", price: 10, stock: 5 });

      assert.throws(() => service.delete(product.id), BusinessError);
    });

    it("throws when product is not found", () => {
      assert.throws(() => service.delete("missing"), BusinessError);
    });
  });
});
