import { Request, Application, Response } from 'express';

export function getVoltages(request: Request, response: Response) {
  // ...
  response.send('these are some voltages');
}

export function installMiddlewares(app: Application) {
  app.get('/voltages', getVoltages);
}
