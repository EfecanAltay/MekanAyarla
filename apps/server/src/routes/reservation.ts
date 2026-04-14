import { Router } from 'express';
import { createReservation, cancelReservation, getMyReservations, getAllReservationsAdmin, updateReservationStatus, createPublicReservation } from '../controllers/reservation';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/public', createPublicReservation as any);

router.use(authenticate as any);

router.post('/', createReservation as any);
router.delete('/:id', cancelReservation as any);
router.get('/me', getMyReservations as any);
router.get('/admin', getAllReservationsAdmin as any);
router.patch('/:id/confirm', updateReservationStatus as any);

export default router;
