import { Fraction } from "./fraction";
import { State } from "./state";

class FractionImpl extends Fraction<any> { /* empty */ }

describe("state tests", () => {
    it("assert default return actions", () => {
        const state = new State();
        const stateAny: any = state;

        expect(stateAny.fractions).toBeDefined();
        expect(stateAny.fractions.length).toBe(0);
        const fractions = [new FractionImpl()];
        state.registerFractions(fractions);

        expect(stateAny.fractions).toBe(fractions);
    });
});
