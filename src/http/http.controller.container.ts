import BaseHttpController from "./http.controller";
import HttpClient from "./http.client";
import { HttpMethod } from "./http.decorators";
import HttpMiddleware from "./http.middleware";

export interface IController {
  route: string;
  middlewares: HttpMiddleware[];
  funcName: string;
  method: HttpMethod | HttpMethod[];
}

export class IHttpControllerGroup {
  public name: string;

  private prefix: string = "";
  private middlewares: HttpMiddleware[] = [];
  private classType: typeof BaseHttpController;
  private controllers: IController[] = [];

  public constructor(classType: typeof BaseHttpController, name: string) {
    this.classType = classType;
    this.name = name;
  }

  public setGlobalInfos = (prefix: string, middlewares: HttpMiddleware[]) => {
    this.prefix = prefix;
    this.middlewares = middlewares;
  };

  public addController = (
    route: string,
    funcName: string,
    middlewares: HttpMiddleware[],
    method: HttpMethod | HttpMethod[]
  ) => {
    this.controllers.push({
      route,
      funcName,
      middlewares,
      method,
    });
  };

  public instantiateClass = (client: HttpClient): BaseHttpController => {
    return new this.classType(client);
  };

  public getPrefix = (): string => this.prefix;
  public getMiddlewares = (): HttpMiddleware[] => this.middlewares;
  public getControllers = (): IController[] => this.controllers;
}

export default class HttpControllerContainer {
  private static controllerGroups: IHttpControllerGroup[] = [];

  public static addControllerGroup = (
    name: string,
    classType: typeof BaseHttpController
  ): IHttpControllerGroup => {
    let controllerGroup:
      | IHttpControllerGroup
      | undefined = HttpControllerContainer.controllerGroups.find(
      (c) => c.name === name
    );
    if (!controllerGroup) {
      controllerGroup = new IHttpControllerGroup(classType, name);
      HttpControllerContainer.controllerGroups.push(controllerGroup);
    }

    return controllerGroup;
  };

  public static getAllControllerGroups = (): IHttpControllerGroup[] =>
    HttpControllerContainer.controllerGroups;
}
