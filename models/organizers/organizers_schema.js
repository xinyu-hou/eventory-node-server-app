import mongoose from 'mongoose';

const OrganizersSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    activated: { type: Boolean, default: false },
    activationToken: String,
    name: { type: String, required: true },
    profilePicture: Buffer,
    description: String,
    events: [{ type: mongoose.Schema.Types.ObjectId, ref: 'EventsModel' }]
}, {collection: 'admins'});

export default OrganizersSchema;