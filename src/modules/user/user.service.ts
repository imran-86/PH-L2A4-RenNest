import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";
import { IUpdateUser, RegisterUserPayload } from "./user.interface";
import config from "../../config";



const registerUserIntoDB = async (payload: RegisterUserPayload) =>{
    const { name, email, password, phone , role, status} = payload;

    const isUserExist = await prisma.user.findUnique({
        where: { email }
    })

    if (isUserExist) {
        throw new Error("User with this email already exists");
    }

    const hashedPassword = await bcrypt.hash(password, Number(config.bcrypt_salt_rounds))

    const createdUser = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            phone,
            role,
            status,
        }
    });


    const user = await prisma.user.findUnique({
        where: {
            id: createdUser.id,
            email: createdUser.email || email
        },
        omit: {
            password: true
        }
    })

    return user;
}

const updateUserProfileIntoDb = async (userId: string, payload: IUpdateUser) => {
    const { name, phone } = payload;

    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!user) {
        throw new Error('User not found');
    }

    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
            name: name || user.name,
            phone: phone !== undefined ? phone : user.phone,
        },
        omit: {
            password: true,
        },
    });

    return updatedUser;
};


export const userService = {
    registerUserIntoDB,
    updateUserProfileIntoDb
}