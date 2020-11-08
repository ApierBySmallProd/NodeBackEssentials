import HttpClient from './http.client';

export default class BaseHttpController {
  public client: HttpClient;

  public constructor(client: HttpClient) {
    this.client = client;
  }
}
