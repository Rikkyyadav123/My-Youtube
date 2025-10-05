import mongoose, {Schema} from 'mongoose'
import mongooseAggregatepaginate from 'mongoose-aggregate-paginate-v2'


const videoSchema = new Schema({
    
videofile:{
    type:String,
    required:true 
},

thumbnail:{
    type:String,
    required:true 
},

owner:[{
    type:Schema.Types.ObjectId,
    ref:"user"
}],

title:{
    type:String,
    required:true 
},

description:{
    type:String,
    required:true 
},

duration:{
    type:Number,
    required:true 
},

views:{
    type:Number,
    default:0 
},

ispublished:{
    type:Boolean,
    default:true
},





},
{timestamp:true}
)
videoSchema.plugin(mongooseAggregatepaginate)
export const video = mongoose.model(video,"videoSchema")