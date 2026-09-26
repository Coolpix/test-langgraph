import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { BusinessError } from "./product.js";

describe("BusinessError", () => {
  it("creates an error with name BusinessError", () => {
    const message = "Invalid business operation";
    const error = new BusinessError(message);

    assert.equal(error.name, "BusinessError");
    assert.equal(error.message, message);
    assert.ok(error instanceof Error);
  });
});
