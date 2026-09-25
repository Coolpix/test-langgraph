# CRUD simulado en TypeScript

Aplicacion de prueba con un CRUD en memoria para productos. Incluye una capa de servicio con reglas de negocio, un repositorio simulado y tests automatizados.

## Requisitos

- Node.js 20 o superior
- npm

## Ejecutar

```bash
npm install
npm run dev
```

La ejecucion crea productos, actualiza uno, lista activos/inactivos y muestra el error esperado al intentar eliminar un producto con stock.

## Tests y compilacion

```bash
npm test
npm run build
npm start
```

Reglas incluidas:

- El SKU se normaliza a mayusculas y debe ser unico.
- El precio debe ser mayor que cero.
- El stock debe ser un entero no negativo.
- Los productos inactivos no aparecen en el listado por defecto.
- No se puede eliminar un producto que conserva stock.
