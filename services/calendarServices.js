const { google } = require('googleapis');
const env = require('dotenv');
env.config();
// Provide the required configuration
const CREDENTIALS = JSON.parse(process.env.CREDENTIALS);
const calendarId = process.env.CALENDAR_ID;

// Google calendar API settings
const SCOPES = 'https://www.googleapis.com/auth/calendar';
const calendar = google.calendar({ version: "v3" });

const auth = new google.auth.JWT(
  CREDENTIALS.client_email,
  null,
  CREDENTIALS.private_key,
  SCOPES
);

// Your TIMEOFFSET Offset
const TIMEOFFSET = '+05:30';


function convertDateToG_CalFormat(dateString) {
  const [year, month, day] = dateString.split('/');
  const isoDateString = new Date(`${year}-${month}-${day}T12:00:00`).toISOString();
  return isoDateString;
}



// Insert new event to Google Calendar
const addCalendarEvent = async (event) => {
  try {
    let response = await calendar.events.insert({
      auth: auth,
      calendarId: calendarId,
      resource: event
    });

    if (response['status'] == 200 && response['statusText'] == 'OK') {
      return 1;
    } else {
      return 0;
    }
  } catch (error) {
    console.log(`Error at insertEvent --> ${error}`);
    return 0;
  }
};


// // Event for Google Calendar
// let event = {
//   'summary': `This is the summary.`,
//   'description': `This is the description.`,
//   'start': {
//     'dateTime': convertDateToG_CalFormat(start),
//     'timeZone': 'Asia/Kolkata'
//   },
//   'end': {
//     'dateTime': convertDateToG_CalFormat(end),
//     'timeZone': 'Asia/Kolkata'
//   }
//   // ,
//   // 'attendees': [
//   //   { 'email': 'onkarsabale15@gmail.com' },
//   // ]
// };


// Get all the events between two dates
const getEvents = async (dateTimeStart, dateTimeEnd) => {
  dateTimeStart = await convertDateToG_CalFormat(dateTimeStart);
  dateTimeEnd = await convertDateToG_CalFormat(dateTimeEnd)
  try {
    let response = await calendar.events.list({
      auth: auth,
      calendarId: calendarId,
      timeMin: dateTimeStart,
      timeMax: dateTimeEnd,
      timeZone: 'Asia/Kolkata'
    });

    let items = response['data']['items'];
    return items;
  } catch (error) {
    console.log(`Error at getEvents --> ${error}`);
    return 0;
  }
};


// Delete an event from eventID
const deleteEvent = async (eventId) => {

  try {
    let response = await calendar.events.delete({
      auth: auth,
      calendarId: calendarId,
      eventId: eventId
    });

    if (response.data === '') {
      return 1;
    } else {
      return 0;
    }
  } catch (error) {
    console.log(`Error at deleteEvent --> ${error}`);
    return 0;
  }
};

module.exports = { deleteEvent, getEvents, addCalendarEvent, convertDateToG_CalFormat }