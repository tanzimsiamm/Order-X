import express, { Application, Request, Response } from 'express';
import config from './shared/config/env';

const app: Application = express();


// Health
app.get('/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Server is running',
    env: config.nodeEnv,
  });
});


export default app;
