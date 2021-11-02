const fs = require('fs');

// getdata json
let rawdata = fs.readFileSync('web-list.json');
let webList = JSON.parse(rawdata);

for(var attributename in webList){
    console.log(attributename+": "+webList[attributename]);
}