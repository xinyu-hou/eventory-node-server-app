import * as UsersDao from '../../models/users/users-dao.js'
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import UsersModel from '../../models/users/users-model.js';
import { checkUsernameExistence, isCurrentUserAdmin, isCurrentUserCurrentUser } from '../../utils/utils.js';

const UsersController = (app) => {
    app.get('/api/users', isCurrentUserAdmin, findAllUsers); // Admin only action
    app.post('/api/users', createUser);
    app.delete('/api/users/:userId', isCurrentUserAdmin, deleteUser); // Admin only action
    app.put('/api/users/:userId', isCurrentUserCurrentUser, updateUser); // One user only action
    app.get('/api/users/verify/:token', verifyUser);
};

const findAllUsers = async (req, res) => {
    const users = await UsersDao.findAllUsers();
    res.json(users);
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
        const insertedUser = await UsersDao.createUser(newUser);
        // Send an account activation email to user.
        await sendActivationEmail(username, activationToken);
        return res.status(201).json({ message: 'Please check your email and activate your account.' });
    } catch (error) {
        console.error('Failed to register user: ', error.message);
        return res.status(500).json({ message: 'Server error.' });
    }
};
const deleteUser = async (req, res) => {
    const userId = req.params.userId;
    await UsersDao.deleteUser(userId)
        .then((status) => {
            return res.status(201).json(status);
        })
        .catch ((error) => {
            console.log('Failed to delete user: ' + error.message)
            return res.status(400).json({ message: 'Failed to delete user.' });
        });
    // TODO: When a user is deleted, should it be reflected in the events collection?
};
const updateUser = async (req, res) => {
    const userId = req.params.userId;
    const updates = req.body;
    const status = await UsersDao.updateUser(userId, updates);
    // Fetch the updated user information from the database
    const updatedUser = await UsersDao.findUserById(userId);
    // Store the updated user information in the req.session['currentUser'] variable
    req.session['currentUser'] = updatedUser;
    res.json(status);
};
const verifyUser = async (req, res) => {
    const token = req.params.token;
    try {
        // Find the user with the activation token.
        const user = await UsersDao.findOneToken(token);
        // If no user found, token is invalid
        if (!user) {
            return res.status(400).json({ message: 'Invalid verification token' });
        };
        // If a user is found, set the activation attribute to true.
        const updates = { activated: true };
        const status = await UsersDao.updateUser(user._id, updates);
        return res.status(201).json({ message: 'Your Eventory account has been activated.' });
    } catch (error) {
        console.error('Failed to verify user: ', error.message);
        return res.status(500).json({ message: 'Server error.'});
    }
};
const sendActivationEmail = async (username, activationToken) => {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false,
        auth: {
            user: process.env.SMTP_USERNAME,
            pass: process.env.SMTP_PASSWORD,
        }
    });
    const mailOptions = {
        from: 'Eventory App <eventoryma@gmail.com>',
        to: username,
        subject: 'Activate you Eventory account',
        text: `Please click the following link to verify your email address: ${process.env.BASE_URL}/api/users/verify/${activationToken}`,
        replyTo: 'noreply@eventoryma.com'
    };
    await transporter.sendMail(mailOptions);
};

export default UsersController;