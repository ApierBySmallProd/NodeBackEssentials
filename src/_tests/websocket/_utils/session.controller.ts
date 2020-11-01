import {
  BaseWSController,
  WSController,
  WSControllerGroup,
  WSRequest,
} from "../../..";

@WSControllerGroup({
  prefix: "session",
  middlewares: [],
})
export default class SessionController extends BaseWSController {
  @WSController({
    event: "store",
    middlewares: [],
  })
  public store = (request: WSRequest) => {
    this.client.saveInSession(request.data);
  };

  @WSController({
    event: "get",
    middlewares: [],
  })
  public get = (request: WSRequest) => {
    const session = this.client.getFromSession();
    return request.respond(session);
  };

  @WSController({
    event: "clear",
    middlewares: [],
  })
  public clear = (request: WSRequest) => {
    this.client.saveInSession({});
  };
}
