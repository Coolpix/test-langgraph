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
      const product = service.create({
        sku: " kb-001 ",
        name: "Teclado",
        price: 79.9,
      });

      assert.equal(product.sku, "KB-001");
      assert.equal(product.name, "Teclado");
      assert.equal(product.price, 79.9);
      assert.equal(product.stock, 0);
      assert.equal(product.active, true);
      assert.ok(product.id);
      assert.ok(product.createdAt);
      assert.ok(product.updatedAt);
    });

    it("trims and uppercases sku", () => {
      const product = service.create({ sku: "  abc  ", name: "A", price: 1 });

      assert.equal(product.sku, "ABC");
    });

    it("rejects duplicate sku", () => {
      service.create({ sku: "ABC", name: "A", price: 1 });

      assert.throws(
        () => service.create({ sku: "abc", name: "B", price: 2 }),
        BusinessError,
      );
    });

    it("rejects empty sku", () => {
      assert.throws(
        () => service.create({ sku: "", name: "A", price: 1 }),
        BusinessError,
      );
    });

    it("rejects empty name", () => {
      assert.throws(
        () => service.create({ sku: "ABC", name: "   ", price: 1 }),
        BusinessError,
      );
    });

    it("rejects non-positive price", () => {
      assert.throws(
        () => service.create({ sku: "ABC", name: "A", price: 0 }),
        BusinessError,
      );
      assert.throws(
        () => service.create({ sku: "ABC", name: "A", price: -1 }),
        BusinessError,
      );
    });

    it("rejects non-finite price", () => {
      assert.throws(
        () => service.create({ sku: "ABC", name: "A", price: NaN }),
        BusinessError,
      );
      assert.throws(
        () => service.create({ sku: "ABC", name: "A", price: Infinity }),
        BusinessError,
      );
    });

    it("rejects negative stock", () => {
      assert.throws(
        () => service.create({ sku: "ABC", name: "A", price: 1, stock: -1 }),
        BusinessError,
      );
    });

    it("rejects non-integer stock", () => {
      assert.throws(
        () => service.create({ sku: "ABC", name: "A", price: 1, stock: 1.5 }),
        BusinessError,
      );
    });
  });

  describe("list", () => {
    it("lists only active products by default", () => {
      const active = service.create({ sku: "A1", name: "Active", price: 1 });
      const inactive = service.create({
        sku: "I1",
        name: "Inactive",
        price: 1,
        stock: 0,
      });
      service.update(inactive.id, { active: false });

      const result = service.list();

      assert.equal(result.length, 1);
      assert.equal(result[0].id, active.id);
    });

    it("includes inactive products when requested", () => {
      service.create({ sku: "A1", name: "Active", price: 1 });
      const inactive = service.create({
        sku: "I1",
        name: "Inactive",
        price: 1,
        stock: 0,
      });
      service.update(inactive.id, { active: false });

      const result = service.list(true);

      assert.equal(result.length, 2);
    });

    it("sorts products by name", () => {
      service.create({ sku: "Z1", name: "Zebra", price: 1 });
      service.create({ sku: "A1", name: "Apple", price: 1 });

      const result = service.list();

      assert.equal(result[0].name, "Apple");
      assert.equal(result[1].name, "Zebra");
    });
  });

  describe("getById", () => {
    it("returns an existing product", () => {
      const product = service.create({ sku: "A1", name: "A", price: 1 });

      assert.equal(service.getById(product.id).id, product.id);
    });

    it("throws when product is not found", () => {
      assert.throws(() => service.getById("missing"), BusinessError);
    });
  });

  describe("update", () => {
    it("updates name, price and stock", () => {
      const product = service.create({
        sku: "A1",
        name: "A",
        price: 10,
        stock: 5,
      });

      const updated = service.update(product.id, {
        name: "B",
        price: 20,
        stock: 3,
      });

      assert.equal(updated.name, "B");
      assert.equal(updated.price, 20);
      assert.equal(updated.stock, 3);
    });

    it("keeps current values for omitted fields", () => {
      const product = service.create({
        sku: "A1",
        name: "A",
        price: 10,
        stock: 5,
      });

      const updated = service.update(product.id, {});

      assert.equal(updated.name, "A");
      assert.equal(updated.price, 10);
      assert.equal(updated.stock, 5);
    });

    it("deactivates a product with zero stock", () => {
      const product = service.create({
        sku: "A1",
        name: "A",
        price: 10,
        stock: 0,
      });

      const updated = service.update(product.id, { active: false });

      assert.equal(updated.active, false);
    });

    it("reactivates a product", () => {
      const product = service.create({
        sku: "A1",
        name: "A",
        price: 10,
        stock: 0,
      });
      service.update(product.id, { active: false });

      const updated = service.update(product.id, { active: true });

      assert.equal(updated.active, true);
    });

    it("rejects deactivation when stock is positive", () => {
      const product = service.create({
        sku: "A1",
        name: "A",
        price: 10,
        stock: 5,
      });

      assert.throws(
        () => service.update(product.id, { active: false }),
        BusinessError,
      );
    });

    it("rejects empty name", () => {
      const product = service.create({ sku: "A1", name: "A", price: 10 });

      assert.throws(
        () => service.update(product.id, { name: "   " }),
        BusinessError,
      );
    });

    it("rejects non-positive price", () => {
      const product = service.create({ sku: "A1", name: "A", price: 10 });

      assert.throws(
        () => service.update(product.id, { price: 0 }),
        BusinessError,
      );
    });

    it("rejects non-finite price", () => {
      const product = service.create({ sku: "A1", name: "A", price: 10 });

      assert.throws(
        () => service.update(product.id, { price: NaN }),
        BusinessError,
      );
    });

    it("rejects negative stock", () => {
      const product = service.create({ sku: "A1", name: "A", price: 10 });

      assert.throws(
        () => service.update(product.id, { stock: -1 }),
        BusinessError,
      );
    });

    it("rejects non-integer stock", () => {
      const product = service.create({ sku: "A1", name: "A", price: 10 });

      assert.throws(
        () => service.update(product.id, { stock: 1.5 }),
        BusinessError,
      );
    });

    it("throws when product is not found", () => {
      assert.throws(
        () => service.update("missing", { name: "X" }),
        BusinessError,
      );
    });
  });

  describe("delete", () => {
    it("deletes a product with zero stock", () => {
      const product = service.create({
        sku: "A1",
        name: "A",
        price: 10,
        stock: 0,
      });

      service.delete(product.id);

      assert.throws(() => service.getById(product.id), BusinessError);
    });

    it("rejects deleting a product with stock", () => {
      const product = service.create({
        sku: "A1",
        name: "A",
        price: 10,
        stock: 5,
      });

      assert.throws(() => service.delete(product.id), BusinessError);
    });

    it("throws when product is not found", () => {
      assert.throws(() => service.delete("missing"), BusinessError);
    });
  });
});
