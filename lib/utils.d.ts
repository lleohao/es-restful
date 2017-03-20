/**
 * 全局变量
 */
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
/**
 * 简单的路由参数处理
 */
export declare function getRuleReg(path: string): {
    rule: RegExp;
    params: string[];
};
/**
 * 判断对象数组中是否存在指定值
 */
export declare function arrHas(arr: Object[], key: string, value: any): boolean;
export declare class RestfulError extends Error {
}
