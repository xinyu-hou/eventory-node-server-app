import mongoose from 'mongoose';

const OrganizersSchema = new mongoose.Schema({
    role: { type: String, default: 'organizer', enum: ['user', 'organizer', 'admin'], immutable: true},
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    activated: { type: Boolean, default: false },
    activationToken: String,
    name: { type: String, required: true },
    profilePicture: Buffer,
    bio: String,
    events: [{ type: mongoose.Schema.Types.ObjectId, ref: 'EventsModel' }]
}, {collection: 'organizers'});

export default OrganizersSchema;