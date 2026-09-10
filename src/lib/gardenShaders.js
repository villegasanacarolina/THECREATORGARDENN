export const vertexShader = `
uniform sampler2D touchTexture, autoTouchTexture;
uniform float opacity;

varying vec2 vUv, uvScreen;
varying vec4 flowmap;
varying float extrude;

void main() {
  vUv = uv;

  vec4 worldPosition = modelMatrix * vec4(position, 1.);
  vec4 ndc = projectionMatrix * viewMatrix * worldPosition;
  uvScreen = (ndc.xy / ndc.w + 1.) * .5;

  flowmap = texture2D(touchTexture, uvScreen) + texture2D(autoTouchTexture, uvScreen);
  extrude = flowmap.b * opacity;

  worldPosition.xyz *= vec3(1.004, 1.004, mix(.05, 1., extrude));

  gl_Position = projectionMatrix * viewMatrix * worldPosition;
}
`

export const fragmentShader = `
precision highp float;

uniform sampler2D map, emissive, plaster;
uniform float darkMode, brightness, contrast, plasterStrength;

varying vec2 vUv, uvScreen;
varying vec4 flowmap;
varying float extrude;

vec4 sRGB(vec4 color) {
  vec3 adjusted = mix(pow(color.rgb, vec3(.41666)) * 1.055 - vec3(.055), color.rgb * 12.92, step(color.rgb, vec3(.0031308)));
  return vec4(adjusted, color.a);
}

void main() {
  float extrusion = extrude;
  vec3 map1 = sRGB(texture2D(map, vUv)).rgb;
  vec3 map2 = sRGB(texture2D(emissive, vUv)).rgb;
  float plasterTexture = texture2D(plaster, uvScreen).g;

  float initialMix = mix(map2.b, map2.g, smoothstep(0., .2, extrusion));
  float firstLayer = mix(.54504, initialMix, smoothstep(.2, .4, extrusion));
  float secondLayer = mix(map2.r, map1.b, smoothstep(.4, .6, extrusion));
  float thirdLayer = mix(firstLayer, secondLayer, smoothstep(.6, .8, extrusion));
  float finalLayer = mix(map1.g, map1.r, smoothstep(.8, 1., extrusion));

  float interpolatedValue = mix(thirdLayer, finalLayer, smoothstep(.8, 1., extrusion));

  vec3 finalColor = vec3(interpolatedValue) * contrast + brightness;
  finalColor = mix(finalColor, finalColor * plasterTexture * 1.5, plasterStrength);

  vec3 darkVer = pow(vec3(interpolatedValue) * (length(flowmap) * .0003) + vec3(interpolatedValue), vec3(5.5));
  finalColor = mix(finalColor, darkVer, darkMode);

  gl_FragColor = vec4(finalColor, 1.);
}
`
