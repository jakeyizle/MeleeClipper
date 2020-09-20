const admin = require('firebase-admin');
const serviceAccount = require('../settings/meleeclipper-8a8ca8cb8489.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();
//take recording -> upload to gfycat
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
        var files = fs.readdirSync(videoPath);
        uploadGfy(0, files.length, tokenResult.access_token); 
  })
  .catch((err) => console.log(err));


//this works but not the way its designed to
//right now the index never increases - we're always looking at the first file
  async function uploadGfy(i, max, token) {
    var authHeaders = new Headers();
    authHeaders.append("Authorization", "Bearer "+token);
    
    var gfycatsOptions = {
      method: 'POST',
      headers: authHeaders,
      redirect: 'follow'
    }
    var files = fs.readdirSync(videoPath);
    numberOfFiles = files.length;
    if (files[i]) {
        return fetch("https://api.gfycat.com/v1/gfycats", gfycatsOptions)
        .then(res=>res.json())
        .then(gfyResult => {
            console.log(gfyResult);
            var newFilePath = path.join(uploadPath, gfyResult.gfyname);
            //but we move the file, so the first file changes
            //should probably rename it at the end, in case of errors
            fs.renameSync(path.join(videoPath, files[i]), newFilePath);

            var params = new FormData();
            params.append('key', gfyResult.gfyname);

            var file = fs.readFileSync(newFilePath);            
            params.append('file', file, newFilePath);

            fetch('https://filedrop.gfycat.com', {method: 'POST', body: params, redirect: 'follow'})
            .then((res)=> {

                let data = {
                    "clipName": gfyResult.gfyname,
                    "fileName": files[i],
                    "votes": ""
                }
                gfyFiles.push(data);
                db.collection('clips').add(data).then(() => {
                    uploadGfy(i++, max, token);
                    return;
                })
            })
            .catch(err => console.log(err));            
        }).catch(err => console.log(err));
    } else {
        var dateTime = moment().valueOf();
        fs.writeFile(path.join(__dirname,`../uploadedFiles/uploadedFiles-${dateTime}.json`), JSON.stringify(gfyFiles), function(err) {
        });
    }
  }