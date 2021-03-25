var { response } = require("express");
var express = require("express");
var http = require("http");
var fetch = require("node-fetch");
var cors = require("cors");
var fs = require("fs");
var parse = require("csv-parse");


var parser = parse({columns: true}, function (err, records) {
	console.log(records);
});

const app = express();
app.use(cors())
const server = http.createServer(app);

var today = new Date().toISOString().split('T')[0]
var yesterday = new Date(new Date().getFullYear(), new Date().getMonth(), new Date(new Date().getDate())).toISOString().split('T')[0]
var dayBefore = new Date(new Date().getFullYear(), new Date().getMonth(), new Date(new Date().getDate() - 1)).toISOString().split('T')[0]

app.get("/fetchStateWise", (req, res) => {
  fetch("https://api.covid19india.org/csv/latest/state_wise_daily.csv")
    .then((response) => response.text())
    .then((text) => {
      var allTextLines = text.split(/\r\n|\n/);
      var headers = allTextLines[0].split(",");
      var pos = 0;
      
      while (pos < headers.length) {
        if (headers[pos] == "KL") break;
        pos += 1;
      }

      var newConfirmed = allTextLines[allTextLines.length - 3].split(",");
      res.send(newConfirmed[pos]);
    });
});

app.get("/fetchDistrictWise", (req, res) => {
  fetch("https://api.covid19india.org/csv/latest/districts.csv")
    .then((response) => response.text())
    .then((text) => {
      var allTextLines = text.split(/\r\n|\n/);

      var oldData = []
      var prevData = []
      var newData = []
      var finalData = []

      for(i=0; i<allTextLines.length; i++) {
        if (allTextLines[i].split(',')[0] == dayBefore && allTextLines[i].split(',')[1] == "Kerala") {
          oldData.push(allTextLines[i].split(','));
        }
      }

      for(i=0; i<allTextLines.length; i++) {
        if (allTextLines[i].split(',')[0] == yesterday && allTextLines[i].split(',')[1] == "Kerala") {
          prevData.push(allTextLines[i].split(','));
        }
      }

      for(i=0; i<allTextLines.length; i++) {
        if (allTextLines[i].split(',')[0] == today && allTextLines[i].split(',')[1] == "Kerala") {
          newData.push(allTextLines[i].split(','));
        }
      }

      for(i=0; i<prevData.length; i++) {
        if(prevData[i][2] == newData[i][2]) {
          newConfirmed = newData[i][3] - prevData[i][3];
          if(newConfirmed) {
            finalData.push([prevData[i][2], newConfirmed])
          }
          else {
            newConfirmed = prevData[i][3] - oldData[i][3];
            finalData.push([prevData[i][2], newConfirmed])
          }
        }
      }

      finalData = JSON.stringify(finalData)
      res.send(finalData)      

    });
});

const port = process.env.PORT || 3000;
server.listen(port);
