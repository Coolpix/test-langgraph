import { describe, it } from "node:test";
import assert from "node:assert";

describe("index demo script", () => {
  it("runs the demo without errors and logs expected messages", async () => {
    const logs: unknown[][] = [];
    const originalLog = console.log;
    const originalTable = console.table;

    console.log = (...args: unknown[]) => logs.push(args);
    console.table = (...args: unknown[]) => logs.push(args);

    try {
      await import("./index.js");
      assert.ok(logs.some((args) => args[0] === "Productos activos:"));
      assert.ok(logs.some((args) => args[0] === "Todos los productos:"));
      assert.ok(logs.some((args) => typeof args[0] === "string" && args[0].startsWith("Regla aplicada:")));
    } finally {
      console.log = originalLog;
      console.table = originalTable;
    }
  });
});
