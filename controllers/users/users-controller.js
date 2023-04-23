import * as UsersDao from '../../models/users/users-dao.js';
import * as EventsDao from '../../models/events/events-dao.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import UsersModel from '../../models/users/users-model.js';
import {
    checkUserIdExists,
    checkEventIdExists,
    checkTicketmasterEventIdExists,
    checkUsernameExistence,
    isCurrentUserAdmin,
    isCurrentUserUser,
    isCurrentUserCurrentUser,
    sendActivationEmailByRole,
} from '../../utils/utils.js';
import mongoose from 'mongoose';

const UsersController = (app) => {
    app.get('/api/users', isCurrentUserAdmin, findAllUsers); // Admin only action
    app.get('/api/users/:userId', checkUserIdExists, findUserById);
    app.post('/api/users', createUser);
    app.delete('/api/users/:userId', checkUserIdExists, isCurrentUserAdmin, deleteUser); // Admin only action
    app.put(
        '/api/users/:userId',
        checkUserIdExists,
        isCurrentUserCurrentUser,
        updateUser
    ); // One user only action
    app.put(
        '/api/users/eventory/:eventId',
        checkEventIdExists,
        isCurrentUserUser,
        likeOrDislikeEventoryEvent
    ); // User only action
    app.put(
        '/api/users/ticketmaster/:eventId',
        checkTicketmasterEventIdExists,
        isCurrentUserUser,
        likeOrDislikeTicketmasterEvent
    ); // User only action
    app.put('/api/users/user/resetpassword', isCurrentUserUser, resetUserPassword); // User only action
    app.get('/api/users/verify/:token', verifyUser);
};

const findAllUsers = async (req, res) => {
    try {
        const users = await UsersDao.findAllUsers();
        return res.json(users);
    } catch (error) {
        console.error('Failed to retrieve users: ', error.message);
        return res.status(500).json({ message: 'Server error.' });
    }
};
const findUserById = async (req, res) => {
    try {
        const userId = req.params.userId;
        const user = await UsersDao.findUserById(userId);
        // Only return non-sensitve info such as firstName, lastName, bio, profilePicture, likedEvents(?)
        const limitedInfoUser = {
            firstName: user.firstName,
            lastName: user.lastName,
            bio: user.bio,
            location: user.location,
            profilePicture: user.profilePicture,
            likedEvents: user.likedEvents,
            likedTicketmasterEvents: user.likedTicketmasterEvents,
        };
        res.json(limitedInfoUser);
    } catch (error) {
        console.error('Failed to find user: ', error.message);
        return res.status(500).json({ message: 'Server error.' });
    }
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
            activationToken,
        });
        // Insert user into database.
        try {
            await UsersDao.createUser(newUser);
        } catch (error) {
            const errorMessage = 'Failed to register user: ' + error.message;
            return res.status(400).json({ message: errorMessage });
        }
        // Send an account activation email to user.
        await sendActivationEmailByRole(username, activationToken, 'users');
        return res
            .status(201)
            .json({ message: 'Please check your email and activate your account.' });
    } catch (error) {
        console.error('Failed to register user: ', error.message);
        return res.status(500).json({ message: 'Server error.' });
    }
};
const deleteUser = async (req, res) => {
    const session = await mongoose.startSession();
    try {
        await session.withTransaction(async () => {
            const userId = req.params.userId;
            try {
                await UsersDao.deleteUser(userId);
                await EventsDao.pullInterestedUserEvents(userId);
                return res.sendStatus(204);
            } catch (error) {
                console.error('Failed to delete user: ', error.message);
                return res.status(400).json({ message: 'Failed to delete user.' });
            }
        });
    } catch (error) {
        console.error('Failed to delete user: ', error.message);
        return res.status(500).json({ message: 'Server error.' });
    } finally {
        await session.endSession();
    }
};
const updateUser = async (req, res) => {
    try {
        const userId = req.params.userId;
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
    }
};
const likeOrDislikeEventoryEvent = async (req, res) => {
    const session = await mongoose.startSession();
    try {
        await session.withTransaction(async () => {
            const currentUser = req.session['currentUser'];
            const userId = currentUser._id;
            // Retrieve eventId from req parameters
            const eventId = req.params.eventId;
            const action = req.body.action;
            switch (action) {
                case 'like':
                    await likeEventoryEvent(req, res, userId, eventId);
                    break;
                case 'dislike':
                    await dislikeEventoryEvent(req, res, userId, eventId);
                    break;
                default:
                    return res.status(400).json({ message: 'Invalid action' });
            }
        });
    } catch (error) {
        console.error('Failed to like/dislike Eventory event: ', error.message);
        return res.status(500).json({ message: 'Server error.' });
    } finally {
        await session.endSession();
    }
};
const likeEventoryEvent = async (req, res, userId, eventId) => {
    try {
        const updatedUserStatus = await UsersDao.pushEventoryEventOneUser(
            userId,
            eventId
        );
        await EventsDao.pushInterestedUserOneEvent(eventId, userId);
        const updatedUser = await UsersDao.findUserById(userId);
        req.session['currentUser'] = updatedUser;
        res.json(updatedUserStatus);
    } catch (error) {
        console.error('Failed to like Eventory event: ', error.message);
        return res.status(400).json({ message: 'Failed to like Eventory event.' });
    }
};
const dislikeEventoryEvent = async (req, res, userId, eventId) => {
    try {
        const updatedUserStatus = await UsersDao.pullEventoryEventOneUser(
            userId,
            eventId
        );
        await EventsDao.pullInterestedUserOneEvent(eventId, userId);
        const updatedUser = await UsersDao.findUserById(userId);
        req.session['currentUser'] = updatedUser;
        res.json(updatedUserStatus);
    } catch (error) {
        console.error('Failed to dislike Eventory event: ', error.message);
        return res.status(400).json({ message: 'Failed to dislike Eventory event.' });
    }
};
const likeOrDislikeTicketmasterEvent = async (req, res) => {
    const session = await mongoose.startSession();
    try {
        await session.withTransaction(async () => {
            const currentUser = req.session['currentUser'];
            const userId = currentUser._id;
            // Retrieve eventId from req parameters
            const eventId = req.params.eventId;
            const action = req.body.action;
            switch (action) {
                case 'like':
                    await likeTicketmasterEvent(req, res, userId, eventId);
                    break;
                case 'dislike':
                    await dislikeTicketmasterEvent(req, res, userId, eventId);
                    break;
                default:
                    return res.status(400).json({ message: 'Invalid action' });
            }
        });
    } catch (error) {
        console.error('Failed to like/dislike Ticketmaster event: ', error.message);
        return res.status(500).json({ message: 'Server error.' });
    } finally {
        await session.endSession();
    }
};
const likeTicketmasterEvent = async (req, res, userId, eventId) => {
    try {
        const updatedUserStatus = await UsersDao.pushTicketmasterEventOneUser(
            userId,
            eventId
        );
        const updatedUser = await UsersDao.findUserById(userId);
        req.session['currentUser'] = updatedUser;
        res.json(updatedUserStatus);
    } catch (error) {
        console.error('Failed to like Ticketmaster event: ', error.message);
        return res.status(400).json({ message: 'Failed to like Ticketmaster event.' });
    }
};
const dislikeTicketmasterEvent = async (req, res, userId, eventId) => {
    try {
        const updatedUserStatus = await UsersDao.pullTicketmasterEventOneUser(
            userId,
            eventId
        );
        const updatedUser = await UsersDao.findUserById(userId);
        req.session['currentUser'] = updatedUser;
        res.json(updatedUserStatus);
    } catch (error) {
        console.error('Failed to dislike Ticketmaster event: ', error.message);
        return res.status(400).json({ message: 'Failed to dislike Ticketmaster event.' });
    }
};
const resetUserPassword = async (req, res) => {
    try {
        // Retrieve password from currentUser session
        const currentUser = req.session['currentUser'];
        const currentUserPassword = currentUser.password;
        const currentUserId = currentUser._id;
        // Retrieve oldPassword and newPassword from req parameters
        const { oldPassword, newPassword } = req.body;
        // Check if oldPassword matches with currentUserPassword
        const passwordMatch = await bcrypt.compare(oldPassword, currentUserPassword);
        // When passwords do not match
        if (!passwordMatch) {
            const errorMessage = 'Invalid password.';
            return res.status(400).json({ message: errorMessage });
        }
        // When entered oldPassword is valid, encrypt the newPassword and update user info
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const updates = { password: hashedPassword };
        const status = await UsersDao.updateUser(currentUserId, updates);
        const updatedUser = await UsersDao.findUserById(currentUserId);
        // Store the updated user information in the req.session['currentUser'] variable
        req.session['currentUser'] = updatedUser;
        res.json(status);
    } catch (error) {
        console.error('Failed to reset user password: ', error.message);
        return res.status(500).json({ message: 'Server error.' });
    }
};
const verifyUser = async (req, res) => {
    try {
        const token = req.params.token;
        // Find the user with the activation token.
        const user = await UsersDao.findOneToken(token);
        // If no user found, token is invalid.
        if (!user) {
            return res.status(400).json({ message: 'Invalid verification token' });
        }
        // If a user is found, set the activation attribute to true.
        const updates = { activated: true };
        await UsersDao.updateUser(user._id, updates);
        return res
            .status(200)
            .json({ message: 'Your Eventory account has been activated.' });
    } catch (error) {
        console.error('Failed to verify user: ', error.message);
        return res.status(500).json({ message: 'Server error.' });
    }
};

export default UsersController;
