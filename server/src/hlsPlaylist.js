const fs = require('fs');

module.exports = function(source, filepath){
    fs.open(filepath, function(err, file){
        if(err){ fs.writeFile(filepath, "#EXTM3U", function(err){ if(err) console.log(err)}); }
        if(file){
            
        }
    })
}