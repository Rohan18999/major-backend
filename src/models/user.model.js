import mongoose,{Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export const userSchema = new mongoose.Schema
(
    {
       username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true, // Whitespace will be trimmed
            index: true, // Regular index (helps with faster search)
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        fullname: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        avatar: {
            type: String, // cloundinary url
            required: true,
        },
        coverImage: {
            type: String, // cloundinary url
        },
        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video"
            }
        ],
        password: {
            type: String,
            required: [true,"Password is required"]
        },
        refreshToken: {
            type: String
        },  
    },
    {timestamps: true}
)

// middleware used to save the new password in hashed format
userSchema.pre("save",  async function (next) {
    if(!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10);
    next(); // the next keyboard is used bcz this tells to go to the next middlware
})

// middleware to compare the password with the hashed password in db
userSchema.methods.isPasswordCorrect = async function (password){ // here we are using method instead of a variable to store it bcz we nedd this keyword
    return await bcrypt.compare(password,this.password) // returns a boolean value
}

userSchema.methods.generateAcessToken = function () {
    jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullname: this.fullname
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
)
}
userSchema.methods.generateRefreshToken = function () {
    jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY 
        }
)
}

export const User = mongoose.model("User", userSchema)