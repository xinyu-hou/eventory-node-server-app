import mongoose from 'mongoose';
import moment from 'moment-timezone';

const EventsSchema = new mongoose.Schema({
    name: { type: String, required: true },
    date: {
        type: Date,
        required: true,
        get: function(date) {
            return moment(date).tz('America/New_York').format('YYYY-MM-DD');
        },
        set: function(date) {
            return moment.tz(date, 'YYYY-MM-DD', 'America/New_York').toDate();
        }
    },
    time: {
        type: Date,
        required: true,
        get: function(time) {
            return moment(time).tz('America/New_York').format('HH:mm:ss');
        },
        set: function(time) {
            return moment.tz(time, 'HH:mm:ss', 'America/New_York').toDate();
        }
    },
    address: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    description: { type: String, required: true },
    image: String,
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'OrganizersModel', immutable: true },
    interestedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'UsersModel' }]
}, {collection: 'events'});

EventsSchema.methods.getDateTimeInTimeZone = function(timeZone) {
    const eventDateTime = moment.tz(`${this.date} ${this.time}`, 'YYYY-MM-DD HH:mm:ss', 'UTC');
    return eventDateTime.tz(timeZone).format('YYYY-MM-DD HH:mm:ss');
};

export default EventsSchema;