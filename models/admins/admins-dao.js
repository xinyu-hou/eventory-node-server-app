import AdminsModel from "./admins-model.js";

export const findAllAdmins = () => AdminsModel.find();
export const findOneAdmin = (username) => AdminsModel.findOne({username: username});
export const deleteAdmin = (adminId) => AdminsModel.deleteOne({_id: adminId});
export const updateAdmin = (username, admin) => AdminsModel.updateOne({username: username}, {$set: admin});