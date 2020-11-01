import BaseHttpController from './http.controller';
import HttpControllerContainer from './http.controller.container';
import HttpMiddleware from './http.middleware';

export type HttpMethod = 'POST' | 'GET' | 'DELETE' | 'PUT' | 'PATCH';

export interface HttpControllerGroupOptions {
  prefix: string;
  middlewares: HttpMiddleware[];
}

export const HttpControllerGroup = (config: HttpControllerGroupOptions) => {
  return <T extends { new (...args: any[]): BaseHttpController }>(constructor: T) => {
    const controllerGroup = HttpControllerContainer.addControllerGroup(constructor.name, constructor);
    controllerGroup.setGlobalInfos(config.prefix, config.middlewares);
    return class extends constructor {
      constructor(...args: any[]) {
        super(...args);
      }
    };
  };
};

export interface HttpControllerOptions {
  route: string;
  method: HttpMethod | HttpMethod[];
  middlewares: HttpMiddleware[];
}

export const HttpController = (config: HttpControllerOptions) => {
  return function (target: BaseHttpController, key: string | symbol, descriptor?: PropertyDescriptor): any {
    const controllerGroup = HttpControllerContainer.addControllerGroup(
      target.constructor.name,
      target.constructor as any,
    );
    controllerGroup.addController(config.route, key as string, config.middlewares, config.method);
  };
};
