import { RentalRequestStatus } from '../../../generated/prisma/enums';
import { prisma } from '../../lib/prisma';
import {ICreateRentalRequest, IRentalRequestQuery} from './rental_request.interface';


const createRentalRequest = async (payload: ICreateRentalRequest, tenantId: string) => {
    const { propertyId, moveInDate, moveOutDate, message } = payload;

    const property = await prisma.property.findUnique({
        where: { id: propertyId },
    });

    if (!property) {
        // throw new Error('Property not found');
        return {
            success: false,
            message: 'Property not found',
        };
    }

    
    const existingRequest = await prisma.rentalRequest.findFirst({
        where: {
            tenantId,
            propertyId,
            status: RentalRequestStatus.PENDING,
        },
    });

    if (existingRequest) {
        // throw new Error('You already have a pending request for this property');
        return {
            success: false,
            message: 'You already have a pending request for this property',
        };
    }

    // Create rental request
    const rentalRequest = await prisma.rentalRequest.create({
        data: {
            tenantId,
            propertyId,
            moveInDate: new Date(moveInDate),
            moveOutDate: moveOutDate ? new Date(moveOutDate) : null,
            message: message || null,
            status: RentalRequestStatus.PENDING,
        },
        include: {
            tenant: {
                omit: {
                    password: true,
                },
            },
            property: true,
        },
    });

    return rentalRequest;
};
const getUsersRentalRequestsFromDB = async (tenantId: string, query: IRentalRequestQuery) => {
    const { status, sortBy = 'createdAt', sortOrder = 'desc' } = query;

    const where: any = {
        tenantId,
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
            tenant: {
                omit: {
                    password: true,
                },
            },
        },
    });

    return rentalRequests;
};

const getRentalRequestByIdFromDB = async (id: string, tenantId: string) => {
    const rentalRequest = await prisma.rentalRequest.findUnique({
        where: {
            id,
        },
        include: {
            tenant: {
                omit: {
                    password: true,
                },
            },
            property: {
                include: {
                    landlord: {
                        omit: {
                            password: true,
                        },
                    },
                },
            },
        },
    });

    if (!rentalRequest) {
        // throw new Error('Rental request not found');
        return {
            success: false,
            message: 'Rental request not found',
        };
    }


    if (rentalRequest.tenantId !== tenantId) {
        // throw new Error('You are not authorized to view this request');
        return {
            success: false,
            message: 'You are not authorized to view this request',
        };
    }

    return rentalRequest;
};

export const rentalRequestService = {
    createRentalRequest,
    getUsersRentalRequestsFromDB,
    getRentalRequestByIdFromDB
};