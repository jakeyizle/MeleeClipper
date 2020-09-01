const fs = require("fs"); 
const path = require('path');
const { exec } = require("child_process");
var ps = require('ps-node');

const inboxPath = path.join(__dirname, '../replayInbox');

//slippi dolphin has to be edited to shutdown at the end of replays, which requires editing the code and then rebuilding
//also configure it to dump frames
const dolphinPath = "C:\\Users\\18135\\AppData\\Roaming\\Slippi Desktop App\\dolphin\\Dolphin.exe"

const isoPath = "D:\\Games\\Dolphin Isos\\Super Smash Bros. Melee (USA) (En,Ja) (Rev 2).nkit.iso"

// ps.lookup({
//     command: 'Dolphin.exe'
//     }, function(err, resultList ) {
//     if (err) {
//         throw new Error( err );
//     }
//     console.log(resultList);
//     resultList.forEach(function( process ){
//         if( process ){            
//             console.log( 'PID: %s, COMMAND: %s, ARGUMENTS: %s', process.pid, process.command, process.arguments );
//         }
//     });
// });


if (!fs.existsSync(dolphinPath)) {
    throw new error("Dolphin not present");
}
myFunction();

// var moments = fs.readFileSync(`${inboxPath}\\moments.json`);
// moments = JSON.parse(moments);
// for (let i = 0; i < moments.queue.length; i++) {
//     var output = {
//         "mode": "queue",
//         "replay": "",
//         "isRealTimeMode": false,
//         "outputOverlayFiles": true,
//         "queue": []
//       };
//     //queue has to have array squares in json, even though only 1 item
//     output.queue.push(moments.queue[i]);    
//     fs.writeFileSync("tempMoments.json", JSON.stringify(output));
//     output.queue.pop();
    
//     var replayCommand = `"${dolphinPath}" -i tempMoments.json -b -e "${isoPath}"`;
//     exec(replayCommand, (error) => {
//         //it always errors for some reason
//         if (error) {
//             console.log(`error: ${error.message}`);
//             //do next thing            
//         }
//     })    
// }


function myFunction() {    
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
    doItAgain(0, max);

    function doItAgain(i, max) {
        var replayCommand = `"${dolphinPath}" -i tempMoments.json -b -e "${isoPath}"`;
        exec(replayCommand, (error) => {
            //it always errors for some reason
            if (error) {
                console.log(`${i} error - but actually good!`);
                if (i < max) {
                    doItAgain(i+1, max);   
                }
                return;                  
            }
        })
    }
}