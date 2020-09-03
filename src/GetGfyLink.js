//take recording -> upload to gfycat
//store the filename/gfycat link in a text file for now?
const fs = require("fs"); 
const fetch = require('node-fetch');
const path = require('path');
const moment = require('moment');
const FormData = require('form-data');
const Headers = require('fetch-headers');
const videoPath = path.join(__dirname, '../storedVideos');
const uploadPath = path.join(__dirname, '../storedUploads')
const settings = JSON.parse(fs.readFileSync(path.join(__dirname, '../settings/appSettings.json')));
var numberOfFiles;

var gfyFiles = new Array();
var tokenHeaders = new Headers();
tokenHeaders.append("Content-Type", "application/json");
var tokenBody = {
    "grant_type":"password",
    "client_id": settings.client_id,
    "client_secret": settings.client_secret,
    "username":settings.username,
    "password":settings.password
}

var tokenOptions = {
    method: 'POST',
    headers: tokenHeaders,
    body: JSON.stringify(tokenBody),
    redirect: 'follow' 
};

fetch("https://api.gfycat.com/v1/oauth/token", tokenOptions)
  .then(res => res.json())
  .then(tokenResult => {
      var token = tokenResult.access_token;

      var authHeaders = new Headers();
      authHeaders.append("Authorization", "Bearer "+token);
      
      var gfycatsOptions = {
        method: 'POST',
        headers: new Headers({
            "Authorization" : "Bearer " + token
        }),
        redirect: 'follow'
      }
      var files = fs.readdirSync(videoPath);
      numberOfFiles = files.length;
      for (let i = 0; i < files.length; i++) {
        fetch("https://api.gfycat.com/v1/gfycats", gfycatsOptions)
            .then(res=> res.json())
            .then(gfyResult => {
                console.log(files[i]);
                
                var newFilePath = path.join(uploadPath, gfyResult.gfyname);
                fs.renameSync(path.join(videoPath, files[i]), newFilePath);

                var params = new FormData();
                params.append('key', gfyResult.gfyname);

                var file = fs.readFileSync(newFilePath);            
                params.append('file', file, newFilePath);

                fetch('https://filedrop.gfycat.com', {method: 'POST', body: params, redirect: 'follow'})
                .then((res)=> {
                    gfyFiles.push( {
                        "gfyURL": gfyResult.gfyname,
                        "fileName": files[i]
                    })
                    //Guess this will be an insert statement once i have a DB
                    writeLog(i);
                });            
            });
        }   
  });

  function writeLog(i) {
    if (i == (numberOfFiles - 1)) {
        var dateTime = moment().valueOf();
        console.log(gfyFiles);
        fs.writeFile(path.join(__dirname,`../uploadedFiles/uploadedFiles-${dateTime}.json`), JSON.stringify(gfyFiles), function(err) {
        });
    }
  }
// var gfyFiles = new Array();

// fs.readdir(videoPath, function(err, files) { 
//     fetch('https://api.gfycat.com/v1/gfycats', {method:'POST'})
//         .then(res=> res.json())
//         .then(json => {
//             var filePath = path.join(uploadPath, json.gfyname)
//             fs.renameSync(path.join(videoPath, files[0]), filePath);
//             var params = new FormData();
//             params.append('key', json.gfyname);
//             var file = fs.readFileSync(filePath);
//             params.append('file', file, filePath);

//             fetch('https://filedrop.gfycat.com', {method: 'POST', body: params, redirect: 'follow'})
//                 .then((res)=> {
//                     console.log(res);
//                     gfyFiles.push( {
//                         "gfyURL": json.gfyname,
//                         "fileName": path.join(uploadPath, json.gfyname)
//                     })
//                     fs.writeFile(path.join(__dirname,"uploadedFiles.json"), JSON.stringify(gfyFiles), function(err) {
//                     });
//                 });            
//         });
    
//         for (let i = 0; i < files.length; i++) {

//         }
// })