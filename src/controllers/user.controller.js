// so higher order function is used when you want to to check for errors in multiple functions

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js"

const registerUser = asyncHandler(async(req,res) => {
    // get user details from frontend
    // validation - not empty fields
    // check if user already exists: username or email
    // check for images, check for avatar
    // upload them to cloudinary, avatar is mandatory
    // create user object - create entry in db
    // check for user creation (if the user is created successfully, then only send response)
    // send response back to frontend

    const {fullName,email,username,password} = req.body; // here destructuring is used because req.body contains multiple fields,so instead of writing const fullName = req.body.fullName we use {fullName} = req.bodyf
    console.log("email: ",email); 

    if (
        [fullName, email, username, password].some((field) =>
        field?.trim() === "") // here trim is used to remove extra spaces
    ) {
        throw new ApiError(400,"All Fields should be filled")
    }

    const existedUser = User.findOne({
        $or: [{ username },{ email }]
    });

    if (existedUser){
        throw new ApiError(409, "User with email or username already exists")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path
    const coverImageLocalPath = req.files?.covarImage[0]?.path

    if (!avatarLocalPath) {
        throw new ApiError(400,"Avatar file is required")
    }

    const avatar = await uploadToCloudinary(avatarLocalPath)
    const image = await uploadToCloudinary(coverImageLocalPath)
    
    if (!avatar) {
        throw new ApiError(400,"Avatar file is required")
    }

    const user = await User.create(
        {
            fullName,
            avatar: avatar.url,
            coverImage: coverImage?.url || "",
            email,
            password,
            username: username.toLowerCase()
        }
    )

    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User Registered Successfully")
    )


})


export {registerUser}