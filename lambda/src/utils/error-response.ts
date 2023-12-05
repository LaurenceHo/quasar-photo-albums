import { STATUS_ERROR } from '../constants';

export default class ErrorResponse extends Error {
  private _status: string = STATUS_ERROR;
  private _code: number;

  constructor(message: string, code: number) {
    super(message);
    this._code = code;
  }

  get status(): string {
    return this._status;
  }

  set status(value: string) {
    this._status = value;
  }

  get code(): number {
    return this._code;
  }

  set code(value: number) {
    this._code = value;
  }
}
