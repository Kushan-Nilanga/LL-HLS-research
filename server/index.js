/**
 * Http2 server to handle encoding and file serving
 *
 *
 * HTTP2 always sends data in chunked mode so there is no need to define it explicitly
 */
const ffmpegIns = require("@ffmpeg-installer/ffmpeg");
const ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath(ffmpegIns.path);
const http2 = require("http2");
const fs = require("fs");

const PORT = process.env.PORT || 3000;

// server authentication
const server = http2.createSecureServer({
  key: fs.readFileSync("localhost-private.pem"),
  cert: fs.readFileSync("localhost-cert.pem"),
});

server.on("error", (err) => console.log(err));
server.on("stream", function (stream, headers) {
  // router
  switch (headers[":path"]) {
    case "/":
      serveStaticPage(stream, headers);
      break;

    default:
      const parsedURL = headers[":path"].split(".");
      if (parsedURL[parsedURL.length - 1] === "mp4") {
        outstandingStreams.push({ headers: headers, stream: stream });
      }
      break;
  }
});

server.listen(PORT, () => console.log(`listening on ${PORT}`));

/**
 * Serves the static file to lead the hls player on the browser
 *
 * TODO:
 * * HLS.js should be modified to support fmp4 sent over the http push connection
 *
 */
async function serveStaticPage(stream, headers) {
  data = fs.readFileSync("./public/static/index.html");
  stream.respond({ ":status": 200 });
  stream.end(data);
  transmuxSource("public/video/shaker.mp4", "public/out/output.mp4");
}

var moovBlock;
var streamEnded = false;

function transmuxSource(source, output) {
  var i = 0;
  var outStream = fs.createWriteStream(output);
  ffmpeg(source)
    .native() // simulating a live stream native frames per second
    .addOption([
      "-g 15",
      "-codec:v libx264",
      "-codec:a copy",
      "-strict experimental",
      "-f mp4",
      //"-x264opts keyint=5:min-keyint=2",
      "-movflags frag_every_frame+empty_moov+default_base_moof",
    ])
    .on("error", () => (streamEnded = true))
    .on("end", () => (streamEnded = true))
    .stream()
    .on("data", function (data) {
      if (i < 2) {
        moovBlock += data;
        i++;
      } else {
        serveLiveData(data);
      }
    })
    .pipe(outStream);
}

var outstandingStreams = [];

async function serveLiveData(data) {
  /**
   * serve the data to outstanding streams
   */
  outstandingStreams.forEach((connection) => {
    connection.stream.pushStream(
      { ":path": connection.headers[":path"] },
      function (err, pushStream, headers) {
        if (err) console.log("Live data serving error " + err);
        pushStream.respond({ ":status": 200 });
        //pushStream.write(data);
        pushStream.end(data);
        pushStream.push();
      }
    );
  });
}

// Creating certification
// openssl req -x509 -newkey rsa:2048 -nodes -sha256 -subj '/CN=localhost' -keyout localhost-private.pem -out localhost-cert.pem
