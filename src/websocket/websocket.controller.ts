import WSClient from "./websocket.client";

export default class BaseWSController {
  protected client: WSClient;

  public constructor(client: WSClient) {
    this.client = client;
  }
}
