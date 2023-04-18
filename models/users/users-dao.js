import UsersModel from "./users-model.js";

export const findAllUsers = () => UsersModel.find();
export const findOneUser = (username) => UsersModel.findOne({username: username});
export const findUserById = (userId) => UsersModel.findById(userId);
export const findOneToken = (token) => UsersModel.findOne({activationToken: token});
export const createUser = (user) => UsersModel.create(user);
export const deleteUser = (userId) => UsersModel.deleteOne({_id: userId});
export const updateUser = (userId, user) => UsersModel.updateOne({_id: userId}, {$set: user});
export const pullEventUsers = (eventId) => UsersModel
    .updateMany({likedEvents: eventId}, {$pull: {likedEvents: eventId}});
export const pullEventsUsers = (eventIds) => UsersModel
    .updateMany({likedEvents: {$in: eventIds}}, {$pull: {likedEvents: {$in: eventIds}}});
export const pushEventoryEventOneUser = (userId, eventId) => UsersModel
    .updateOne({_id: userId}, {$addToSet: {likedEvents: eventId}});
export const pullEventoryEventOneUser = (userId, eventId) => UsersModel
    .updateOne({_id: userId}, {$pull: {likedEvents: eventId}});
export const pushTicketmasterEventOneUser = (userId, ticketmasterEventId) => UsersModel
    .updateOne({_id: userId}, {$addToSet: {likedTicketmasterEvents: ticketmasterEventId}});
export const pullTicketmasterEventOneUser = (userId, ticketmasterEventId) => UsersModel
    .updateOne({_id: userId}, {$pull: {likedTicketmasterEvents: ticketmasterEventId}});
export const findInterestedUsersByTicketmasterEventId = (ticketmasterEventId) => UsersModel
    .find({likedTicketmasterEvents: ticketmasterEventId});