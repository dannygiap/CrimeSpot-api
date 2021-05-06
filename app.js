const config = require('./config/config.js');
const firebase = require('firebase/app');
const cron = require('node-cron');
const fs = require('fs');
const fetchCrimes = require('./src/get-crime.js');
require('firebase/firestore');

const key = config.KEY;

var firebaseConfig = {
  apiKey: key,
  authDomain: 'crime-spot-305622.firebaseapp.com',
  projectId: 'crime-spot-305622',
  storageBucket: 'crime-spot-305622.appspot.com',
  messagingSenderId: '546726224547',
  appId: '1:546726224547:web:ad753b557b408d4f375516',
  measurementId: 'G-L638M6VMSV',
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

let db = firebase.firestore();

if (process.env.NODE_ENV === 'development') {
  db.useEmulator('localhost', 8080);
}

fetchCrimes(db, key, firebase);
// cron.schedule('46 17 5 * *', () => {
//   let log = `Fetched Crime Data on ${new Date().toUTCString()}\n`;
//   fetchCrimes(db, key, firebase);
//   fs.appendFile('./logs.txt', log, (err) => {
//     if (err) console.log(err);
//     else console.log('adding to logs');
//   });
// });
