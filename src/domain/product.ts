export interface Product {
  id: string;
  sku: string;
  name: string;
  price: number;
  stock: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductInput {
  sku: string;
  name: string;
  price: number;
  stock?: number;
}

export interface UpdateProductInput {
  name?: string;
  price?: number;
  stock?: number;
  active?: boolean;
}

export class BusinessError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BusinessError";
  }
}
