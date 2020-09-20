const admin = require('firebase-admin');
const serviceAccount = require('../settings/meleeclipper-8a8ca8cb8489.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();
const { default: SlippiGame } = require('@slippi/slippi-js');
const fs = require ('fs');
const path = require('path');
const replayPath = 'C:\\Users\\18135\\Documents\\Slippi\\used';
var storedConversions = [];
var fileLogs = [];
breakApartGameName().then((clips) => {
    let games= clips.map(clip => clip.game);
    let uniqueGames = games.filter(onlyUnique);
    files = fs.readdirSync(replayPath);
    uniqueGames.forEach((game) => {
        if (fs.existsSync(path.join(replayPath,game+'.slp'))) {
            file = fs.readFileSync(path.join(replayPath,game+'.slp'));
            
            const melee = new SlippiGame(file);
            var conversions = melee.getStats().conversions;

            gameClips = clips.filter(clip => clip.game == game);
            
            var conversionStarts = conversions.map(conversion => conversion.startFrame);
            var clipStarts = gameClips.map(gameClip => gameClip.startFrame);
            var fileLog = {
                "conversionStarts": conversionStarts,
                "clipStarts": clipStarts
            }
            console.log(fileLog);
            fileLogs.push(fileLog);

            gameClips.forEach((gameClip) => {
                var possibleConversions = conversions.filter(conversion => conversion.startFrame == (gameClip.startFrame));
                storedConversions.push(possibleConversions);            
            })

        }
        else {
            console.log(`Error, replay does not exist - ${game}`)
        }

        //find and read slippi game data
        //get all of the clips that are in this game
        //for each clip
            //search for the corresponding conversion
            //the frame values in the filename are modified so they are not the exact same as the actual conversion
            //either -30 or -45 (means rf is diff by -60 or -90) 

    })
    fs.writeFileSync('frameLog.json', JSON.stringify(fileLogs));
    fs.writeFileSync('trainingData.json', JSON.stringify(storedConversions));
})

async function getFile() {

}

function onlyUnique(value, index, self) { 
    return self.indexOf(value) === index;
}

async function breakApartGameName() {
    let clips = await getAverageVotes();
    clips.forEach(clip => {
        let gameRegex = /Game_.*?(?=\_)/;
        let sfRegex = /(?<=sf-).*?(?=\_)/;
        let rfRegEx = /(?<=rf-).*?(?=\.)/;

        clip.game = clip.fileName.match(gameRegex)[0];
        clip.startFrame = clip.fileName.match(sfRegex)[0];
        clip.runFrames = clip.fileName.match(rfRegEx)[0];                    
    });
    return clips;
}


async function getAverageVotes() {
    return getClips().then((clips) => {
        clips = clips.filter(clip => clip.votes);
        clips.forEach((clip) => {
            clip.averageVote = averageArray(clip.votes.map(vote=>vote.vote));
        })
        return clips;
    })
}

function averageArray(array) {
    return array.reduce((a,b) => a+b, 0)/array.length;
}

async function getClips() {
    const snapshot = await db.collection('clips').get();
    var items = [];
    snapshot.forEach(doc => {
        items.push(doc.data());
    });
    console.log("getClips");
    return items;
}

