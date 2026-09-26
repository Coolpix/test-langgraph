# CRUD simulado en TypeScript

Aplicación de ejemplo que implementa un CRUD en memoria de productos. Está escrita en TypeScript, organizada como un pnpm workspace y separa el código en capas de dominio, servicio y repositorio.

## Requisitos

- Node.js 20 o superior
- [pnpm](https://pnpm.io/)

## Instalación

```bash
pnpm install
```

## Ejecutar en desarrollo

```bash
pnpm dev
```

`pnpm dev` ejecuta el punto de entrada `src/index.ts`. La demostración crea productos, actualiza uno, lista activos/inactivos y muestra el error esperado al intentar eliminar un producto con stock.

## Compilar y ejecutar

```bash
pnpm build
pnpm start
```

- `pnpm build` compila el proyecto TypeScript a `dist/`.
- `pnpm start` ejecuta la salida compilada.

## Tests

```bash
pnpm test
```

> Nota: el repositorio está preparado para ejecutar el runner de tests configurado en `package.json`, pero actualmente no incluye archivos de test.

## Estructura del proyecto

```
src/
  domain/
    product.ts              # Entidad y tipos de Product
  repositories/
    product-repository.ts   # Almacenamiento en memoria (simulado)
  services/
    product-service.ts      # Reglas de negocio y validaciones
  index.ts                  # Punto de entrada y demostración
```

### Descripción de capas

- **Dominio (`src/domain/product.ts`)**: define la entidad `Product` y los contratos de datos que usa el resto de la aplicación.
- **Repositorio (`src/repositories/product-repository.ts`)**: gestiona el almacenamiento en memoria, exponiendo operaciones básicas de creación, lectura, actualización y eliminación.
- **Servicio (`src/services/product-service.ts`)**: contiene las reglas de negocio y validaciones antes de persistir los cambios.
- **Punto de entrada (`src/index.ts`)**: orquesta una ejecución de ejemplo que muestra el comportamiento del CRUD.

## Reglas de negocio

- El SKU se normaliza a mayúsculas y debe ser único.
- El precio debe ser mayor que cero.
- El stock debe ser un entero no negativo.
- Los productos inactivos no aparecen en el listado por defecto.
- No se puede eliminar un producto que conserva stock.
