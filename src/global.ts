/**
 * Global variable
 */

/**
 * es-resuful error code 
 * 
 * @export
 * @enum {number}
 */
export enum ErrorCode {
    REQUEST_ERROR = 1,
    REQUIRED_ERROR = 2,
    CONVER_ERROR = 3,
    CHOICES_ERROR = 4,
    NULL_ERROR = 5
}

/**
 * es-resuful message
 */
export const ErrorMessages = {
    1: 'Unable to parse this request.',
    2: 'Missing request parameters.',
    3: 'Parameter type conversion error.',
    4: 'The parameter is not in the selection range.',
    5: 'Parameters are not allowed to be null.'
};
