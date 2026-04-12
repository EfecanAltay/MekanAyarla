import { Router } from 'express';
import { getResources, getResourceDetails, createResource, createTimeSlots, updateResource, deleteResource, updateSlotStatus, updateDateStatus, batchToggleSlots } from '../controllers/resource';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '@remotely/shared';

const router = Router();

// Publicly browseable
router.get('/', getResources);
router.get('/:id', getResourceDetails);

// Admin/Staff only
router.post('/', authenticate as any, authorize([UserRole.BUSINESS_ADMIN, UserRole.SUPER_ADMIN]) as any, createResource as any);
router.patch('/:id', authenticate as any, authorize([UserRole.BUSINESS_ADMIN, UserRole.SUPER_ADMIN]) as any, updateResource as any);
router.delete('/:id', authenticate as any, authorize([UserRole.BUSINESS_ADMIN, UserRole.SUPER_ADMIN]) as any, deleteResource as any);
router.post('/slots', authenticate as any, authorize([UserRole.BUSINESS_ADMIN, UserRole.STAFF]) as any, createTimeSlots as any);
router.patch('/:id/slots/batch-toggle', authenticate as any, authorize([UserRole.BUSINESS_ADMIN, UserRole.SUPER_ADMIN]) as any, batchToggleSlots as any);
router.patch('/:id/slots/:slotId/toggle', authenticate as any, authorize([UserRole.BUSINESS_ADMIN, UserRole.SUPER_ADMIN]) as any, updateSlotStatus as any);
router.patch('/:id/dates/:dateStr/toggle', authenticate as any, authorize([UserRole.BUSINESS_ADMIN, UserRole.SUPER_ADMIN]) as any, updateDateStatus as any);


export default router;
