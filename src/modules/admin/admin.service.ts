import { error } from "node:console";
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
const getAllPropertiesForAdmin = async (query: any) => {
    const { searchTerm, type, status, city, minPrice, maxPrice, sortBy = 'createdAt', sortOrder = 'desc' } = query;

    const where: any = {};

    if (searchTerm) {
        where.OR = [
            { title: { contains: searchTerm, 
                mode: 'insensitive' } 
            },
            { description: { contains: searchTerm,
                 mode: 'insensitive' } 
            },
            { location: { contains: searchTerm,
                 mode: 'insensitive' } 
            },
            { city: { contains: searchTerm, 
                mode: 'insensitive' } 
            },
        ];
    }

    if (type) {
        where.type = type;
    }

    if (status) {
        where.status = status;
    }

    if (city) {
        where.city = { contains: city, mode: 'insensitive' };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
        where.price = {};
        if (minPrice !== undefined){
           where.price.gte = minPrice;
        } 
        if (maxPrice !== undefined){
           where.price.lte = maxPrice;
        } 
    }

    const properties = await prisma.property.findMany({
        where,
        orderBy: {
            [sortBy]: sortOrder,
        },
        include: {
            landlord: {
                omit: {
                    password: true,
                },
            },
            _count: {
                select: {
                    rentalRequests: true,
                },
            },
        },
    });

    return properties;
};

const getAllRentalRequestsForAdmin = async (query: any) => {
    const { status, propertyId, tenantId, sortBy = 'createdAt', sortOrder = 'desc' } = query;

    const where: any = {};

    if (status) {
        where.status = status;
    }

    if (propertyId) {
        where.propertyId = propertyId;
    }

    if (tenantId) {
        where.tenantId = tenantId;
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

    return rentalRequests;
};

const createCategoryIntoDb = async(payload : any) =>{
    const {name , description} = payload;
    const isExistCategory = await prisma.category.findUnique({
        where : {
            name
        }
    })
    if(isExistCategory){
        throw new Error ("This category is exist in our database , Please create new category");
    }
    
     const category = await prisma.category.create({
            data: {
                name: name,
                description: description
            },
        });
   

    return category;

}

const getAllCategoryFromDb = async ()=>{
    const category = await prisma.category.findMany();
    if(category.length === 0){
        throw new Error ('We have no category yet , please create category first')
    }
    return category;
}
const deleteCategoryByIdFromDb = async(categoryId : string)=>{
    const category = await prisma.category.findUnique({
        where : {
            id : categoryId
        }
    })
    if(!category){
        throw new Error ('This category do not exist in our database')
    }

    await prisma.category.delete({
        where : {
            id : categoryId
        }
    })
    return category
}

export const adminService = {
    getAllUsersFromDb,
    updateUserStatusInDb,
    getAllPropertiesForAdmin,
    getAllRentalRequestsForAdmin,
    createCategoryIntoDb,
    getAllCategoryFromDb,
    deleteCategoryByIdFromDb
};