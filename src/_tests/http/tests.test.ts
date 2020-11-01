import ErrorMiddleware, { spy as errorMiddlewareSpy } from './_utils/error.middleware';
import TestMiddleware, { spy as testMiddlewareSpy } from './_utils/test.middleware';

import AuthController from './_utils/auth.controller';
import { HttpServer } from '../..';
import SessionController from './_utils/session.controller';
import TestController from './_utils/test.controller';
import { expect as chaiexp } from 'chai';
import expressSession from 'express-session';
import supertest from 'supertest';
import supertestSession from 'supertest-session';

describe('Http tests', () => {
  let httpServer: HttpServer;
  beforeEach(async (done) => {
    httpServer = new HttpServer();
    done();
  });

  describe('Connection', () => {
    test('Request without route should return a 404 error', async () => {
      // httpServer.useMiddleware(errorMiddleware);
      httpServer.registerController(AuthController);

      httpServer.startForTests();
      const res = await supertest(httpServer.getApp()).get('/').send();
      chaiexp(res.status).to.be.equal(404);
    });
  });

  describe('Middlewares', () => {
    test('Application level middleware', async () => {
      const errorMiddleware = new ErrorMiddleware();

      httpServer.useMiddleware(errorMiddleware);
      httpServer.registerController(AuthController);

      errorMiddlewareSpy.mockClear();

      httpServer.startForTests();
      await supertest(httpServer.getApp()).get('/login').send();

      chaiexp(errorMiddlewareSpy.mock.calls.length).to.be.equal(1);
    });

    test('Group controller level middleware', async () => {
      httpServer.registerController(AuthController);

      testMiddlewareSpy.mockClear();

      httpServer.startForTests();
      await supertest(httpServer.getApp()).get('/login').send();

      chaiexp(testMiddlewareSpy.mock.calls.length).to.be.equal(1);
    });

    test('Express middleware', async () => {
      const spy = jest.fn((req, res, next) => next());
      httpServer.useExpressMiddleware(spy);
      httpServer.registerController(AuthController);

      testMiddlewareSpy.mockClear();

      httpServer.startForTests();
      await supertest(httpServer.getApp()).get('/login').send();

      chaiexp(spy.mock.calls.length).to.be.equal(1);
    });

    test('Pass parameters from middleware to controller', async () => {
      httpServer.useMiddleware(new TestMiddleware());
      httpServer.registerController(TestController);
      httpServer.startForTests();

      const res = await supertest(httpServer.getApp()).get('/test/external').send();

      chaiexp(res.body).to.be.deep.equal({ external: { test: 'test' } });
    });
  });

  describe('Session', () => {
    const sessionData = {
      message: 'hello',
    };
    test('By default there is no session saved', async () => {
      httpServer.registerControllers([AuthController, SessionController]);
      httpServer.useExpressMiddleware(
        expressSession({
          secret: 'secret',
          resave: false,
          saveUninitialized: true,
        }),
      );

      httpServer.startForTests();

      const res = await supertestSession(httpServer.getApp()).request('patch', '/session/get').send();

      chaiexp(res.body).to.be.deep.equal({});
    });

    test('When we save the session the next request can retrieve it', async () => {
      httpServer.registerControllers([AuthController, SessionController]);
      httpServer.useExpressMiddleware(
        expressSession({
          secret: 'secret',
          resave: false,
          saveUninitialized: true,
        }),
      );
      httpServer.startForTests();

      const session = supertestSession(httpServer.getApp());

      const res = await session.request('post', '/session/save').send(sessionData);

      chaiexp(res.status).to.be.equal(200);

      const res2 = await session.request('patch', '/session/get').send();
      chaiexp(res2.body).to.be.deep.equal(sessionData);
    });

    test('When we delete the session the next request cannot retrieve it', async () => {
      httpServer.registerControllers([AuthController, SessionController]);
      httpServer.useExpressMiddleware(
        expressSession({
          secret: 'secret',
          resave: false,
          saveUninitialized: true,
        }),
      );
      httpServer.startForTests();

      const session = supertestSession(httpServer.getApp());

      // * We put some things in the session
      const res = await session.request('post', '/session/save').send(sessionData);
      chaiexp(res.status).to.be.equal(200);

      // * We delete the session
      const res2 = await session.request('delete', '/session/delete').send();
      chaiexp(res2.status).to.be.equal(200);

      // * There should be no more session here
      const res3 = await session.request('put', '/session/get').send();
      chaiexp(res3.body).to.be.deep.equal({});
    });
  });

  describe('Header in response', () => {
    test('We can add headers in the response', async () => {
      const headers = {
        'X-Test': 'test',
      };
      httpServer.registerController(TestController);

      httpServer.startForTests();

      const res = await supertest(httpServer.getApp()).get('/test/header').send(headers);
      chaiexp(res.headers).have.deep.property('x-test', headers['X-Test']);
    });
  });

  describe('Test request parameters', () => {
    test('We can get query parameters from request', async () => {
      httpServer.registerController(TestController);

      httpServer.startForTests();

      const res = await supertest(httpServer.getApp()).get('/test/query?name=test').send();
      chaiexp(res.body).deep.equal({ name: 'test' });
    });

    test('We can get route parameters from request', async () => {
      httpServer.registerController(TestController);

      httpServer.startForTests();

      const res = await supertest(httpServer.getApp()).get('/test/params/toto').send();
      chaiexp(res.body).deep.equal({ name: 'toto' });
    });

    test('We can get headers from request', async () => {
      httpServer.registerController(TestController);

      httpServer.startForTests();

      const res = await supertest(httpServer.getApp()).get('/test/req/header').set('X-Test', 'test').send();
      chaiexp(res.body).deep.equal({ customHeader: 'test' });
    });
  });
});
