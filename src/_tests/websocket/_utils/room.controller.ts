import {
  BaseWSController,
  WSController,
  WSControllerGroup,
  WSRequest,
} from "../../..";

@WSControllerGroup({
  prefix: "room",
  middlewares: [],
})
export default class RoomController extends BaseWSController {
  @WSController({
    event: "join",
    middlewares: [],
  })
  public join = (request: WSRequest) => {
    this.client.joinRoom("the_room");
  };

  @WSController({
    event: "broadcast",
    middlewares: [],
  })
  public broadcast = (request: WSRequest) => {
    this.client.broadcast("the_room", "broadcast_event", request.data);
  };

  @WSController({
    event: "leave",
    middlewares: [],
  })
  public leave = (request: WSRequest) => {
    this.client.leaveRoom("the_room");
  };
}
