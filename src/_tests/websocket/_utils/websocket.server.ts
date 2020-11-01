import AuthWSController from "./auth.controller";
import { WSServer } from "../../..";
import http from "http";

export default async () => {
  const httpServer = new http.Server();
  const server = WSServer.fromHttpServer(httpServer);
  httpServer.listen(2000);

  server.registerControllers([AuthWSController]);
  await server.start();

  return { server, httpServer };
};
