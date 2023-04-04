import mongoose from 'mongoose';

const UsersSchema = new mongoose.Schema({
    username: String,
    password: String,
    activated: { type: Boolean, default: false },
    activationToken: String,
    firstName: String,
    lastName: String,
    displayName: String,
    profilePicture: Buffer,
    dateOfBirth: Date,
    location: String,
    searchHistory: { type: Array, default: [] },
    likedEvents: { type: Array, default: [] },
    registeredEvents: { type: Array, default: [] }
}, {collection: 'users'});

export default UsersSchema;