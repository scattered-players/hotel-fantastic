import createWorker from '../workers/create-worker';

let workerFps = null;
const workerUrl = document.querySelector('[rel=preload][as=script][href^="/assets/nav-1928"]').href;
const worker = createWorker(workerUrl, e => {
  let { data } = e;
  switch(data.type) {
    case 'RENDER':
      workerFps && workerFps.update();
      break;
    default: console.log(`No handler for message of type ${data.type}`);
  }
});

export default class Nav1928Plugin {
  constructor(fpsStats) {
    workerFps = fpsStats;
    worker.post({type:'INIT_SCENE'});
    this.onResize = this.onResize.bind(this);
    window.addEventListener('resize', this.onResize);
  }

  newCanvas(canvas){
    this.canvas = canvas;
    worker.newCanvas(canvas);
  }

  removeCanvas(){
    this.canvas = null;
    worker.post({type:'REMOVE_CANVAS'});
  }

  sendMessage(message) {
    worker.post(message);
  }

  onResize() {
    if(this.canvas){
      worker.post({
        type: 'RESIZE',
        width: this.canvas.clientWidth,
        height: this.canvas.clientHeight,
      })
    }
  }

  destroy() {
    window.removeEventListener('resize', this.onResize);
    this.canvas = null;
    worker.post({type:'DESTROY'});
  }
}