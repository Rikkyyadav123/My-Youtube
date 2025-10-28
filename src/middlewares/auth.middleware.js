import { asyncHandler } from "../util/asynchandler.js";
import jwt from "jsonwebtoken"
import { ApiError } from "../util/apierror.js";
import { user } from "../models/user.model.js";
export const verifyJWT = asyncHandler(async (req, _, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer", "");
        console.log("🔹 Received Token:", token);

        if (!token) {
            throw new ApiError(401, "access token not found");
        }

        const decodedtoken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const userdata = await user.findById(decodedtoken._id).select("-password -refreshToken");

        if (!userdata) {
            throw new ApiError(401, "user not found");
        }

        req.user = userdata;
        next();

    } catch (error) {
        console.error("❌ JWT verification failed:", error.name, error.message);
        throw new ApiError(401, "invalid access token");
    }
});
