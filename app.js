const config = require('./config/config.js');
const admin = require('firebase-admin');
const firebase = require('firebase/app');
const cron = require('node-cron');
const fs = require('fs');
const fetchCrimes = require('./src/get-crime.js');
const clean = require('./src/clean.js');
const serviceAccount = require('./config/serviceAccount.json');
require('firebase/firestore');

const key = config.KEY;

// Initialize Firebase as admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://crime-spot-305622.firebaseio.com',
});

let db = admin.firestore();

if (process.env.NODE_ENV === 'development') {
  db.useEmulator('localhost', 8080);
}

fetchCrimes(db, key, admin);

// // fetchCrimes(db, key, admin);
// cron.schedule('0 14 * * *', () => {
//   let log = `Fetched Crime Data on ${new Date().toUTCString()}\n`;
//   fetchCrimes(db, key, firebase);
//   fs.appendFile('./logs.txt', log, (err) => {
//     if (err) console.log(err);
//     else console.log('adding to logs');
//   });
// });
