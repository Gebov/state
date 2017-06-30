import { ModuleWithProviders, NgModule, Inject, Optional } from "@angular/core";
import { State } from "./state";
import { Fraction } from "./fraction";

/**
 * The main state module that holds the State provider
 */
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
    /**
     * Initializes a new instance of the StateModule class.
     * @param state The injected state.
     * @param fractions The injected fractions.
     */
    constructor(@Optional() @Inject(State) state: State, @Inject(Fraction) fractions: Fraction<any>[]) {
        state.registerFractions(fractions);
    }
}
