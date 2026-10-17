import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { BusinessError } from "./product.js";

describe("BusinessError", () => {
  it("conserva el nombre de error y el mensaje", () => {
    const error = new BusinessError("fallo de negocio");

    assert.equal(error.name, "BusinessError");
    assert.equal(error.message, "fallo de negocio");
    assert.ok(error instanceof Error);
    assert.ok(error instanceof BusinessError);
  });
});
