import { Injectable } from "@angular/core";
import { Fraction } from "./fraction";
import { Action } from "./action";
import { Observable, ReplaySubject } from "rxjs";

interface Notification {
    name: string,
    data: any
}

@Injectable()
export class State {
    private state: any = {};
    private fractions: Array<Fraction<any>> = [];
    private readonly asyncSuffix = "async";
    private stateStream = new ReplaySubject<Notification>(1); // todo history

    public registerFractions(fractions: Array<Fraction<any>>) {
        if (fractions)
            this.fractions = fractions;
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

    private handleSyncAction(fraction: Fraction<any>, action: Action<any>) {

        const fractionName = fraction.getName();
        const currentState = this.state[fractionName];
        const result = fraction.handleAction(currentState, action);
        if (result === undefined)
            return;

        if (result === currentState)
            return;

        this.state[fractionName] = result;

        this.stateStream.next({
            name: fractionName,
            data: result
        });
    }

    private handleAsyncAction(fraction: Fraction<any>, action: Action<any>): void {
        const asyncHandle = fraction.handleAsyncAction(action);
        if (asyncHandle === undefined) // todo
            return;

        const subscription = asyncHandle.subscribe((data) => {
            this.notify(data);
            if (subscription) {
                subscription.unsubscribe();
            }
        });
    }

    public select<TData>(name: string): Observable<TData> {
        if (!this.fractions.find((x) => x.getName() == name)) // todo cache
            throw new Error(`Invalid state name - ${name}`);

        return this.stateStream.filter<Notification>((x) => {
            return x.name === name;
        }).map(x => x.data);
    }

    private isAsyncAction(actionName: string): boolean {
        const lowerCaseName = actionName.toLowerCase();

        let result = false;
        if (lowerCaseName.endsWith(this.asyncSuffix))
            result = true;

        return result;
    }
}
