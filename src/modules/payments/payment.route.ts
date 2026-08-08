import express from 'express';
import { paymentController } from './payment.controller';
import { auth } from '../../middlewares/auth';
import { Role } from '../../../generated/prisma/enums';


const router = express.Router();

// Create payment session (tenant)
router.post('/create-session', auth(Role.TENANT), paymentController.createPaymentSession);
router.get('/verify', paymentController.verifyPayment);
router.get('/history', auth(Role.TENANT), paymentController.getTenantPayments);
router.get('/:id', auth(Role.TENANT), paymentController.getPaymentById);



export const paymentRoutes = router;