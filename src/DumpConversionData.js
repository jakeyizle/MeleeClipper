const { default: SlippiGame } = require('@slippi/slippi-js');
const fs = require ('fs');
const path = require('path');
const inboxPath = path.join(__dirname, '../replayInbox');
const ObjectsToCsv = require('objects-to-csv');

var myConversions = [];

fs.readdir(inboxPath, function(err, files) {
    if (err) {
        return console.log('error: '+err);
    }
        
    for (let i = 0; i < files.length; i++) {        
        let file = path.join(inboxPath, files[i])        
        const game = new SlippiGame(file);
        game.getStats().conversions.forEach(conversion => {
            let addConversion = false;
            if (conversion.startFrame && conversion.endFrame && conversion.startPercent && conversion.endPercent) {
                addConversion = true;
            }

            let newConversion = conversion;
            newConversion.moveIds = newConversion.moves.map(move => move.moveId);
            newConversion.conversionDiversity = countUnique(newConversion.moveIds) * newConversion.moveIds.length;                         
            newConversion.frameDiff = newConversion.endFrame - newConversion.startFrame;
            newConversion.percentDiff = newConversion.endPercent - newConversion.startPercent;
            newConversion.didKill = (newConversion.didKill) ? 1 : 0;
            delete newConversion.moveIds;
            delete newConversion.playerIndex;
            delete newConversion.opponentIndex;
            delete newConversion.startFrame;
            delete newConversion.endFrame;
            delete newConversion.startPercent;
            delete newConversion.endPercent;
            delete newConversion.currentPercent;
            delete newConversion.moves;

            if (addConversion) {myConversions.push(newConversion)};

        });
    }

    (async () => {
        const csv = new ObjectsToCsv(myConversions);
       
        // Save to file:
        await csv.toDisk('./test.csv');
       
        // Return the CSV file as string:
        console.log(await csv.toString());
      })();    
});


   
function countUnique(iterable) {
    return new Set(iterable).size;
  }
