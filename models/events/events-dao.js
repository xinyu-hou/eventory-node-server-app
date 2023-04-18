import EventsModel from './events-model.js';

export const findAllEvents = () => EventsModel.find();
export const findEventsByCityAndKeyword = (cityRegex, keywordRegex) => EventsModel
    .find({
        city: {$regex: cityRegex},
        $or: [{name: {$regex: keywordRegex}}, {description: {$regex: keywordRegex}}]
    });
export const findEventsByKeyword = (keywordRegex) => EventsModel
    .find({$or: [{name: keywordRegex}, {description: keywordRegex}]});
export const findEventsByCity = (cityRegex) => EventsModel
    .find({city: cityRegex});
export const findEventById = (eventId) => EventsModel
    .findById(eventId)
    .populate({path: 'organizer', select: '_id username name bio'})
    .populate({path: 'interestedUsers', select: '_id firstName lastName'});
export const createEvent = (event) => EventsModel.create(event);
export const deleteEvent = (eventId) => EventsModel.deleteOne({_id: eventId});
export const deleteEventsByOrganizerId = (organizerId) => EventsModel
    .deleteMany({organizer: organizerId});
export const updateEvent = (eventId, event) => EventsModel.updateOne({_id: eventId}, {$set: event});
export const pullInterestedUserEvents = (userId) => EventsModel
    .updateMany({interestedUsers: userId}, {$pull: {interestedUsers: userId}});
export const pushInterestedUserOneEvent = (eventId, userId) => EventsModel
    .updateOne({_id: eventId}, {$addToSet: {interestedUsers: userId}});
export const pullInterestedUserOneEvent = (eventId, userId) => EventsModel
    .updateOne({_id: eventId}, {$pull: {interestedUsers: userId}});
export const findEventIdsByOrganizerId = (organizerId) => EventsModel
    .find({organizer: organizerId})
    .select("_id");