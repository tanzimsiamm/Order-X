import express, { Application, Request, Response } from 'express';

const app: Application = express();


app.get('/', (req, res) => {
  res.send('Hello World!')
})


export default app;
