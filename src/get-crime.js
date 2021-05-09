const fetch = require('node-fetch');
const sleep = require('./sleep.js');
const geofire = require('geofire-common');

let dontAdd = [
  'ABANDONED 911 CALL',
  'ABANDONED OR FOUND BICYCLE',
  'ABANDONED VEHICLE',
  'ABANDONED VEHICLE, BLOCKING DRIVEWAY',
  'ALARM',
  'ALARM, AUDIBLE',
  'ALARM, SILENT',
  'BAD CHECKS (PHONY CHECKS)',
  'BAD CHECKS (WORTHLESS CHECKS)',
  'BEAT INFORMATION',
  'COUNTY ORDINANCE',
  'DESK ASSIGNMENT',
  'EVENT FOR INFO ONLY',
  'FOLLOW UP',
  'MEET THE CITIZEN',
  'PHONE UR OFFICE, OR:',
  'PICK-UP',
  'RECOVERED VEHICLE',
  'SPECIAL ASSIGNMENT',
  'TAKE A REPORT',
  'UNKN TYPE 7 DIGIT EMERGENCY CALL',
  'UNKNOWN TYPE 911 CALL',
  'VEHICLE STOP',
  'WIRELESS ABANDONED 911 CALL',
  'ABANDONED 7 DIGIT EMERGENCY CALL',
  'ATTEMPT TO CONTACT',
  'PEDESTRIAN STOP',
  'DOCUMENT SERVICE',
  'PATROL CHECK',
  'WELFARE CHECK',
  'SERVICE OR AID REQUEST',
  'PUBLIC SAFETY ASSISTANCE',
  'FOOT PATROL',
];

function fetchCrimes(db, key, firebase) {
  let from = "'2020-01-01T00:00:00'";
  let to = "'2020-12-31T23:00:00'";
  fetch(
    `https://data.sccgov.org/resource/n9u6-aijz.json?$where=incident_datetime between ${from} and ${to}&$limit=10000`,
    {
      method: 'GET',
      headers: {
        'X-App-Token': 'gzGhsK5HDvHDwYtVdgc3KFI25',
      },
    }
  )
    .then((data) => data.json())
    .then(async (crimes) => {
      console.log(`retrieved ${crimes.length} crimes`);
      for (let i = 0; i < crimes.length; i++) {
        //check for unneccessary crimes
        if (
          dontAdd.includes(crimes[i].incident_type_primary) ||
          !crimes[i].incident_type_primary
        ) {
          console.log('Bad Data');
          continue;
        }
        let crimeRef = db.collection('crimes').doc(`${crimes[i].case_number}`);

        //check for existing document in firestore
        let exists = false;
        await crimeRef.get().then((doc) => {
          if (doc.exists) {
            exists = true;
          }
        });
        if (exists) {
          console.log('Crime Already Exists');
          continue;
        }

        let address = crimes[i].address_1;
        let city = crimes[i].city;
        let location = {};
        sleep(1000).then(() => {
          fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${address},
          +${city},+CA&key=${key}`)
            .then((data) => data.json())
            .then((coord) => {
              if (coord.status === 'ZERO_RESULTS') throw 'Bad Address';
              if (coord.results.length > 1 || coord.results.length === 0)
                throw 'Bad Response';

              location.lng = coord.results[0].geometry.location.lng;
              location.lat = coord.results[0].geometry.location.lat;
              let hash = geofire.geohashForLocation([
                location.lat,
                location.lng,
              ]);
              let geohash = hash.substring(0, 9);
              let geohash6 = hash.substring(0, geohash.length - 3); //get 6-digit geohash for notificaiton feature

              //add crime document
              crimeRef
                .set({
                  datetime: crimes[i].incident_datetime,
                  primary_type: crimes[i].incident_type_primary,
                  parent_type: crimes[i].parent_incident_type,
                  city: crimes[i].city,
                  state: crimes[i].state,
                  location: {
                    geohash: geohash,
                    geopoint: new firebase.firestore.GeoPoint(
                      location.lat,
                      location.lng
                    ),
                  },
                  coord: { lat: location.lat, lng: location.lng },
                })
                .then(() => console.log('Coorinates Saved'))
                .catch((error) => console.log(error));

              //add to hashes collection
              let hashRef = db.collection('hashes').doc(geohash6);
              hashRef.get().then((doc) => {
                if (!doc.exists) {
                  hashRef.set({
                    count: 1, //set a count field of document doesn't exist
                  });
                } else {
                  //increment count field for crimes within the same 7-digit geohash
                  hashRef.update({
                    count: firebase.firestore.FieldValue.increment(1),
                  });
                }
              });
            })
            .catch((error) => console.log(error));
        });
      }
    })
    .catch((error) => console.log(error));
}

module.exports = fetchCrimes;
