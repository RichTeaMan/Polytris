import "jest-extended";
import { Poly } from "../src/game/poly";

describe("Poly hash code", () => {
  it("Non zero hash", () => {

    const poly = new Poly();

    expect(poly.getHashCode()).toBeNumber();
  });
});
