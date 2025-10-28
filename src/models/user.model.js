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
        type : String
       },

       watchHistory:[
        {
            type:Schema.Types.ObjectId,
            ref:"video"
        }
       ],

       password:{
        type:String,
        required:[true,"password is required"]
       },

       refreshToken:{
        type:String
       },


    },
    {
        timestamp:true
    }
)

userSchema.pre("save", async function(next){
    if(!this.isModified("password")) return next()
    this.password = await bcrypt.hash(this.password,10)
    next()
})

userSchema.methods.isPasswordCorrect = async function(password){
    return await  bcrypt.compare(password,this.password)
}

userSchema.methods.generateaccesstoken = function(){
        console.log("ACCESS_TOKEN_SECRET:", process.env.ACCESS_TOKEN_SECRET);

    return jwt.sign
    (
        {_id:this._id,
         email:this.email,
         username:this.username,
         fullname:this.fullname

        },
        process.env.ACCESS_TOKEN_SECRET,
        {expiresIn:process.env.ACCESS_TOKEN_SECRET_EXPIRY})
}
userSchema.methods.generaterefreshtoken = function(){
            console.log("REFRESH_TOKEN_SECRET:", process.env.REFRESH_TOKEN_SECRET);

    return jwt.sign
    (
        {_id:this._id},
        process.env.REFRESH_TOKEN_SECRET,
        {expiresIn:process.env.REFRESH_TOKEN_SECRET_EXPIRY})

}
export const user = mongoose.model("user",userSchema)
