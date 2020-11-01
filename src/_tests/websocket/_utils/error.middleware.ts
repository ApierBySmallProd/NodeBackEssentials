import { WSMiddleware, WSRequest } from "../../..";

export default class ErrorMiddleware extends WSMiddleware {
  public handle = async (
    request: WSRequest<any, any>,
    next: () => Promise<void>
  ): Promise<void> => {
    try {
      console.log("Error middleware");
      const response = await next();
      return response;
    } catch (error) {
      console.error("An error occured while processing a request");
      console.error(error);
    }
  };
}
