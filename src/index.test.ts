import { describe, it, mock } from "node:test";
import assert from "node:assert/strict";

describe("index demo", () => {
  it("executes the demo script and logs expected messages", async () => {
    const logs: unknown[] = [];
    const tables: unknown[] = [];

    mock.method(console, "log", (...args: unknown[]) => {
      logs.push(args[0]);
      return undefined;
    });
    mock.method(console, "table", (...args: unknown[]) => {
      tables.push(args[0]);
      return undefined;
    });

    await import("./index.js");

    mock.restoreAll();

    assert.ok(logs.includes("Productos activos:"));
    assert.ok(logs.includes("Todos los productos:"));
    assert.ok(tables.length >= 2);
    assert.ok(
      logs.some(
        (message) =>
          typeof message === "string" &&
          message.includes("No se puede eliminar un producto con stock disponible")
      )
    );
  });
});
