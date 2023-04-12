import mongoose from 'mongoose';

const AdminsSchema = new mongoose.Schema({
    role: { type: String, default: 'admin', enum: ['user', 'organizer', 'admin'], immutable: true},
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true }
}, {collection: 'admins'});

export default AdminsSchema;