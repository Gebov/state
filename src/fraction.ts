import { Action } from "./action";
import { Observable } from "rxjs/Observable";

export abstract class Fraction<TData> {
    getName(): string {
        let className = this.constructor.toString().match(/\w+/g)[1];
        return className.toLowerCase();
    }

    abstract handleAction(currentState: TData, action: Action<TData>): TData;

    abstract handleAsyncAction(action: Action<TData>): Observable<Action<TData>>;
}
