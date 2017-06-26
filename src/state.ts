import { Injectable } from "@angular/core";
import { Fraction } from "./fraction";
import { Action } from "./action";
import { Observable, ReplaySubject } from "rxjs";

interface Notification {
    name: string,
    data: any,

    action: Action<any>
}

@Injectable()
export class State {
    public static readonly EMPTY_VALUE = undefined;
    private readonly asyncSuffix = "async";

    private innerState: any = {};
    private fractions: Array<Fraction<any>> = [];
    private stateStream = new ReplaySubject<Notification>(1); // todo history

    public registerFractions(fractions: Array<Fraction<any>>) {
        if (fractions) {
            fractions.forEach((fraction) => {
                const fractionName = fraction.getName();
                if (!this.innerState.hasOwnProperty(fractionName))
                    this.innerState[fractionName] = State.EMPTY_VALUE;
            });

            this.fractions = fractions;
        }
    }

    public notify<TData>(action: Action<TData>): void {
        this.fractions.forEach((fraction: Fraction<TData>) => {
            if (this.isAsyncAction(action.name)) {
                this.handleAsyncAction(fraction, action);
            }
            else {
                this.handleSyncAction(fraction, action);
            }
        });
    }

    public select<TData>(name: string): Observable<TData> {
        if (!this.innerState.hasOwnProperty(name))
            throw new Error("Invalid subscription");

        return this.stateStream.filter<Notification>((x) => {
            return x.name === name;
        }).map(x => x.data).pluck(name);
    }

    private handleSyncAction(fraction: Fraction<any>, action: Action<any>) {
        const fractionName = fraction.getName();
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

    private handleAsyncAction(fraction: Fraction<any>, action: Action<any>): void {
        const asyncHandle = fraction.handleAsyncAction(action);
        if (asyncHandle === State.EMPTY_VALUE) // todo
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
