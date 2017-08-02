/**
 * es-resuful error code 
 * 
 * @export
 * @enum {number}
 */
export enum StatusCode {
    REQUIRED_ERROR = 1,
    CONVER_ERROR = 2,
    CHOICES_ERROR = 3,
    NULL_ERROR = 4
}

/**
 * es-resuful message
 */
export const ErrorMessages = {
    1: 'Missing request parameters.',
    2: 'Parameter type conversion error.',
    3: 'The parameter is not in the selection range.',
    4: 'Parameters are not allowed to be null.'
};
