// We are telling TypeScript to add a new property to the Express Request interface
declare namespace Express {
  export interface Request {
    rawBody?: Buffer;
  }
}
