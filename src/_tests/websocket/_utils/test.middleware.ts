import { WSMiddleware, WSRequest } from "../../..";

const jestMock = jest.fn();

export default class TestMiddleware extends WSMiddleware {
  public handle = async (
    request: WSRequest<any, any>,
    next: () => Promise<void>
  ): Promise<void> => {
    jestMock.call(this, request, next);
    return await next();
  };
}

export const spy = jestMock;
