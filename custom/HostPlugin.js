// import { workerFps } from './stats';
class HostPlugin {
  constructor(canvas) {
    this.canvas = canvas;
    this.onResize = this.onResize.bind(this);
    window.addEventListener('resize', this.onResize);
    console.log('HOST CONTRUCTOR');
  }

  sendMessage(message) {
    console.log('SEND MESSAGE', message);
  }

  onResize() {
    console.log('RESIZE', this.canvas.clientWidth, this.canvas.clientHeight);
  }

  destroy() {
    window.removeEventListener('resize', this.onResize);
    this.canvas = null;
    console.log('HOST DESTROY');
  }
}

export default {
  start: function(canvas){
    return new HostPlugin(canvas);
  }
}