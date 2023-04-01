import mongoose from 'mongoose';
const UsersSchema = new mongoose.Schema({
    username: String,
    password: String,
    activated: Boolean,
    firstName: String,
    lastName: String,
    displayName: String,
    profilePicture: Buffer,
    dateOfBirth: Date,
    location: String,
    searchHistory: Array,
    likedEvents: Array,
    registeredEvents: Array
}, {collection: 'users'});

export default UsersSchema;