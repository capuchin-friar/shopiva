import { v2 } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();


module.exports =  function initializeCloudinary () {
    v2.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME as any,
        api_key: process.env.CLOUDINARY_API_KEY as any,
        api_secret: process.env.CLOUDINARY_API_SECRET as any,
    });
    return v2;
}