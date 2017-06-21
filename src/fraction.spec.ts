import { Fraction } from "./fraction";

class FractionImpl extends Fraction<any> { /* empty */ }

describe("fraction tests", () => {
    it("assert default return actions", () => {
        const fraction = new FractionImpl();

        const defaultSyncReturnValue = fraction.handleAction(null, null);

        expect(defaultSyncReturnValue).toBe(undefined);

        const defaultAsyncReturnValue = fraction.handleAsyncAction(null);

        expect(defaultAsyncReturnValue).toBe(undefined);
    });

    it("assert default name", () => {
        const fraction = new FractionImpl();

        const expectedName = "fractionimpl";

        const actualName = fraction.getName();

        expect(actualName).toBe(expectedName);
    });
});
