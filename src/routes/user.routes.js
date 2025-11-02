import {Router} from "express";
import { registerUser, testCloudinaryUpload } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]), // here upload.fields is a middleWare
    registerUser
);

// Test route for debugging Cloudinary
router.route("/test-cloudinary").post(
    upload.single("testFile"),
    testCloudinaryUpload
);

export default router;