const { default: SlippiGame } = require('@slippi/slippi-js');
const fs = require ('fs');
const path = require('path');
const inboxPath = path.join(__dirname, '../replayInbox');

var output = {
    "mode": "queue",
    "replay": "",
    "isRealTimeMode": false,
    "outputOverlayFiles": true,
    "queue": []
  };

//   output.queue[momentCount] = {
//     "path" : files[i],
//     "startFrame" : Math.max(-123, n-captureTimePreInput),
//     "endFrame" : Math.min(lastframe, n+captureTimePostInput)
//   }


fs.readdir(inboxPath, function(err, files) {
    if (err) {
        return console.log('error: '+err);
    }
        
    for (let i = 0; i < files.length; i++) {        
        let file = path.join(inboxPath, files[i])
        console.log(file);
        const game = new SlippiGame(file);
        //const settings = game.getSettings();
        var conversions = game.getStats().conversions.filter(conversion=>conversion.moves.length > 5 && conversion.didKill);
        conversions.forEach(function(conversion) {            
            var queue = {
                "path" : file,
                "startFrame" : Math.max(-123, conversion.startFrame-30),
                "endFrame" : Math.min(game.getLatestFrame().frame, conversion.endFrame+30)
            }
            output.queue.push(queue);
        })
    }

    fs.writeFile(path.join(inboxPath,"moments.json"), JSON.stringify(output), function(err) {
        if(err) {
            return console.log(err);
        }    
        console.log("Replay clip queue file was saved!");  
    });

})