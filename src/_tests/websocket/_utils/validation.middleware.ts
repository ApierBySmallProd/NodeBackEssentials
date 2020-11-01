import { WSMiddleware, WSRequest } from "../../..";

import Joi from "joi";

export default class ValidationMiddleware extends WSMiddleware {
  private schema: Joi.AnySchema;

  public constructor(schema: Joi.AnySchema) {
    super();
    this.schema = schema;
  }

  public handle = async (
    request: WSRequest,
    next: () => Promise<void>
  ): Promise<void> => {
    const { error } = this.schema.validate(request.data);
    if (!error) {
      return await next();
    } else {
      console.error("Invalid request");
      console.error(error);
    }
  };
}
