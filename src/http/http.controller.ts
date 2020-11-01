import HttpClient from './http.client';

export default class BaseHttpController {
  protected client: HttpClient;

  public constructor(client: HttpClient) {
    this.client = client;
  }
}
