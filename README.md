# ngstate

**State management with the power of RxJS for Angular 2 apps.**

[![npm version](https://badge.fury.io/js/ngstate.svg)](https://badge.fury.io/js/ngstate)
[![CircleCI](https://circleci.com/gh/Gebov/state/tree/master.svg?style=shield)](https://circleci.com/gh/Gebov/state/tree/master)

The main advantage of this state management library is that it allows its state to be dynamically extended - even by lazy modules. Another big advantage is that it is easily pluggable using Angular's DI mechanism. The fractions themselves are instantiated by Angular, which allows for other services to be injected into them.

## How to use

First create a Fraction that will handle the actions and provide the new state. 

``` typescript

import { Observable } from "rxjs/Rx";
import { ClassProvider } from "@angular/core/core";
import { Fraction, Action } from "ngstate";

export const HELLO_ACTION_NAME = "HELLO";

export class Message {
    text: string;
}

class AppFraction extends Fraction<Message> {

    handleAction(currentState: Message, action: Action<Message>): Message {
        if (action.name === HELLO_ACTION_NAME) {
            return {
                text: action.data.text
            }
        }

        // return current state if no modifications are made
        return currentState;
    }
    
    handleAsyncAction(action: Action<Message>): Observable<Action<Message>> {

        // return undefined if there are no async actions that need to be handled
        return undefined;
    }
}

export const FRACTION_REGISTRY: ClassProvider = {
    
    // must be multi so we can have multiple fractions registered
    multi: true,
    provide: Fraction,
    useClass: AppFraction
};


```

Next Import the State module into your application with the forRoot method and register the fraction with Angular. We want to have the State provider a singleton even for lazy loaded modules

``` typescript

import { NgModule }      from '@angular/core';
import { StateModule } from "ngstate";
import { FRACTION_REGISTRY } from "./app.fraction.ts";

@NgModule({
  ...
  // module is regiered with forRoot
  imports: [ StateModule.forRoot() ],
  providers: [FRACTION_REGISTRY]

  ...
```

And you are done. Next you need to subscribe to the observable and fire an event

``` typescript

export class AppComponent implements OnInit {
    private messageText: string;

    constructor(private state: State) {

    }

    ngOnInit(): void {

        // first we subscribe
        // NOTE: the name of the fraction defaults to its class name in lowercase formatting
        this.state.select<Message>("appfraction").subscribe((msg) => {
            this.messageText = msg.text;
        });

        // then we fire the event
        this.state.notify<Message>({
            name: HELLO_ACTION_NAME,
            data: {
                text: "Hello world !"
            }
        });
    }
}

```

### Note on lazy modules
If you have a lazy loaded module that has a fraction, it should import the StateModule again, but this time without the forRoot method

``` typescript

import { NgModule }      from '@angular/core';
import { StateModule } from "ngstate";
import { FRACTION_REGISTRY } from "./app.fraction.ts";

@NgModule({
  ...

  // module is regiered without forRoot
  imports: [ StateModule ],
  providers: [FRACTION_REGISTRY]

  ...
```

## Fractions
Advanced explanation of fractions and the mechanism underneath can be found [here](https://github.com/Gebov/state/wiki/Fractions)
