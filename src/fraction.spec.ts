import { Fraction } from "./fraction";
import { Observable } from "rxjs/Rx";
import { Action } from "./action";

const testFractionName = "testFraction";

class FractionImpl extends Fraction<any> {

    handleAction(currentState: any, action: Action<any>) {
        throw new Error("Method not implemented.");
    }

    handleAsyncAction(action: Action<any>): Observable<Action<any>> {
        throw new Error("Method not implemented.");
    }
}
class FractionName extends Fraction<any> {

    handleAction(currentState: any, action: Action<any>) {
        throw new Error("Method not implemented.");
    }

    handleAsyncAction(action: Action<any>): Observable<Action<any>> {
        throw new Error("Method not implemented.");
    }
    getName() {
        return testFractionName;
    }
}

describe("fraction tests", () => {
    it("assert default name", () => {
        const fraction = new FractionImpl();

        const expectedName = "fractionimpl";

        const actualName = fraction.getName();

        expect(actualName).toBe(expectedName);
    });

    it("assert overriden name", () => {
        const fraction = new FractionName();

        const actualName = fraction.getName();

        expect(actualName).toBe(testFractionName);
    });
});
