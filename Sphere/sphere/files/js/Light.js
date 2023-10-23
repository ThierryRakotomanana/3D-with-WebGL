///////////////////////////////////////////////////////////////////////////////
// Light.js
// ========
// a struct of WebGL light, construct with position
// If w coord is 0, it is a directional light.
// If w coord is 1, it is a point light
//
// Vector4  position    : coords at world space, should be normalized
// Vector4  color       : diffuse and specular, white by default
// Vector3  attenuations: constant, linear, quadratic attenuations
//
//  AUTHOR: Song Ho Ahn (song.ahn@gmail.com)
// CREATED: 2011-02-18
// UPDATED: 2021-07-09
//
// Copyright (C) 2011. Song Ho Ahn
///////////////////////////////////////////////////////////////////////////////

let Light = function(x, y, z, w)
{
    this.position = new Vector4(x, y, z, w);
    this.color = new Vector4(1, 1, 1, 1);   // white
    this.attenuations = new Vector3(1, 0, 0);
};


Light.prototype =
{
    // return as Float32Array struct
    getPosition: function()
    {
        return new Float32Array([this.position.x,
                                 this.position.y,
                                 this.position.z,
                                 this.position.w]);
    },

    // set position of light
    setPosition: function(x, y, z, w)
    {
        this.position.set(x, y, z, w);
        return this;
    },

    // return color as Float32Array
    getColor: function()
    {
        return new Float32Array([this.color.x,
                                 this.color.y,
                                 this.color.z,
                                 this.color.w]);
    },

    // set color of light
    setColor: function(r, g, b, a)
    {
        this.color.set(r, g, b, a);
        return this;
    },

    // return attenuation values as Float32Array
    getAttenuations: function()
    {
        return new Float32Array([this.attenuations.x,
                                 this.attenuations.y,
                                 this.attenuations.z]);
    },

    // set attenuations (const, linear, quadratic)
    setAttenuations: function(a0, a1, a2)
    {
        this.attenuations.set(a0, a1, a2);
        return this;
    },

    toString: function()
    {
        return "===== Light =====\n" +
               "    Position: " + this.position + "\n" +
               "       Color: " + this.color + "\n" +
               "Attenuations: " + this.attenuations + "\n";
    }
};

