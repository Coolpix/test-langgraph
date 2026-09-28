import { describe, it, mock } from "node:test";
import assert from "node:assert/strict";

describe("index demo script", () => {
  it("runs the demo and logs expected output", async () => {
    const logs: unknown[] = [];
    const tables: unknown[] = [];

    mock.method(
      console,
      "log",
      ((...args: unknown[]) => {
        logs.push(args[0]);
      }) as typeof console.log,
    );
    mock.method(
      console,
      "table",
      ((...args: unknown[]) => {
        tables.push(args[0]);
      }) as typeof console.table,
    );

    try {
      await import("./index.js");
    } finally {
      mock.restoreAll();
    }

    assert.ok(
      logs.some(
        (message) =>
          typeof message === "string" && message.includes("Productos activos"),
      ),
    );
    assert.ok(
      logs.some(
        (message) =>
          typeof message === "string" && message.includes("Todos los productos"),
      ),
    );
    assert.ok(
      logs.some(
        (message) =>
          typeof message === "string" &&
          message.startsWith("Regla aplicada:"),
      ),
    );
    assert.equal(tables.length, 2);
  });
});
