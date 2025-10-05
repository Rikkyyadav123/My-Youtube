import mongoose, {Schema} from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
const userSchema = new Schema(
    {
       username:{
        type : String,
        required : true,
        lowercase:true,
        unique:true,
        trim:true,
        index:true
       } ,

       email:{
        type : String,
        required : true,
        lowercase:true,
        unique:true,
        trim:true,
       } ,

       fullname:{
        type : String,
        required : true,
        trim:true,
        index:true
       },

       avatar:{
        type:String,
        required:true
       },

       coverimage:{
        type:string
       },

       watchHistory:[
        {
            type:Schema.Type.ObjectId,
            ref:"video"
        }
       ],

       password:{
        type:string,
        required:[true,"password is required"]
       },

       refreshToken:{
        type:string
       },


    },
    {
        timestamp:true
    }
)

userSchema.pre("save", async function(next){
    if(!this.ismodified("password")) return next()
    this.password = await bcrypt.hash("this.password",10)
    next()
})

userSchema.methods.ispasswordcorrect = async function(password){
    return await  bcrypt.compare(password,this.password)
}

userSchema.methods.generateaccesstoken = function(){
    return jwt.sign
    (
        {id:this._id,
         email:this.email,
         username:this.username,
         fullname:this.fullname

        },
        process.env.ACCESS_TOKEN_SECRET,
        {expiresIn:process.env.ACCESS_TOKEN_SECRET_EXPIRY})
}
userSchema.methods.generaterefreshtoken = function(){
    return jwt.sign
    (
        {id:this._id},
        process.env.REFRESH_TOKEN_SECRET,
        {expiresIn:process.env.REFRESH_TOKEN_SECRET_EXPIRY})

}
export const user = mongoose.model(user,userSchema)
