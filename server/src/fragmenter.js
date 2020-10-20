const ffmpegInstaller = require("@ffmpeg-installer/ffmpeg");
const ffmpeg = require("fluent-ffmpeg");

const fs = require("fs");

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

module.exports = async function (source, output) {
  var outStream = fs.createWriteStream(output);

  ffmpeg(source)
    .native() // simulating a live stream native frames per second
    .addOption([
      "-g 300",
      "-codec:v libx264",
      "-codec:a copy",
      "-strict experimental",
      "-f mp4",
      "-x264opts keyint=2:min-keyint=2",
      "-movflags frag_keyframe+empty_moov",
    ])

    .on("end", function () {
      console.log("done");
    })

    .on("error", function (err) {
      console.error(err);
    })

    .on("progress", function (prog) {
      console.log(prog.timemark);
    })

    .pipe(outStream);
};

