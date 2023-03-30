import express from 'express';
import bodyParser from "body-parser";
import TestController from "./controllers/test-controller.js";
import TicketmasterController from "./controllers/ticketmaster/ticketmaster-controller.js";

const app = express();
app.use(bodyParser.json());
TestController(app);
TicketmasterController(app);
app.listen(4000);