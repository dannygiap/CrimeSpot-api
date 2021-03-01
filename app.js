const express = require('express');
const fetch = require('node-fetch');
const app = express();

const port = 3000;

const crimes = [];

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
        +${city},+CA&key=AIzaSyA6zb2Dv26xLpOe7FJSDX8BayoGAnfTfT0`)
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
