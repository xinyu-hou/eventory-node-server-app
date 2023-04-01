import * as UsersDao from '../../models/users/users-dao.js';

const UsersController = (app) => {
    app.get('/api/users', findAllUsers);
    app.post('/api/users', createUser);
    app.delete('/api/users/:userId', deleteUser);
    app.put('/api/users/:userId', updateUser);
};

const findAllUsers = async (req, res) => {
    const users = await UsersDao.findAllUsers();
    res.json(users);
};
const createUser = async (req, res) => {
    const user = req.body;
    // TODO: Initialize some default values.
    const newUser = await UsersDao.createUser(user);
    res.json(newUser);
};
const deleteUser = async (req, res) => {
    const userId = req.params.userId;
    const status = await UsersDao.deleteUser(userId);
    res.json(status);
};
const updateUser = async (req, res) => {
    const userId = req.params.userId;
    const updates = req.body;
    const status = await UsersDao.updateUser(userId, updates);
    res.json(status);
};

export default UsersController;