import mongoose from 'mongoose';
import EventsSchema from './events-schema.js';

const EventsModel = mongoose.model('EventsModel', EventsSchema);

export default EventsModel;