import * as OrganizersDao from "../../models/organizers/organizers_dao.js";
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import {
    checkOrganizerIdExists,
    checkUsernameExistence,
    isCurrentUserAdmin,
    isCurrentUserOrganizer,
    isCurrentUserCurrentOrganizer,
    sendActivationEmailByRole
} from "../../utils/utils.js";
import OrganizersModel from "../../models/organizers/organizers_model.js";

const OrganizersController = (app) => {
    app.get('/api/organizers', isCurrentUserAdmin, findAllOrganizers); // Admin only action
    app.get('/api/organizers/:organizerId', checkOrganizerIdExists, findOrganizerById);
    app.post('/api/organizers', createOrganizer);
    app.delete('/api/organizers/:organizerId', checkOrganizerIdExists, isCurrentUserAdmin, deleteOrganizer); // Admin only action
    app.put('/api/organizers/:organizerId', checkOrganizerIdExists, isCurrentUserCurrentOrganizer, updateOrganizer); // One organizer only action
    app.put('/api/organizers/organizer/resetpassword', isCurrentUserOrganizer, resetOrganizerPassword); // Organizer only action
    app.get('/api/organizers/verify/:token', verifyOrganizer);
};

const findAllOrganizers = async (req, res) => {
    const organizers = await OrganizersDao.findAllOrganizers();
    res.json(organizers);
};
const findOrganizerById = async (req, res) => {
    try {
        const organizerId = req.params.organizerId;
        const organizer = await OrganizersDao.findOrganizerById(organizerId);
        // Only return non-sensitive info such as name, profilePicture, bio, and username(?)
        const limitedInfoOrganizer = {
            name: organizer.name,
            bio: organizer.bio,
            profilePicture: organizer.profilePicture,
            username: organizer.username
        };
        res.json(limitedInfoOrganizer);
    } catch (error) {
        console.error('Failed to find organizer: ', error.message);
        return res.status(500).json({ message: 'Server error.' });
    }
};
const createOrganizer = async (req, res) => {
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
        const organizer = req.body;
        const newOrganizer = new OrganizersModel({
            ...organizer,
            password: hashedPassword,
            activationToken
        });
        // Insert organizer into database.
        try {
            await OrganizersDao.createOrganizer(newOrganizer);
        } catch (error) {
            const errorMessage = 'Failed to register organizer: ' + error.message;
            return res.status(400).json({ message: errorMessage });
        }
        // Send an account activation email to organizer.
        await sendActivationEmailByRole(username, activationToken, 'organizers');
        return res.status(201).json({ message: 'Please check your email and activate your account.' });
    } catch (error) {
        console.error('Failed to register organizer: ', error.message);
        return res.status(500).json({ message: 'Server error.' });
    }
};
const deleteOrganizer = async (req, res) => {
    const organizerId = req.params.organizerId;
    await OrganizersDao.deleteOrganizer(organizerId)
        .then((status) => {
            return res.sendStatus(204); // No Content Status Code
        })
        .catch((error) => {
           console.log('Failed to delete organizer: ' + error.message);
           return res.status(400).json({ message: 'Failed to delete organizer.' });
        });
    // TODO: When an organizer is deleted, should it be reflected in the events collection?
};
const updateOrganizer = async (req, res) => {
    try {
        const organizerId = req.params.organizerId;
        const updates = req.body;
        const status = await OrganizersDao.updateOrganizer(organizerId, updates);
        // Fetch the updated user information from the database
        const updatedOrganizer = await OrganizersDao.findOrganizerById(organizerId);
        // Store the updated user information in the req.session['currentUser'] variable
        req.session["currentUser"] = updatedOrganizer;
        res.json(status);
    } catch (error) {
        console.error('Failed to update organizer: ', error.message);
        return res.status(500).json({ message: 'Server error.' });
    }
};
const resetOrganizerPassword = async (req, res) => {
    try {
        // Retrieve password from currentUser session
        const currentOrganizer = req.session["currentUser"];
        const currentOrganizerPassword = currentOrganizer.password;
        const currentOrganizerId = currentOrganizer._id;
        // Retrieve oldPassword and newPassword from req parameters
        const { oldPassword, newPassword } = req.body;
        // Check if oldPassword matches with currentOrganizerPassword
        const passwordMatch = await bcrypt.compare(oldPassword, currentOrganizerPassword);
        // When passwords do not match
        if (!passwordMatch) {
            const errorMessage = 'Invalid password.';
            return res.status(400).json({ message: errorMessage });
        }
        // When entered oldPassword is valid, encrypt the newPassword and update user info
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const updates = { password: hashedPassword };
        const status = await OrganizersDao.updateOrganizer(currentOrganizerId, updates);
        const updatedOrganizer = await OrganizersDao.findOrganizerById(currentOrganizerId);
        // Store the updated organizer information in the req.session['currentUser'] variable
        req.session["currentUser"] = updatedOrganizer;
        res.json(status);
    } catch (error) {
        console.error('Failed to reset organizer password: ', error.message);
        return res.status(500).json({ message: 'Server error.' });
    }
};
const verifyOrganizer = async (req, res) => {
    try {
        const token = req.params.token;
        // Find the organizer with the activation token.
        const organizer = await OrganizersDao.findOneToken(token);
        // If no organizer found, token is invalid.
        if (!organizer) {
            return res.status(400).json({ message: 'Invalid verification token' });
        }
        // If an organizer is found, set the activation attribute to true.
        const updates = { activated: true };
        await OrganizersDao.updateOrganizer(organizer._id, updates);
        return res.status(200).json({ message: 'Your Eventory account has been activated.' });
    } catch (error) {
        console.error('Failed to verify organizer: ', error.message);
        return res.status(500).json({ message: 'Server error.'});
    }
};

export default OrganizersController;