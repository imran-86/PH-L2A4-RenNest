import bcrypt from "bcryptjs";
import { prisma } from "../../lib/prisma";
import { ILoginUser} from "./auth.interface";
import { jwtUtils } from "../../utils/jwt";
import config from "../../config";
import { SignOptions } from "jsonwebtoken";

const loginUser = async (payload : ILoginUser) => {
    const { email, password } = payload;


    const user = await prisma.user.findUniqueOrThrow({
        where : {email}
    })

    if (user.status === "BANNED") {
        throw new Error("Your account has been banned. Please contact support.");
    }

    const isPasswordMatched = await bcrypt.compare(password, user.password);

    if(!isPasswordMatched){
        throw new Error("Password is incorrect");
    }

    const jwtPayload = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
    }


    const accessToken = jwtUtils.createToken(
        jwtPayload,
        config.jwt_access_secret as string,
        config.jwt_access_expires_in as SignOptions
    );


    const refreshToken = jwtUtils.createToken(
        jwtPayload,
        config.jwt_refresh_secret as string,
        config.jwt_refresh_expires_in as SignOptions
    );

    return {
        accessToken,
        refreshToken,
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
    };
}
const getLoggedInUserFromDB = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        },
        omit: {
            password: true,
        },
        include: {
            properties: true, 
        },
    });

    if (!user) {
        throw new Error('User not found');
    }

    return user;
}



export const authService = {
    loginUser,
    getLoggedInUserFromDB
}