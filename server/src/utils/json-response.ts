import { FastifyReply } from 'fastify';
import {
  STATUS_BAD_REQUEST,
  STATUS_ERROR,
  STATUS_SUCCESS,
  STATUS_UNAUTHORIZED,
} from '../constants.js';
import { ApiResponse, ResponseStatus } from '../types';

export default class JsonResponse<T> {
  private readonly code: number;
  private _status: string;

  constructor(statusCode = 200) {
    this.code = statusCode;
    this._status = '';
  }

  success(reply: FastifyReply, message: string, data?: T) {
    this._status = STATUS_SUCCESS;
    if (data) {
      return reply.code(200).send({
        code: 200,
        status: this._status,
        message,
        data,
      } satisfies ApiResponse<T>);
    } else {
      return reply.code(this.code).send({
        code: this.code,
        status: this._status,
        message,
      } satisfies ResponseStatus);
    }
  }

  unauthorized(reply: FastifyReply, message: string) {
    this._status = STATUS_UNAUTHORIZED;
    return reply.code(this.code).send({
      code: this.code,
      status: this._status,
      message,
    } satisfies ResponseStatus);
  }

  badRequest(reply: FastifyReply, message: string) {
    this._status = STATUS_BAD_REQUEST;
    return reply.code(this.code).send({
      code: this.code,
      status: this._status,
      message,
    } satisfies ResponseStatus);
  }

  error(reply: FastifyReply, message: string) {
    this._status = STATUS_ERROR;
    return reply.code(this.code).send({
      code: this.code,
      status: this._status,
      message,
    } satisfies ResponseStatus);
  }

  setStatus(status: string) {
    this._status = status;
    return this;
  }
}
