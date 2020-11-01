import { BaseHttpController, HttpController, HttpControllerGroup, HttpRequest } from '../../..';

import TestMiddleware from './test.middleware';

@HttpControllerGroup({
  prefix: '',
  middlewares: [new TestMiddleware()],
})
export default class AuthController extends BaseHttpController {
  @HttpController({
    method: 'GET',
    middlewares: [],
    route: '/login',
  })
  public login = async (request: HttpRequest) => {
    return request.respond({}, 200);
  };
}
