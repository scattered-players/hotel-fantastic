import Seriously from './seriously.js';

export default  {
  none: async ( { canvas, localInputVideo } ) => {
    let seriously = new Seriously();
    let camera = seriously.source(localInputVideo);
    let target = seriously.target(canvas);
    target.source = camera;
    seriously.go()

    return () => {
      seriously.stop();
      seriously.destroy();
      camera = null;
      target = null;
      seriously = null;
    }
  }
};