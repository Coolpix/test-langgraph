import { describe, it } from "node:test";
import assert from "node:assert";
import { BusinessError } from "./product.js";

describe("BusinessError", () => {
  it("exposes su nombre y conserva el mensaje", () => {
    const error = new BusinessError("mensaje de prueba");
    assert.strictEqual(error.name, "BusinessError");
    assert.strictEqual(error.message, "mensaje de prueba");
  });
});
