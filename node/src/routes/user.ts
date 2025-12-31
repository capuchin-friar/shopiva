import express from "express";
import { authenticate } from "../middleware/auth.js";
import { DeleteUserController, SigninController, SignupController, UpdateEmailController, UpdatePasswordController, UpdatePhoneController, UpdatePhotoController, UpdateProfileController, UpdateRoleController } from "../controllers/user.js";

export const UserRouter = express.Router();

// Public routes (no middleware)
UserRouter.post("/user/signup", SignupController);
UserRouter.post("/user/signin", SigninController);

// Protected routes (use middleware)
UserRouter.delete('/user/delete/:id', authenticate, DeleteUserController);
UserRouter.put('/user/role/update/:id', authenticate, UpdateRoleController);
UserRouter.put('/user/email/update/:id', authenticate, UpdateEmailController);
UserRouter.put('/user/phone/update/:id', authenticate, UpdatePhoneController);
UserRouter.put('/user/photo/update/:id', authenticate, UpdatePhotoController);
UserRouter.put('/user/profile/update/:id', authenticate, UpdateProfileController);
UserRouter.put('/user/password/update/:id', authenticate, UpdatePasswordController);
