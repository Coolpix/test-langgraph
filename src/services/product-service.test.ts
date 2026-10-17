import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
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
    it("crea un producto activo con stock por defecto 0 y SKU normalizado", () => {
      const product = service.create({
        sku: " kb-001 ",
        name: " Teclado ",
        price: 79.9,
      });

      assert.equal(product.sku, "KB-001");
      assert.equal(product.name, "Teclado");
      assert.equal(product.price, 79.9);
      assert.equal(product.stock, 0);
      assert.equal(product.active, true);
      assert.equal(repository.findAll().length, 1);
    });

    it("rechaza un SKU vacío", () => {
      assert.throws(
        () => service.create({ sku: "   ", name: "Nombre", price: 1 }),
        BusinessError,
      );
    });

    it("rechaza un nombre vacío", () => {
      assert.throws(
        () => service.create({ sku: "SKU-1", name: "   ", price: 1 }),
        BusinessError,
      );
    });

    it("rechaza precio menor o igual a cero", () => {
      assert.throws(
        () => service.create({ sku: "SKU-1", name: "Nombre", price: 0 }),
        BusinessError,
      );
    });

    it("rechaza precio no finito", () => {
      assert.throws(
        () => service.create({ sku: "SKU-1", name: "Nombre", price: NaN }),
        BusinessError,
      );
    });

    it("rechaza stock negativo", () => {
      assert.throws(
        () => service.create({ sku: "SKU-1", name: "Nombre", price: 1, stock: -1 }),
        BusinessError,
      );
    });

    it("rechaza stock no entero", () => {
      assert.throws(
        () => service.create({ sku: "SKU-1", name: "Nombre", price: 1, stock: 1.5 }),
        BusinessError,
      );
    });

    it("rechaza SKU duplicado independientemente de mayúsculas", () => {
      service.create({ sku: "SKU-1", name: "Nombre", price: 1 });

      assert.throws(
        () => service.create({ sku: "sku-1", name: "Otro", price: 2 }),
        BusinessError,
      );
    });
  });

  describe("list", () => {
    it("devuelve solo activos ordenados por nombre por defecto", () => {
      const first = service.create({ sku: "SKU-B", name: "B", price: 1, stock: 0 });
      const second = service.create({ sku: "SKU-A", name: "A", price: 1, stock: 0 });
      service.update(first.id, { active: false });

      const active = service.list();

      assert.deepEqual(active.map((p) => p.id), [second.id]);
    });

    it("puede incluir productos inactivos", () => {
      const product = service.create({ sku: "SKU-1", name: "Nombre", price: 1 });
      service.update(product.id, { active: false });

      assert.equal(service.list(true).length, 1);
      assert.equal(service.list().length, 0);
    });
  });

  describe("getById", () => {
    it("devuelve el producto existente", () => {
      const product = service.create({ sku: "SKU-1", name: "Nombre", price: 1 });

      assert.equal(service.getById(product.id).sku, "SKU-1");
    });

    it("lanza error si el producto no existe", () => {
      assert.throws(() => service.getById("inexistente"), BusinessError);
    });
  });

  describe("update", () => {
    it("actualiza los campos permitidos", () => {
      const product = service.create({ sku: "SKU-1", name: "Nombre", price: 1, stock: 5 });

      const updated = service.update(product.id, {
        name: "Nuevo nombre",
        price: 2,
        stock: 0,
        active: false,
      });

      assert.equal(updated.name, "Nuevo nombre");
      assert.equal(updated.price, 2);
      assert.equal(updated.stock, 0);
      assert.equal(updated.active, false);
    });

    it("conserva los valores actuales cuando se omiten", () => {
      const product = service.create({ sku: "SKU-1", name: "Nombre", price: 1, stock: 5 });

      const updated = service.update(product.id, {});

      assert.equal(updated.name, "Nombre");
      assert.equal(updated.price, 1);
      assert.equal(updated.stock, 5);
      assert.equal(updated.active, true);
    });

    it("impide inactivar un producto con stock", () => {
      const product = service.create({ sku: "SKU-1", name: "Nombre", price: 1, stock: 5 });

      assert.throws(
        () => service.update(product.id, { active: false }),
        BusinessError,
      );
    });

    it("rechaza precio inválido", () => {
      const product = service.create({ sku: "SKU-1", name: "Nombre", price: 1 });

      assert.throws(() => service.update(product.id, { price: -1 }), BusinessError);
    });

    it("rechaza stock inválido", () => {
      const product = service.create({ sku: "SKU-1", name: "Nombre", price: 1 });

      assert.throws(() => service.update(product.id, { stock: -1 }), BusinessError);
    });

    it("rechaza nombre vacío", () => {
      const product = service.create({ sku: "SKU-1", name: "Nombre", price: 1 });

      assert.throws(() => service.update(product.id, { name: "   " }), BusinessError);
    });

    it("lanza error si el producto no existe", () => {
      assert.throws(() => service.update("inexistente", { name: "N" }), BusinessError);
    });
  });

  describe("delete", () => {
    it("elimina un producto sin stock", () => {
      const product = service.create({ sku: "SKU-1", name: "Nombre", price: 1, stock: 0 });

      service.delete(product.id);

      assert.equal(repository.findById(product.id), undefined);
    });

    it("rechaza eliminar un producto con stock", () => {
      const product = service.create({ sku: "SKU-1", name: "Nombre", price: 1, stock: 1 });

      assert.throws(() => service.delete(product.id), BusinessError);
    });

    it("lanza error si el producto no existe", () => {
      assert.throws(() => service.delete("inexistente"), BusinessError);
    });
  });
});
