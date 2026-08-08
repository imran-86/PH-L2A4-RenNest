import { Request, Response } from 'express';
import { paymentService } from './payment.service';
import { prisma } from '../../lib/prisma';

import { RentalRequestStatus } from '../../../generated/prisma/enums';

const createPaymentSession = async (req: Request, res: Response) => {
    try {
        const { rentalRequestId } = req.body;
        const tenantId = req.user?.id;

        if (!tenantId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized',
            });
        }

        const rentalRequest = await prisma.rentalRequest.findUnique({
            where: { id: rentalRequestId },
            include: {
                property: true,
                tenant: true,
            },
        });

        if (!rentalRequest) {
            return res.status(404).json({
                success: false,
                message: 'Rental request not found',
            });
        }

       
        if (rentalRequest.tenantId !== tenantId) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to pay for this request',
            });
        }

       
        if (rentalRequest.status !== RentalRequestStatus.APPROVED) {
            return res.status(400).json({
                success: false,
                message: 'This rental request is not approved yet',
            });
        }

      
        if (rentalRequest.isPaid) {
            return res.status(400).json({
                success: false,
                message: 'This rental request has already been paid',
            });
        }

        
        const existingPayment = await prisma.payment.findUnique({
            where: { rentalRequestId: rentalRequest.id },
        });

        if (existingPayment && existingPayment.status === 'PENDING') {
            return res.status(400).json({
                success: false,
                message: 'Payment is already in progress. Please complete the payment.',
                data: {
                    paymentId: existingPayment.id,
                },
            });
        }

        
        const session = await paymentService.createStripePaymentSession({
            rentalRequestId: rentalRequest.id,
            propertyId: rentalRequest.propertyId,
            tenantId: tenantId,
            tenantEmail: rentalRequest.tenant.email,
            amount :Number(rentalRequest.property.price),
            propertyTitle: rentalRequest.property.title,
        });

        res.status(200).json({
            success: true,
            message: 'Payment session created successfully',
            data: {
                sessionId: session.sessionId,
                url: session.url,
                paymentId: session.paymentId,
            },
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to create payment session',
        });
    }
};



export const paymentController = {
    createPaymentSession,
    
};