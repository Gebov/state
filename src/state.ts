import { Injectable } from "@angular/core";
import { Fraction } from "./fraction";
import { Action } from "./action";
import { Observable, ReplaySubject } from "rxjs";

interface Notification {
    name: string,
    data: any,

    action: Action<any>
}

/**
 * The state service that dispatches actions and provides access to the state
 */
@Injectable()
export class State {
    public static readonly EMPTY_VALUE = undefined;
    private readonly asyncSuffix = "async";

    private innerState: any = {};
    private fractionsCache = new Map<string, Fraction<any>>();

    private stateStream = new ReplaySubject<Notification>(1); // todo history

    /**
     * Registers additional fractions with the state. Can be used to extend the state dynamically.
     * @param fractions The fractions to be registered.
     */
    public registerFractions(fractions: Array<Fraction<any>>) {
        if (fractions) {
            fractions.forEach((fraction) => {
                const fractionName = fraction.getName();
                if (this.innerState.hasOwnProperty(fractionName))
                    throw new Error(`Fraction with the name ${fractionName} already exists.`)

                this.innerState[fractionName] = State.EMPTY_VALUE;
                this.fractionsCache.set(fractionName, fraction);
            });
        }
    }

    /**
     * This function dispatches an action to all of the available fractions.
     * @param action The action to dispatch.
     */
    public notify<TData>(action: Action<TData>): void {
        const isAsyncAction = this.isAsyncAction(action.name);

        this.fractionsCache.forEach((fraction, name) => {
            if (isAsyncAction) {
                this.handleAsyncAction(name, fraction, action);
            }
            else {
                this.handleSyncAction(name, fraction, action);
            }
        });
    }

    /**
     * Returns an observable that tracks changes to the fraction.
     * @param name The name of the fraction.
     */
    public select<TData>(name: string): Observable<TData> {
        if (!this.innerState.hasOwnProperty(name))
            throw new Error("Invalid subscription");

        return this.stateStream.filter<Notification>((x) => {
            return x.name === name;
        }).map(x => x.data).pluck(name);
    }

    private handleSyncAction(fractionName: string, fraction: Fraction<any>, action: Action<any>) {
        const currentState = this.innerState[fractionName];

        let result = fraction.handleAction(currentState, action);
        if (result === State.EMPTY_VALUE)
            return;

        if (result === currentState)
            return;

        if (result instanceof Object) {
            result = Object.freeze(result);
        }

        this.innerState[fractionName] = result;

        this.stateStream.next({
            name: fractionName,
            data: this.innerState,
            action: action
        });
    }

    private handleAsyncAction(fractionName: string, fraction: Fraction<any>, action: Action<any>): void {
        const currentState = this.innerState[fractionName];

        const asyncHandle = fraction.handleAsyncAction(currentState, action);
        if (asyncHandle === State.EMPTY_VALUE)
            return;

        const subscription = asyncHandle.subscribe((data) => {
            this.notify(data);
            if (subscription) {
                subscription.unsubscribe();
            }
        });
    }

    private isAsyncAction(actionName: string): boolean {
        const lowerCaseName = actionName.toLowerCase();

        let result = false;
        if (lowerCaseName.endsWith(this.asyncSuffix))
            result = true;

        return result;
    }
}
