import {v2 as cloudinary} from 'cloudinary'

cloudinary.config({ 
  cloud_name: process.env.cloudinary_cloud_name, 
  api_key: process.env.cloudinary_api_key, 
  api_secret: process.env.cloudinary_api_secret
});

const uploadoncloudinary = async (localfilepath)=>{
   try{ 
    if(!localfilepath) return null;

    const response = await cloudinary.uploader.upload(localfilepath, {
        resource_type: "auto"
    })
    console.log("file uploaded on cloudinary",response.url);
    return response;
}
    catch(err){
        Fs.unlinksync(localfilepath);

    }
}