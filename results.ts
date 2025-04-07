export type LogicResult = {
    error: boolean,
    message: string;
    result: object | null;
};

export function createErrorResult(message: string): LogicResult {
    return {
        error: true,
        message,
        result: null
    }
}

export function createSuccessResult(result: object): LogicResult {
    return {
        error: false,
        message: 'Success.',
        result
    }
}