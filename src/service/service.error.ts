export default interface ServiceError<Data = undefined> {
  code: number;
  infos: string;
  data: Data;
}
