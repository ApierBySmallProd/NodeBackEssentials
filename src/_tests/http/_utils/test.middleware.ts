import { HttpMiddleware, HttpRequest } from '../../..';

const jestSpy = jest.fn();

export default class TestMiddleware extends HttpMiddleware {
  public handle = async (request: HttpRequest, next: any) => {
    jestSpy.call(this, request, next);
    request.external = { ...request.external, test: 'test' };
    return await next();
  };
}

export const spy = jestSpy;
