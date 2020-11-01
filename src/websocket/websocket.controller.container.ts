import WSClient from "./websocket.client";
import WSController from "./websocket.controller";
import WSMiddleware from "./websocket.middleware";

export interface IController {
  event: string;
  middlewares: WSMiddleware[];
  funcName: string;
}

export class IWSControllerGroup {
  public name: string;

  private prefix: string = "";
  private middlewares: WSMiddleware[] = [];
  private classType: typeof WSController;
  private controllers: IController[] = [];

  public constructor(classType: typeof WSController, name: string) {
    this.classType = classType;
    this.name = name;
  }

  public setGlobalInfos = (prefix: string, middlewares: WSMiddleware[]) => {
    this.prefix = prefix;
    this.middlewares = middlewares;
  };

  public addController = (
    event: string,
    funcName: string,
    middlewares: WSMiddleware[]
  ) => {
    this.controllers.push({
      event,
      funcName,
      middlewares,
    });
  };

  public instantiateClass = (client: WSClient): WSController => {
    return new this.classType(client);
  };

  public getPrefix = (): string => this.prefix;
  public getMiddlewares = (): WSMiddleware[] => this.middlewares;
  public getControllers = (): IController[] => this.controllers;
}

export default class WSControllerContainer {
  private static controllerGroups: IWSControllerGroup[] = [];

  public static addControllerGroup = (
    name: string,
    classType: typeof WSController
  ): IWSControllerGroup => {
    let controllerGroup:
      | IWSControllerGroup
      | undefined = WSControllerContainer.controllerGroups.find(
      (c) => c.name === name
    );
    if (!controllerGroup) {
      controllerGroup = new IWSControllerGroup(classType, name);
      WSControllerContainer.controllerGroups.push(controllerGroup);
    }

    return controllerGroup;
  };

  public static getAllControllerGroups = (): IWSControllerGroup[] =>
    WSControllerContainer.controllerGroups;
}
