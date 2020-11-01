import HttpClient from './http.client';
import express from 'express';

export default class HttpRequest<External = any, Body = any, Query = any> {
  public external: External;
  public body: Body;
  public query: Query;
  private client: HttpClient;
  private expressRequest: express.Request;
  private expressResponse: express.Response;

  public constructor(req: express.Request, res: express.Response, client: HttpClient) {
    this.expressRequest = req;
    this.expressResponse = res;
    this.client = client;
    this.body = req.body;
    this.query = req.query as any;
  }

  public respond = (data: any, statusCode: number = 200) => {
    this.expressResponse.status(statusCode).send(data);
  };

  public respondWithHeader = (data: any, statusCode: number, headers: any) => {
    this.expressResponse.status(statusCode);
    for (const [key, value] of Object.entries(headers)) {
      this.expressResponse.setHeader(key, value as any);
    }
    this.expressResponse.send(data);
  };

  public getParam = (name: string) => this.expressRequest.params[name];
  public getQuery = (name: string) => this.query[name];
  public getHeader = (name: string) => this.expressRequest.headers[name];

  public getExpressRequest = () => this.expressRequest;
  public getExpressResponse = () => this.expressResponse;
}
