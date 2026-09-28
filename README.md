# CRUD simulado en TypeScript

Aplicacion de prueba con un CRUD en memoria para productos. Incluye una capa de servicio con reglas de negocio, un repositorio simulado y tests automatizados.

## Requisitos

- Node.js 20 o superior
- pnpm 11.21.0 o superior (recomendado; tambien compatible con npm)

## Instalacion

El proyecto declara `pnpm` como gestor de paquetes:

```bash
pnpm install
```

Si prefieres npm:

```bash
npm install
```

## Ejecutar

```bash
pnpm dev
# o
npm run dev
```

La ejecucion crea productos, actualiza uno, lista activos/inactivos y muestra el error esperado al intentar eliminar un producto con stock.

## Tests y compilacion

```bash
pnpm test
pnpm run build
pnpm start
```

Tambien funcionan con npm:

```bash
npm test
npm run build
npm start
```

- `pnpm dev` / `npm run dev`: ejecuta `src/index.ts` con `tsx`.
- `pnpm test` / `npm test`: ejecuta las suites de `src/**/*.test.ts` con el runner de Node.
- `pnpm run build` / `npm run build`: compila TypeScript a `dist/` usando `tsconfig.json`.
- `pnpm start` / `npm start`: ejecuta `dist/index.js`.

## Cobertura

El proyecto incluye configuracion de `c8` en `package.json`. Para generar un reporte de cobertura:

```bash
pnpm exec c8 pnpm test
# o
npx c8 npm test
```

El alcance se limita a `src/**/*.ts` excluyendo los propios archivos de test.

## Configuracion

`tsconfig.json` compila bajo:

- `target`: `ES2022`
- `module` / `moduleResolution`: `NodeNext`
- `rootDir`: `src`
- `outDir`: `dist`
- `strict`: `true`

## API publica

### Dominio (`src/domain/product.ts`)

- `Product`: entidad con `id`, `sku`, `name`, `price`, `stock`, `active`, `createdAt` y `updatedAt`.
- `CreateProductInput`: datos para crear un producto (`sku`, `name`, `price`, `stock?`).
- `UpdateProductInput`: datos para actualizar un producto (`name?`, `price?`, `stock?`, `active?`).
- `BusinessError`: error de negocio que extiende `Error`.

### Repositorio (`src/repositories/product-repository.ts`)

- `ProductRepository`: interfaz de persistencia.
- `InMemoryProductRepository`: implementacion en memoria. Los datos viven solo durante la ejecucion.

### Servicio (`src/services/product-service.ts`)

`ProductService` expone las operaciones principales:

- `create(input: CreateProductInput): Product`
- `list(includeInactive = false): Product[]`
- `getById(id: string): Product`
- `update(id: string, input: UpdateProductInput): Product`
- `delete(id: string): void`

## Reglas de negocio

- El SKU se normaliza a mayusculas, se recorta y debe ser unico.
- El nombre es obligatorio y se recorta.
- El precio debe ser un numero finito mayor que cero.
- El stock debe ser un entero mayor o igual que cero; si no se indica, es cero.
- Los productos inactivos no aparecen en `list()` por defecto; `list(true)` los incluye.
- No se puede desactivar un producto que tenga stock positivo.
- No se puede eliminar un producto que conserve stock.
