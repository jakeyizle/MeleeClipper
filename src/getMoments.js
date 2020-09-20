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



//go through all replays in dir, and get a bunch of conversions from them
//generate one moments.json file (ironically will break it up later)
//one json file can map to a bunch of replay files
fs.readdir(inboxPath, function(err, files) {
    if (err) {
        return console.log('error: '+err);
    }
        
    for (let i = 0; i < files.length; i++) {        
        let file = path.join(inboxPath, files[i])        
        const game = new SlippiGame(file);        
        //this is where some super algorithim would tell us what to capture
        var conversions = game.getStats().conversions.filter(conversion=>conversion.moves.length > 5 || conversion.didKill || (conversion.endFrame - conversion.startFrame >= 400) 
        || (conversion.endPercent - conversion.startPercent >= 40));
        //more than 5 moves, or it killed, or framediff > x, or percent diff > x
        conversions.forEach(function(conversion) {
                let realStartFrame = Math.max(-123, conversion.startFrame);
                let realEndFrame = Math.min(game.getLatestFrame().frame, conversion.endFrame);            
            var queue = {
                "path" : file,
                "startFrame" : Math.max(-123, realStartFrame - 30),
                "endFrame" : Math.min(game.getLatestFrame().frame, realEndFrame + 30),
                "realStartFrame": realStartFrame,
                "realEndFrame": realEndFrame
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