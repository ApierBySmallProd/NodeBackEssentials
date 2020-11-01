import HttpClient from "./http.client";
import HttpRequest from "./http.request";

export default abstract class HttpMiddleware {
  protected client: HttpClient;

  public constructor() {}

  public registerClient = (client: HttpClient) => {
    this.client = client;
  };

  public abstract async handle(
    request: HttpRequest,
    next: () => Promise<void>
  ): Promise<void>;
}
