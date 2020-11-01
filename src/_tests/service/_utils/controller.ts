import AuthService from './auth.service';
import { LoginRequest } from './auth.service.data';
import { ServiceRequest } from '../../..';

export default class Controller {
  public static login = () => {
    const request: LoginRequest = new ServiceRequest({
      email: 'toto@test.com',
      password: 'secret',
    });

    const authService = new AuthService();
    authService.login(request);

    if (request.hasError()) {
      // * Here we can access the error(s)
      const error = request.getError();
    } else {
      // * Here we can access the response
      const { user } = request.getResponse();
    }
  };
}
