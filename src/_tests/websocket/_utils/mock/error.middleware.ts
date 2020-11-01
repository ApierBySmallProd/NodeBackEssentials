import ErrorMiddleware from "../error.middleware";

const originalHandle = ErrorMiddleware.prototype.handle;

const mock = () => {
  jest.mock("../error.middleware");
};

const unMock = () => {
  ErrorMiddleware.prototype.handle = originalHandle;
};

export default {
  mock,
  unMock,
};
