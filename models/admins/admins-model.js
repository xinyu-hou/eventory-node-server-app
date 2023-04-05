import mongoose from "mongoose";
import AdminsSchema from "./admins-schema.js";

const AdminsModel = mongoose.model('AdminsModel', AdminsSchema);

export default AdminsModel;