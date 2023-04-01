import UsersModel from "./users-model.js";

export const findAllUsers = () => UsersModel.find();
export const createUser = (user) => UsersModel.create(user);
export const deleteUser = (userId) => UsersModel.deleteOne({_id: userId});
export const updateUser = (userId, user) => UsersModel.updateOne({_id: userId}, {$set: user});