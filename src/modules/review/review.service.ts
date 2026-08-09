import { prisma } from '../../lib/prisma';
import { ICreateReviewPayload } from './review.interface';



const createReviewIntoDb = async (payload: ICreateReviewPayload, tenantId: string) => {
    const { rating, comment, propertyId, rentalRequestId } = payload;

    if (rating < 1 || rating > 5) {
        throw new Error('Rating must be between 1 and 5');
    }

    const rentalRequest = await prisma.rentalRequest.findUnique({
        where: { id: rentalRequestId },
        include: {
            property: true,
        },
    });

    if (!rentalRequest) {
        throw new Error('Rental request not found');
    }

    if (rentalRequest.tenantId !== tenantId) {
        throw new Error('You are not authorized to review this property');
    }

    if (!rentalRequest.isPaid) {
        throw new Error('You can only review properties after payment is completed');
    }

    const existingReview = await prisma.review.findUnique({
        where: { rentalRequestId },
    });

    if (existingReview) {
        throw new Error('You have already reviewed this property for this rental');
    }

    const property = await prisma.property.findUnique({
        where: { id: propertyId },
    });

    if (!property) {
        throw new Error('Property not found');
    }

    const review = await prisma.review.create({
        data: {
            rating,
            comment: comment || null,
            tenantId,
            propertyId,
            rentalRequestId,
        },
        include: {
            tenant: {
                omit: {
                    password: true,
                },
            },
            property: {
                select: {
                    id: true,
                    title: true,
                    type: true,
                    price: true,
                    location: true,
                    city: true,
                    images: true,
                },
            },
        },
    });

    return review;
};

export const reviewService = {
    createReviewIntoDb,
}