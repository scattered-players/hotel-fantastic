class NavigationPlugin1 {
  constructor(fpsStats) {
    console.log('CONSTRUCTED');
    this.state = {
      placeName: null
    };
  }

  newCanvas(canvas){
    this.canvas = canvas;
    this.ctx = this.canvas.getContext('2d');
    console.log('NEW CANVAS');
    this.onResize = this.onResize.bind(this);
    window.addEventListener('resize', this.onResize);
    this.state = {
      placeName: null
    };
    this.draw();
  }

  draw(){
    if(this.ctx) {
      this.ctx.fillStyle = 'red';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.fillStyle = 'black';
      this.ctx.fillText(this.state.placeName, 10, 50);
    }
  }

  removeCanvas(){
    this.canvas = null;
    this.ctx = null;
    console.log('REMOVE CANVAS');
  }

  sendMessage(message) {
    console.log('SEND MESSAGE', message);
    if(message.type === 'UPDATE') {
      this.state.placeName = message.state.selectedPlace ? message.state.selectedPlace.placeName : null;
    }
    this.draw();
  }

  onResize() {
    if(this.canvas){
      console.log('CANVAS RESIZE',  this.canvas.clientWidth, this.canvas.clientHeight);
      this.draw();
    }
  }

  destroy() {
    window.removeEventListener('resize', this.onResize);
    this.canvas = null;
    this.ctx = null;
    console.log('DESTROY');
  }
}

class NavigationPlugin2 {
  constructor(fpsStats) {
    console.log('CONSTRUCTED');
    this.state = {
      placeName: null
    };
  }

  newCanvas(canvas){
    this.canvas = canvas;
    this.ctx = this.canvas.getContext('2d');
    console.log('NEW CANVAS');
    this.onResize = this.onResize.bind(this);
    window.addEventListener('resize', this.onResize);
    this.state = {
      placeName: null
    };
    this.draw();
  }

  draw(){
    if(this.ctx) {
      this.ctx.fillStyle = 'blue';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.fillStyle = 'black';
      this.ctx.fillText(this.state.placeName, 10, 50);
    }
  }

  removeCanvas(){
    this.canvas = null;
    this.ctx = null;
    console.log('REMOVE CANVAS');
  }

  sendMessage(message) {
    console.log('SEND MESSAGE', message);
    if(message.type === 'UPDATE') {
      this.state.placeName = message.state.selectedPlace ? message.state.selectedPlace.placeName : null;
    }
    this.draw();
  }

  onResize() {
    if(this.canvas){
      console.log('CANVAS RESIZE',  this.canvas.clientWidth, this.canvas.clientHeight);
      this.draw();
    }
  }

  destroy() {
    window.removeEventListener('resize', this.onResize);
    this.canvas = null;
    this.ctx = null;
    console.log('DESTROY');
  }
}

export default {
  f1: NavigationPlugin1,
  f2: NavigationPlugin2
};
