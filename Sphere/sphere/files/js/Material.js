///////////////////////////////////////////////////////////////////////////////
// Material.js
// ===========
// a struct of WebGL material, construct with diffuse color
//
// Vector4  ambient
// Vector4  diffuse
// Vector4  specular
// float    shininess (0 ~ 128)
//
//  AUTHOR: Song Ho Ahn (song.ahn@gmail.com)
// CREATED: 2011-02-18
// UPDATED: 2021-07-09
//
// Copyright (C) 2011. Song Ho Ahn
///////////////////////////////////////////////////////////////////////////////

let Material = function(r, g, b, a)
{
    this.ambient = new Vector4(0, 0, 0, 0);
    this.diffuse = new Vector4(r, g, b, a);
    this.specular = new Vector4(1, 1, 1, 1);    // specular
    this.shininess = 0;                         // specular exponent
};


Material.prototype =
{
    // return as Float32Array struct
    getAmbient: function()
    {
        return new Float32Array([this.ambient.x,
                                 this.ambient.y,
                                 this.ambient.z,
                                 this.ambient.w]);
    },
    getDiffuse: function()
    {
        return new Float32Array([this.diffuse.x,
                                 this.diffuse.y,
                                 this.diffuse.z,
                                 this.diffuse.w]);
    },
    getSpecular: function()
    {
        return new Float32Array([this.specular.x,
                                 this.specular.y,
                                 this.specular.z,
                                 this.specular.w]);
    },
    setAmbient: function(r, g, b, a)
    {
        this.ambient.set(r, g, b, a);
        return this;
    },
    setDiffuse: function(r, g, b, a)
    {
        this.diffuse.set(r, g, b, a);
        return this;
    },
    setSpecular: function(r, g, b, a)
    {
        this.specular.set(r, g, b, a);
        return this;
    },
    toString: function()
    {
        return "===== Material =====\n" +
               "  Ambient: (" + this.ambient.x + ", " + this.ambient.y + ", " + this.ambient.z + ", " + this.ambient.w + ")\n" +
               "  Diffuse: (" + this.diffuse.x + ", " + this.diffuse.y + ", " + this.diffuse.z + ", " + this.diffuse.w + ")\n" +
               " Specular: (" + this.specular.x + ", " + this.specular.y + ", " + this.specular.z + ", " + this.specular.w + ")\n" +
               "Shininess: " + this.shininess + "\n";
    }
};

