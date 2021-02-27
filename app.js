var { response } = require("express");
var express = require("express");
var http = require("http");
var fetch = require("node-fetch");
var cors = require("cors");
var fs = require("fs");

const app = express();
app.use(cors())
const server = http.createServer(app);

app.get("/fetchStateWise", (req, res) => {
  fetch("https://api.covid19india.org/data.json")
    .then((response) => response.json())
    .then((data) => {res.send(data.statewise[5])});
});

app.get("/fetchDistrictWise", (req, res) => {
  fetch("https://api.covid19india.org/state_district_wise.json")
    .then((response) => response.json())
    .then((data) => {res.send(data.Kerala.districtData)});
});

const port = process.env.PORT || 3000;
server.listen(port);
