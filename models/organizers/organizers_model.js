import mongoose  from 'mongoose';
import OrganizersSchema from "./organizers_schema.js";

const OrganizersModel = mongoose.model('OrganizersModel', OrganizersSchema);

export default OrganizersModel;