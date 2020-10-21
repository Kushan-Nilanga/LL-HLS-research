const fs = require("fs");
const fragment = require('./fragmenter');

module.exports = function (stream, headers) {
    console.log('media file requested')
  /**
   * reads the fmp4 data as they are being encoded from the
   * fragmenter.js and push the data streams by http2push.
   *
   * push the buffers as fragments of the fmp4 file so that the
   * client player(HLS.js) can decode and play on the fly.
   */

    // start encoding the stream
    fragment('./public/video/shaker.mp4', './public/out/output.fmp4')
};
