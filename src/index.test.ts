import { describe, it } from "node:test";
import assert from "node:assert/strict";

describe("index script", () => {
  it("ejecuta la demostración y registra los mensajes esperados", async () => {
    const logs: unknown[] = [];
    const originalLog = console.log;
    const originalTable = console.table;
    const consoleAny = console as any;

    consoleAny.log = (...args: unknown[]) => logs.push(args);
    consoleAny.table = (...args: unknown[]) => logs.push(args);

    try {
      await import("./index.js");
    } finally {
      consoleAny.log = originalLog;
      consoleAny.table = originalTable;
    }

    const text = logs.map((entry) => JSON.stringify(entry)).join(" ");

    assert.match(text, /Productos activos/);
    assert.match(text, /Todos los productos/);
    assert.match(text, /Regla aplicada/);
    assert.match(text, /No se puede eliminar un producto con stock disponible/);
  });
});
