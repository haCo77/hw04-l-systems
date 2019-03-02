#version 300 es
precision highp float;

uniform vec3 u_Eye, u_Ref, u_Up;
uniform vec2 u_Dimensions;
uniform float u_Time;

in vec2 fs_Pos;
out vec4 out_Col;

void main() {
  vec3 forward = normalize(u_Ref - u_Eye);
  vec3 right = normalize(cross(forward, u_Up));
  vec3 up = normalize(cross(right, forward));
  vec3 ray = fs_Pos.x * right + fs_Pos.y * up + forward;
  if(ray.y < 0.0) {
    if(u_Eye.y > 0.0) {
      float t = - u_Eye.y / ray.y;
      vec3 p = u_Eye + t * ray;
      out_Col = vec4(vec3(-smoothstep(0.0, 4.0, length(p.xz)) / 8.0 + 0.2), 1.0);
    } else {
      out_Col = vec4((0.2 - 0.1 * ray.y) * vec3(0.2, 0.3, 0.45), 1.0);
    }
  }
  else {
      out_Col = vec4((0.2 - 0.1 * ray.y) * vec3(0.2, 0.3, 0.45), 1.0);
  }
}

