import { asyncHandler } from "../util/asynchandler.js"
import { ApiError } from "../util/apierror.js"
import { ApiResponse } from "../util/apiresponse.js"
import { user } from "../models/user.model.js"
import { uploadoncloudinary } from "../util/cloudinary.js"

const generateAccessAndRefreshTokens = async(User_id)=>{
    try {
        const existUser = await user.findById(User_id)
        console.log("Generating tokens for user_id:", User_id);
    // const existuser = await user.findById(User_id);
    console.log("User found:", existUser);
        const accessToken = await existUser.generateaccesstoken()
        const refreshToken = await existUser.generaterefreshtoken()
        
        user.refreshToken = refreshToken
        await existUser.save({validateBeforeSave:false})

        return {accessToken, refreshToken}
        
    } catch (error) {
        throw new ApiError(500, "error while generating tokens")
    }
}


const registeruser = asyncHandler(async (req, res) => {

    const {username, email, fullname, password} = req.body
    console.log("email:",email);

    if([username,email,fullname,password].some((field) => 
        field?.trim() === "")
){
    throw new ApiError(400, "All fields are required")
}

    const existeduser = await user.findOne({
        $or: [{username},{email}] 
})

    if(existeduser){
        throw new ApiError(409, "user already exists with this username or email")
    }
    console.log("req.files:",req.files);
    const avatarLocalpath = req.files?.avatar[0]?.path;
    
    const coverimageLocalPath = req.files?.coverimage?.[0]?.path;
    console.log("avatarLocalpath:",avatarLocalpath);
    

    if(!avatarLocalpath){
        throw new ApiError(400, "avatar file is required")
    }

    const avatar = await uploadoncloudinary(avatarLocalpath)
    const coverimage = await uploadoncloudinary(coverimageLocalPath)

    if(!avatar){
        throw new ApiError(500, "error while uploading avatar image")
    }
    const newuser = await user.create({
        username: username.toLowerCase(),
        email,
        fullname,
        password,
        avatar: avatar.secure_url,
        coverimage: coverimage?.secure_url || ""
    })

    const createduser = await user.findById (newuser._id).select("-password  -refreshToken")
    if(!createduser){
        throw new ApiError(500, "unable to create user")
    }

    res.status(201).json(
        new ApiResponse(201, createduser, "user registered successfully"))
})

const loginuser = asyncHandler(async (req, res) => {
    const {username, email, password} = req.body
    console.log(email);

    if(!username && !email){
        throw new ApiError(400, "username or email is required");
    }

    const userdata = await user.findOne({
        $or: [{username}, {email}]
    })

    if(!userdata){
        throw new ApiError(404, "user not found")
    }

    const ispasswordValid = await userdata.isPasswordCorrect(password)
    console.log("login pass", password );
    if(!ispasswordValid){
        throw new ApiError(401, "invalid password")
    }

    const {accessToken, refreshToken} =  await generateAccessAndRefreshTokens(userdata._id)

    const loggedInuser = await user.findById(userdata._id).select("-password -refreshToken")

    const options = {
        httpOnly:true,
        secure:true
    }

    return res
    .status(200)
    .cookie("refreshToken", refreshToken, options)
    .cookie("accessToken", accessToken, options)
    .json(
           new ApiResponse(200, {user: loggedInuser, accessToken, refreshToken},
              "user logged in successfully"

           ) 
           
    )
    


})

const logoutuser = asyncHandler(async (req, res) => {
    await user.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    );

    const options = {
        httpOnly: true,
        secure: true
    };

    return res
        .status(200)
        .clearCookie("refreshToken", options)
        .clearCookie("accessToken", options)
        .json(
            new ApiResponse(200, {}, "user logged out successfully")
        );
});

const refreshaccessToken = asyncHandler(async (req, res) => {
    const incomingrefreshToken = req.cookies?.refreshToken || req.body.refreshToken

    if(!incomingrefreshToken){
        throw new ApiError(401, "refresh token not found")
    }

    try {
        const decodedtoken = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)
        
        const userdata = await user.findById(decodedtoken._id).select("-password -refreshToken")

        if(!userdata){
            throw new ApiError(401, "user not found")
        }

        if(incomingrefreshToken !== userdata.refreshToken){
            throw new ApiError(401, "refresh token is expired or used")
        }

        const options = {
            httpOnly:true,
            secure:true
        }

        const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(userdata._id)
        return res
        .status(200)
        .cokkie("refreshToken", refreshToken, options)
        .cookies("accessToken", accessToken, options)
        .json(
            new ApiResponse(200, {accessToken, refreshToken},
                "access token refreshed successfully"
            ))

    } catch (error) 
    {
        throw new ApiError(401, "invalid refresh token")
        
    }
})

const changeuserpassword = asyncHandler(async (req, res) => {
    const{oldpassword,newpassword} = req.body

    if(!oldpassword || !newpassword){
        throw new ApiError(400, "old password and new password are required");
    }

    const userdata = await user.findById(req.user?._id)
    const ispasswordValid = await userdata.isPasswordCorrect(oldpassword)
    if(!ispasswordValid){
        throw new ApiError(401, "old password is incorrect")
    }

    userdata.password = newpassword
    await userdata.save({validateBeforeSave:false})
    res
    .status(200)
    .json(
        new ApiResponse(200, {}, "password changed successfully")
    )
})

 const currentuser = asyncHandler(async (req, res) => {

    res
    .status(200)
    .json(
        new ApiResponse(200, {user: req.user}, "current user fetched successfully")
    )
})

const updateAccountdetails = asyncHandler(async (req, res) => {
    const {fullname, email} = req.body

    if(!fullname || !email){
        throw new ApiError(400, "fullname and email are required")
    }

    const updateduser = await user.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullname:fullname,
                email:email
        }
    },
    {
        new:true
    }.select("-password -refreshToken")

)
    res
    .status(200)
    .json(
        new ApiResponse(200, {user:
    updateduser}, "user account details updated successfully")
    )
})

const updateuserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalpath = req.file?.path
    if(!avatarLocalpath){
        throw new ApiError(400, "avatar file is required")
    }

    const avatar = await uploadoncloudinary(avatarLocalpath)
    if(!avatar){
        throw new ApiError(500, "error while uploading avatar image")
    }

    const userdata = await user.findByIdAndUpdate
    (
        req.user?._id,
        {
           $set: {
            avatar : avatar.url
           }
        }, {
            new:true
        }
    ).select("-password")

    res
    .status(200)
    .json(
        new ApiResponse(200, {user: userdata}, "user avatar updated successfully")
    )
})

const updatecoverimage = asyncHandler(async(req, res) => {
    const coverimagepath = req.file?.path
    if(!coverimagepath){
        throw new ApiError(400, "coverimagge file is required")
    }

    const coverimage = await uploadoncloudinary(coverimagepath)
    if(!coverimage){
        throw new ApiError(500, "error while uploading cover image")
    }

    const userdata = await user.findaByIdAndUpdate(
        req.user?._id,{
              $set: {
                coverimage: coverimage.url
              }
        },{
            new:true
        }
    ).select("-password")

    res.status(200)
    .json(
        new ApiResponse(200,{user:userdata},
            "user coverimage updated seccessfully"
        )
    )

})

export { registeruser,
    loginuser,
    logoutuser ,
    refreshaccessToken,
    changeuserpassword,
    currentuser,
    updateAccountdetails,
    updateuserAvatar,
    updatecoverimage

}
