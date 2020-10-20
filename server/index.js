/**
 * Http2 server to handle encoding and file serving
 * 
 * 
 * HTTP2 always sends data in chunked mode so there is no need to define it explicitly
 */
const http2 = require('http2');
const fs = require('fs')
const frag = require('./src/fragmenter');
const createPlaylist = require('./src/hlsPlaylist')

// Creating certification 
// openssl req -x509 -newkey rsa:2048 -nodes -sha256 -subj '/CN=localhost' -keyout localhost-private.pem -out localhost-cert.pem
const server = http2.createSecureServer({
    "key": fs.readFileSync('localhost-private.pem'),
    "cert": fs.readFileSync('localhost-cert.pem')
});

server.on('stream', function(stream, headers){
    stream.respond({
        ":status":200
    });
    stream.end("Hello world");
});

server.listen(3000, async function(){
    //await frag('./public/video/shaker.mp4', "./public/out/output.fmp4");
    createPlaylist("asd", "public/out/path.txt");
    console.log("listening on port 3000");
});
