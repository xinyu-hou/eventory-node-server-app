import mongoose from 'mongoose';

const UsersSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    activated: { type: Boolean, default: false },
    activationToken: String,
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    displayName: String,
    profilePicture: Buffer,
    dateOfBirth: Date,
    location: String,
    searchHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'EventsModel' }],
    likedEvents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'EventsModel' }],
    registeredEvents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'EventsModel' }]
}, {collection: 'users'});

export default UsersSchema;