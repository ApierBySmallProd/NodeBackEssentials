import ServiceError from './service.error';

export default class ServiceRequest<Parameters = {}, Response = {}, ErrorData = undefined> {
  private parameters: Parameters;
  private error?: ServiceError<ErrorData>;
  private errors: ServiceError<ErrorData>[] = [];
  private response: Response;

  public constructor(parameters: Parameters) {
    this.parameters = parameters;
  }

  public setResponse = (response: Response) => {
    this.response = response;
  };

  public setError = (error: ServiceError<ErrorData>) => {
    this.error = error;
  };

  public addError = (error: ServiceError<ErrorData>) => {
    this.errors.push(error);
  };

  public getParameters = () => this.parameters;
  public getError = () => this.error;
  public getErrors = () => this.errors;
  public getResponse = () => this.response;
  public hasError = () => (this.error ? true : this.errors.length ? true : false);
}
