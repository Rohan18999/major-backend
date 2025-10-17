// so higher order function is used when you want to to check for errors in multiple functions

import { asyncHandler } from "../utils/asyncHandler.js";

const registerUser = asyncHandler(async(req,res) => {
    res.status(200).json({
        message: "ok"
    })
})

export {registerUser}