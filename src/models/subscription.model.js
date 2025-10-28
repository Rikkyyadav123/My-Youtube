import mongoose , {Schema} from "mongoose";

const subscriptionSchema = new mongoose.Schema({
    subscriber: {
        type: Schema.Types.ObjectId,
        ref: "user",
     },

     channel: {
        type: Schema.Types.ObjectId,
        ref: "user"
     }
     
}

)

export const subscription =  mongoose.model("subscription", subscriptionSchema)