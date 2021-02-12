/**
 * @author mrdoob / http://mrdoob.com/
 */

import {
  RGBAFormat,
  RGBFormat,
  ImageLoader,
  ImageBitmapLoader,
  Texture,
  Loader
} from 'three';

const OurImageLoader = typeof window !== 'undefined' ? ImageLoader : ImageBitmapLoader;

function TextureLoader( manager, options ) {

	Loader.call( this, manager );

	this.options = Object.assign({
		flipY: true
	}, options);

}

TextureLoader.prototype = Object.assign( Object.create( Loader.prototype ), {

	constructor: TextureLoader,

	load: function ( url, onLoad, onProgress, onError ) {

		var texture = new Texture();

		var loader = new OurImageLoader( this.manager );
		loader.setCrossOrigin( this.crossOrigin );
		loader.setPath( this.path );

		if(typeof window === 'undefined' && this.options.flipY) {
			loader.setOptions({ imageOrientation: 'flipY' })
		}

		loader.load( url, function ( image ) {

			texture.image = image;

			// JPEGs can't have an alpha channel, so memory can be saved by storing them as RGB.
			var isJPEG = url.search( /\.jpe?g($|\?)/i ) > 0 || url.search( /^data\:image\/jpeg/ ) === 0;

			texture.format = isJPEG ? RGBFormat : RGBAFormat;
			texture.needsUpdate = true;

			if ( onLoad !== undefined ) {

				onLoad( texture );

			}

		}, onProgress, onError );

		return texture;

	}

} );


export default TextureLoader;