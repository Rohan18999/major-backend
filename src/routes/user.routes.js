import { Router } from "express";
import { loginUser, logoutUser, registerUser, testCloudinaryUpload } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

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

router.route("/login").post(loginUser);

//secured routes
router.route("/logout").post(verifyJWT, logoutUser)

// Test route for debugging Cloudinary
router.route("/test-cloudinary").post(
    upload.single("testFile"),
    testCloudinaryUpload
);

export default router;

/*
And according to HTTP standards:

Method Used for: 

GET	 -> Fetching data (no changes)
POST ->	Creating or performing an action that changes state
PUT/PATCH ->	Updating data
DELETE ->	Removing data (usually by ID)

*/