import mongoose from 'mongoose';

const EventsSchema = new mongoose.Schema({
    name: { type: String, required: true },
    dateAndTime: { type: Date, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    description: { type: String, required: true },
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'OrganizersModel' },
    interestedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'UsersModel' }],
    registeredUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'UsersModel' }]
}, {collection: 'events'});

export default EventsSchema;