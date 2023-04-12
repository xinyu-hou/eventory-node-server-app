import * as AdminsDao from '../../models/admins/admins-dao.js';

const AdminsController = (app) => {
    app.get('/api/admins', getAllAdmins);
}

const getAllAdmins = async (req, res) => {
    const users = await AdminsDao.findAllAdmins();
    res.json(users);
}
// const adminLogin = async (req, res) => {
//     const { username, password } = req.body;
//     try {
//         // Check if username exists in the database
//         const existingAdmin = await AdminsDao.findOneAdmin(username);
//         // When username does not exist in the database
//         if (!existingAdmin) {
//             const errorMessage = 'Admin with this username does not exist.';
//             return res.status(404).json({ message: errorMessage });
//         }
//         // When username exists in the database, check if password is correct.
//         const passwordMatch = await bcrypt.compare(password, existingAdmin.password);
//         // When passwords do not match
//         if (!passwordMatch) {
//             const errorMessage = 'Invalid password.';
//             return res.status(401).json({ message: errorMessage });
//         }
//         // When passwords match, display welcome message.
//         const welcomeMessage = 'Welcome admin ' + existingAdmin.firstName + '.';
//         return res.status(201).json({ message: welcomeMessage });
//     } catch (error) {
//         console.error('Failed to login admin: ', error.message);
//         return res.status(500).json({ message: 'Server error.'});
//     }
// };

export default AdminsController;