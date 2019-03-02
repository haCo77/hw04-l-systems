import {vec3, mat4} from "gl-matrix";
import Turtle from "./Turtle";

export default class DrawingRule {
    drawFirtMesh: boolean = true;
    moveDis: number = 0;
    rotateRad: number = 0;
    rotateAxis: vec3;
    constructor(dfm: boolean, md: number, rr: number, ra: vec3) {
      this.drawFirtMesh = dfm;
      this.moveDis = md;
      this.rotateRad = rr * 3.1415926 / 180;
      this.rotateAxis = ra;
    }
  
    draw(trans1: number[], trans2: number[], turtle: Turtle, decay: number) {
      if(turtle.far> 20 && this.drawFirtMesh) {
          return;
      }
      let rdaxis = vec3.create();
      vec3.random(rdaxis);
      vec3.scale(rdaxis, rdaxis, 0.5);
      vec3.add(rdaxis, this.rotateAxis, rdaxis);
      let randrot = Math.min(Math.random() * Math.min(turtle.far * turtle.far, 30) / 30, 1.0);
      turtle.rotate(rdaxis, this.rotateRad + 0.2 * randrot - 0.1);
      if(turtle.orientation[1] < 0) {
        turtle.orientation[1] = -turtle.orientation[1];
      }
      turtle.orientation[0] = 1.1 * turtle.orientation[0];
      turtle.orientation[2] = 1.1 * turtle.orientation[2];
      vec3.normalize(turtle.orientation, turtle.orientation);
      if(this.moveDis == 0 && this.drawFirtMesh) {
          return;
      }
      let sc2 = 1.0 / Math.pow(1.03, turtle.far);
      turtle.moveForward(this.moveDis * sc2);
      let transmat = mat4.create();
      mat4.identity(transmat);
      let sc = 1.0 / Math.pow(decay, turtle.far);
      if(turtle.orientation[0] == 0 && turtle.orientation[2] == 0) {
        if(turtle.orientation[1] == -1) {
          transmat[0] = -1 * sc;
          transmat[5] = -1 * sc2;
          transmat[10] = -1 * sc;
        }
        else{
          transmat[0] = 1 * sc;
          transmat[5] = 1 * sc2;
          transmat[10] = 1 * sc;
        }
      } else {
        let t = vec3.create();
        vec3.cross(t, turtle.orientation, vec3.fromValues(0, 1, 0));
        vec3.normalize(t, t);
        let b = vec3.create();
        vec3.cross(b, turtle.orientation, t);
        transmat[0] = b[0] * sc;
        transmat[1] = b[1] * sc;
        transmat[2] = b[2] * sc;
        transmat[3] = 0;
        transmat[4] = turtle.orientation[0] * sc2;
        transmat[5] = turtle.orientation[1] * sc2;
        transmat[6] = turtle.orientation[2] * sc2;
        transmat[7] = 0;
        transmat[8] = t[0] * sc;
        transmat[9] = t[1] * sc;
        transmat[10] = t[2] * sc;
        transmat[11] = 0;
      }
      transmat[12] = turtle.position[0];
      transmat[13] = turtle.position[1];
      transmat[14] = turtle.position[2];
      if(this.drawFirtMesh) {
        for(let i = 0; i < 16; i++) {
            trans1.push(transmat[i]);
        }
      } else {
        for(let i = 0; i < 16; i++) {
            trans2.push(transmat[i]);
        }
      }
      turtle.far += 1.0;
    }
  }