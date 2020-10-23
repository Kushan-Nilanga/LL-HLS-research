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
                serveMedia(stream, headers);
            }
            break;
    }
});

server.listen(PORT, () => {
    console.log(`listening on ${PORT}`);
    transmuxSource("public/video/shaker.mp4", "public/out/output.mp4");
});

/**
 * Serves the static file to lead the hls player on the browser
 *
 * TODO:
 * * HLS.js should be modified to support fmp4 sent over the http push connection
 */
async function serveStaticPage(stream, headers) {
    data = fs.readFileSync("./public/static/index.html");
    stream.respond({ ":status": 200 });
    stream.end(data);
}

var moovBlock;
var mdatBlock = [];

/**
 * Accepts a video to be played live and output source and provides a live output
 *
 * @param {String} source: live source for transmuxing
 * @param {String} output: output file name
 */
function transmuxSource(source, output) {
    var i = 0;
    var outStream = fs.createWriteStream(output);
    var placeholder;
    ffmpeg(source)
        .native() // simulating a live stream native frames per second
        .addOption([
            "-c:v libx264",
            "-c:a aac",
            "-b:a 44k",
            "-vf format=yuv420p",
            "-profile:v baseline",
            "-level 3.1",
            "-b:v 900k",
            "-f mp4",
            "-movflags frag_every_frame+empty_moov+default_base_moof",
        ])
        .stream()
        .on("data", function (data) {
            placeholder += data;
            if (i < 2) {
                moovBlock += data;
                i++;
            } else {
                mdatBlock.push(data);
                serveLiveData();
            }
        })
        .pipe(outStream);
}

var outstandingStreams = [];

/**
 *
 * @param {Buffer} data: Live data to be pushed to client players
 */
async function serveLiveData() {
    /**
     * serve the data to outstanding streams
     */
    outstandingStreams.forEach((connection) => {
        connection.stream.pushStream({ ":path": `https://localhost:3000/public/out/output.${mdatBlock[mdatBlock - 1]}.mp4` }, function (err, pushStream, headers) {
            if (err) console.log("Live data serving error " + err);
            pushStream.respond({ ":status": 200 });
        });
        pushStream.end(data);
    });
}

/**
 * serves media to requested by the clients
 */
function serveMedia(stream, headers) {
    var parsedUrl = headers[":path"].split(".");
    if (parsedUrl[parsedUrl.length - 2] === "moov") {
        stream.respond({ ":status": 200 });
        return stream.end(moovBlock);
    }
    //ffmpeg.ffprobe("public/out/output.mp4", (err, md) => console.log(md));
    stream.respond({ ":status": 200 });
    return stream.end(mdatBlock[parsedUrl[parsedUrl.length - 2]]);
}
