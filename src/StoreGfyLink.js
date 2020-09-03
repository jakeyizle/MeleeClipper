const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const serviceAccount = require('../settings/meleeclipper-8a8ca8cb8489.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const uploadPath = path.join(__dirname, '../uploadedFiles');
var files = fs.readdirSync(uploadPath);
for (let i = 0; i < files.length; i++) {    
    // console.log(files[i]);
    var filePath = path.join(uploadPath, files[i]);
    var file = fs.readFileSync(filePath);
    var json = JSON.parse(file);
    for (let j = 0; j < json.length; j++) {
        var data = {
            clipName: json[j].gfyURL,
            fileName: json[j].fileName
        };
        insertInto('clips', data)        
    }
}

async function insertInto(collection, data) {
    var res = await db.collection(collection).add(data);
    console.log(res.id);
}