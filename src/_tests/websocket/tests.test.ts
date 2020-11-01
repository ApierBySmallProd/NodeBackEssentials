import WSocket, {
  createClient,
  waitConnection,
} from "./_utils/websocket.client";

import AuthWSController from "./_utils/auth.controller";
import ErrorMiddleware from "./_utils/error.middleware";
import RoomController from "./_utils/room.controller";
import SessionController from "./_utils/session.controller";
import { WSServer } from "../..";
import { expect as chaiexp } from "chai";
import http from "http";
import { spy as testMiddlewareSpy } from "./_utils/test.middleware";
import { wait } from "../_utils/time.util";

describe("Websocket tests", () => {
  let IOServer: WSServer, HttpServer: http.Server;

  beforeEach(() => {});

  describe("Connection", () => {
    afterEach(async (done) => {
      try {
        IOServer.stop();
      } catch (e) {}
      try {
        HttpServer.close();
        await new Promise((resolve) => {
          HttpServer.on("close", () => resolve());
        });
      } catch (e) {}
      done();
    });

    test("Create a websocket server from an http server", async () => {
      HttpServer = new http.Server();
      IOServer = WSServer.fromHttpServer(HttpServer);
      IOServer.start();

      await new Promise((resolve) => {
        HttpServer.listen(2000, () => resolve());
      });

      const client = new WSocket("ws://localhost:2000");

      const spy = jest.fn();
      client.on("connect", spy);

      client.connect();

      await wait(100);

      chaiexp(spy.mock.calls.length).to.be.eq(1);
    });

    test("Create a websocket server from scratch", async () => {
      const { wsServer, httpServer } = WSServer.fromScratch(2000);
      IOServer = wsServer;
      HttpServer = httpServer;
      IOServer.start();

      await new Promise((resolve) => {
        HttpServer.on("listening", () => resolve());
      });

      const client = new WSocket("ws://localhost:2000");

      const spy = jest.fn();
      client.on("connect", spy);

      client.connect();

      await wait(100);

      chaiexp(spy.mock.calls.length).to.be.eq(1);
    });
  });

  describe("Middlewares", () => {
    beforeAll(async (done) => {
      HttpServer = new http.Server();
      IOServer = WSServer.fromHttpServer(HttpServer);
      IOServer.start();
      await new Promise((resolve) => {
        HttpServer.listen(2000, () => resolve());
      });

      done();
    });
    test("Application level middleware", async () => {
      const errorMiddleware = new ErrorMiddleware();
      const mock = jest.fn(async (request, next) => await next());
      errorMiddleware.handle = mock;
      IOServer.useMiddleware(errorMiddleware);
      IOServer.registerControllers([AuthWSController]);
      const client = new WSocket("ws://localhost:2000");

      client.connect();

      await waitConnection(client);

      client.emit("auth_login", { email: "test", password: "test" });

      await wait(100);

      chaiexp(mock.mock.calls.length).to.be.eq(1);
    });

    test("Group controller level middleware", async () => {
      testMiddlewareSpy.mockClear();
      IOServer.registerController(AuthWSController);

      const client = new WSocket("ws://localhost:2000");
      client.connect();
      await waitConnection(client);

      client.emit("auth_login", { email: "test", password: "test" });

      await wait(100);

      chaiexp(testMiddlewareSpy.mock.calls.length).to.be.equal(1);
    });
    afterAll(() => {
      IOServer.stop();
      HttpServer.close();
    });
  });

  describe("Session", () => {
    let client: WSocket;
    const dataToStore = {
      test: "some session data",
    };
    beforeAll(async (done) => {
      HttpServer = new http.Server();
      IOServer = WSServer.fromHttpServer(HttpServer);
      IOServer.start();
      await new Promise((resolve) => {
        HttpServer.listen(2000, () => resolve());
      });

      IOServer.registerControllers([AuthWSController, SessionController]);

      client = new WSocket("ws://localhost:2000");
      client.connect();
      await waitConnection(client);

      done();
    });

    test("Save data in the session", async () => {
      client.emit("session_store", dataToStore);

      await wait(100);

      const spy = jest.fn();

      client.emit("session_get", {}, spy);

      await wait(100);

      chaiexp(spy.mock.calls.length).to.be.equal(1);
      chaiexp(spy.mock.calls[0][0]).to.be.deep.equal(dataToStore);
    });

    test("Remove data from the session", async () => {
      // * Check if the session is still full
      const spy = jest.fn();

      client.emit("session_get", {}, spy);

      await wait(100);

      chaiexp(spy.mock.calls.length).to.be.equal(1);
      chaiexp(spy.mock.calls[0][0]).to.be.deep.equal(dataToStore);

      // * Clear the session
      client.emit("session_clear", dataToStore);

      await wait(100);

      // * Get the session again to see if it has been cleared
      const spy2 = jest.fn();

      client.emit("session_get", {}, spy2);

      await wait(100);

      chaiexp(spy2.mock.calls.length).to.be.equal(1);
      chaiexp(spy2.mock.calls[0][0]).to.be.deep.equal({});
    });

    afterAll(() => {
      IOServer.stop();
      HttpServer.close();
    });
  });

  describe("Room", () => {
    let client: WSocket;
    const broadcastMessage = { message: "hello" };
    beforeAll(async (done) => {
      HttpServer = new http.Server();
      IOServer = WSServer.fromHttpServer(HttpServer);
      IOServer.start();
      await new Promise((resolve) => {
        HttpServer.listen(2000, () => resolve());
      });

      IOServer.registerControllers([
        AuthWSController,
        SessionController,
        RoomController,
      ]);

      client = await createClient("ws://localhost:2000");

      done();
    });

    test("Broadcast in a room should send a message to everyone on the room", async () => {
      // * Get a second client
      const client2 = await createClient("ws://localhost:2000");
      client.emit("room_join", {});
      client2.emit("room_join", {});

      await wait(100);

      const spy = jest.fn();
      const spy2 = jest.fn();

      client.on("broadcast_event", spy);
      client2.on("broadcast_event", spy2);

      client.emit("room_broadcast", broadcastMessage);

      await wait(100);

      chaiexp(spy.mock.calls.length).to.be.equal(1);
      chaiexp(spy.mock.calls[0][0]).to.be.deep.equal(broadcastMessage);
      chaiexp(spy2.mock.calls.length).to.be.equal(1);
      chaiexp(spy2.mock.calls[0][0]).to.be.deep.equal(broadcastMessage);
    });

    test("Broadcast in a room should not send a message to people who are not in the room", async () => {
      // * Get a second client
      const client2 = await createClient("ws://localhost:2000");
      client.emit("room_join", {});

      await wait(100);

      const spy = jest.fn();
      const spy2 = jest.fn();

      client.on("broadcast_event", spy);
      client2.on("broadcast_event", spy2);

      client.emit("room_broadcast", broadcastMessage);

      await wait(100);

      chaiexp(spy.mock.calls.length).to.be.equal(1);
      chaiexp(spy.mock.calls[0][0]).to.be.deep.equal(broadcastMessage);
      chaiexp(spy2.mock.calls.length).to.be.equal(0);
    });

    test("Broadcast in a room should not send a message to people who left the room", async () => {
      // * Get a second client
      const client2 = await createClient("ws://localhost:2000");
      client.emit("room_join", {});
      client2.emit("room_join", {});

      await wait(100);

      client2.emit("room_leave", {});

      await wait(100);

      const spy = jest.fn();
      const spy2 = jest.fn();

      client.on("broadcast_event", spy);
      client2.on("broadcast_event", spy2);

      client.emit("room_broadcast", broadcastMessage);

      await wait(100);

      chaiexp(spy.mock.calls.length).to.be.equal(1);
      chaiexp(spy.mock.calls[0][0]).to.be.deep.equal(broadcastMessage);
      chaiexp(spy2.mock.calls.length).to.be.equal(0);
    });

    afterAll(() => {
      IOServer.stop();
      HttpServer.close();
    });
  });
});
