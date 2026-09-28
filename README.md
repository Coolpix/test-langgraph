# CRUD simulado en TypeScript

Aplicacion de prueba en TypeScript con un CRUD en memoria para productos. Incluye una capa de servicio con reglas de negocio, un repositorio simulado y tests automatizados.

## Requisitos

- Node.js 20 o superior
- npm o pnpm

> El proyecto declara `packageManager: pnpm@11.21.0`, por lo que se recomienda usar `pnpm install`.

## Instalacion y ejecucion

```bash
pnpm install
pnpm run dev
```

La ejecucion crea productos, actualiza uno, lista activos/inactivos y muestra el error esperado al intentar eliminar un producto con stock.

## Scripts principales

| Comando | Descripcion |
|---------|-------------|
| `pnpm run dev` | Ejecuta el script de demostracion con `tsx src/index.ts`. |
| `pnpm test` | Ejecuta los tests con `tsx --test "src/**/*.test.ts"`. |
| `pnpm run build` | Compila TypeScript a `dist/` mediante `tsc`. |
| `pnpm start` | Ejecuta la version compilada `dist/index.js` con Node. |

La configuracion de cobertura (c8) en `package.json` acota el alcance a `src/**/*.ts` y excluye los propios tests.

## Configuracion del compilador

El archivo `tsconfig.json` configura:

- `target`: `ES2022`
- `module` / `moduleResolution`: `NodeNext`
- `rootDir`: `src`
- `outDir`: `dist`
- `strict`: `true`

## API publica

### Dominio

Exportado desde `src/domain/product.ts`:

- `Product`: interfaz con `id`, `sku`, `name`, `price`, `stock`, `active`, `createdAt` y `updatedAt`.
- `CreateProductInput`: datos necesarios para crear un producto.
- `UpdateProductInput`: datos opcionales para actualizar un producto.
- `BusinessError`: error lanzado por violaciones de reglas de negocio.

### Repositorio

Exportado desde `src/repositories/product-repository.ts`:

- `ProductRepository`: interfaz de persistencia.
- `InMemoryProductRepository`: implementacion en memoria; los datos viven solo durante la ejecucion.

### Servicio

Exportado desde `src/services/product-service.ts`:

- `ProductService`: orquesta las operaciones del CRUD y aplica las reglas de negocio.

Metodos principales:

- `create(input: CreateProductInput): Product`
- `list(includeInactive = false): Product[]`
- `getById(id: string): Product`
- `update(id: string, input: UpdateProductInput): Product`
- `delete(id: string): void`

## Reglas de negocio

- El SKU se normaliza a mayusculas y debe ser unico.
- El precio debe ser un numero finito mayor que cero.
- El stock debe ser un entero no negativo.
- Los productos inactivos no aparecen en el listado por defecto.
- No se puede inactivar ni eliminar un producto que conserva stock.

## Tests y compilacion

```bash
pnpm test
pnpm run build
pnpm start
```
