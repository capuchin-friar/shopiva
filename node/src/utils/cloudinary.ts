import { v2 } from "cloudinary";
import { randomUUID } from "crypto";


export default class Cloudinary {
   
    static deleteFolder = async (payload: { product_id: string; type: string }) => {
        const { product_id, type='image' } = payload;

        try {
            try {
                // Delete all resources inside the folder
                const resources = await v2.api.delete_resources_by_prefix(product_id, {
                    resource_type: type,
                });
                // Delete the folder itself
                const folder = await v2.api.delete_folder(product_id);
                return true;
            } catch (error: any) {
                throw new Error(`Error deleting Cloudinary folder: ${String(error?.message ?? error)}`);
            }
        } catch (error: any) {
            throw new Error(`Error: ${String(error?.message ?? error)}`);
        }
    };

    static deleteAsset = async (payload: { url: string; type: string }) => {
        try {
            const { url, type } = payload;

            const extractPublicId = (url: string | any) => {
                const parts = url.split('/upload/');
                if (parts.length < 2) throw new Error('Invalid Cloudinary URL');
                const pathWithVersion = parts[1];
                const pathParts = pathWithVersion.split('/');
                if (pathParts[0].startsWith('v')) pathParts.shift();
                const fileWithExt = pathParts.pop();
                const fileName = fileWithExt.split('.')[0];
                return [...pathParts, fileName].join('/');
            };

            const publicId = extractPublicId(url);
            if (!publicId) throw new Error("Could not extract public ID");

            const result = await v2.uploader.destroy(publicId, {
                // timeout: 60000,
                invalidate: true,
                resource_type: type === 'video' ? 'video' : 'image'
            });

            if (result.result === 'ok') return true;
            if (result.result === 'not found') throw new Error("File not found");
            throw new Error("Failed to delete file");
        } catch (error: any) {
            throw new Error("Internal server error: " + error.message);
        }
    };

    static uploadAsset = async (payload: { file: any; productId: string }) => {
        const { file, productId } = payload;

        try {
            if (!file) throw new Error("No file uploaded");

            const MAX_FILE_SIZE = 15 * 1024 * 1024;
            if (file.size > MAX_FILE_SIZE) {
                throw new Error("File size exceeds 15MB limit");
            }

            const uploadOptions = {
                resource_type: 'auto',
                folder: productId ? productId.trim() : undefined,
                public_id: `${randomUUID()}-${productId}`,
                use_filename: false,
                unique_filename: false,
                overwrite: false,
                transformation: [
                    { width: 1000, height: 1000, crop: 'limit' },
                    { quality: 'auto' },
                ],
            };

            const result = await new Promise((resolve, reject) => {
                const uploadStream = v2.uploader.upload_stream(uploadOptions as any, (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                });
                uploadStream.end(file.buffer);
            });

            if (!result || typeof result !== 'object' || !('secure_url' in result)) {
                throw new Error("Invalid upload result");
            }

            const typedResult = result as { secure_url: string; public_id: string; width: number; height: number; format: string; bytes: number };

            return {
                success: true,
                message: 'File uploaded successfully',
                data: {
                    url: typedResult.secure_url,
                    public_id: typedResult.public_id,
                    width: typedResult.width,
                    height: typedResult.height,
                    format: typedResult.format,
                    bytes: typedResult.bytes,
                },
            };
        } catch (error: any) {
            console.error('Upload error:', error);
            throw new Error("Error uploading file: " + error.message);
        }
    };

    static getFolder = async (payload: { folderId: string }) => {
        const { folderId } = payload;

        try {
            const { resources } = await v2.search
                .expression(`folder:${folderId as string}`)
                .sort_by('public_id', 'desc')
                .max_results(100)
                .execute();
            return resources;
        } catch (error: any) {
            throw new Error("Error fetching folder assets: " + error.message);
        }

    }
}


