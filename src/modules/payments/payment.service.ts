import Stripe from 'stripe';
import { prisma } from '../../lib/prisma';
import config from '../../config';
import { ICreatePaymentSession } from './payment.interface';
import { PaymentProvider, PaymentStatus } from '../../../generated/prisma/enums';


const stripe = new Stripe(config.stripe_secret_key as string, {
    apiVersion: '2026-07-29.dahlia',
});




const createStripePaymentSession = async (payload: ICreatePaymentSession) => {
    const {
        rentalRequestId,
        propertyId,
        tenantId,
        tenantEmail,
        amount,
        propertyTitle,
    } = payload;

    
    const amountInPaisa = Math.round(amount * 100);

    
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
            {
                price_data: {
                    currency: 'bdt',
                    product_data: {
                        name: `Rent for ${propertyTitle}`,
                        description: `Property ID: ${propertyId} | Request ID: ${rentalRequestId}`,
                    },
                    unit_amount: amountInPaisa,
                },
                quantity: 1,
            },
        ],
        mode: 'payment',
        success_url: `${config.app_url}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${config.app_url}/payment/cancel`,
        customer_email: tenantEmail,
        metadata: {
            rentalRequestId,
            propertyId,
            tenantId,
        },
    });

    const payment = await prisma.payment.create({
        data: {
            transactionId: session.id,
            amount: amount,
            method: 'card',
            provider: PaymentProvider.STRIPE,
            status: PaymentStatus.PENDING,
            providerRef: session.id,
            metadata: {
                sessionId: session.id,
                propertyId,
                rentalRequestId,
            },
            rentalRequest: {
                connect: { id: rentalRequestId },
            },
            tenant: {
                connect: { id: tenantId },
            },
        },
    });

    return {
        sessionId: session.id,
        url: session.url,
        paymentId: payment.id,
    };
};
const handleStripeWebhook = async (event: any) => {
    switch (event.type) {
        case 'checkout.session.completed': {
            const session = event.data.object;
            const payment = await prisma.payment.findUnique({
                where: { transactionId: session.id },
            });

            if (payment && payment.status === PaymentStatus.PENDING) {
                await prisma.payment.update({
                    where: { id: payment.id },
                    data: {
                        status: PaymentStatus.COMPLETED,
                        paidAt: new Date(),
                        providerRef: session.payment_intent,
                        metadata: {
                            ...(payment.metadata as any),
                            paymentIntentId: session.payment_intent,
                        },
                    },
                });

                await prisma.rentalRequest.update({
                    where: { id: payment.rentalRequestId },
                    data: {
                        isPaid: true,
                        paidAt: new Date(),
                        paymentId: payment.id,
                    },
                });
            }
            break;
        }

        case 'checkout.session.expired': {
            const session = event.data.object;
            await prisma.payment.updateMany({
                where: { transactionId: session.id },
                data: {
                    status: PaymentStatus.FAILED,
                    metadata: {
                        failureReason: 'Session expired',
                    },
                },
            });
            break;
        }
    }
};
const verifyStripePayment = async (sessionId: string) => {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    const payment = await prisma.payment.findUnique({
        where: { transactionId: sessionId },
        include: {
            rentalRequest: true,
        },
    });

    if (!payment) {
        throw new Error('Payment record not found');
    }

    if (session.payment_status === 'paid') {
        await prisma.payment.update({
            where: { id: payment.id },
            data: {
                status: PaymentStatus.COMPLETED,
                paidAt: new Date(),
                providerRef: session.payment_intent as string,
                metadata: {
                    ...(payment.metadata as any),
                    paymentIntentId: session.payment_intent,
                },
            },
        });

        await prisma.rentalRequest.update({
            where: { id: payment.rentalRequestId },
            data: {
                isPaid: true,
                paidAt: new Date(),
                paymentId: payment.id,
            },
        });

        return {
            success: true,
            payment,
            session,
        };
    }

    if (session.payment_status === 'unpaid' || session.payment_status === 'no_payment_required') {
        await prisma.payment.update({
            where: { id: payment.id },
            data: {
                status: PaymentStatus.FAILED,
                metadata: {
                    ...(payment.metadata as any),
                    failureReason: session.payment_status,
                },
            },
        });
    }

    return {
        success: false,
        payment,
        session,
    };
};
const getTenantPayments = async (tenantId: string) => {
    const payments = await prisma.payment.findMany({
        where: { tenantId },
        orderBy: { createdAt: 'desc' },
        include: {
            rentalRequest: {
                include: {
                    property: true,
                },
            },
        },
    });
    return payments;
};
const getPaymentById = async (paymentId: string, tenantId: string) => {
    const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: {
            rentalRequest: {
                include: {
                    property: true,
                },
            },
            tenant: {
                omit: {
                    password: true,
                },
            },
        },
    });

    if (!payment) {
        throw new Error('Payment not found');
    }

    if (payment.tenantId !== tenantId) {
        throw new Error('You are not authorized to view this payment');
    }

    return payment;
};



export const paymentService = {
    createStripePaymentSession,
    verifyStripePayment,
    handleStripeWebhook,
    getTenantPayments,
    getPaymentById
};