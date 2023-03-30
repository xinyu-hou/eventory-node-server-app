import express from 'express';
import TestController from "./controllers/test-controller.js";

const app = express();
TestController(app);
app.listen(4000);