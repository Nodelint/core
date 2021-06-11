
export const EventSymbol = Symbol.for("NodeLintEvent");
export const DataEventSymbol = Symbol.for("NodeLintDataEvent");

export const Events = Object.freeze({
    Log: Symbol("logEvent"),
    Information: Symbol("informationEvent"),
    Warning: Symbol("warningEvent"),
    Error: Symbol("errorEvent")
});

export const Mode = Object.freeze({
    Asynchronous: Symbol("asynchronousMode"),
    Synchronous: Symbol("synchronousMode")
});
