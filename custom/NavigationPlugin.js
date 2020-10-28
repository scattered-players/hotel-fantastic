export default class NavigationPlugin {
  constructor(fpsStats) {
    console.log('CONSTRUCTED');
  }

  newCanvas(canvas){
    this.canvas = canvas;
    console.log('NEW CANVAS');
    this.onResize = this.onResize.bind(this);
    window.addEventListener('resize', this.onResize);
  }

  removeCanvas(){
    this.canvas = null;
    console.log('REMOVE CANVAS');
  }

  sendMessage(message) {
    console.log('SEND MESSAGE', message);
  }

  onResize() {
    if(this.canvas){
      console.log('CANVAS RESIZE',  this.canvas.clientWidth, this.canvas.clientHeight);
    }
  }

  destroy() {
    window.removeEventListener('resize', this.onResize);
    this.canvas = null;
    console.log('DESTROY');
  }
}