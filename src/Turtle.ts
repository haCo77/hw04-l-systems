import {vec3, vec4, mat4} from 'gl-matrix';

export default class Turtle {
  position: vec3 = vec3.create();
  orientation: vec3 = vec3.create();
  depth: number;
  far: number;
  constructor(pos: vec3 = vec3.fromValues(0, 0, 0), orient: vec3 = vec3.fromValues(0, 1, 0), d: number = 0, f: number = 0) {
    Object.assign(this.position, pos);
    vec3.normalize(this.orientation, orient);
    this.depth = d;
    this.far = f;
  }

  moveForward(dis: number) {
    vec3.scaleAndAdd(this.position, this.position, this.orientation, dis);
  }

  rotate(axis: vec3, angle: number) {
    let tmp = vec4.fromValues(this.orientation[0], this.orientation[1],this.orientation[2], 0);
    let rotmat = mat4.create();
    mat4.rotate(rotmat, mat4.identity(mat4.create()), angle, axis);
    vec4.transformMat4(tmp, tmp, rotmat);
    this.orientation = vec3.fromValues(tmp[0], tmp[1], tmp[2]);
  }
}