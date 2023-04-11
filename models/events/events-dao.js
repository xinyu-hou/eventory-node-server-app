import EventsModel from './events-model.js';

export const findAllEvents = () => EventsModel.find();
export const findOneEvents = (eventId) => EventsModel.findOne({_id: eventId});
export const createEvent = (event) => EventsModel.create(event);
export const deleteEvent = (eventId) => EventsModel.deleteOne({_id: eventId});
export const updateEvent = (eventId, event) => EventsModel.updateOne({_id: eventId}, {$set: event});