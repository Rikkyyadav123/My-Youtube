import dotenv from 'dotenv';
import {connectDB} from './db/index.js';

dotenv.config()

connectDB();

/*
(async ()=>{
   try{
    await mongoose.connect(`${process.env.mongoose_url}`/`${DB_name}`)
    app.on("error",()=>{
        console.log("error while listening with database",err);
        throw err;
    })
    app.listen(process.env.port, ()=>{
        console.log('server is listening on port',`$(process.env.port)`);
    })
    }
   catch(err){
    console.log('error while connecting to mongo db',err);
   }
})()*/