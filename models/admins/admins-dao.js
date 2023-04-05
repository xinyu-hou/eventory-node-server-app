import AdminsModel from "./admins-model.js";


export const findOneAdmin = (username) => AdminsModel.findOne({username: username});
export const createAdmin = (admin) => AdminsModel.create(admin);
export const deleteAdmin = (adminId) => AdminsModel.deleteOne({_id: adminId});
export const updateAdmin = (username, admin) => AdminsModel.updateOne({username: username}, {$set: admin});