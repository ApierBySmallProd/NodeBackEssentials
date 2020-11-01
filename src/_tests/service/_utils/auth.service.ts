import { LoginRequest } from './auth.service.data';

export default class AuthService {
  public login = (request: LoginRequest) => {
    // * Here we can get the parameters
    const { email, password } = request.getParameters();

    // * Here we can do whatever we want to process the request
    if (true) {
      request.setResponse({
        user: {
          age: 21,
          name: 'Toto',
          pseudo: 'TotoTheBeast',
        },
      });
    } else {
      request.setError({
        code: 1,
        infos: 'Incorrect credentials',
        data: {
          email,
          password,
        },
      });
    }
  };
}
