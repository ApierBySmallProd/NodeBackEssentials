import express, { RequestHandler } from 'express';

import BaseHttpController from './http.controller';
import HttpClient from './http.client';
import HttpControllerContainer from './http.controller.container';
import HttpExpressMiddleware from './http.express.middleware';
import { HttpMethod } from './http.decorators';
import HttpMiddleware from './http.middleware';
import HttpRequest from './http.request';
import http from 'http';

export default class HttpServer {
  private globalMiddlewares: HttpMiddleware[] = [];
  private controllers: typeof BaseHttpController[] = [];
  private expressApp: express.Application;
  private httpServer: http.Server;

  public constructor() {
    this.expressApp = express();
    this.expressApp.use(express.json());
  }

  public start = async (port: number, host: string = '0.0.0.0') => {
    this.generateRoutes();
    return new Promise((resolve) => {
      this.httpServer = this.expressApp.listen(port, host, () => {
        resolve();
      });
    });
  };

  public startForTests = () => {
    this.generateRoutes();
  };

  public stop = async () => {
    return new Promise((resolve) => {
      this.httpServer.on('close', () => resolve());
      this.httpServer.close();
    });
  };

  public useMiddleware = (middleware: HttpMiddleware) => {
    this.globalMiddlewares.push(middleware);
  };

  public useExpressMiddleware = (middleware: express.RequestHandler) => {
    this.globalMiddlewares.push(new HttpExpressMiddleware(middleware));
  };

  public getApp = () => this.expressApp;

  public registerController = (controller: typeof BaseHttpController) => {
    const c = controller as any;
    new c();
    this.controllers.push(controller);
  };

  public registerControllers = (controllers: typeof BaseHttpController[]) => {
    controllers.forEach((c: any) => {
      new c();
      this.controllers.push(c);
    });
  };

  private generateRoutes = () => {
    HttpControllerContainer.getAllControllerGroups().forEach((groupController) => {
      let router = express.Router();

      groupController.getControllers().forEach((controller) => {
        const middlewares = [...this.globalMiddlewares, ...groupController.getMiddlewares(), ...controller.middlewares];
        const handler = async (req: express.Request, res: express.Response) => {
          let i = -1;
          const client = new HttpClient(req);
          const request = new HttpRequest(req, res, client);
          const next = async () => {
            i += 1;
            if (middlewares.length > i) {
              middlewares[i].registerClient(client);
              await middlewares[i].handle(request, next);
            } else {
              await groupController.instantiateClass(client)[controller.funcName](request);
            }
          };
          await next();
        };

        if (controller.method instanceof Array) {
          controller.method.forEach((method) => {
            router = this.generateRoute(router, method, controller.route, handler);
          });
        } else {
          router = this.generateRoute(router, controller.method, controller.route, handler);
        }
      });

      const prefix = groupController.getPrefix();
      if (prefix) {
        this.expressApp.use(prefix, router);
      } else {
        this.expressApp.use(router);
      }
    });
    this.expressApp.all('*', (req: express.Request, res: express.Response) => {
      return res.sendStatus(404);
    });
  };

  private generateRoute = (router: express.Router, method: HttpMethod, route: string, func: RequestHandler) => {
    switch (method) {
      case 'DELETE': {
        router.delete(route, func);
        break;
      }
      case 'GET': {
        router.get(route, func);
        break;
      }
      case 'PATCH': {
        router.patch(route, func);
        break;
      }
      case 'POST': {
        router.post(route, func);
        break;
      }
      case 'PUT': {
        router.put(route, func);
        break;
      }
    }
    return router;
  };
}
