import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import api from './routes';
import swaggerUi from 'swagger-ui-express';
import { openApiDoc } from './openapi';

const app = express();

app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json());

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openApiDoc));

app.use('/api', api);

// Error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

export default app;
