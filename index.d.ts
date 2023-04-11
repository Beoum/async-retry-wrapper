type AsyncFunction = Function;

interface Functions {
    [name: string]: AsyncFunction;
}

interface Options {
    count?: number;
    interval?: number;
    rule?: Function;
    logging?: boolean;
}

export default function retryWrapper(functions: Functions, options?: Options): Functions;