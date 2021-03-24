const express = require('express');
const fetch = require('node-fetch');
const config = require('./config.js');
const firebase = require('firebase/app');
const admin = require('firebase-admin');
require('firebase/firestore');

const app = express();
const port = 3000;
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

//using Firebase Emulator for development and testing purposes.
db.useEmulator('localhost', 9090);

const testCrime = {
  case_number: 'S210820046',
  incident_datetime: '2021-03-23T05:26:02.000',
  incident_description:
    "Call Type: SUSCIR <br>Description: SUSPICIOUS CIRCUMSTANCES<br>Final Disposition: N <br>Data provided by: Santa Clara County Sheriff's Office",
  address_1: '1700 Block S MILPITAS BL',
  city: 'Santa Clara County',
  state: 'CA',
  parent_incident_type: 'Other',
  incident_type_primary: 'SUSPICIOUS CIRCUMSTANCES',
};

//adding a test crime into the Firestore
var docRef = db.collection('crimes').doc(`${testCrime.case_number}`);
docRef
  .set({
    time: testCrime.incident_datetime,
    description: testCrime.incident_description,
    type: testCrime.incident_type_primary,
  })
  .then(() => console.log('crime data saved'))
  .catch((err) => console.log(err));

//convert address into coordinates
let location = {};
fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${testCrime.address_1},
        +${testCrime.city},+CA&key=${key}`)
  .then((data) => data.json())
  .then((coord) => {
    location.lng = coord.results[0].geometry.location.lng;
    location.lat = coord.results[0].geometry.location.lat;

    docRef
      .update({
        location: location,
      })
      .then(() => console.log('coorinates saved'))
      .catch((err) => console.log(err));
  });

// app.get('/', (req, res) => {
//   fetch('https://data.sccgov.org/resource/n9u6-aijz.json')
//     .then((data) => data.json())
//     .then((json) => {
//       let address = json[0].address_1;
//       let city = json[0].city;
//       let crime = {};
//       let location = {};

//       crime = json[0];
//       var docRef = db.collection('crimes').doc(`${json[0].case_number}`);
//       docRef
//         .set({
//           time: json[0].incident_datetime,
//           description: json[0].incident_description,
//           type: json[0].incident_type_primary,
//         })
//         .then(() => console.log('crime data saved'))
//         .catch((err) => console.log(err));

//       fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${address},
//         +${city},+CA&key=${key}`)
//         .then((data) => data.json())
//         .then((coord) => {
//           location.lng = coord.results[0].geometry.location.lng;
//           location.lat = coord.results[0].geometry.location.lat;
//           crime.location = location;
//           crimes.push(crime);

//           docRef
//             .update({
//               lng: coord.results[0].geometry.location.lng,
//               lat: coord.results[0].geometry.location.lat,
//             })
//             .then(() => console.log('coorinates saved'))
//             .catch((err) => console.log(err));

//           res.json(crimes);
//         });
//     });
// });

// app.listen(port, () => {
//   console.log(`Example app listening at http://localhost:${port}`);
// });
