export const isString = (value: unknown): value is string =>
    typeof value === "string";

export const isNonEmptyString = (value: unknown): value is string =>
    typeof value === "string" && value.trim() !== "";
