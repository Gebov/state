import { Action } from "./action";
import { Observable } from "rxjs/Observable";

export abstract class Fraction<TData> {
    getName(): string {
        let className = this.constructor.toString().match(/\w+/g)[1];
        return className.toLowerCase();
    }

    // abstract initState(): TData;

    handleAction(action: Action<TData>): TData {
        return; // return undefined to mark this as unhandled
    }

    handleAsyncAction(action: Action<TData>): Observable<Action<TData>> {
        return; // return undefined to mark this as unhandled
    }
}
