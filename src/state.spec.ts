import { Fraction } from "./fraction";
import { State } from "./state";
import { Action } from "./action";
import { Observable } from "rxjs/Rx";

const HANDLED_ACTION_NAME = "NAME";
const UNHANDLED_ACTION_NAME = "NAME2";
const HANDLED_ASYNC_ACTION_NAME = "NAME_ASYNC";
// const UNHANDLED_ASYNC_ACTION_NAME = "NAME2_ASYNC";

const fractionName = "fractionimpl";

class TestData {
    public test: boolean = true
}

class FractionImpl extends Fraction<TestData> {

    handleAction(currentState: TestData, action: Action<TestData>) {
        if (action.name === HANDLED_ACTION_NAME)
            return action.data;

        return currentState;
    }

    handleAsyncAction(action: Action<TestData>): Observable<Action<TestData>> {
        if (action.name === HANDLED_ASYNC_ACTION_NAME) {
            return Observable.of<Action<TestData>>({
                name: HANDLED_ACTION_NAME,
                data: action.data
            });
        }

        return State.EMPTY_VALUE;
    }
}

describe("state tests", () => {
    let state: State;
    let stateAny: any;


    beforeEach(() => {
        state = new State();
        stateAny = state;
    });

    it("assert default return actions", () => {
        expect(stateAny.fractions).toBeDefined();
        expect(stateAny.fractions.length).toBe(0);
        const fractions = [new FractionImpl()];
        state.registerFractions(fractions);

        expect(stateAny.fractions).toBe(fractions);
        const stateCopy = {};
        stateCopy[fractionName] = State.EMPTY_VALUE;

        expect(stateAny.innerState).toEqual(stateCopy);
    });

    it("test not handling actions", (done: DoneFn) => {
        const unhandledAction: Action<TestData> = {
            name: UNHANDLED_ACTION_NAME,
            data: {
                test: true
            }
        };

        testAction((handleActionSpy, action) => {
            expect(handleActionSpy).toHaveBeenCalledWith(State.EMPTY_VALUE, action);

            let handled: boolean = false;
            state.select<TestData>(fractionName).subscribe((data) => {
                handled = true;
            });

            setTimeout(() => {
                expect(handled).toBe(false);
                done();
            }, 0);

        }, unhandledAction);
    });

    it("test handling of sync actions", (done: DoneFn) => {
        const handledAction: Action<TestData> = {
            name: HANDLED_ACTION_NAME,
            data: {
                test: true
            }
        };

        testAction((handleActionSpy, action) => {
            expect(handleActionSpy).toHaveBeenCalledWith(State.EMPTY_VALUE, action);

            state.select<TestData>(fractionName).subscribe((data) => {
                expect(data).toEqual(action.data);

                let objectClone = {};
                objectClone[fractionName] = action.data;
                expect(stateAny.innerState).toEqual(objectClone);

                done();
            });
        }, handledAction);
    });

    it("test handling of async actions", (done: DoneFn) => {
        const handledAction: Action<TestData> = {
            name: HANDLED_ASYNC_ACTION_NAME,
            data: {
                test: true
            }
        };

        const expectedAction: Action<TestData> = {
            name: HANDLED_ACTION_NAME,
            data: handledAction.data
        };

        testAction((handleActionSpy, action) => {
            expect(handleActionSpy).toHaveBeenCalledWith(State.EMPTY_VALUE, expectedAction);

            state.select<TestData>(fractionName).subscribe((data) => {
                expect(data).toEqual(action.data);

                let objectClone = {};
                objectClone[fractionName] = expectedAction.data;
                expect(stateAny.innerState).toEqual(objectClone);

                done();
            });
        }, handledAction);
    });

    function testAction(asserter: (spy: jasmine.Spy, action: Action<TestData>) => void, action: Action<TestData>) {
        const fraction = new FractionImpl();
        const handleActionSpy = jasmine.createSpy("handleAction", fraction.handleAction).and.callThrough();
        fraction.handleAction = handleActionSpy;

        state.registerFractions([fraction]);

        state.notify(action);

        asserter(handleActionSpy, action);
    }
});
