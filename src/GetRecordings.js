const fs = require("fs"); 
const path = require('path');
const { exec } = require("child_process");
var ps = require('ps-node');
var mv = require('mv');
const inboxPath = path.join(__dirname, '../replayInbox');
const dolphinVideo = 'C:\\Users\\18135\\AppData\\Roaming\\Slippi Desktop App\\dolphin\\User\\Dump\\Frames\\framedump0.avi'
//slippi dolphin has to be edited to shutdown at the end of replays, which requires editing the code and then rebuilding
//also configure it to dump frames
const dolphinPath = "C:\\Users\\18135\\AppData\\Roaming\\Slippi Desktop App\\dolphin\\Dolphin.exe"
const isoPath = "D:\\Games\\Dolphin Isos\\Super Smash Bros. Melee (USA) (En,Ja) (Rev 2).nkit.iso"

if (!fs.existsSync(dolphinPath)) {
    throw new error("Dolphin not present");
}
  
var moments = fs.readFileSync(`${inboxPath}\\moments.json`);
moments = JSON.parse(moments);
var output = {
    "mode": "queue",
    "replay": "",
    "isRealTimeMode": false,
    "outputOverlayFiles": true,
    "queue": []
    };    
let max = moments.queue.length;
recordAndWait(0, max);

function recordAndWait(i, max) {
    if (i < max) {
        //we record one clip at a time, this way they are separated
        //need to treat like array to get the json formatting right                                
        console.log(moments.queue[i]);
        //adding framedata to title
        let fullFileTitle = moments.queue[i].path;
        let titleRegex = /Game.*?(?=\.)/;
        let fileTitle = fullFileTitle.match(titleRegex);
        
        let frameDiff = moments.queue[i].realEndFrame - moments.queue[i].realStartFrame;
        let clipAddition = `_sf-${moments.queue[i].realStartFrame}_rf-${frameDiff}`;

        let recordingTitle = fileTitle + clipAddition;        

        var replayCommand = `"${dolphinPath}" -i tempMoments.json -b -e "${isoPath}"`;
        console.log(replayCommand);
        // delete moments.queue[i].realStartFrame;
        // delete moments.queue[i].realEndFrame;
        output.queue.push(moments.queue[i]);    
        fs.writeFileSync("tempMoments.json", JSON.stringify(output));
        
        output.queue.pop();
        exec(replayCommand, (error) => {
            //dolphin will exit, and then the command will error
            //then this fires - so this is how we time it (since opening a million dolphins doesnt work so well)
            if (error) {
                console.log(`${i} error - but actually good!`);                    
                storeRecording(recordingTitle).then(() => {
                    //this dumb recursion was the only way I could think
                    recordAndWait(i+1, max);                       
                    return; 
                })
                 
            }
        })
    }
}

async function storeRecording(title) {
    let recordingPath = path.join(__dirname, '../storedVideos/'+title+'.avi')
    return mv(dolphinVideo, recordingPath, function(err) {
        if (err) {
            console.log(err);
        }
        return;
    })
}