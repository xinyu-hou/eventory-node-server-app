import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { config } from 'dotenv';
import bodyParser from "body-parser";
import TestController from "./controllers/test-controller.js";
import TicketmasterController from "./controllers/ticketmaster/ticketmaster-controller.js";
import UsersController from "./controllers/users/users-controller.js";
import AdminsController from "./controllers/admins/admins-controller.js";

// Retrieve DB_CONNECTION_STRING env variable.
config();
const CONNECTION_STRING = process.env.DB_CONNECTION_STRING;
// Connect to MongoDB.
// TODO: Remove debug lines when in production.
mongoose.connect(CONNECTION_STRING)
    .then(() => {
        console.log('Connected to MongoDB.');
    })
    .catch((error) => {
        console.error('Failed to connect to MongoDB: ', error.message);
    });

const app = express();
app.use(cors());
app.use(bodyParser.json());
TestController(app);
TicketmasterController(app);
UsersController(app);
AdminsController(app);
app.listen(process.env.PORT || 4000);