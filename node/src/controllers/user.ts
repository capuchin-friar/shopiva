import type { Request, Response } from "express";
import { SignupService, SigninService, UpdateProfileService, UpdateEmailService, UpdatePhoneService, UpdatePhotoService, UpdatePasswordService, DeleteUserService, UpdateRoleService } from "../services/user.js";
import type { AuthRequest } from "../middleware/auth.js";

export async function SignupController(req: Request, res: Response) {
    try {
        const { fname, lname, email, phone, provider, password, gender, role, src, deviceId, deviceToken } = req.body;
        
        const result = await SignupService({ fname, lname, email, phone, provider, password, gender, role, src, deviceId, deviceToken });
        
        res.status(201).json({
            message: "User created successfully",
            token: result.token,
            user: result.user
        });
    } catch (err) {
        res.status(400).json({
            error: err instanceof Error ? err.message : String(err)
        });
    }
}

export async function SigninController(req: Request, res: Response) {
    try {
        const { email, password } = req.body;
        
        const result = await SigninService({ email, password });
        
        res.status(200).json({
            message: "Login successful",
            token: result.token,
            user: result.user
        });
    } catch (err) {
        res.status(401).json({
            error: err instanceof Error ? err.message : String(err)
        });
    }
}

export async function DeleteUserController(req: Request, res: Response) {
    try {
        if (!req.params?.id) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        await DeleteUserService(req.params.id as unknown as number);
        
        res.status(200).json({
            message: "User deleted successfully"
        });
    } catch (err) {
        res.status(500).json({
            error: err instanceof Error ? err.message : String(err)
        });
    }
}

export async function UpdateEmailController(req: Request, res: Response) {
    try {
        if (!req.params?.id) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const { email } = req.body;
        const result = await UpdateEmailService(req.params.id as unknown as number, email);
        
        res.status(200).json({
            message: "Email updated successfully",
            user: result
        });
    } catch (err) {
        res.status(400).json({
            error: err instanceof Error ? err.message : String(err)
        });
    }
}

export async function UpdateRoleController(req: Request, res: Response) {
    try {
        if (!req.params?.id) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const { role } = req.body;
        const result = await UpdateRoleService(req.params.id as unknown as number, role);
        
        res.status(200).json({
            message: "Role updated successfully",
            user: result
        });
    } catch (err) {
        res.status(400).json({
            error: err instanceof Error ? err.message : String(err)
        });
    }
}

export async function UpdatePhoneController(req: Request, res: Response) {
    try {
        if (!req.params?.id) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const { phone } = req.body;
        const result = await UpdatePhoneService(req.params.id as unknown as number, phone);
        
        res.status(200).json({
            message: "Phone updated successfully",
            user: result
        });
    } catch (err) {
        res.status(400).json({
            error: err instanceof Error ? err.message : String(err)
        });
    }
}

export async function UpdatePhotoController(req: Request, res: Response) {
    try {
        if (!req.params?.id) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const { photo } = req.body;
        const result = await UpdatePhotoService(req.params.id as unknown as number, photo);
        
        res.status(200).json({
            message: "Photo updated successfully",
            user: result
        });
    } catch (err) {
        res.status(400).json({
            error: err instanceof Error ? err.message : String(err)
        });
    }
}

export async function UpdateProfileController(req: Request, res: Response) {
    try {
        if (!req.params?.id) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const { fname, lname, gender, bio } = req.body;
        const result = await UpdateProfileService(req.params.id as unknown as number, { fname, lname, gender });
        
        res.status(200).json({
            message: "Profile updated successfully",
            user: result
        });
    } catch (err) {
        res.status(400).json({
            error: err instanceof Error ? err.message : String(err)
        });
    }
}

export async function UpdatePasswordController(req: Request, res: Response) {
    try {
        if (!req.params?.id) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const { password } = req.body;
        const result = await UpdatePasswordService(req.params.id as unknown as number, password);
        
        res.status(200).json({
            message: "Password updated successfully"
        });
    } catch (err) {
        res.status(400).json({
            error: err instanceof Error ? err.message : String(err)
        });
    }
}