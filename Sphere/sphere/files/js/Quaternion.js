///////////////////////////////////////////////////////////////////////////////
// Quaternion.js
// =============
// Quaternion class represented as sum of a scalar and a vector(rotation axis)
// parts; [s, v] = s + (ix + jy + kz)
//
// When the quaternion is used for 3D rotation, initialize the quaternion with
// the half of the rotation angle (radian), because of double multiplication by
// its inverse, qpq*.
//
//  AUTHOR: Song Ho Ahn (song.ahn@gmail.com)
// CREATED: 2011-12-15
// UPDATED: 2021-07-09
//
// Copyright (C) 2011. Song Ho Ahn
///////////////////////////////////////////////////////////////////////////////

let Quaternion = function(s=0, x=0, y=0, z=0)
{
    this.s = s; // scalar part
    this.x = x; // vector part
    this.y = y;
    this.z = z;
};

Quaternion.prototype =
{
    set: function(s=0, x=0, y=0, z=0)
    {
        if(s instanceof Quaternion)
        {
            this.s = s.s;
            this.x = s.x;
            this.y = s.y;
            this.z = s.z;
        }
        else if(s instanceof Vector3)
        {
            this.s = 0;
            this.x = s.x;
            this.y = s.y;
            this.z = s.z;
        }
        else
        {
            this.s = s;
            this.x = x;
            this.y = y;
            this.z = z;
        }
        return this;
    },
    // set q with rotation axis and angle(radian)
    setWithAxisAngle: function(axis, angle)
    {
        let v = new Vector3(axis.x, axis.y, axis.z);
        v.normalize();  // convert to unit vector
        let sine = Math.sin(angle);

        this.s = Math.cos(angle);
        this.x = v.x * sine;
        this.y = v.y * sine;
        this.z = v.z * sine;
        return this;
    },
    add: function(q)
    {
        this.s += q.s;
        this.x += q.x;
        this.y += q.y;
        this.z += q.z;
        return this;
    },
    substract: function(q)
    {
        this.s -= q.s;
        this.x -= q.x;
        this.y -= q.y;
        this.z -= q.z;
        return this;
    },
    multiply: function(q)
    {
        let v1 = new Vector3(this.x, this.y, this.z);
        let v2 = new Vector3(q.x, q.y, q.z);

        // q1 * q2 = [s1, v1] * [s2, v2] = [s1s2 - v1.v2, v1 x v2 + s1v2 + s2v1]
        let s3 = this.s * q.s - v1.dot(v2);     // s1s2 - v1.v2
        let v3 = Vector3.cross(v1, v2);         // v1 x v2
        v3.add(v2.scale(this.s));               // + s1v2
        v3.add(v1.scale(q.s));                  // + s2v1
        this.set(s3, v3.x, v3.y, v3.z);
        return this;
    },
    scale: function(a)
    {
        this.s *= a;
        this.x *= a;
        this.y *= a;
        this.z *= a;
        return this;
    },
    length: function()
    {
        return Math.sqrt(this.s*this.s + this.x*this.x + this.y*this.y + this.z*this.z);
    },
    normalize: function()
    {
        let d = this.s*this.s + this.x*this.x + this.y*this.y + this.z*this.z;
        if(d < 0.00001)
            return this;    // do nothing if it is zero

        let invLength = 1 / Math.sqrt(d);
        this.s *= invLength;
        this.x *= invLength;
        this.y *= invLength;
        this.z *= invLength;
        return this;
    },
    conjugate: function()
    {
        this.x = -this.x;  this.y = -this.y;  this.z = -this.z;
        return this;
    },
    invert: function()
    {
        let d = this.s*this.s + this.x*this.x + this.y*this.y + this.z*this.z;
        if(d < 0.00001)
            return this; // do nothing if it is zero

        let q = new Quaternion(this.s, this.x, this.y, this.z);
        q.conjugate().scale(1 / d); // q* / |q||q|
        this.set(q.s, q.x, q.y, q.z);
        return this;
    },
    toMatrix: function()
    {
        // NOTE: assume the quaternion is unit quaternion
        let x2  = this.x + this.x;
        let y2  = this.y + this.y;
        let z2  = this.z + this.z;
        let xx2 = this.x * x2;
        let xy2 = this.x * y2;
        let xz2 = this.x * z2;
        let yy2 = this.y * y2;
        let yz2 = this.y * z2;
        let zz2 = this.z * z2;
        let sx2 = this.s * x2;
        let sy2 = this.s * y2;
        let sz2 = this.s * z2;

        // build 4x4 matrix and return (column-major)
        return new Matrix4(1 - (yy2 + zz2),  xy2 + sz2,        xz2 - sy2,        0,
                           xy2 - sz2,        1 - (xx2 + zz2),  yz2 + sx2,        0,
                           xz2 + sy2,        yz2 - sx2,        1 - (xx2 + yy2),  0,
                           0,                0,                0,                1);
    },
    clone: function()
    {
        return new Quaternion(this.s, this.x, this.y, this.z);
    },
    toString: function()
    {
        const FIXED = 100000;
        let s = Math.round(this.s * FIXED) / FIXED;
        let x = Math.round(this.x * FIXED) / FIXED;
        let y = Math.round(this.y * FIXED) / FIXED;
        let z = Math.round(this.z * FIXED) / FIXED;
        return "Quaternion(" + s + ", " + x + ", " + y + ", " + z + ")";
    }
};



///////////////////////////////////////////////////////////////////////////////
// class (static) methods for Quaternion class
///////////////////////////////////////////////////////////////////////////////

// return the quaternion rotating from v1 to v2 (Vector3)
Quaternion.toQuaternion = function(v1, v2)
{
    const EPSILON = 0.001;
    const HALF_PI = Math.PI * 0.5;  // pi / 2

    let q = new Quaternion();
    let v = new Vector3();

    // if two vectors are equal return the vector with 0 rotation
    if(Math.abs(v1.x - v2.x) < EPSILON && Math.abs(v1.y - v2.y) < EPSILON && Math.abs(v1.z - v2.z) < EPSILON)
        return q.setWithAxisAngle(v1, 0);
    // if two vectors are opposite return a perpendicular vector with 180 angle
    else if(Math.abs(v1.x + v2.x) < EPSILON && Math.abs(v1.y + v2.y) < EPSILON && Math.abs(v1.z + v2.z) < EPSILON)
    {
        if(v1.x > -EPSILON && v1.x < EPSILON)       // if x ~= 0
            v.set(1, 0, 0);
        else if(v1.y > -EPSILON && v1.y < EPSILON)  // if y ~= 0
            v.set(0, 1, 0);
        else                                        // if z ~= 0
            v.set(0, 0, 1);
        return q.setWithAxisAngle(v, HALF_PI);
    }

    //let v = new Vector3(v1.x, v1.y, v1.z);
    let u1 = v1.clone().normalize();                // unit vector
    let u2 = v2.clone().normalize();
    v = Vector3.cross(u1, u2);                      // compute rotation axis
    let angle = Math.acos(u1.dot(u2));              // rotation angle
    q.setWithAxisAngle(v, angle*0.5);               // half angle
    return q;
};



// return the quaternion from rotation half angles (x,y,z)
Quaternion.toQuaternionFromAngles = function(angleX, angleY, angleZ)
{
    let q = new Quaternion(1,0,0,0);
    if(angleZ)
    {
        q.setWithAxisAngle(new Vector3(0,0,1), angleZ);
    }
    if(angleY)
    {
        let qy = new Quaternion(1,0,0,0);
        qy.setWithAxisAngle(new Vector3(0,1,0), angleY);
        q = qy.multiply(q);
    }
    if(angleX)
    {
        let qx = new Quaternion(1,0,0,0);
        qx.setWithAxisAngle(new Vector3(1,0,0), angleX);
        q = qx.multiply(q)
    }
    return q;
};



Quaternion.slerp = function(from, to, alpha, mode)
{
    // re-compute alpha with mode
    let t = getInterpolateAlpha(alpha, mode);

    let dot = from.s*to.s + from.x*to.x + from.y*to.y + from.z*to.z;

    // if dot < 0, reverse rotation direction
    if(dot < 0)
    {
        dot = -dot;
        from.scale(-1);
    }

    // if dot ~= 1, then use lerp instead
    if(dot > 0.999)
    {
        let q = new Quaternion();
        q.s = from.s + t * (to.s - from.s);
        q.x = from.x + t * (to.x - from.x);
        q.y = from.y + t * (to.y - from.y);
        q.z = from.z + t * (to.z - from.z);
        //q.normalize(); // assume from and to are already normalized
        return q;
    }
    // if dot ~= -1 then the angle = 180 (rotation axis is undefined)
    else if(dot < -0.999)
    {
        let v1 = from.clone();
        v1.normalize();
        let up = new Vector3();
        if(Math.fab(from.x) < 0.001)
            up.set(1, 0, 0);
        else
            up.set(0, 1, 0);
        let v2 = Vector3.cross(v1, up); // orthonormal to v1
        v2.normalize();
        let angle = Math.acos(dot) * t;
        let q = new Quaternion();
        q.s = 0;
        q.x = v1.x + Math.cos(angle) + v2.x * Math.sin(angle);
        q.y = v1.y + Math.cos(angle) + v2.y * Math.sin(angle);
        q.z = v1.z + Math.cos(angle) + v2.z * Math.sin(angle);
        return new q;
    }

    // determine the angle between
    let angle = Math.acos(dot);                     // 0 ~ pi
    let invSine = 1.0 / Math.sqrt(1 - dot * dot);   // 1 / sin(angle)

    // compute the scale factors
    let s1 = Math.sin((1-t)*angle) * invSine;
    let s2 = Math.sin(t*angle) * invSine;

    let q = new Quaternion();
    q.s = from.s * s1 + to.s * s2;
    q.x = from.x * s1 + to.x * s2;
    q.y = from.y * s1 + to.y * s2;
    q.z = from.z * s1 + to.z * s2;
    return q;
};
