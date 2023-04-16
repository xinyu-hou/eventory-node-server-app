import OrganizersModel from "./organizers_model.js";

export const findAllOrganizers = () => OrganizersModel.find();
export const findOneOrganizer = (username) => OrganizersModel.findOne({username: username});
export const findOrganizerById = (organizerId) => OrganizersModel.findById(organizerId);
export const findOneToken = (token) => OrganizersModel.findOne({activationToken: token});
export const createOrganizer = (organizer) => OrganizersModel.create(organizer);
export const deleteOrganizer = (organizerId) => OrganizersModel.deleteOne({_id: organizerId});
export const updateOrganizer = (organizerId, organizer) => OrganizersModel.updateOne({_id: organizerId}, {$set: organizer});
export const pushEventOrganizer = (organizerId, eventId) => OrganizersModel.updateOne({_id: organizerId}, {$push: {events: eventId}});
export const pullEventOrganizer = (organizerId, eventId) => OrganizersModel.updateOne({_id: organizerId}, {$pull: {events: eventId}});