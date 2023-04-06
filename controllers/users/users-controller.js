import * as UsersDao from '../../models/users/users-dao.js'
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import UsersModel from '../../models/users/users-model.js';

const UsersController = (app) => {
    app.get('/api/users', findAllUsers);
    app.post('/api/users', createUser);
    app.delete('/api/users/:userId', deleteUser);
    app.put('/api/users/:userId', updateUser);
    app.get('/verify/:token', verifyUser);
    app.post('/api/users/login', userLogin);
};

const findAllUsers = async (req, res) => {
    const users = await UsersDao.findAllUsers();
    res.json(users);
};

const createUser = async (req, res) => {
    const { username, password } = req.body;
    try {
        // Check if username (email address) exists in the database.
        const existingUser = await UsersDao.findOneUser(username);
        // If user exists and the account is activated,
        if (existingUser && existingUser.activated === true) {
            const errorMessage = 'User with this username already exists.';
            return res.status(400).json({ message: errorMessage });
        } else if (existingUser && existingUser.activated === false) {
            const activationMessage = 'User with this username exists but the account is not activated. An ' +
                'account activation email has been sent. Please use the link in the email to activate your account.'
            const activationToken = crypto.randomBytes(64).toString('hex');
            const updates = { activationToken: activationToken };
            await UsersDao.updateUserByUsername(username, updates);
            await sendActivationEmail(username, activationToken);
            return res.status(403).json({ message: activationMessage });
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
    // TODO: Only the user themselves and admins can perform delete a user action.
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
        text: `Please click the following link to verify your email address: ${process.env.BASE_URL}/verify/${activationToken}`,
        replyTo: 'noreply@eventoryma.com'
    };
    await transporter.sendMail(mailOptions);
}
const userLogin = async (req, res) => {
    const { username, password } = req.body;
    try {
        // Check if username exists in the database
        const existingUser = await UsersDao.findOneUser(username);
        // When username does not exist in the database
        if (!existingUser) {
            const errorMessage = 'User with this username does not exist.';
            return res.status(404).json({ message: errorMessage });
        }
        // When username exists in the database, check if password is correct.
        const passwordMatch = await bcrypt.compare(password, existingUser.password);
        // When passwords do not match
        if (!passwordMatch) {
            const errorMessage = 'Invalid password.';
            return res.status(401).json({ message: errorMessage });
        }
        // When entered password is valid, check if user account is activated.
        // If account is not activated, renew token and send activation email.
        if (existingUser.activated === false) {
            const activationMessage = 'User with this username exists but the account is not activated. An ' +
                'account activation email has been sent. Please use the link in the email to activate your account.'
            const activationToken = crypto.randomBytes(64).toString('hex');
            const updates = { activationToken: activationToken };
            await UsersDao.updateUserByUsername(username, updates);
            await sendActivationEmail(username, activationToken);
            return res.status(403).json({ message: activationMessage });
        }
        // If account is activated, display welcome message.
        const welcomeMessage = 'Welcome ' + existingUser.firstName;
        return res.status(201).json({ message: welcomeMessage });
    } catch (error) {
        console.error('Failed to login user: ', error.message);
        return res.status(500).json({ message: 'Server error.'});
    }
}

export default UsersController;