// const fs = require('fs');

// // getdata json
// let rawdata = fs.readFileSync('web-list.json');
// let webList = JSON.parse(rawdata);

// for(var attributename in webList){
//     console.log(attributename+": "+webList[attributename]);
// }

const cron = require('node-cron');
// Schedule tasks to be run on the server.
cron.schedule('* * * * *', function() {
    console.log('running a task every minute');
});