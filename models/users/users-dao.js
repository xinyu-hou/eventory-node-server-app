import UsersModel from "./users-model.js";

export const findAllUsers = () => UsersModel.find();
export const findOneUser = (username) => UsersModel.findOne({username: username});
export const findUserById = (userId) => UsersModel.findOne({_id: userId});
export const findOneToken = (token) => UsersModel.findOne({activationToken: token});
export const createUser = (user) => UsersModel.create(user);
export const deleteUser = (userId) => UsersModel.deleteOne({_id: userId});
export const updateUser = (userId, user) => UsersModel.updateOne({_id: userId}, {$set: user});
export const updateUserByUsername = (username, user) => UsersModel.updateOne({username: username}, {$set: user});