// import * as UsersDao from "../../models/users/users-dao.js";
// import bcrypt from "bcryptjs";
// import crypto from "crypto";
// import {checkUsernameExistence, checkUserType} from "../../utils/utils.js";
//
// const AuthController = (app) => {
//     app.post('/api/login', everybodyLogin);
// };
//
// const everybodyLogin = async (req, res) => {
//     const {username, password} = req.body;
//     try {
//         // Check user type. If userType is nobody, username does not exist.
//         const userType = await checkUserType(username);
//         console.log("userType"+userType);
//         switch (userType) {
//             case 'user':
//                 console.log("User trying to login.");
//                 break;
//             case 'organizer':
//                 console.log("Organizer trying to login.");
//                 break;
//             case 'admin':
//                 console.log("Admin trying to login.")
//                 break;
//             default:
//                 const errorMessage = 'User with this username does not exist.';
//                 return res.status(404).json({message: errorMessage});
//         }
//         ;
//
//         //
//         // const passwordMatch = await bcrypt.compare(password, existingUser.password);
//         // // When passwords do not match
//         // if (!passwordMatch) {
//         //     const errorMessage = 'Invalid password.';
//         //     return res.status(401).json({ message: errorMessage });
//         // }
//         // // When entered password is valid, check if user account is activated.
//         // // If account is not activated, renew token and send activation email.
//         // if (existingUser.activated === false) {
//         //     const activationMessage = 'User with this username exists but the account is not activated. An ' +
//         //         'account activation email has been sent. Please use the link in the email to activate your account.'
//         //     const activationToken = crypto.randomBytes(64).toString('hex');
//         //     const updates = { activationToken: activationToken };
//         //     await UsersDao.updateUserByUsername(username, updates);
//         //     await sendActivationEmail(username, activationToken);
//         //     return res.status(403).json({ message: activationMessage });
//         // }
//         // // If account is activated, display welcome message.
//         // const welcomeMessage = 'Welcome ' + existingUser.firstName;
//         // return res.status(201).json({ message: welcomeMessage });
//     } catch (error) {
//         console.error('Login failed: ', error.message);
//         return res.status(500).json({message: 'Server error.'});
//     };
// };
//
// export default AuthController;