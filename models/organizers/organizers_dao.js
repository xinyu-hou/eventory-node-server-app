import OrganizersModel from "./organizers_model.js";

export const findAllOrganizers = () => OrganizersModel.find();
export const findOneOrganizer = (username) => OrganizersModel.findOne({username: username});
export const findOrganizerById = (organizerId) => OrganizersModel.findById(organizerId);
export const findOrganizerByIdPopulateEvents = (organizerId) => OrganizersModel
    .findById(organizerId)
    .populate({path: 'events', select: '_id name date time address city postalCode description image interestedUsers'});
export const findOneToken = (token) => OrganizersModel.findOne({activationToken: token});
export const createOrganizer = (organizer) => OrganizersModel.create(organizer);
export const deleteOrganizer = (organizerId) => OrganizersModel.deleteOne({_id: organizerId});
export const updateOrganizer = (organizerId, organizer) => OrganizersModel
    .updateOne({_id: organizerId}, {$set: organizer});
export const pushEventOrganizer = (organizerId, eventId) => OrganizersModel
    .updateOne({_id: organizerId}, {$addToSet: {events: eventId}});
export const pullEventOrganizer = (organizerId, eventId) => OrganizersModel
    .updateOne({_id: organizerId}, {$pull: {events: eventId}});