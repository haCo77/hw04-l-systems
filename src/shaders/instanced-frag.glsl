#version 300 es
precision highp float;

in vec4 fs_Col;
in vec4 fs_Pos;
in vec2 fs_UV;
uniform sampler2D u_Texture;

out vec4 out_Col;

void main()
{
    // float dist = 1.0 - (length(fs_Pos.xyz) * 2.0);
    vec4 tmp = texture(u_Texture, fs_UV);
    if(1.5 * tmp.g > tmp.r + tmp.b) {
        tmp.g *= 0.7;
    } 
    out_Col = tmp;
    // out_Col = vec4(dist) * fs_Col;
}
