import express from 'express';
import session from 'express-session';
import cors from 'cors';
import mongoose from 'mongoose';
import { config } from 'dotenv';
import bodyParser from "body-parser";
import TicketmasterController from "./controllers/ticketmaster/ticketmaster-controller.js";
import UsersController from "./controllers/users/users-controller.js";
import AdminsController from "./controllers/admins/admins-controller.js";
import OrganizersController from "./controllers/organizers/organizers-controller.js";
import EventsController from "./controllers/events/events-controller.js";
import AuthController from "./controllers/auth/auth-controller.js";

// Retrieve DB_CONNECTION_STRING env variable.
config();
const CONNECTION_STRING = process.env.DB_CONNECTION_STRING;
// Connect to MongoDB.
mongoose.connect(CONNECTION_STRING)
    .then(() => {
        console.log('Connected to MongoDB.');
    })
    .catch((error) => {
        console.error('Failed to connect to MongoDB: ', error.message);
    });

const app = express();
app.use(session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false
}));
app.use(cors({
    credentials: true,
    origin: "http://localhost:3000",
}));
app.use(bodyParser.json());
TicketmasterController(app);
UsersController(app);
AdminsController(app);
OrganizersController(app);
EventsController(app);
AuthController(app);
app.listen(process.env.PORT || 4000);