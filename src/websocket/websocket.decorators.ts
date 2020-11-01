import BaseWSController from './websocket.controller';
import WSControllerContainer from './websocket.controller.container';
import WSMiddleware from './websocket.middleware';

export interface WSControllerGroupOptions {
  prefix: string;
  middlewares: WSMiddleware[];
}

export const WSControllerGroup = (config: WSControllerGroupOptions) => {
  return <T extends { new (...args: any[]): BaseWSController }>(constructor: T) => {
    const controllerGroup = WSControllerContainer.addControllerGroup(constructor.name, constructor);
    controllerGroup.setGlobalInfos(config.prefix, config.middlewares);
    return class extends constructor {
      constructor(...args: any[]) {
        super(...args);
      }
    };
  };
};

export interface WSControllerOptions {
  event: string;
  middlewares: WSMiddleware[];
}

export const WSController = (config: WSControllerOptions) => {
  return function (target: BaseWSController, key: string | symbol, descriptor?: PropertyDescriptor): any {
    const controllerGroup = WSControllerContainer.addControllerGroup(
      target.constructor.name,
      target.constructor as any,
    );
    controllerGroup.addController(config.event, key as string, config.middlewares);
  };
};
