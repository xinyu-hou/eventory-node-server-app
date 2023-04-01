import mongoose from 'mongoose';
import UsersSchema from "./users-schema.js";

const UsersModel = mongoose.model('UsersModel', UsersSchema);

export default UsersModel;