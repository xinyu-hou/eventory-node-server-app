import bcrypt from 'bcryptjs';
import mongoose from "mongoose";
import * as AdminsDao from '../models/admins/admins-dao.js';

const CONNECTION_STRING = 'replace with actual connection string';
mongoose.connect(CONNECTION_STRING)
    .then(() => {
        console.log('Connected to MongoDB.');
    })
    .catch((error) => {
        console.error('Failed to connect to MongoDB: ', error.message);
    });

const admins = await AdminsDao.findAllAdmins();
await admins.map(async admin => {
    console.log(admin);
    const hashedPassword = await bcrypt.hash(admin.password, 10);
    const updates = { password: hashedPassword };
    await AdminsDao.updateAdmin(admin.username, updates);
})
console.log('Admin passwords hashed.');

