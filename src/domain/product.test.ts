import { describe, it } from "node:test";
import assert from "node:assert";
import { BusinessError } from "./product.js";

describe("BusinessError", () => {
  it("sets name and message", () => {
    const error = new BusinessError("Something went wrong");
    assert.strictEqual(error.name, "BusinessError");
    assert.strictEqual(error.message, "Something went wrong");
    assert.ok(error instanceof Error);
  });
});
