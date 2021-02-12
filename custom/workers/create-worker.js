// import reportError from '../actions/reportError';

module.exports = function (workerUrl, listener) {
  if (typeof OffscreenCanvas !== "undefined") {
    console.log('USING OFFSCREEN CANVAS');
    var worker = new Worker(workerUrl)
    worker.onmessage = listener
    worker.onerror = error => {
      console.error('WORKER ERROR', error);
      // reportError({
      //   type: 'WORKER_ERROR',
      //   message: `${error.filename}:${error.lineno} ${error.message}`
      // })();
    }
    return {
      newCanvas: function(canvas) {
        var offscreen = canvas.transferControlToOffscreen()
        worker.postMessage({
          type: 'NEW_CANVAS',
          canvas: offscreen,
          width: canvas.clientWidth,
          height: canvas.clientHeight,
          dpi: window.devicePixelRatio || 1
        }, [offscreen])
      },
      post: function (a, b) {
        worker.postMessage(a, b)
      }
    }
  } else {
    console.log('POLYFILLING OFFSCREEN CANVAS');
    var randomId = 'Offscreen' + Math.round(Math.random() * 1000)
    var script = document.createElement('script')
    script.src = workerUrl
    script.async = true
    script.dataset.id = randomId

    var connection = { msgs: [], host: listener }
    var api = {
      newCanvas: canvas => {
        api.post({
          type: 'NEW_CANVAS',
          canvas: canvas,
          width: canvas.clientWidth,
          height: canvas.clientHeight,
          dpi: window.devicePixelRatio || 1
        })
      },
      post: data => {
        if (connection.worker) {
          connection.worker({ data: data })
        } else {
          connection.msgs.push(data)
        }
      }
    };

    document.head.appendChild(script)
    window[randomId] = connection
    return api
  }
}