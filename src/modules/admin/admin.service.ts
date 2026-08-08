import { UserStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";


const getAllUsersFromDb = async (query: any) => {
    const { searchTerm, role, status, sortBy = 'createdAt', sortOrder = 'desc' } = query;

    const where: any = {};

    if (searchTerm) {
        where.OR = [
            { name: 
                { contains: searchTerm,
                  mode: 'insensitive' 
                } 
            },
            { email: 
                { contains: searchTerm,
                  mode: 'insensitive'
             } 
            },
            { phone: 
                { contains: searchTerm,
                 mode: 'insensitive'

                } 
            },
        ];
    }

    if (role) {
        where.role = role;
    }

    if (status) {
        where.status = status;
    }

    const users = await prisma.user.findMany({
        where,
        orderBy: {
            [sortBy]: sortOrder,
        },
        omit: {
            password: true,
        },
        include: {
            _count: {
                select: {
                    properties: true,
                    rentalRequests: true,
                },
            },
        },
    });

    return users;
};
const updateUserStatusInDb = async (userId: string, status: UserStatus) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!user) {
        throw new Error('User not found');
    }

    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
            status: status,
        },
        omit: {
            password: true,
        },
    });

    return updatedUser;
};

export const adminService = {
    getAllUsersFromDb,
    updateUserStatusInDb,
};