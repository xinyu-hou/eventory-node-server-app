import mongoose from 'mongoose';

const UsersSchema = new mongoose.Schema({
    role: { type: String, default: 'user', enum: ['user', 'organizer', 'admin'], immutable: true},
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    activated: { type: Boolean, default: false },
    activationToken: String,
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    profilePicture: String,
    dateOfBirth: Date,
    location: String,
    bio: String,
    likedEvents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'EventsModel' }],
    likedTicketmasterEvents: { type: [String], default: [] }
}, {collection: 'users'});

export default UsersSchema;