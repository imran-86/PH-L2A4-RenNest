import { Request, Response } from 'express';
import { reviewService } from './review.service';

const createReview = async (req: Request, res: Response) => {
    try {
        const tenantId = req.user?.id;

        if (!tenantId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized',
            });
        }

        const { rating, comment, propertyId, rentalRequestId } = req.body;

        if (!rating || !propertyId || !rentalRequestId) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: rating, propertyId, rentalRequestId',
            });
        }

        const review = await reviewService.createReviewIntoDb(
            { rating, comment, propertyId, rentalRequestId },
            tenantId
        );

        res.status(201).json({
            success: true,
            message: 'Review created successfully',
            data: review,
        });
    } catch (error: any) {
        if (error.message === 'Rating must be between 1 and 5') {
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }
        if (error.message === 'Rental request not found') {
            return res.status(404).json({
                success: false,
                message: error.message,
            });
        }
        if (error.message === 'You are not authorized to review this property') {
            return res.status(403).json({
                success: false,
                message: error.message,
            });
        }
        if (error.message === 'You can only review properties after payment is completed') {
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }
        if (error.message === 'You have already reviewed this property for this rental') {
            return res.status(400).json({
                success: false,
                message: error.message,
            });
        }
        if (error.message === 'Property not found') {
            return res.status(404).json({
                success: false,
                message: error.message,
            });
        }
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to create review',
        });
    }
};

export const reviewController = {
    createReview,
}