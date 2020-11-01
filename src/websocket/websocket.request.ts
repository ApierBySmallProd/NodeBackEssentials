import WSClient from "./websocket.client";

export default class WSRequest<T = any, U = any> {
  public external: T;
  public data: U;
  private client: WSClient;
  private event: string;

  public constructor(data: U, client: WSClient, event: string) {
    this.data = data;
    this.client = client;
    this.event = event;
  }

  public respond = (data: any) => {
    this.client.send(`response_${this.event}`, data);
  };
}
