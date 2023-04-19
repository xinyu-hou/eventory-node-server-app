import * as AdminsDao from '../../models/admins/admins-dao.js';
import {checkUsernameExistence} from "../../utils/utils.js";
import bcrypt from "bcryptjs";
import AdminsModel from "../../models/admins/admins-model.js";

const AdminsController = (app) => {
    app.get('/api/admins', getAllAdmins);
    // app.post('/api/admins', createAdmin);
}

const getAllAdmins = async (req, res) => {
    const admins = await AdminsDao.findAllAdmins();
    const limitedInfoAdmins = [];
    admins.map(admin => {
        let limitedInfoAdmin = {
            username: admin.username,
            firstName: admin.firstName,
            lastName: admin.lastName
        };
        limitedInfoAdmins.push(limitedInfoAdmin);
    });
    res.json(limitedInfoAdmins);
};
const createAdmin = async (req, res) => {
    const { username, password } = req.body;
    try {
        const usernameExistence = await checkUsernameExistence(username);
        if (usernameExistence) {
            const errorMessage = 'User with this username already exists.';
            return res.status(400).json({ message: errorMessage });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const admin = req.body;
        const newAdmin = new AdminsModel({
            ...admin,
            password: hashedPassword
        });
        const insertedAdmin = await AdminsDao.createAdmin(newAdmin);
        return res.status(201).json({ message: 'Admin created.' });
    } catch (error) {
        console.log("Failed to create admin: " + error.message);
    }
};

export default AdminsController;