import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert";

describe("script de demostración", () => {
  const logs: unknown[][] = [];
  const tables: unknown[] = [];
  const originalLog = console.log;
  const originalTable = console.table;

  beforeEach(() => {
    console.log = (...args: unknown[]) => logs.push(args);
    console.table = (data: unknown) => tables.push(data);
  });

  afterEach(() => {
    console.log = originalLog;
    console.table = originalTable;
    logs.length = 0;
    tables.length = 0;
  });

  it("ejecuta el flujo completo sin detenerse y muestra productos y reglas", async () => {
    await import("./index.js");

    assert.ok(
      logs.some((args) => typeof args[0] === "string" && args[0].includes("Productos activos")),
      "debe mostrar la sección de productos activos"
    );
    assert.ok(
      logs.some((args) => typeof args[0] === "string" && args[0].includes("Todos los productos")),
      "debe mostrar la sección de todos los productos"
    );
    assert.ok(
      logs.some((args) => typeof args[0] === "string" && args[0].startsWith("Regla aplicada")),
      "debe mostrar el mensaje de regla aplicada"
    );
    assert.strictEqual(tables.length, 2, "debe pintar dos tablas");
  });
});
