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
    it("creates a product with normalized SKU and default stock", () => {
      const product = service.create({ sku: " kb-001 ", name: "Keyboard", price: 79.9 });
      assert.strictEqual(product.sku, "KB-001");
      assert.strictEqual(product.name, "Keyboard");
      assert.strictEqual(product.price, 79.9);
      assert.strictEqual(product.stock, 0);
      assert.strictEqual(product.active, true);
    });

    it("creates a product with explicit stock", () => {
      const product = service.create({ sku: "MOU-001", name: "Mouse", price: 29.5, stock: 5 });
      assert.strictEqual(product.stock, 5);
    });

    it("throws for empty SKU", () => {
      assert.throws(() => service.create({ sku: "   ", name: "Keyboard", price: 10 }), BusinessError);
    });

    it("throws for empty name", () => {
      assert.throws(() => service.create({ sku: "KB-001", name: "   ", price: 10 }), BusinessError);
    });

    it("throws for non-positive price", () => {
      assert.throws(() => service.create({ sku: "KB-001", name: "Keyboard", price: 0 }), BusinessError);
      assert.throws(() => service.create({ sku: "KB-001", name: "Keyboard", price: -1 }), BusinessError);
    });

    it("throws for non-finite price", () => {
      assert.throws(() => service.create({ sku: "KB-001", name: "Keyboard", price: NaN }), BusinessError);
      assert.throws(() => service.create({ sku: "KB-001", name: "Keyboard", price: Infinity }), BusinessError);
    });

    it("throws for negative stock", () => {
      assert.throws(() => service.create({ sku: "KB-001", name: "Keyboard", price: 10, stock: -1 }), BusinessError);
    });

    it("throws for non-integer stock", () => {
      assert.throws(() => service.create({ sku: "KB-001", name: "Keyboard", price: 10, stock: 1.5 }), BusinessError);
    });

    it("throws for duplicate SKU regardless of casing", () => {
      service.create({ sku: "KB-001", name: "Keyboard", price: 10 });
      assert.throws(() => service.create({ sku: "kb-001", name: "Another", price: 10 }), BusinessError);
    });
  });

  describe("list", () => {
    it("returns only active products sorted by name by default", () => {
      service.create({ sku: "Z-001", name: "Zebra", price: 10 });
      service.create({ sku: "A-001", name: "Apple", price: 10 });
      const inactive = service.create({ sku: "I-001", name: "Inactive", price: 10, stock: 0 });
      service.update(inactive.id, { active: false });
      const active = service.list();
      assert.strictEqual(active.length, 2);
      assert.strictEqual(active[0].name, "Apple");
      assert.strictEqual(active[1].name, "Zebra");
    });

    it("returns all products when requested", () => {
      service.create({ sku: "A-001", name: "Active", price: 10 });
      const inactive = service.create({ sku: "I-001", name: "Inactive", price: 10, stock: 0 });
      service.update(inactive.id, { active: false });
      assert.strictEqual(service.list(true).length, 2);
    });

    it("returns an empty array when there are no products", () => {
      assert.deepStrictEqual(service.list(), []);
    });
  });

  describe("getById", () => {
    it("returns an existing product", () => {
      const created = service.create({ sku: "KB-001", name: "Keyboard", price: 10 });
      const found = service.getById(created.id);
      assert.strictEqual(found.id, created.id);
    });

    it("throws when product is not found", () => {
      assert.throws(() => service.getById("missing"), BusinessError);
    });
  });

  describe("update", () => {
    it("updates all provided fields", () => {
      const created = service.create({ sku: "KB-001", name: "Keyboard", price: 10, stock: 0 });
      const updated = service.update(created.id, { name: "Gaming Keyboard", price: 99.9, stock: 5, active: true });
      assert.strictEqual(updated.name, "Gaming Keyboard");
      assert.strictEqual(updated.price, 99.9);
      assert.strictEqual(updated.stock, 5);
    });

    it("keeps current values for omitted fields", () => {
      const created = service.create({ sku: "KB-001", name: "Keyboard", price: 10 });
      const updated = service.update(created.id, { price: 20 });
      assert.strictEqual(updated.name, "Keyboard");
      assert.strictEqual(updated.price, 20);
      assert.strictEqual(updated.stock, 0);
    });

    it("throws for empty name", () => {
      const created = service.create({ sku: "KB-001", name: "Keyboard", price: 10 });
      assert.throws(() => service.update(created.id, { name: "   " }), BusinessError);
    });

    it("throws for non-positive price", () => {
      const created = service.create({ sku: "KB-001", name: "Keyboard", price: 10 });
      assert.throws(() => service.update(created.id, { price: 0 }), BusinessError);
    });

    it("throws for negative stock", () => {
      const created = service.create({ sku: "KB-001", name: "Keyboard", price: 10 });
      assert.throws(() => service.update(created.id, { stock: -1 }), BusinessError);
    });

    it("throws when deactivating a product with stock", () => {
      const created = service.create({ sku: "KB-001", name: "Keyboard", price: 10, stock: 5 });
      assert.throws(() => service.update(created.id, { active: false }), BusinessError);
    });

    it("allows deactivating a product without stock", () => {
      const created = service.create({ sku: "KB-001", name: "Keyboard", price: 10, stock: 0 });
      const updated = service.update(created.id, { active: false });
      assert.strictEqual(updated.active, false);
    });

    it("throws when product does not exist", () => {
      assert.throws(() => service.update("missing", { name: "New" }), BusinessError);
    });
  });

  describe("delete", () => {
    it("deletes a product without stock", () => {
      const created = service.create({ sku: "KB-001", name: "Keyboard", price: 10, stock: 0 });
      service.delete(created.id);
      assert.throws(() => service.getById(created.id), BusinessError);
    });

    it("throws when deleting a product with stock", () => {
      const created = service.create({ sku: "KB-001", name: "Keyboard", price: 10, stock: 5 });
      assert.throws(() => service.delete(created.id), BusinessError);
    });

    it("throws when product does not exist", () => {
      assert.throws(() => service.delete("missing"), BusinessError);
    });
  });
});
