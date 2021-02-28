var { response } = require("express");
var express = require("express");
var http = require("http");
var fetch = require("node-fetch");
var cors = require("cors");
var fs = require("fs");

const app = express();
app.use(cors())
const server = http.createServer(app);

const refresh = 18*60
const date = new Date()
const now = date.getHours()*60 + date.getMinutes()

function checkTime() {
  if (refresh <= now) {
    return true
  }
  else {
    return false
  }
}

app.get("/fetchStateWise", (req, res) => {
  if (checkTime()) {
    fetch("https://api.covid19india.org/data.json")
    .then((response) => response.json())
    .then((data) => {
      let write = JSON.stringify(data.statewise[5])
      fs.writeFile('stateWise.json', write, (err) => {if(err) throw err})
      res.send(data.statewise[5])
    });
  }
  else {
    fs.readFile('stateWise.json', (err, data) => {
      if (err) throw err
      let read = JSON.parse(data)
      res.send(read)
    });
  }
});

app.get("/fetchDistrictWise", (req, res) => {
  if (checkTime()) {
    fetch("https://api.covid19india.org/state_district_wise.json")
    .then((response) => response.json())
    .then((data) => {
      let write = JSON.stringify(data.Kerala.districtData)
      fs.writeFile('districtWise.json', write, (err) => {if(err) throw err})
      res.send(data.Kerala.districtData)
    });
  }
  else {
    fs.readFile('districtWise.json', (err, data) => {
      if (err) throw err
      let read = JSON.parse(data)
      res.send(read)
    });
  }
});

const port = process.env.PORT || 3000;
server.listen(port);
