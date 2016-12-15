/**
 * 全局变量
 */
export enum errorCode {
    REQUEST_ERROR = 1,
    REQUIRED_ERROR = 2,
    CONVER_ERROR = 3,
    CHOICES_ERROR = 4,
    NULL_ERROR = 5
};

export const errorMessages = {
    1: 'Unable to parse this request.',
    2: 'Missing request parameters.',
    3: 'Parameter type conversion error.',
    4: 'The parameter is not in the selection range.',
    5: 'Parameters are not allowed to be null.'
};