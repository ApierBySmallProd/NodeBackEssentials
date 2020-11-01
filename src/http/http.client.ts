import express from 'express';

export default class HttpClient {
  private expressRequest: any;

  public constructor(expressRequest: express.Request) {
    this.expressRequest = expressRequest;
  }

  public getSession = (): any => {
    if (this.expressRequest.session) {
      return this.expressRequest.session.session;
    }
    console.error('Session not available! Please use a middleware to enable it!');
    return null;
  };

  public setSession = (session: any): void => {
    if (this.expressRequest.session) {
      this.expressRequest.session.session = session;
    } else {
      console.error('Session not available! Please use a middleware to enable it!');
    }
  };
}
