import express from 'express';
import Stripe from 'stripe';
import config from '../../config';
import { paymentService } from './payment.service';

const router = express.Router();

router.post('/stripe-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'] as string;
    const endpointSecret = config.stripe_webhook_secret as string;

    let event: Stripe.Event;

    try {
        const stripe = new Stripe(config.stripe_secret_key as string, {
            apiVersion: '2026-07-29.dahlia',
        });
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err: any) {
        console.error(`Webhook Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
        await paymentService.handleStripeWebhook(event);
        res.status(200).json({ received: true });
    } catch (error: any) {
        console.error('Webhook processing error:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;