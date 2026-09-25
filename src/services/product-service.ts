import { randomUUID } from "node:crypto";
import {
  BusinessError,
  type CreateProductInput,
  type Product,
  type UpdateProductInput,
} from "../domain/product.js";
import type { ProductRepository } from "../repositories/product-repository.js";

export class ProductService {
  constructor(private readonly repository: ProductRepository) {}

  create(input: CreateProductInput): Product {
    const sku = input.sku.trim().toUpperCase();
    const name = input.name.trim();
    this.validateText(sku, "El SKU");
    this.validateText(name, "El nombre");
    this.validateMoney(input.price);
    this.validateStock(input.stock ?? 0);
    if (this.repository.findBySku(sku)) {
      throw new BusinessError(`Ya existe un producto con el SKU ${sku}`);
    }

    const now = new Date().toISOString();
    return this.repository.create({
      id: randomUUID(), sku, name, price: input.price, stock: input.stock ?? 0,
      active: true, createdAt: now, updatedAt: now,
    });
  }

  list(includeInactive = false): Product[] {
    return this.repository.findAll()
      .filter((product) => includeInactive || product.active)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  getById(id: string): Product {
    const product = this.repository.findById(id);
    if (!product) throw new BusinessError("Producto no encontrado");
    return product;
  }

  update(id: string, input: UpdateProductInput): Product {
    const current = this.getById(id);
    const name = input.name === undefined ? current.name : input.name.trim();
    const price = input.price === undefined ? current.price : input.price;
    const stock = input.stock === undefined ? current.stock : input.stock;
    this.validateText(name, "El nombre");
    this.validateMoney(price);
    this.validateStock(stock);
    if (stock > 0 && input.active === false) {
      throw new BusinessError("Un producto con stock no puede quedar inactivo");
    }

    return this.repository.update(id, {
      ...current, name, price, stock,
      active: input.active ?? current.active,
      updatedAt: new Date().toISOString(),
    });
  }

  delete(id: string): void {
    const product = this.getById(id);
    if (product.stock > 0) {
      throw new BusinessError("No se puede eliminar un producto con stock disponible");
    }
    this.repository.delete(id);
  }

  private validateText(value: string, field: string): void {
    if (!value) throw new BusinessError(`${field} es obligatorio`);
  }

  private validateMoney(value: number): void {
    if (!Number.isFinite(value) || value <= 0) {
      throw new BusinessError("El precio debe ser un numero mayor que cero");
    }
  }

  private validateStock(value: number): void {
    if (!Number.isInteger(value) || value < 0) {
      throw new BusinessError("El stock debe ser un entero mayor o igual que cero");
    }
  }
}
