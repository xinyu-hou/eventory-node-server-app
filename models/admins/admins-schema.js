import mongoose from 'mongoose';

const AdminsSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true }
}, {collection: 'admins'});

export default AdminsSchema;