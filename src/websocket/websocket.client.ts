import WSControllerContainer, {
  IController,
  IWSControllerGroup,
} from "./websocket.controller.container";

import BaseWSController from "./websocket.controller";
import WSMiddleware from "./websocket.middleware";
import WSRequest from "./websocket.request";
import WSServer from "./websocket.server";
import ws from "ws";

interface ControllerGroup {
  object: BaseWSController;
  infos: IWSControllerGroup;
}

export default class WSClient {
  private socket: ws;
  private session: any = {};
  private server: WSServer;
  private rooms: string[] = [];
  private controllerGroups: ControllerGroup[] = [];
  private globalMiddlewares: WSMiddleware[];

  public constructor(
    socket: ws,
    server: WSServer,
    globalMiddlewares: WSMiddleware[]
  ) {
    this.socket = socket;
    this.server = server;
    this.globalMiddlewares = globalMiddlewares;
    this.initEvents();
    this.initControllerGroups();
  }

  public saveInSession(data: any): void {
    this.session = data;
  }
  public getFromSession() {
    return this.session;
  }

  public joinRoom = (roomName: string) => {
    this.rooms = this.rooms.filter((r) => r !== roomName);
    this.rooms.push(roomName);
  };

  public leaveRoom = (roomName: string) => {
    this.rooms = this.rooms.filter((r) => r !== roomName);
  };

  public broadcast = (roomName: string, event: string, data: any) => {
    this.server.broadcast(roomName, event, data);
  };

  public getRooms = (): string[] => this.rooms;

  public send = (event: string, data: any) => {
    try {
      this.socket.send(JSON.stringify({ type: event, data }));
    } catch (error) {
      console.error(error);
    }
  };

  private initControllerGroups = () => {
    const controllerGroups = WSControllerContainer.getAllControllerGroups();
    controllerGroups.forEach((group) => {
      const obj = group.instantiateClass(this);
      this.controllerGroups.push({
        object: obj,
        infos: group,
      });
    });
  };

  private initEvents = () => {
    this.socket.on("close", this.onClose);
    this.socket.on("error", this.onError);
    this.socket.on("message", this.onMessage);
    this.socket.on("open", this.onOpen);
    this.socket.on("upgrade", this.onUpgrade);
    this.socket.on("ping", this.onPing);
    this.socket.on("pong", this.onPong);
    this.socket.on("unexpected-response", this.onUnexpectedResponse);
  };

  private onClose = (socket: ws, code: number, reason: string) => {
    this.server.removeClient(this);
  };

  private onError = (socket: ws, err: Error) => {};

  private onMessage = (data: ws.Data) => {
    try {
      const parsed = JSON.parse(data.toString());
      if (parsed.type) {
        const parsedType: string = parsed.type;
        const parsedData = parsed.data;
        let middlewares = [...this.globalMiddlewares];
        let finalControllerGroup: ControllerGroup | null = null;
        let finalController: IController | null = null;
        for (let i = 0; i < this.controllerGroups.length; i += 1) {
          const group = this.controllerGroups[i];
          const prefix = group.infos.getPrefix();
          if (!prefix || parsedType.startsWith(`${prefix}_`)) {
            const event = parsedType.substring(
              prefix.length + (!prefix ? 0 : 1),
              parsedType.length
            );
            const controllers = group.infos.getControllers();
            for (let j = 0; j < controllers.length; j += 1) {
              const controller = controllers[j];
              if (controller.event === event) {
                middlewares = [
                  ...middlewares,
                  ...group.infos.getMiddlewares(),
                  ...controller.middlewares,
                ];
                finalControllerGroup = group;
                finalController = controller;
                break;
              }
            }
          }
        }
        if (finalController && finalControllerGroup) {
          // * Let's process every middlewares
          const request = new WSRequest(parsedData, this, parsedType);
          let i = -1;
          const next = async () => {
            i += 1;
            if (middlewares.length > i) {
              middlewares[i].registerClient(this);
              await middlewares[i].handle(request, next);
            } else if (finalController && finalControllerGroup) {
              finalControllerGroup.object[finalController.funcName](request);
            }
          };
          next();
        } else {
          console.error(
            `Received event '${parsedType}', but no controller where found for this event!`
          );
        }
      }
    } catch (error) {
      console.error(
        `An error occured while handling the request: ${data.toString()}`
      );
      console.error(error);
    }
  };

  private onOpen = (socket: ws) => {};

  private onUpgrade = (socket: ws, request: any) => {};

  private onPing = (socket: ws, data: Buffer) => {};

  private onPong = (socket: ws, data: Buffer) => {};

  private onUnexpectedResponse = (
    socket: ws,
    request: any,
    response: any
  ) => {};
}
