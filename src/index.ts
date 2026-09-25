import { InMemoryProductRepository } from "./repositories/product-repository.js";
import { ProductService } from "./services/product-service.js";

const service = new ProductService(new InMemoryProductRepository());

const keyboard = service.create({ sku: " kb-001 ", name: "Teclado mecanico", price: 79.9, stock: 12 });
const mouse = service.create({ sku: "MOU-001", name: "Raton inalambrico", price: 29.5, stock: 0 });
service.update(mouse.id, { price: 24.99, active: false });

console.log("Productos activos:");
console.table(service.list());
console.log("Todos los productos:");
console.table(service.list(true));

// Demuestra una regla de negocio sin detener la aplicacion.
try {
  service.delete(keyboard.id);
} catch (error) {
  console.log(`Regla aplicada: ${(error as Error).message}`);
}
