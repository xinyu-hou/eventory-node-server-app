import * as UsersDao from '../../models/users/users-dao.js'
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import UsersModel from '../../models/users/users-model.js';
import {
    checkUsernameExistence,
    isCurrentUserAdmin,
    isCurrentUserCurrentUser,
    sendActivationEmailByRole
} from '../../utils/utils.js';
import mongoose from "mongoose";

const UsersController = (app) => {
    app.get('/api/users', isCurrentUserAdmin, findAllUsers); // Admin only action
    app.get('/api/users/:userId', findUserById);
    app.post('/api/users', createUser);
    app.delete('/api/users/:userId', isCurrentUserAdmin, deleteUser); // Admin only action
    app.put('/api/users/:userId', isCurrentUserCurrentUser, updateUser); // One user only action
    app.get('/api/users/verify/:token', verifyUser);
};

const findAllUsers = async (req, res) => {
    const users = await UsersDao.findAllUsers();
    res.json(users);
};
const findUserById = async (req, res) => {
    try {
        const userId = req.params.userId;
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(404).json({ message: 'User not found.' });
        }
        const user = await UsersDao.findUserById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        // Only return non-sensitve info such as firstName, lastName, bio, profilePicture, likedEvents(?)
        const limitedInfoUser = {
            firstName: user.firstName,
            lastName: user.lastName,
            bio: user.bio,
            profilePicture: user.profilePicture,
            likedEvents: user.likedEvents
        };
        res.json(limitedInfoUser);
    } catch (error) {
        console.error('Failed to find user: ', error.message);
        return res.status(500).json({ message: 'Server error.' });
    };
};
const createUser = async (req, res) => {
    const { username, password } = req.body;
    try {
        const existingUser = await checkUsernameExistence(username);
        if (existingUser) {
            const errorMessage = 'User with this username already exists.';
            return res.status(400).json({ message: errorMessage });
        }
        // If username is not used, generate activation token and hash password.
        const activationToken = crypto.randomBytes(64).toString('hex');
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = req.body;
        const newUser = new UsersModel({
            ...user,
            password: hashedPassword,
            activationToken
        });
        // Insert user into database.
        try {
            await UsersDao.createUser(newUser);
        } catch (error) {
            const errorMessage = 'Failed to register user: ' + error.message;
            return res.status(400).json({ message: errorMessage });
        };
        // Send an account activation email to user.
        await sendActivationEmailByRole(username, activationToken, 'users');
        return res.status(201).json({ message: 'Please check your email and activate your account.' });
    } catch (error) {
        console.error('Failed to register user: ', error.message);
        return res.status(500).json({ message: 'Server error.' });
    }
};
const deleteUser = async (req, res) => {
    const userId = req.params.userId;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(404).json({ message: 'User not found.' });
    };
    await UsersDao.deleteUser(userId)
        .then((status) => {
            return res.status(204).json({ message: 'User deleted.' }); // No Content Status Code
        })
        .catch ((error) => {
            console.log('Failed to delete user: ' + error.message)
            return res.status(400).json({ message: 'Failed to delete user.' });
        });
    // TODO: When a user is deleted, should it be reflected in the events collection?
};
const updateUser = async (req, res) => {
    try {
        const userId = req.params.userId;
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(404).json({ message: 'User not found.' });
        };
        const updates = req.body;
        const status = await UsersDao.updateUser(userId, updates);
        // Fetch the updated user information from the database
        const updatedUser = await UsersDao.findUserById(userId);
        // Store the updated user information in the req.session['currentUser'] variable
        req.session['currentUser'] = updatedUser;
        res.json(status);
    } catch (error) {
        console.error('Failed to update user: ', error.message);
        return res.status(500).json({ message: 'Server error.' });
    };
};
const verifyUser = async (req, res) => {
    try {
        const token = req.params.token;
        // Find the user with the activation token.
        const user = await UsersDao.findOneToken(token);
        // If no user found, token is invalid.
        if (!user) {
            return res.status(400).json({ message: 'Invalid verification token' });
        };
        // If a user is found, set the activation attribute to true.
        const updates = { activated: true };
        await UsersDao.updateUser(user._id, updates);
        return res.status(200).json({ message: 'Your Eventory account has been activated.' });
    } catch (error) {
        console.error('Failed to verify user: ', error.message);
        return res.status(500).json({ message: 'Server error.'});
    };
};

export default UsersController;