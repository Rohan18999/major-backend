// we use multer to store the image in local storage
// we use cloudinary to bring the image from local to the cloud

import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

// Test cloudinary configuration
const testCloudinaryConfig = () => {
    const config = {
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    };
    
    console.log('Cloudinary Configuration Check:');
    console.log('- Cloud Name:', config.cloud_name ? '✓ Set' : '✗ Missing');
    console.log('- API Key:', config.api_key ? '✓ Set' : '✗ Missing');
    console.log('- API Secret:', config.api_secret ? '✓ Set' : '✗ Missing');
    
    if (!config.cloud_name || !config.api_key || !config.api_secret) {
        console.error('❌ Cloudinary configuration is incomplete!');
        return false;
    }
    
    console.log('✅ Cloudinary configuration appears complete');
    return true;
};

// Configure cloudinary (will be called when needed)
const configureCloudinary = () => {
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });
};

// function to upload file to cloudinary
const uploadToCloudinary = async (localfilepath) => {
    console.log('🔄 Starting Cloudinary upload process...');
    console.log('📂 Local file path:', localfilepath);
    
    try {
        // Configure Cloudinary at runtime (after dotenv has loaded)
        configureCloudinary();
        
        // Test configuration 
        if (!testCloudinaryConfig()) {
            console.error('❌ Cloudinary configuration failed - aborting upload');
            return null;
        }
        
        // Check if path is provided
        if (!localfilepath) {
            console.log('❌ No file path provided');
            return null;
        }
        
        // Check if file exists
        if (!fs.existsSync(localfilepath)) {
            console.error('❌ File does not exist at path:', localfilepath);
            return null;
        }
        
        // Get file stats for debugging
        const stats = fs.statSync(localfilepath);
        console.log('📊 File stats:', {
            size: stats.size,
            isFile: stats.isFile(),
            path: localfilepath
        });
        
        console.log('☁️ Uploading to Cloudinary...');
        
        // Upload the file to cloudinary
        const response = await cloudinary.uploader.upload(localfilepath, {
            resource_type: 'auto', // auto-detect file type
            timeout: 60000 // 60 second timeout
        });
        
        console.log('✅ File uploaded successfully!');
        console.log('🔗 Cloudinary URL:', response.url);
        console.log('🆔 Public ID:', response.public_id);
        
        return response;

    } catch (error) {
        console.error('❌ Cloudinary upload error:');
        console.error('Error type:', error.name);
        console.error('Error message:', error.message);
        
        // More detailed error logging
        if (error.error && error.error.message) {
            console.error('Cloudinary API error:', error.error.message);
        }
        
        if (error.http_code) {
            console.error('HTTP status code:', error.http_code);
        }
        
        return null;
        
    } finally {
        // Clean up local file after upload attempt (success or failure)
        if (localfilepath && fs.existsSync(localfilepath)) {
            try {
                fs.unlinkSync(localfilepath);
                console.log('🧹 Local file cleaned up:', localfilepath);
            } catch (cleanupError) {
                console.error('⚠️ Error cleaning up local file:', cleanupError);
            }
        }
    }
}


export {uploadToCloudinary};