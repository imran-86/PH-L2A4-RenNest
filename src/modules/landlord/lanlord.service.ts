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

export const landlordService = {
    getLandlordRentalRequestsFromDB,
};