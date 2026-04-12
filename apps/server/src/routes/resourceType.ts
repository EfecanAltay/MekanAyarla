import { Router } from 'express';
import { getResourceTypes, createResourceType, updateResourceType, deleteResourceType } from '../controllers/resourceType';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate as any);

router.get('/', getResourceTypes as any);
router.post('/', createResourceType as any);
router.patch('/:id', updateResourceType as any);
router.delete('/:id', deleteResourceType as any);

export default router;
