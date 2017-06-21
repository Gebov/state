import { ModuleWithProviders, NgModule, Inject } from "@angular/core";
import { State } from "./state";
import { Fraction } from "./fraction";

@NgModule()
export class StateModule {
    public static forRoot(): ModuleWithProviders {
        return {
            ngModule: StateModule,
            providers: [
                State
            ]
       };
    }

    constructor(@Inject(State) state: State, @Inject(Fraction) fractions: Fraction<any>[]) {
        state.registerFractions(fractions);
    }
}
