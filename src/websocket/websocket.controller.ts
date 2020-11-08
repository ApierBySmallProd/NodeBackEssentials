import WSClient from './websocket.client';

export default class BaseWSController {
  public client: WSClient;

  public constructor(client: WSClient) {
    this.client = client;
  }
}
