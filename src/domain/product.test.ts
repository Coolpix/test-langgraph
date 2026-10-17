import { describe, it } from "node:test";
import assert from "node:assert";
import { BusinessError } from "./product.js";

describe("BusinessError", () => {
  it("is an Error with the given name and message", () => {
    const error = new BusinessError("business rule violated");

    assert.ok(error instanceof Error);
    assert.strictEqual(error.name, "BusinessError");
    assert.strictEqual(error.message, "business rule violated");
  });
});
