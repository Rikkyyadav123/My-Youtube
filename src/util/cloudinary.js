import {v2 as cloudinary} from 'cloudinary'
import fs from 'fs'

cloudinary.config({ 
  cloud_name: process.env.cloudinary_cloud_name, 
  api_key: process.env.cloudinary_api_key, 
  api_secret: process.env.cloudinary_api_secret
});

console.log({
  cloud_name: process.env.cloudinary_cloud_name,
  api_key: process.env.cloudinary_api_key ? 'exists' : 'not found',
  api_secret: process.env.cloudinary_api_secret ? 'exists' : 'not found',
});


const uploadoncloudinary = async (localfilepath)=>{
   try{ 
    if(!localfilepath) return null;

    const response = await cloudinary.uploader.upload(localfilepath, {
        resource_type: "auto"
    })
    fs.unlinkSync(localfilepath); // delete the local file after upload
    console.log("file uploaded on cloudinary",response.url);
    return response;
}
    catch(err){
    console.log("error while uploading on cloudinary", err);
    return null;
        

    }
}

export {uploadoncloudinary}