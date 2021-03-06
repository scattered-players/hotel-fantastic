import * as THREE from 'three';
import TextureLoader from '../TextureLoader';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';

import vertexShader from '../../glsl/vertex.glsl';
import burnThroughShader from '../../glsl/burn-through.glsl';

THREE.Cache.enabled = true;
export default class NavigationScreen {
  constructor(sendToMainThread) {
    this.state = null;

    this.sendToMainThread = sendToMainThread.bind(this);
    this.updateScene = this.updateScene.bind(this);
    this.render = this.render.bind(this);

    this.initScene();
  }
  
  initScene() {
    this.disposables = [];

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xff00ff);
    this.disposables.push(this.scene);

    let startTime = Date.now();
    this.loadingManager = new THREE.LoadingManager();
    // this.loadingManager.addHandler( /\.tga$/i, new TGALoader(this.loadingManager) );
    this.loadingManager.onLoad = () => {
      setTimeout(() => {
        console.log('1964LOADED!', (Date.now()-startTime)/1000, this.hasReceivedFirstUpdate );
        this.hasReceivedFirstLoad = true;
        if(this.hasReceivedFirstUpdate) {
          this.updateScene(JSON.parse(JSON.stringify(this.state)));
        }
      }, 1000);
    };

    this.hotel1928Texture = new TextureLoader(this.loadingManager).load('/media/thf-1928.png');
    this.disposables.push(this.hotel1928Texture);
    this.hotel1964Texture = new TextureLoader(this.loadingManager).load('/media/thf-1964.png');
    this.disposables.push(this.hotel1964Texture);
    this.geometry = new THREE.PlaneGeometry( 20, 20, 32, 32 );
    this.disposables.push(this.geometry);
    this.timeUniform = { value: 0 };
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        time: this.timeUniform,
        tex1: { type:'t', value: this.hotel1928Texture },
        tex2: { type:'t', value: this.hotel1964Texture },
      },
      vertexShader: vertexShader,
      fragmentShader: burnThroughShader,
      side: THREE.DoubleSide
    });
    this.disposables.push(this.material);
    this.plane = new THREE.Mesh( this.geometry, this.material );
    this.scene.add( this.plane );

    this.camera = new THREE.PerspectiveCamera( 75, 4/3, 0.001, 1000 );
    this.camera.position.z = 10;

    this.ambientLight = new THREE.AmbientLight(0xffffff, 1);
    this.scene.add(this.ambientLight);
    
    this.places = [];
    
    this.hasReceivedFirstUpdate = false;
    this.hasReceivedFirstLoad = false;
    this.frameTimes = [];
  }

  initRenderer(canvas, width, height, dpi) {
    this.destroyRenderer();

    console.log('INIT RENDERER', canvas, width, height, dpi);
    this.canvas = canvas;
    this.width = width;
    this.height = height;
    this.dpi = dpi;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      powerPreference: 'high-performance'
    });
    this.renderer.setPixelRatio(this.dpi);
    this.renderer.setSize(this.width, this.height, false);
    this.renderer.toneMapping = THREE.ReinhardToneMapping;

    this.composer = new EffectComposer( this.renderer );

    this.renderScene = new RenderPass( this.scene, this.camera );
    this.composer.addPass( this.renderScene );
    
    this.clock = new THREE.Clock(true);
    this.rAF = requestAnimationFrame(this.render);
  }

  destroyRenderer() {
    cancelAnimationFrame(this.rAF);
    if(this.renderer){
      try {
        this.renderer.dispose();
      } catch(e){
        console.error('DISPOSAL ERROR (that we caught, so it shouldnt affect anything else)');
        console.error(e);
      }
    }
    this.canvas = null;
    this.width = null;
    this.height = null;
    this.dpi = null;
    this.renderer = null;
    this.renderScene = null;
    this.composer = null;
  }

  updateScene(newState) {
    let oldState = this.state;
    this.state = newState;
    console.log('NEW STATE', this);
    this.hasReceivedFirstUpdate = true;

    if(!this.hasReceivedFirstLoad) {
      return;
    }
    
    newState.places.map(newPlace => {
      let needsAdded = !this.places.some(oldPlace => newPlace._id === oldPlace._id);
      if(needsAdded) {
        console.log('ADDING PLACE', newPlace.assetKey);

        this.places.push({
          _id: newPlace._id,
          assetKey: newPlace.assetKey,
          dispose: () => {
          }
        });
      }
    });
    
    oldState && oldState.places.map(oldPlace => {
      let needsRemoved = !newState.places.some(newPlace => newPlace._id === oldPlace._id);
      if(needsRemoved) {
        console.log('REMOVING PLACE');
        let placeToRemove = this.places.filter(place => place._id === oldPlace._id)[0];
        this.places = this.places.filter(place => place._id !== oldPlace._id);
        placeToRemove.dispose();
      }
    });
    
  }

  resizeScene(width, height) {
    this.width = width;
    this.height = height;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer && this.renderer.setSize(width, height, false);
    this.composer && this.composer.setSize(width, height);
  }

  render() {
    this.sendToMainThread({type:'RENDER'});
    this.rAF = requestAnimationFrame(this.render);
    let timeDelta = this.clock.getDelta();
    let timeElapsed = this.clock.getElapsedTime();
    // console.log('RENDER?', !!this.state, !!this.hasReceivedFirstLoad, !!this.renderer)
    this.timeUniform.value = timeElapsed;

    if(!this.state || !this.hasReceivedFirstLoad || !this.renderer) {
      return;
    }
    this.frameTimes.push(timeDelta);

    let {
      state: {
        places: statePlaces,
        myParty,
        selectedPlace,
        isInTransit
      },
      places,
      scene,
      camera,
      composer,
      renderer
    } = this;


    // places.map(place => {
    //   if(selectedPlace && selectedPlace._id === place._id){
    //     place.shardModel.children.map((child, i) => {
    //       let shardTarget = place.shardTargets[i];
    //       child.position.lerp(shardTarget.homePosition, 2*timeDelta)
    //       child.quaternion.rotateTowards(shardTarget.homeRotation, 2*timeDelta);
    //     });
    //   } else {
    //     place.shardModel.children.map((child, i) => {
    //       let shardTarget = place.shardTargets[i];
    //       child.position.lerp(shardTarget.targetPosition, timeDelta)
    //       child.quaternion.rotateTowards(shardTarget.targetRotation, timeDelta);
    //     });
    //   }
    // });

    // this.plane.rotateY(timeDelta);
    camera.lookAt(0,0,0);

    // renderer.render( scene, camera );
    composer.render( scene, camera );
    // console.log('RENDER!', this.canvas)
  }

  destroy() {
    cancelAnimationFrame(this.rAF);
    this.state = null;
    this.canvas = null;
    this.places.map(placeToRemove => {
      this.scene.remove(placeToRemove.group);
      placeToRemove.dispose();
    });
    this.disposables.map(asset => {
      try {
        asset.dispose();
      } catch (e){
        console.error('DISPOSAL ERROR (that we caught, so it shouldnt affect anything else)', asset);
        console.error(e);
      }
    });

    if(this.frameTimes.length){
      let avgFrameTime = this.frameTimes.reduce((sum, frameTime) => sum+frameTime, 0) / this.frameTimes.length;
      let fps = 1/avgFrameTime;
      console.log('AVERAGE FPS', fps, this.frameTimes);
    }
  }
}