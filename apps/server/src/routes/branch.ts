import { Router } from 'express';
import { getBranches, createBranch, updateBranch, deleteBranch } from '../controllers/branch';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate as any);

router.get('/', getBranches as any);
router.post('/', createBranch as any);
router.patch('/:id', updateBranch as any);
router.delete('/:id', deleteBranch as any);

export default router;
