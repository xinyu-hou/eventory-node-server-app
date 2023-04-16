import EventsModel from './events-model.js';

export const findAllEvents = () => EventsModel.find();
// export const findEventsByCityAndKeyword = (city, keyword) => EventsModel.find({city: city})
export const findEventsByCity = (city) => EventsModel.find({city: city});

export const findEventById = (eventId) => EventsModel.findById(eventId);
export const createEvent = (event) => EventsModel.create(event);
export const deleteEvent = (eventId) => EventsModel.deleteOne({_id: eventId});
export const updateEvent = (eventId, event) => EventsModel.updateOne({_id: eventId}, {$set: event});