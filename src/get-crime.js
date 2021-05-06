const fetch = require('node-fetch');
const sleep = require('./sleep.js');
const geofire = require('geofire-common');

function fetchCrimes(db, key, firebase) {
  console.log(`Started Fetching Crimes at ${new Date().toTimeString()}`);

  fetch('https://data.sccgov.org/resource/n9u6-aijz.json')
    .then((data) => data.json())
    .then(async (crimes) => {
      for (let i = 0; i < 1000; i++) {
        let crimeRef = db.collection('crimes').doc(`${crimes[i].case_number}`);

        //check for existing document in firestore
        let exists = false;
        await crimeRef.get().then((doc) => {
          if (doc.exists) {
            exists = true;
          }
        });
        if (exists) continue;

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
