const express = require('express');
const fetch = require('node-fetch');
const config = require('./config.js');
const app = express();

const port = 3000;

const crimes = [];
const key = config.KEY;

app.get('/', (req, res) => {
  fetch('https://data.sccgov.org/resource/n9u6-aijz.json')
    .then((data) => data.json())
    .then((json) => {
      console.log(json.length); //total number of crime reports
      let address = json[0].address_1;
      let city = json[0].city;
      let crime = {};
      let location = {};

      crime = json[0];

      fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${address},
        +${city},+CA&key=${key}`)
        .then((data) => data.json())
        .then((coord) => {
          location.lng = coord.results[0].geometry.location.lng;
          location.lat = coord.results[0].geometry.location.lat;
          crime.location = location;
          crimes.push(crime);
          res.json(crimes);
        });
    });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
