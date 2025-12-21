import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
export class tools{
    static generate_token(){

    }

    static generate_jwt(id: number, age: number) {
        const secret = process.env.SECRET;
        if (!secret) {
            throw new Error("SECRET environment variable is not defined");
        }

        const options: SignOptions = process.env.AGE
            ? { expiresIn: parseInt(process.env.AGE, 10) }
            : {};

        return jwt.sign({
            id: id as number
        }, secret, options);
    }
}