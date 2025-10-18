import mongoose from 'mongoose';
import { DB_name } from '../constant.js';

export const connectDB = async () => {
    try {
        const { MONGO_USERNAME, MONGO_PASSWORD, MONGO_HOST } = process.env;
        const mongoURI = `mongodb+srv://${MONGO_USERNAME}:${encodeURIComponent(MONGO_PASSWORD)}@${MONGO_HOST}/${DB_name}`;
        const connectionInstance = await mongoose.connect(mongoURI);
        console.log(`mongoDB connected !! host: ${connectionInstance.connection.host}`);
    } catch (err) {
        console.log('error while connecting to mongo db', err);
        throw err;
    }
};

export default connectDB;
