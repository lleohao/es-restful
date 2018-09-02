/**
 * Check value type
 *
 * @export
 * @param v     value
 * @param t     type string
 * @returns {boolean}
 */
export function isType(v: any, t: string): boolean {
  const type: string = Object.prototype.toString.call(v);

  return type.match(/\[object (\w+)]/)[1].toLowerCase() === t;
}

export function createError(setting: RestfulErrorSetting, implementationContext?: any) {
  return new RestfulError(setting, implementationContext);
}

export enum RestfulErrorType {
  ROUTE = 1,
  PARAMS,
  REQUEST,
  ROUTER
}

export interface RestfulErrorSetting {
  type?: RestfulErrorType;
  message?: string;
  code?: number;
  statusCode?: number;
  details?: string | object;
}

export class RestfulError extends Error {
  public type: RestfulErrorType;
  public code: number;
  public statusCode: number;
  public details: object | string;

  constructor(settings: RestfulErrorSetting, implementationContext?: any) {
    super();
    this.name = 'RestfulError';

    this.type = settings.type || -100;
    this.message = settings.message || 'An error occurred.';
    this.details = settings.details || '';
    this.code = settings.code || 0;
    this.statusCode = settings.statusCode || 400;

    Error.captureStackTrace(this, implementationContext || RestfulError);
  }
}
