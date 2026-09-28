import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { BusinessError } from "./product.js";

describe("BusinessError", () => {
  it("sets name and message", () => {
    const error = new BusinessError("something went wrong");

    assert.equal(error.name, "BusinessError");
    assert.equal(error.message, "something went wrong");
    assert.ok(error instanceof Error);
  });
});
