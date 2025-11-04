// so higher order function is used when you want to to check for errors in multiple functions

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js"

const generateAcessAndRefreshTokens = async(userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }

    } catch(error) {
        throw new ApiError(500,"Error in generating access and refresh tokens") 
    }
}

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
    //console.log("email: ",email); 

    if (
        [fullName, email, username, password].some((field) =>
        field?.trim() === "") // here trim is used to remove extra spaces
    ) {
        throw new ApiError(400,"All Fields should be filled")
    }

    const existedUser = await User.findOne({
        $or: [{ username },{ email }]
    });

    if (existedUser){
        throw new ApiError(409, "User with email or username already exists")
    }

    console.log("req.files:", req.files);
    console.log("req.body:", req.body);

    // Enhanced file path checking
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    // let coverImageLocalPath;
    // if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
    //     coverImageLocalPath = req.files.coverImage[0].path
    // }

    console.log("avatarLocalPath:", avatarLocalPath);
    console.log("coverImageLocalPath:", coverImageLocalPath);
    
    // Additional debugging for file upload
    if (req.files?.avatar) {
        console.log("Avatar file details:", {
            fieldname: req.files.avatar[0].fieldname,
            originalname: req.files.avatar[0].originalname,
            encoding: req.files.avatar[0].encoding,
            mimetype: req.files.avatar[0].mimetype,
            size: req.files.avatar[0].size,
            destination: req.files.avatar[0].destination,
            filename: req.files.avatar[0].filename,
            path: req.files.avatar[0].path
        });
    }

    if (!avatarLocalPath) {
        throw new ApiError(400,"Avatar file is required")
    }

    const avatar = await uploadToCloudinary(avatarLocalPath)
    const coverImage = await uploadToCloudinary(coverImageLocalPath)
    
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

    const createdUser = await User.findById(user._id).select("-password -refreshToken") // here in select method we need to add the parameter which are not required

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User Registered Successfully")
    )


})

const loginUser = asyncHandler(async(req,res) => {
    // req body -> data
    // username or email
    // find the user
    // password check
    // access and refresh token
    // send cookie
    
    const { username,email,password } = req.body;
    //console.log("Login Request Body:", req.body);

    if (!username && !email){
        throw new ApiError(400,"username or email is required")
    }
    
    const user = await User.findOne({
        $or: [{ username }, { email }]
    })
    //console.log("Found User:", user);

    if(!user){
        throw new ApiError(400,"User does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(400,"Invalid user credentials")
    }

    const { accessToken, refreshToken } = await generateAcessAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).
    select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User Logged in Sucessfully"
        )
    )

})

const logoutUser = asyncHandler(async(req,res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: null
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true    
    }

    return res
    .status(200)
    .cookie("accessToken", options)
    .cookie("refreshToken", options)
    .json(new ApiResponse(200,{},"User logged out successfully"))
})


// Test endpoint for debugging Cloudinary upload
const testCloudinaryUpload = asyncHandler(async (req, res) => {
    console.log("=== CLOUDINARY TEST ENDPOINT ===");
    console.log("req.files:", req.files);
    
    if (!req.files || !req.files.testFile) {
        throw new ApiError(400, "Test file is required");
    }
    
    const testFilePath = req.files.testFile[0].path;
    console.log("Test file path:", testFilePath);
    
    const uploadResult = await uploadToCloudinary(testFilePath);
    
    if (!uploadResult) {
        throw new ApiError(500, "Cloudinary upload failed");
    }
    
    return res.status(200).json(
        new ApiResponse(200, {
            message: "Cloudinary test successful",
            cloudinaryUrl: uploadResult.url,
            publicId: uploadResult.public_id
        }, "File uploaded to Cloudinary successfully")
    );
});

export { 
    registerUser, 
    testCloudinaryUpload, 
    loginUser, 
    logoutUser
};