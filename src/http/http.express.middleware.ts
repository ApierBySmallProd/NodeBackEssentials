import { HttpMiddleware } from '.';
import HttpRequest from './http.request';
import express from 'express';

export default class HttpExpressMiddleware extends HttpMiddleware {
  private expressMiddleware: express.RequestHandler;

  public constructor(expressMiddleware: express.RequestHandler) {
    super();
    this.expressMiddleware = expressMiddleware;
  }

  public handle = async (request: HttpRequest, next: any) => {
    const customNext = async () => {
      await next();
    };
    await this.expressMiddleware(request.getExpressRequest(), request.getExpressResponse(), customNext);
  };
}
