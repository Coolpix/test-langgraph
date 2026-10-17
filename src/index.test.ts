import { before, after, describe, it } from "node:test";
import assert from "node:assert";

describe("index script", () => {
  const logs: unknown[][] = [];
  const tables: unknown[][] = [];
  const originalLog = console.log;
  const originalTable = console.table;

  before(() => {
    console.log = ((...args: unknown[]) => {
      logs.push(args);
    }) as unknown as typeof console.log;
    console.table = ((...args: unknown[]) => {
      tables.push(args);
    }) as unknown as typeof console.table;
  });

  after(() => {
    console.log = originalLog;
    console.table = originalTable;
  });

  it("runs the demo without crashing and applies the stock deletion rule", async () => {
    await import("./index.js");

    assert.ok(logs.some((args) => args[0] === "Productos activos:"));
    assert.ok(logs.some((args) => args[0] === "Todos los productos:"));
    assert.ok(
      logs.some((args) =>
        String(args[0]).includes("No se puede eliminar un producto con stock disponible"),
      ),
    );
    assert.strictEqual(tables.length, 2);
  });
});
