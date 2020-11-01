import { BaseHttpController, HttpController, HttpControllerGroup, HttpRequest } from '../../..';

@HttpControllerGroup({
  prefix: '/test',
  middlewares: [],
})
export default class TestController extends BaseHttpController {
  @HttpController({
    method: 'GET',
    middlewares: [],
    route: '/header',
  })
  public header = async (request: HttpRequest) => {
    return request.respondWithHeader('', 200, request.body);
  };

  @HttpController({
    method: 'GET',
    middlewares: [],
    route: '/query',
  })
  public query = async (request: HttpRequest) => {
    return request.respond({ name: request.getQuery('name') });
  };

  @HttpController({
    method: 'GET',
    middlewares: [],
    route: '/params/:name',
  })
  public params = async (request: HttpRequest) => {
    return request.respond({ name: request.getParam('name') });
  };

  @HttpController({
    method: 'GET',
    middlewares: [],
    route: '/req/header',
  })
  public reqHeader = async (request: HttpRequest) => {
    return request.respond({ customHeader: request.getHeader('x-test') });
  };

  @HttpController({
    method: 'GET',
    middlewares: [],
    route: '/external',
  })
  public external = async (request: HttpRequest) => {
    return request.respond({ external: request.external });
  };
}
