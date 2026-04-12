import { Router } from 'express';
import { getOrganizationMetadata } from '../controllers/organization';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate as any);

router.get('/metadata', getOrganizationMetadata as any);

export default router;
