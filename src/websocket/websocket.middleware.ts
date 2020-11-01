import WSClient from "./websocket.client";
import WSRequest from "./websocket.request";

export default abstract class WSMiddleware {
  protected client: WSClient;

  public constructor() {}

  public registerClient = (client: WSClient) => {
    this.client = client;
  };

  public abstract async handle(
    request: WSRequest,
    next: () => Promise<void>
  ): Promise<void>;
}
