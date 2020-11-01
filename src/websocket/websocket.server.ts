import BaseWSController from "./websocket.controller";
import WSClient from "./websocket.client";
import WSMiddleware from "./websocket.middleware";
import http from "http";
import ws from "ws";

export default class WSServer {
  private wsServer: ws.Server;
  private controllers: typeof BaseWSController[] = [];
  private clients: WSClient[] = [];
  private globalMiddlewares: WSMiddleware[] = [];

  private constructor(server: http.Server) {
    this.wsServer = new ws.Server({ server });
  }

  public static fromHttpServer = (server: http.Server): WSServer => {
    return new WSServer(server);
  };

  public static fromScratch = (port: number, host: string = "0.0.0.0") => {
    const server = new http.Server();
    server.listen(port, host);
    return { wsServer: new WSServer(server), httpServer: server };
  };

  public start = async () => {
    this.wsServer.on("connection", (socket: ws) => {
      this.clients.push(new WSClient(socket, this, this.globalMiddlewares));
    });
  };

  public stop = () => {
    this.wsServer.close();
  };

  public useMiddleware = (middleware: WSMiddleware) => {
    this.globalMiddlewares.push(middleware);
  };

  public registerController = (controller: typeof BaseWSController) => {
    const c = controller as any;
    new c();
    this.controllers.push(controller);
  };

  public registerControllers = (controllers: typeof BaseWSController[]) => {
    controllers.forEach((c: any) => {
      new c();
      this.controllers.push(c);
    });
  };

  public broadcast = (roomName: string, event: string, data: any) => {
    this.clients.forEach((c) => {
      if (c.getRooms().find((r) => r === roomName)) {
        c.send(event, data);
      }
    });
  };

  public removeClient = (client: WSClient) => {
    this.clients = this.clients.filter((c) => c !== client);
  };
}
