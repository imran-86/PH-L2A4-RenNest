import { RentalRequestStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";



const getLandlordRentalRequestsFromDB = async (landlordId: string, query: any) => {
    const { status, sortBy = 'createdAt', sortOrder = 'desc' } = query;

    const where: any = {
        property: {
            landlordId: landlordId,
        },
    };

    if (status) {
        where.status = status;
    }

    const rentalRequests = await prisma.rentalRequest.findMany({
        where,
        orderBy: {
            [sortBy]: sortOrder,
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
                    landlordId: true,
                },
            },
        },
    });


    for (const request of rentalRequests) {
        if (request.property?.landlordId !== landlordId) {
            throw new Error('You are not authorized to view these requests');
        }
    }

    return rentalRequests;
};
const updateRentalRequestStatus = async ( requestId: string, landlordId: string,
    status: RentalRequestStatus
) => {
   
    const existingRequest = await prisma.rentalRequest.findUnique({
        where: { id: requestId },
        include: {
            property: {
                select: {
                    landlordId: true,
                },
            },
        },
    });

    if (!existingRequest) {
        throw new Error('Rental request not found');
    }

    if (existingRequest.property?.landlordId !== landlordId) {
        throw new Error('You are not authorized to update this request');
    }

    if (existingRequest.status !== RentalRequestStatus.PENDING) {
        throw new Error(`This request is already ${existingRequest.status.toLowerCase()}`);
    }

    const updatedRequest = await prisma.rentalRequest.update({
        where: { id: requestId },
        data: {
            status: status,
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

    return updatedRequest;
};

const getPropertyRentalHistoryFromDB = async (propertyId: string, landlordId: string) => {
  
    const property = await prisma.property.findFirst({
        where: {
            id: propertyId,
            landlordId: landlordId,
        },
        select: {
            id: true,
            title: true,
            type: true,
            price: true,
            location: true,
            city: true,
            images: true,
            description: true,
        },
    });

    if (!property) {
        throw new Error('Property not found or you are not the owner');
    }

    const rentalHistory = await prisma.rentalRequest.findMany({
        where: {
            propertyId: propertyId,
            isPaid: true, 
        },
        include: {
            tenant: {
                omit: {
                    password: true,
                },
            },
            payment: {
                select: {
                    id: true,
                    amount: true,
                    status: true,
                    paidAt: true,
                },
            },
            review: {
                include: {
                    tenant: {
                        omit: {
                            password: true,
                        },
                    },
                },
            },
        },
    });
    const ratingStats = await prisma.review.aggregate({
        where: {
            propertyId: propertyId,
        },
        _avg: {
            rating: true,
        },
        _count: {
            rating: true,
        },
    });
    return {
        property: property,
        rentalHistory: rentalHistory,
        ratingStats: {
            averageRating: ratingStats._avg.rating || 0,
            totalReviews: ratingStats._count.rating || 0,
        },
    };
};

export const landlordService = {
    getLandlordRentalRequestsFromDB,
    updateRentalRequestStatus,
    getPropertyRentalHistoryFromDB
};