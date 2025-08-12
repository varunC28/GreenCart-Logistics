import { Router } from 'express';
import auth from './auth';
import drivers from './drivers';
import routes from './routes';
import orders from './orders';
import simulation from './simulation';

const api = Router();

api.use('/auth', auth);
api.use('/drivers', drivers);
api.use('/routes', routes);
api.use('/orders', orders);
api.use('/simulate', simulation);

export default api;
