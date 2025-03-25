
import { Router } from 'express';
import { SupportModel } from '../models/support.model';

const router = Router();

router.post('/api/support', async (req, res) => {
  try {
    const support = new SupportModel(req.body);
    await support.save();
    res.status(201).json({ message: 'Support request created successfully' });
  } catch (error) {
    console.error('Support request error:', error);
    res.status(500).json({ message: 'Failed to create support request' });
  }
});

export const setupSupportAPI = (app: Express) => {
  app.use(router);
};
