import {vec3, mat4} from 'gl-matrix';
import * as Stats from 'stats-js';
import * as DAT from 'dat-gui';
import Square from './geometry/Square';
import ScreenQuad from './geometry/ScreenQuad';
import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';
import {setGL} from './globals';
import ShaderProgram, {Shader} from './rendering/gl/ShaderProgram';

import {readTextFile} from './globals';
import {loadTexture} from './Texture';
import Mesh from './geometry/Mesh';
import ExpansionRule from "./ExpansionRule";
import DrawingRule from "./DrawingRule";
import Turtle from "./Turtle";

// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.
const controls = {
  'iteration' : 8,
  'leaf density' : 1,
  'height': 1,
};

let square: Square;
let screenQuad: ScreenQuad;
let time: number = 0.0;
let obj0: string = readTextFile('./src/resources/trunk.obj');
let trunk: Mesh = new Mesh(obj0, vec3.fromValues(0, 0, 0));
let obj1: string = readTextFile('./src/resources/leaf.obj');
let leaf: Mesh = new Mesh(obj1, vec3.fromValues(0, 0, 0));;
let grammar: string;


function loadScene() {
  grammar = "F";

  let expmap : Map<string, ExpansionRule> = new Map();
  let r1 = new ExpansionRule("CG", "[C[*]C[*]G*]+C[*]C[*]G*", "C[+C[*]C[*]][C[*]C[*]]-C[*]C[*]", 0.3, 0.95);
  let r2 = new ExpansionRule("CCCB", "CCCCCB", "CCCCB", 0.3, 0.7);
  let r3 = new ExpansionRule("[+CG][--CG][CG]", "[+CG][CG]", "[+CG][--CG][++CG][CG]", 0.33, 0.7);
  expmap.set('G', r1);
  expmap.set('F', r2);
  expmap.set('B', r3);
  
  for(let i = 0; i < controls.iteration; ++i) {
    let tmp: string = "";
    let count1 = 0;
    for(let j = 0; j < grammar.length; j++) {
      let s = expmap.get(grammar[j])
      if(s) {
        tmp += s.expand();
      } else {
        tmp += grammar[j]
      }
    }
    grammar = tmp;
  }

  let d1 = new DrawingRule(true, 0.4 * controls.height, 0, vec3.fromValues(0, 1, 0));
  let d2 = new DrawingRule(true, 0, 30, vec3.fromValues(0, 1, 0));
  let d3 = new DrawingRule(true, 0, -40, vec3.fromValues(0, 1, 0));
  let d4 = new DrawingRule(false, 0, 0, vec3.fromValues(0.3, 0.8, 0.2));
  let drawmap : Map<string, DrawingRule> = new Map();
  drawmap.set("+", d2);
  drawmap.set("-", d3);
  drawmap.set("F", d1);
  drawmap.set("G", d1);
  drawmap.set("C", d1);
  drawmap.set("*", d4);

  let trtfArray: number[] = [];
  let fltfArray: number[] = [];

  let turtles: Turtle[] = [];
  let turtle: Turtle = new Turtle();
  for(let j = 0; j < grammar.length; j++) {
    if(grammar[j] == "[") {
      let tmp: Turtle = new Turtle(turtle.position, turtle.orientation, turtle.depth, turtle.far);
      turtles.push(tmp);
      turtle.depth = turtle.depth + 1;
    } else if(grammar[j] == "]"){
      let tmp = turtles.pop();
      Object.assign(turtle, tmp);
    } else{
      if(grammar[j] == '*') {
        if(Math.random() < controls["leaf density"]) {
          vec3.cross(d4.rotateAxis, turtle.orientation, vec3.fromValues(0, 1, 0));
          d4.rotateRad += 3.14 * Math.random();
          d4.draw(trtfArray, fltfArray, turtle, 1);
        }
        continue;
      }
      if(grammar[j] != "B")
        drawmap.get(grammar[j]).draw(trtfArray, fltfArray, turtle, 1.15);
    }
  }
  trunk.destoryTF()
  trunk.setInstanceTFs(new Float32Array(trtfArray));
  trunk.setNumInstances(trtfArray.length / 16);
  leaf.destoryTF();
  leaf.setInstanceTFs(new Float32Array(fltfArray));
  leaf.setNumInstances(fltfArray.length / 16);
}

function main() {
  // Initial display for framerate
  const stats = Stats();
  stats.setMode(0);
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';
  document.body.appendChild(stats.domElement);

  // Add controls to the gui
  const gui = new DAT.GUI();
  gui.add(controls, 'iteration', 5, 13).step(1);
  gui.add(controls, 'leaf density', 0.0, 1.0);
  gui.add(controls, 'height', 0.5, 2);
  let preIt = 8;
  let preBrd = 1;
  let preh = 1;

  // get canvas and webgl context
  const canvas = <HTMLCanvasElement> document.getElementById('canvas');
  const gl = <WebGL2RenderingContext> canvas.getContext('webgl2');
  if (!gl) {
    alert('WebGL 2 not supported!');
  }
  // `setGL` is a function imported above which sets the value of `gl` in the `globals.ts` module.
  // Later, we can import `gl` from `globals.ts` to access it
  setGL(gl);

  // Initial call to load scene
    
  const texture = loadTexture(gl, './src/resources/HazelnutBark.png');
  const texture2 = loadTexture(gl, './src/resources/HazelnutLeaves.png');

  trunk.create();
  leaf.create();
  loadScene();
  screenQuad = new ScreenQuad();
  screenQuad.create();

  const camera = new Camera(vec3.fromValues(10, 10, 10), vec3.fromValues(0, 0, 0));

  const renderer = new OpenGLRenderer(canvas);
  renderer.setClearColor(0.2, 0.2, 0.2, 1);
  gl.enable(gl.DEPTH_TEST);

  const instancedShader = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/instanced-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/instanced-frag.glsl')),
  ]);

  const flat = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/flat-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/flat-frag.glsl')),
  ]);

  // This function will be called every frame
  function tick() {
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, texture2);
    if(preIt != controls.iteration || preBrd != controls["leaf density"] || preh != controls.height) {
      preIt = controls.iteration;
      preBrd = controls["leaf density"];
      preh = controls.height;
      loadScene();
    }
    camera.update();
    stats.begin();
    instancedShader.setTime(time);
    flat.setTime(time++);
    flat.setEyeRefUp(camera.position, camera.target, camera.up);
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.clear();
    renderer.render(camera, flat, [screenQuad]);
    renderer.render(camera, instancedShader, [
      //square, 
      trunk,
      leaf,
    ]);
    stats.end();

    // Tell the browser to call `tick` again whenever it renders a new frame
    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', function() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.setAspectRatio(window.innerWidth / window.innerHeight);
    camera.updateProjectionMatrix();
    flat.setDimensions(window.innerWidth, window.innerHeight);
  }, false);

  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.setAspectRatio(window.innerWidth / window.innerHeight);
  camera.updateProjectionMatrix();
  flat.setDimensions(window.innerWidth, window.innerHeight);

  // Start the render loop
  tick();
}

main();
