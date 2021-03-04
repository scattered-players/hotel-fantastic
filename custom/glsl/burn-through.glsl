uniform float time;
uniform sampler2D tex1;
uniform sampler2D tex2;

varying vec2 vUv;


//
// GLSL textureless classic 2D noise "cnoise",
// with an RSL-style periodic variant "pnoise".
// Author:  Stefan Gustavson (stefan.gustavson@liu.se)
// Version: 2011-08-22
//
// Many thanks to Ian McEwan of Ashima Arts for the
// ideas for permutation and gradient selection.
//
// Copyright (c) 2011 Stefan Gustavson. All rights reserved.
// Distributed under the MIT license. See LICENSE file.
// https://github.com/stegu/webgl-noise
//

vec4 mod289(vec4 x)
{
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x)
{
  return mod289(((x*34.0)+1.0)*x);
}

vec4 taylorInvSqrt(vec4 r)
{
  return 1.79284291400159 - 0.85373472095314 * r;
}

vec2 fade(vec2 t) {
  return t*t*t*(t*(t*6.0-15.0)+10.0);
}

// Classic Perlin noise
float cnoise(vec2 P)
{
  vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
  vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
  Pi = mod289(Pi); // To avoid truncation effects in permutation
  vec4 ix = Pi.xzxz;
  vec4 iy = Pi.yyww;
  vec4 fx = Pf.xzxz;
  vec4 fy = Pf.yyww;

  vec4 i = permute(permute(ix) + iy);

  vec4 gx = fract(i * (1.0 / 41.0)) * 2.0 - 1.0 ;
  vec4 gy = abs(gx) - 0.5 ;
  vec4 tx = floor(gx + 0.5);
  gx = gx - tx;

  vec2 g00 = vec2(gx.x,gy.x);
  vec2 g10 = vec2(gx.y,gy.y);
  vec2 g01 = vec2(gx.z,gy.z);
  vec2 g11 = vec2(gx.w,gy.w);

  vec4 norm = taylorInvSqrt(vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11)));
  g00 *= norm.x;  
  g01 *= norm.y;  
  g10 *= norm.z;  
  g11 *= norm.w;  

  float n00 = dot(g00, vec2(fx.x, fy.x));
  float n10 = dot(g10, vec2(fx.y, fy.y));
  float n01 = dot(g01, vec2(fx.z, fy.z));
  float n11 = dot(g11, vec2(fx.w, fy.w));

  vec2 fade_xy = fade(Pf.xy);
  vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
  float n_xy = mix(n_x.x, n_x.y, fade_xy.y);
  return 2.3 * n_xy;
}

// Classic Perlin noise, periodic variant
float pnoise(vec2 P, vec2 rep)
{
  vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
  vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
  Pi = mod(Pi, rep.xyxy); // To create noise with explicit period
  Pi = mod289(Pi);        // To avoid truncation effects in permutation
  vec4 ix = Pi.xzxz;
  vec4 iy = Pi.yyww;
  vec4 fx = Pf.xzxz;
  vec4 fy = Pf.yyww;

  vec4 i = permute(permute(ix) + iy);

  vec4 gx = fract(i * (1.0 / 41.0)) * 2.0 - 1.0 ;
  vec4 gy = abs(gx) - 0.5 ;
  vec4 tx = floor(gx + 0.5);
  gx = gx - tx;

  vec2 g00 = vec2(gx.x,gy.x);
  vec2 g10 = vec2(gx.y,gy.y);
  vec2 g01 = vec2(gx.z,gy.z);
  vec2 g11 = vec2(gx.w,gy.w);

  vec4 norm = taylorInvSqrt(vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11)));
  g00 *= norm.x;  
  g01 *= norm.y;  
  g10 *= norm.z;  
  g11 *= norm.w;  

  float n00 = dot(g00, vec2(fx.x, fy.x));
  float n10 = dot(g10, vec2(fx.y, fy.y));
  float n01 = dot(g01, vec2(fx.z, fy.z));
  float n11 = dot(g11, vec2(fx.w, fy.w));

  vec2 fade_xy = fade(Pf.xy);
  vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
  float n_xy = mix(n_x.x, n_x.y, fade_xy.y);
  return 2.3 * n_xy;
}

// --------------------------------------------------------
//  "Burning Texture Fade" by Krzysztof Kondrak @k_kondrak
// --------------------------------------------------------

float r(in vec2 p)
{
    return fract(cos(p.x*42.98 + p.y*43.23) * 1127.53);
}

// using noise functions from: https://www.shadertoy.com/view/XtXXD8
float n(in vec2 p)
{
    vec2 fn = floor(p);
    vec2 sn = smoothstep(vec2(0), vec2(1), fract(p));
    
    float h1 = mix(r(fn), r(fn + vec2(1,0)), sn.x);
    float h2 = mix(r(fn + vec2(0,1)), r(fn + vec2(1)), sn.x);
    return mix(h1 ,h2, sn.y);
}

float noise(in vec2 p)
{
    return n(p/32.) * 0.58 +
           n(p/16.) * 0.2  +
           n(p/8.)  * 0.1  +
           n(p/4.)  * 0.05 +
           n(p/2.)  * 0.02 +
           n(p)     * 0.0125;
}

void main() {
//   float value = cnoise(vUv*5.0);
//   gl_FragColor = vec4( value, value, value, 1.0);

  // float value = clamp(cnoise(vUv*5.0) + 1.5 * sin(time*5.0), 0.0, 1.0);
  // vec4 blendedColor = mix(texture2D(tex1, vUv), texture2D(tex2, vUv), value);
  // float burnThresh = 1.0 - 2.0*abs(value - 0.5);
  // gl_FragColor = vec4( blendedColor.xyz, 1.0);
  
  float t = mod(time*.12, 1.2);
  // fade to black
  vec4 c = mix(texture2D(tex1, vUv), vec4(0), smoothstep(t + .1, t - .1, noise(250.*vUv)));

  // burning on the edges (when c.a < .1)
  c.rgb = clamp(c.rgb + step(c.a, .1) * 1.6 * noise(50. * vUv) * vec3(1.2,.5,.0), 0., 1.);

  // fancy background under burned texture
  c.rgb = c.rgb * step(.01, c.a) + texture2D(tex2, vUv).rgb * step(c.a, .01);
  gl_FragColor = c;
}