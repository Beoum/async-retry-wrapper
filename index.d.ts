interface Functions {
    [name: string]: Function;
}

export default function retryWrapper(functions: Functions): Functions;