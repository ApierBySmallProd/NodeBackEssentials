import { BaseWSController, WSController, WSControllerGroup } from "../../..";

import Joi from "joi";
import TestMiddleware from "./test.middleware";
import ValidationMiddleware from "./validation.middleware";

const loginSchema = Joi.object({
  email: Joi.string().required(),
  password: Joi.string().required(),
});

@WSControllerGroup({
  prefix: "auth",
  middlewares: [new TestMiddleware()],
})
export default class AuthWSController extends BaseWSController {
  @WSController({
    event: "login",
    middlewares: [new ValidationMiddleware(loginSchema)],
  })
  public login = async (data: any) => {
    // * ... treat the request
  };
}
