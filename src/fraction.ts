import { Action } from "./action";
import { Observable } from "rxjs/Observable";
import { State } from "./state";

/**
 * Fractions handle actions. They can be sync and async. Async actions must end with the 'async' keyword.
 * Sync actions are redirected to the handleSyncAction method and async actions are redirected to handleAsyncAction.
 * The difference between the two is that only sync actions can mutate the state directly.
 * Whereas async actions must return a sync action, which will mutate the state on their behalf.
 */
export abstract class Fraction<TData> {
    /**
     * Gets the name of the fraction. Defaults to the implemented class name in lowercase.
     */
    getName(): string {
        let className = this.constructor.toString().match(/\w+/g)[1];
        return className.toLowerCase();
    }

    /**
     * Handles the sync action. If the returned state is different, the state tree is changed and the subscribed
     * obsevers are notified. This method is invoked by the State when an action is dispatched.
     * @param currentState The current state of the fraction.
     * @param action The action that was dispatched.
     */
    abstract handleAction(currentState: TData, action: Action<any>): TData;

    /**
     * Handles the async action. If the action cannot be handled, the method should return 'undefined'
     * @param action The async action that was dispatched. This method is invoked by the State when an action is dispatched.
     */
    public handleAsyncAction(currentState: TData, action: Action<any>): Observable<Action<any>> {
        return State.EMPTY_VALUE;
    }
}
