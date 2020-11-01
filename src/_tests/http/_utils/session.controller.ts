import { BaseHttpController, HttpController, HttpControllerGroup, HttpRequest } from '../../..';

@HttpControllerGroup({
  prefix: '/session',
  middlewares: [],
})
export default class SessionController extends BaseHttpController {
  @HttpController({
    method: 'POST',
    middlewares: [],
    route: '/save',
  })
  public save = async (request: HttpRequest) => {
    this.client.setSession(request.body);
    return request.respond('');
  };

  @HttpController({
    method: ['PATCH', 'PUT'],
    middlewares: [],
    route: '/get',
  })
  public get = async (request: HttpRequest) => {
    return request.respond(this.client.getSession());
  };

  @HttpController({
    method: 'DELETE',
    middlewares: [],
    route: '/delete',
  })
  public delete = async (request: HttpRequest) => {
    this.client.setSession({});
    return request.respond('');
  };
}
