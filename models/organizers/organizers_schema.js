import mongoose from 'mongoose';

const OrganizersSchema = new mongoose.Schema({
    username: String,
    password: String,
    activated: { type: Boolean, default: false },
    activationToken: String,
    name: String,
    profilePicture: Buffer,
    description: String,
    events: { type: Array, default: [] }
}, {collection: 'admins'});

export default OrganizersSchema;