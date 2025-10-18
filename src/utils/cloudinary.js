// we use multer to store the image in local storage
// we use cloudinary to bring the image from local to the cloud

import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

 cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret:process.env.CLOUDINARY_API_SECRET  // Click 'View API Keys' above to copy your API secret
    });

// function to upload file to cloudinary
const uploadToCloudinary = async (localfilepath) => { // localfilepath is the path where the file is stored locally using multer
    try {
        if (!localfilepath) return null; 
        // upload the file on cloudinary
        const response = await cloudinary.uploader.upload
        (localfilepath,{
            resource_type: 'auto' // jpeg, png, pdf, docx
        }) 
        // file has been uploaded successfully
        console.log('file uploaded to cloudinary',response.url); // response contains an object which has various properties like url, public_id, etc.
        return response;

    } catch (error) {
        fs.unlinkSync(localfilepath) // remove the locally saved temporary file as the upload operation got failed
        return null
    }
}

export {uploadToCloudinary};