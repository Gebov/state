import { Fraction } from "./fraction";
import { State } from "./state";
import { Action } from "./action";
import { Observable } from "rxjs/Rx";

const HANDLED_ACTION_NAME = "NAME";
const UNHANDLED_ACTION_NAME = "NAME2";
const HANDLED_ASYNC_ACTION_NAME = "NAME_ASYNC";
const UNHANDLED_ASYNC_ACTION_NAME = "NAME2_ASYNC";

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
    let handleSyncActionSpy: jasmine.Spy;
    let handleAsyncActionSpy: jasmine.Spy;

    beforeEach(() => {
        state = new State();
        stateAny = state;
        handleSyncActionSpy = jasmine.createSpy("handleSyncAction", stateAny.handleSyncAction).and.callThrough();
        handleAsyncActionSpy = jasmine.createSpy("handleAsyncAction", stateAny.handleAsyncAction).and.callThrough();
        stateAny.handleSyncAction = handleSyncActionSpy;
        stateAny.handleAsyncAction = handleAsyncActionSpy;
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

    it("test if action is sync or not", () => {
        let isAsync = stateAny.isAsyncAction(HANDLED_ACTION_NAME);
        expect(isAsync).toBe(false);

        isAsync = stateAny.isAsyncAction(HANDLED_ASYNC_ACTION_NAME);
        expect(isAsync).toBe(true);
    });

    it("assert that with no registered fractions, no handlers are called", () => {
        const actions = [HANDLED_ACTION_NAME, HANDLED_ASYNC_ACTION_NAME, UNHANDLED_ACTION_NAME, UNHANDLED_ASYNC_ACTION_NAME];

        actions.forEach((actionName) => {
            state.notify({
                name: actionName
            });

            expect(handleSyncActionSpy).not.toHaveBeenCalled();
            expect(handleAsyncActionSpy).not.toHaveBeenCalled();
        });
    });

    it("test action redistribution", () => {
        state.registerFractions([new FractionImpl()]);

        state.notify({
            name: HANDLED_ACTION_NAME
        });

        expect(handleSyncActionSpy).toHaveBeenCalled();
        expect(handleAsyncActionSpy).not.toHaveBeenCalled();

        handleSyncActionSpy.calls.reset();

        state.notify({
            name: HANDLED_ASYNC_ACTION_NAME
        });

        expect(handleSyncActionSpy).toHaveBeenCalled();
        expect(handleAsyncActionSpy).toHaveBeenCalled();

        handleSyncActionSpy.calls.reset();
        handleAsyncActionSpy.calls.reset();

        state.notify({
            name: UNHANDLED_ASYNC_ACTION_NAME
        });

        expect(handleSyncActionSpy).not.toHaveBeenCalled();
        expect(handleAsyncActionSpy).toHaveBeenCalled();
    });

    it("assert sync action result updates state", () => {
        state.registerFractions([new FractionImpl()]);

        state.notify({
            name: HANDLED_ACTION_NAME
        });

        expect(stateAny.innerState[fractionName]).toBe(State.EMPTY_VALUE);

        state.notify({
            name: HANDLED_ACTION_NAME,
            data: null
        });

        expect(stateAny.innerState[fractionName]).toBe(null);
    });

    it("assert sync action does not update with same value", (done: DoneFn) => {
        state.registerFractions([new FractionImpl()]);

        const testData = {};
        let timesPassed = 0;
        state.select(fractionName).subscribe((data) => {
            timesPassed++;
        });

        state.notify({
            name: HANDLED_ACTION_NAME,
            data: testData
        });

        expect(stateAny.innerState[fractionName]).toBe(testData);

        state.notify({
            name: HANDLED_ACTION_NAME,
            data: testData
        });

        setTimeout(() => {
            expect(timesPassed).toBe(1);
            done();
        }, 0);
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

    it("test not handling of async actions", (done: DoneFn) => {
        const unhandledAction: Action<TestData> = {
            name: UNHANDLED_ASYNC_ACTION_NAME,
            data: {
                test: true
            }
        };

        testAction((handleActionSpy, action) => {
            expect(handleActionSpy).not.toHaveBeenCalled();

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

    function testAction(asserter: (spy: jasmine.Spy, action: Action<TestData>) => void, action: Action<TestData>) {
        const fraction = new FractionImpl();
        const handleActionSpy = jasmine.createSpy("handleAction", fraction.handleAction).and.callThrough();
        fraction.handleAction = handleActionSpy;

        state.registerFractions([fraction]);

        state.notify(action);

        asserter(handleActionSpy, action);
    }
});
