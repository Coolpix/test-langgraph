import type { Product } from "../domain/product.js";

export interface ProductRepository {
  create(product: Product): Product;
  findAll(): Product[];
  findById(id: string): Product | undefined;
  findBySku(sku: string): Product | undefined;
  update(id: string, product: Product): Product;
  delete(id: string): void;
}

/** Persistencia simulada: los datos viven solamente durante la ejecucion. */
export class InMemoryProductRepository implements ProductRepository {
  private readonly products = new Map<string, Product>();

  create(product: Product): Product {
    this.products.set(product.id, product);
    return product;
  }

  findAll(): Product[] {
    return [...this.products.values()];
  }

  findById(id: string): Product | undefined {
    return this.products.get(id);
  }

  findBySku(sku: string): Product | undefined {
    return [...this.products.values()].find((product) => product.sku === sku);
  }

  update(id: string, product: Product): Product {
    this.products.set(id, product);
    return product;
  }

  delete(id: string): void {
    this.products.delete(id);
  }
}
