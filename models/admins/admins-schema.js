import mongoose from 'mongoose';

const AdminsSchema = new mongoose.Schema({
    username: String,
    password: String,
    firstName: String,
    lastName: String
}, {collection: 'admins'});

export default AdminsSchema;