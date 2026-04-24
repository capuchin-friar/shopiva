import express from "express";
import { authenticate, authenticateUser, verifyToken, type AuthRequest } from "../middleware/auth.js";
import { DeleteUserController, SigninController, SignupController, UpdateEmailController, UpdatePasswordController, UpdatePhoneController, UpdatePhotoController, UpdateProfileController, UpdateRoleController } from "../controllers/user.js";

export const UserRouter = express.Router();

// Public routes (no middleware)
UserRouter.post("/user/signup", SignupController);
UserRouter.post("/user/signin", SigninController);
UserRouter.post("/user/authorization", verifyToken, async(req: AuthRequest, res) => {
  // Token is already verified by middleware, just return the decoded user info

  const user = await authenticateUser(req.user?.id as unknown as number);
  res.json({ 
    bool: true, 
    id: req.user!.id,
    data: user
  });
});

// Protected routes (use middleware)
UserRouter.delete('/user/delete/:id', authenticate, DeleteUserController);
UserRouter.put('/user/role/update/:id', authenticate, UpdateRoleController);
UserRouter.put('/user/email/update/:id', authenticate, UpdateEmailController);
UserRouter.put('/user/phone/update/:id', authenticate, UpdatePhoneController);
UserRouter.put('/user/photo/update/:id', authenticate, UpdatePhotoController);
UserRouter.put('/user/profile/update/:id', authenticate, UpdateProfileController);
UserRouter.put('/user/password/update/:id', authenticate, UpdatePasswordController);
