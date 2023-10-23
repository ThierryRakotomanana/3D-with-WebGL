///////////////////////////////////////////////////////////////////////////////
// Vectors.js
// ==========
// 2D/3D/4D vector classes
//
//  AUTHOR: Song Ho Ahn (song.ahn@gmail.com)
// CREATED: 2011-01-21
// UPDATED: 2020-09-30
//
// Copyright (C) 2011-2020. Song Ho Ahn
///////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////
// 2D Vector
///////////////////////////////////////////////////////////////////////////////
let Vector2 = function(x=0, y=0)
{
    this.x = x;
    this.y = y;
};
Vector2.prototype =
{
    set: function(x=0, y=0)
    {
        if(x instanceof Vector2)
        {
            this.x = x.x;
            this.y = x.y;
        }
        else
        {
            this.x = x;
            this.y = y;
        }
        return this;
    },
    add: function(v)
    {
        this.x += v.x;
        this.y += v.y;
        return this;
    },
    subtract: function(v)
    {
        this.x -= v.x;
        this.y -= v.y;
        return this;
    },
    scale: function(s)
    {
        this.x *= s;
        this.y *= s;
        return this;
    },
    dot: function(v)
    {
        return (this.x*v.x + this.y*v.y);
    },
    length: function()
    {
        return Math.sqrt(this.x*this.x + this.y*this.y);
    },
    normalize: function()
    {
        let xxyy = this.x*this.x + this.y*this.y;
        if(xxyy < 0.000001)
            return this;    // do nothing if it is zero vector

        let invLength = 1.0 / Math.sqrt(xxyy);
        this.x *= invLength;
        this.y *= invLength;
        return this;
    },
    distance: function(v)
    {
        return Math.sqrt((this.x-v.x)*(this.x-v.x) + (this.y-v.y)*(this.y-v.y));
    },
    clone: function()
    {
        return new Vector2(this.x, this.y);
    },
    equals: function(v)
    {
        return (v && this.x == v.x && this.y == v.y);
    },
    toFloat32Array: function()
    {
        return new Float32Array([this.x, this.y]);
    },
    toString: function()
    {
        const FIXED = 100000;
        let x = Math.round(this.x * FIXED) / FIXED;
        let y = Math.round(this.y * FIXED) / FIXED;
        return "Vector2(" + x + ", " + y + ")";
    }
};



///////////////////////////////////////////////////////////////////////////////
// class (static) function: interpolate
///////////////////////////////////////////////////////////////////////////////
Vector2.interpolate = function(from, to, alpha, mode)
{
    let t = getInterpolateAlpha(alpha, mode);
    let v1 = new Vector2(from.x, from.y);
    let v2 = new Vector2(to.x-from.x, to.y-from.y); // to - from
    return v1.add(v2.scale(t));
}



///////////////////////////////////////////////////////////////////////////////
// 3D Vector
///////////////////////////////////////////////////////////////////////////////
let Vector3 = function(x=0, y=0, z=0)
{
    this.x = x;
    this.y = y;
    this.z = z;
};
Vector3.prototype =
{
    set: function(x=0, y=0, z=0)
    {
        if(x instanceof Vector3)
        {
            this.x = x.x;
            this.y = x.y;
            this.z = x.z;
        }
        else if(x instanceof Vector2)
        {
            this.x = x.x;
            this.y = x.y;
            this.z = 0;
        }
        else
        {
            this.x = x;
            this.y = y;
            this.z = z;
        }
        return this;
    },
    add: function(v)
    {
        this.x += v.x;
        this.y += v.y;
        this.z += v.z;
        return this;
    },
    subtract: function(v)
    {
        this.x -= v.x;
        this.y -= v.y;
        this.z -= v.z;
        return this;
    },
    scale: function(s)
    {
        this.x *= s;
        this.y *= s;
        this.z *= s;
        return this;
    },
    dot: function(v)
    {
        return (this.x*v.x + this.y*v.y + this.z*v.z);
    },
    length: function()
    {
        return Math.sqrt(this.x*this.x + this.y*this.y + this.z*this.z);
    },
    normalize: function()
    {
        let xxyyzz = this.x*this.x + this.y*this.y + this.z*this.z;
        if(xxyyzz < 0.000001)
            return this;    // do nothing if it is zero vector

        let invLength = 1.0 / Math.sqrt(xxyyzz);
        this.x *= invLength;
        this.y *= invLength;
        this.z *= invLength;
        return this;
    },
    distance: function(v)
    {
        return Math.sqrt((this.x-v.x)*(this.x-v.x) + (this.y-v.y)*(this.y-v.y) + (this.z-v.z)*(this.z-v.z));
    },
    clone: function()
    {
        return new Vector3(this.x, this.y, this.z);
    },
    equals: function(v)
    {
        return (v && this.x == v.x && this.y == v.y && this.z == v.z);
    },
    toFloat32Array: function()
    {
        return new Float32Array([this.x, this.y, this.z]);
    },
    toString: function()
    {
        const FIXED = 100000;
        let x = Math.round(this.x * FIXED) / FIXED;
        let y = Math.round(this.y * FIXED) / FIXED;
        let z = Math.round(this.z * FIXED) / FIXED;
        return "Vector3(" + x + ", " + y + ", " + z + ")";
    }
};

///////////////////////////////////////////////////////////////////////////////
// class (static) function: return cross product of 2 Vector3
///////////////////////////////////////////////////////////////////////////////
Vector3.cross = function(v1, v2)
{
    let x = v1.y * v2.z - v1.z * v2.y;
    let y = v1.z * v2.x - v1.x * v2.z;
    let z = v1.x * v2.y - v1.y * v2.x;
    return new Vector3(x,y,z);
};



///////////////////////////////////////////////////////////////////////////////
// class (static) function: interpolate
///////////////////////////////////////////////////////////////////////////////
Vector3.interpolate = function(from, to, alpha, mode)
{
    let t = getInterpolateAlpha(alpha, mode);
    let v1 = new Vector3(from.x, from.y, from.z);
    let v2 = new Vector3(to.x-from.x, to.y-from.y, to.z-from.z);    // to - from
    return v1.add(v2.scale(t));
}



///////////////////////////////////////////////////////////////////////////////
// 4D vector
///////////////////////////////////////////////////////////////////////////////
let Vector4 = function(x=0, y=0, z=0, w=0)
{
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
};
Vector4.prototype =
{
    set: function(x=0, y=0, z=0, w=0)
    {
        if(x instanceof Vector4)
        {
            this.x = x.x;
            this.y = x.y;
            this.z = x.z;
            this.w = x.w;
        }
        else if(x instanceof Vector3)
        {
            this.x = x.x;
            this.y = x.y;
            this.z = x.z;
            if(y)  this.w = y;
            else   this.w = 0;
        }
        else
        {
            this.x = x;
            this.y = y;
            this.z = z;
            this.w = w;
        }
        return this;
    },
    add: function(v)
    {
        this.x += v.x;
        this.y += v.y;
        this.z += v.z;
        this.w += v.w;
        return this;
    },
    subtract: function(v)
    {
        this.x -= v.x;
        this.y -= v.y;
        this.z -= v.z;
        this.w -= v.w;
        return this;
    },
    scale: function(s)
    {
        this.x *= s;
        this.y *= s;
        this.z *= s;
        this.w *= s;
        return this;
    },
    dot: function(v)
    {
        return (this.x*v.x + this.y*v.y + this.z*v.z + this.w*v.w);
    },
    length: function()
    {
        return Math.sqrt(this.x*this.x + this.y*this.y + this.z*this.z + this.w*this.w);
    },
    normalize: function()
    {
        //NOTE: leave w-component untouched
        let xxyyzz = this.x*this.x + this.y*this.y + this.z*this.z;
        if(xxyyzz < 0.000001)
            return this;    // do nothing if it is zero vector

        let invLength = 1.0 / Math.sqrt(xxyyzz);
        this.x *= invLength;
        this.y *= invLength;
        this.z *= invLength;
        return this;
    },
    distance: function(v)
    {
        let dx = this.x - v.x;
        let dy = this.y - v.y;
        let dz = this.z - v.z;
        let dw = this.w - v.w;
        return Math.sqrt(dx*dx + dy*dy + dz*dz + dw*dw);
    },
    clone: function()
    {
        return new Vector4(this.x, this.y, this.z, this.w);
    },
    equals: function(v)
    {
        return (v && this.x == v.x && this.y == v.y && this.z == v.z && this.w == v.w);
    },
    toFloat32Array: function()
    {
        return new Float32Array([this.x, this.y, this.z, this.w]);
    },
    toString: function()
    {
        const FIXED = 100000;
        let x = Math.round(this.x * FIXED) / FIXED;
        let y = Math.round(this.y * FIXED) / FIXED;
        let z = Math.round(this.z * FIXED) / FIXED;
        let w = Math.round(this.w * FIXED) / FIXED;
        return "Vector4(" + x + ", " + y + ", " + z + ", " + w + ")";
    }
};
