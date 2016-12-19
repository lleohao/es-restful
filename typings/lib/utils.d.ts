export declare enum errorCode {
    REQUEST_ERROR = 1,
    REQUIRED_ERROR = 2,
    CONVER_ERROR = 3,
    CHOICES_ERROR = 4,
    NULL_ERROR = 5,
}
export declare const errorMessages: {
    1: string;
    2: string;
    3: string;
    4: string;
    5: string;
};
export declare function getRuleRegx(path: string): {
    rule: RegExp;
    params: any[];
};
export declare function arrHas(arr: Object[], key: string, value: any): boolean;
