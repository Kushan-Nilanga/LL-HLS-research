const http2 = require("http2");
const fs = require("fs");

const client = http2.connect("https://localhost:5000", {
  ca: fs.readFileSync("localhost-cert.pem"),
});
client.on("error", (err) => console.log(err));

const server = http2.createSecureServer({
    "key": fs.readFileSync('localhost-private.pem'),
    "cert": fs.readFileSync('localhost-cert.pem')
})

server.on('error', (err)=> console.log(err));

server.on('stream', function(stream, headers){
    stream.respond({
        ":status":200
    });
    stream.end("Hello world from client");
});

server.listen(3000, async function(){
    //await frag('./public/video/shaker.mp4', "./public/out/output.fmp4");
    //createPlaylist("asd", "public/out/path.txt");
    console.log("client listening on port 3000");
});

