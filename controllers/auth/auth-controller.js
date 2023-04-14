import bcrypt from "bcryptjs";
import {checkUserExistence} from "../../utils/utils.js";

const AuthController = (app) => {
    app.post('/api/login', everybodyLogin);
    app.post('/api/logout', everybodyLogout);
    app.get('/api/profile', profile);
};

const everybodyLogin = async (req, res) => {
    const {username, password} = req.body;
    try {
        // Check user existence.
        const user = await checkUserExistence(username);
        if (!user) {
            const errorMessage = 'User with this username does not exist.';
            return res.status(404).json({ message: errorMessage });
        };
        const userRole = user.role;
        const correctPassword = user.password;
        const userFirstName = user.firstName;
        const passwordMatch = await bcrypt.compare(password, correctPassword);
        // When passwords do not match
        if (!passwordMatch) {
            const errorMessage = 'Invalid password.';
            return res.status(401).json({ message: errorMessage });
        }
        // When entered password is valid,
        // (1) admin: just welcome the admin
        // (2) user or organizer: check if activated
        if (userRole === 'admin') {
            req.session["currentUser"] = user;
            return res.status(200).json(user);
        }
        const activated = user.activated;
        if (!activated) {
            const errorMessage = 'Account is not activated.';
            return res.status(403).json({ message: errorMessage });
        };
        // // If account is activated, display welcome message.
        const welcomeMessage = 'Welcome ' + userRole + ' ' + userFirstName;
        req.session["currentUser"] = user;
        return res.status(200).json(user);
    } catch (error) {
        console.error('Login failed: ', error.message);
        return res.status(500).json({ message: 'Server error.' });
    };
};
const everybodyLogout = async (req, res) => {
    req.session.destroy();
    res.status(200).json({ message: 'Logout complete.' })
};
const profile = async (req, res) => {
    const currentUser = req.session["currentUser"];
    if (!currentUser) {
        return res.status(404).json({ message: 'No current user found.' });
    }
    return res.status(200).json(currentUser);
}

export default AuthController;