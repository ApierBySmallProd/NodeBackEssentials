import { HttpMiddleware, HttpRequest } from '../../..';

const jestSpy = jest.fn();

export default class ErrorMiddleware extends HttpMiddleware {
  public handle = async (request: HttpRequest, next: any) => {
    jestSpy.call(this, request, next);
    try {
      const res = await next();
      return res;
    } catch (error) {
      return request.respond('', 500);
    }
  };
}

export const spy = jestSpy;
