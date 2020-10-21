# problem

a way to reduce the camera to display time to sub-second latencies
 __________       __________       ____________       ________         ________
| AV Input | ==> | Encoding | ==> | Segmenting |===> | Server | <==== | Client |
|__________|     |__________|     |____________|     |________| ====> |________|

bottleneck tasks
- encoding video
- buffer buildup at client to stop freezes new segment is only sent once requested

possible solutions and caveats
- reducing segment sizes to sub-second intervals
  1. Advantages
     - less time to encode
     - less time to transport
     - smaller temporal buffer
     - faster rate adaption
  2. Disadvantages
     - Many http requests (larger network and server overhead)
     - Many extra round-trip times adding overhead (when RTT is higher than segment duration this becomes inefficient)

Solutions by HTTP Adaptive Streaming providers

### CMAF (Common media application format)
Self explanatory this is a common media format to contain the different codecs and bitrates
![CMAF format](https://www.wowza.com/wp-content/uploads/CMAF-HLS-DASH-graph-1-700x277.png)

### CTE (Chunked transfer encoding) HTTP/1.1
Sending segments as chunks of data.

- LL-HLS (Apple)
- LHLS (OpenSource group)
- DASH-LL (MPEG)

## LHLS
Uses chunk transfer
- Gets a request and sends multiple chuncks within the segment
- Client only request for playlist update after a segment

## LL-HLS
Apples implementation of low latency
### First versions
- Client was sending requests for playlist update along with the part request
- that is one request for each part which dramatically increases the load on server
- built up on server push (HTTP2)

### Newer versions 
[Apple Documentation](https://developer.apple.com/documentation/http_live_streaming/enabling_low-latency_hls) | 
[WWDC20](https://developer.apple.com/videos/play/wwdc2020/10228/)
- Client does not have to request and do rount trips for the content. Parts can be announced before the preparation in the manifest so the player can anticipate the newer parts without having to request them. 

### Potential issues.
- FFMPEG doesn't support sub-second video slicing for LL-HLS
- Developing media server with HTTP/2 functionality
- Most of the existing players doesn't support incomplete segment files.
[HLS.JS developement milestones](https://github.com/video-dev/hls.js/projects/7)

[Discussion on LL-HLS - Wowza Webinar](https://www.youtube.com/watch?v=AvoBou3VQj0) |
[LL-HLS Test tools](https://github.com/thmatuza/alhls-tool-docker) |
[LHLS Proof of concept](https://github.com/jordicenzano/lhls-simple-live-platform) |
[MUX blog](https://mux.com/blog/the-low-latency-live-streaming-landscape-in-2019/) |
[LL-DASH](https://www.theoplayer.com/blog/low-latency-dash) |
[AWS LL-HLS](https://aws.amazon.com/blogs/media/alhls-apple-low-latency-http-live-streaming-explained/)

Apple LL-HLS is not yest supported by majority of the clients and CDNs 
(ios 13 and up)



[LHLS example](https://github.com/jordicenzano/lhls-simple-live-platform) |
[CMAF chunk server](https://github.com/tomlyko/cmaf-server)

