///////////////////////////////////////////////////////////////////////////////
// Matrices.js
// ===========
// 3x3 / 4x4 matrix classes
// NOTE: This matrix follows OpenGL column-major notation.
//       | 0 3 6 |   | 0  4  8 12 |
//       | 1 4 7 |   | 1  5  9 13 |
//       | 2 5 8 |   | 2  6 10 14 |
//                   | 3  7 11 15 |
//
//  AUTHOR: Song Ho Ahn (song.ahn@gmail.com)
// CREATED: 2011-01-21
// UPDATED: 2021-07-09
//
// Copyright (C) 2011. Song Ho Ahn
///////////////////////////////////////////////////////////////////////////////


///////////////////////////////////////////////////////////////////////////////
// 3x3 matrix
///////////////////////////////////////////////////////////////////////////////
let Matrix3 = function(m0,m1,m2, m3,m4,m5, m6,m7,m8)
{
    this.m = new Float32Array(9);
    this.set(m0,m1,m2, m3,m4,m5, m6,m7,m8);
};
Matrix3.prototype =
{
    set: function(m0=1,m1=0,m2=0, m3=0,m4=1,m5=0, m6=0,m7=0,m8=1)
    {
        this.m[0] = m0;  this.m[3] = m3;  this.m[6] = m6;
        this.m[1] = m1;  this.m[4] = m4;  this.m[7] = m7;
        this.m[2] = m2;  this.m[5] = m5;  this.m[8] = m8;
        return this;
    },
    identity: function()
    {
        this.m[0] = 1;  this.m[3] = 0;  this.m[6] = 0;
        this.m[1] = 0;  this.m[4] = 1;  this.m[7] = 0;
        this.m[2] = 0;  this.m[5] = 0;  this.m[8] = 1;
        return this;
    },
    clone: function()
    {
        let mat = new Matrix3(this.m[0], this.m[1], this.m[2], this.m[3], this.m[4], this.m[5], this.m[6], this.m[7], this.m[8]);
        return mat;
    },
    transpose: function()
    {
        let tmp;
        tmp = this.m[1]; this.m[1] = this.m[3]; this.m[3] = tmp;
        tmp = this.m[2]; this.m[2] = this.m[6]; this.m[6] = tmp;
        tmp = this.m[5]; this.m[5] = this.m[7]; this.m[7] = tmp;
        return this;
    },
    getRow: function(row)
    {
        return new Vector3(this.m[row], this.m[3+row], this.m[6+row]);
    },
    getColumn: function(col)
    {
        let i = col * 3;
        return new Vector3(this.m[i], this.m[i+1], this.m[i+2]);
    },
    // returns radians
    getAngle: function()
    {
        const EPSILON = 0.00001;

        let yaw = Math.asin(this.m[6]);
        if(this.m[8] < 0)
        {
            if(yaw >= 0) yaw = Math.PI - yaw;
            else         yaw =-Math.PI - yaw;
        }

        let roll, pitch;
        if(this.m[0] > -EPSILON && this.m[0] < EPSILON)
        {
            roll  = 0;  //@@ assume roll=0
            pitch = Math.atan2(this.m[1], this.m[4]);
        }
        else
        {
            roll  = Math.atan2(-this.m[3], this.m[0]);
            pitch = Math.atan2(-this.m[7], this.m[8]);
        }
        return new Vector3(pitch, yaw, roll);
    },
    // returns degrees
    getAngleDegree: function()
    {
        let a = this.getAngle();
        a.x = rad2deg(a.x);
        a.y = rad2deg(a.y);
        a.z = rad2deg(a.z);
        return a;
    },
    setRow: function(row, v)
    {
        this.m[row]   = v.x;
        this.m[3+row] = v.y;
        this.m[6+row] = v.z;
        return this;
    },
    setColumn: function(col, v)
    {
        let i = col * 3;
        this.m[i]   = v.x;
        this.m[i+1] = v.y;
        this.m[i+2] = v.z;
        return this;
    },
    invert: function()
    {
        let det;
        let tmp = new Array(9);
        tmp[0] = this.m[4] * this.m[8] - this.m[5] * this.m[7];
        tmp[1] = this.m[2] * this.m[7] - this.m[1] * this.m[8];
        tmp[2] = this.m[1] * this.m[5] - this.m[2] * this.m[4];
        tmp[3] = this.m[5] * this.m[6] - this.m[3] * this.m[8];
        tmp[4] = this.m[0] * this.m[8] - this.m[2] * this.m[6];
        tmp[5] = this.m[2] * this.m[3] - this.m[0] * this.m[5];
        tmp[6] = this.m[3] * this.m[7] - this.m[4] * this.m[6];
        tmp[7] = this.m[1] * this.m[6] - this.m[0] * this.m[7];
        tmp[8] = this.m[0] * this.m[4] - this.m[1] * this.m[3];

        // check determinant if it is 0
        det = this.m[0] * tmp[0] + this.m[1] * tmp[3] + this.m[2] * tmp[6];
        if(Math.abs(det) <= 0.00001)
            throw "Matrix3 is not invertible.";

        // divide by the determinant
        det = 1.0 / det;
        this.m[0] = det * tmp[0];
        this.m[1] = det * tmp[1];
        this.m[2] = det * tmp[2];
        this.m[3] = det * tmp[3];
        this.m[4] = det * tmp[4];
        this.m[5] = det * tmp[5];
        this.m[6] = det * tmp[6];
        this.m[7] = det * tmp[7];
        this.m[8] = det * tmp[8];

        return this;
    },
    multiply: function(b)
    {
        let a = this.clone();
        this.m[0] = a.m[0]*b.m[0] + a.m[3]*b.m[1] + a.m[6]*b.m[2];
        this.m[1] = a.m[1]*b.m[0] + a.m[4]*b.m[1] + a.m[7]*b.m[2];
        this.m[2] = a.m[2]*b.m[0] + a.m[5]*b.m[1] + a.m[8]*b.m[2];
        this.m[3] = a.m[0]*b.m[3] + a.m[3]*b.m[4] + a.m[6]*b.m[5];
        this.m[4] = a.m[1]*b.m[3] + a.m[4]*b.m[4] + a.m[7]*b.m[5];
        this.m[5] = a.m[2]*b.m[3] + a.m[5]*b.m[4] + a.m[8]*b.m[5];
        this.m[6] = a.m[0]*b.m[6] + a.m[3]*b.m[7] + a.m[6]*b.m[8];
        this.m[7] = a.m[1]*b.m[6] + a.m[4]*b.m[7] + a.m[7]*b.m[8];
        this.m[8] = a.m[2]*b.m[6] + a.m[5]*b.m[7] + a.m[8]*b.m[8];
        return this;
    },
    transform: function(v)
    {
        let vec3 = new Vector3();
        vec3.x = this.m[0] * v.x + this.m[3] * v.y + this.m[6] * v.z;
        vec3.y = this.m[1] * v.x + this.m[4] * v.y + this.m[7] * v.z;
        vec3.z = this.m[2] * v.x + this.m[5] * v.y + this.m[8] * v.z;
        return vec3;
    },
    toString: function()
    {
        return "===== Matrix3 =====\n" +
            "| " + this.m[0].toFixed(3) + " " + this.m[3].toFixed(3) + " " + this.m[6].toFixed(3) + " |\n" +
            "| " + this.m[1].toFixed(3) + " " + this.m[4].toFixed(3) + " " + this.m[7].toFixed(3) + " |\n" +
            "| " + this.m[2].toFixed(3) + " " + this.m[5].toFixed(3) + " " + this.m[8].toFixed(3) + " |\n";
    }
};



///////////////////////////////////////////////////////////////////////////////
// 4x4 Matrix
///////////////////////////////////////////////////////////////////////////////
let Matrix4 = function(m0,m1,m2,m3, m4,m5,m6,m7, m8,m9,m10,m11, m12,m13,m14,m15)
{
    this.m = new Float32Array(16);
    this.set(m0,m1,m2,m3, m4,m5,m6,m7, m8,m9,m10,m11, m12,m13,m14,m15);
};
Matrix4.prototype =
{
    set: function(m0=1,m1=0,m2=0,m3=0, m4=0,m5=1,m6=0,m7=0, m8=0,m9=0,m10=1,m11=0, m12=0,m13=0,m14=0,m15=1)
    {
        this.m[0] = m0;  this.m[4] = m4;  this.m[8] = m8;   this.m[12] = m12;
        this.m[1] = m1;  this.m[5] = m5;  this.m[9] = m9;   this.m[13] = m13;
        this.m[2] = m2;  this.m[6] = m6;  this.m[10]= m10;  this.m[14] = m14;
        this.m[3] = m3;  this.m[7] = m7;  this.m[11]= m11;  this.m[15] = m15;
        return this;
    },
    clone: function()
    {
        let mat = new Matrix4(this.m[0], this.m[1], this.m[2], this.m[3],
                              this.m[4], this.m[5], this.m[6], this.m[7],
                              this.m[8], this.m[9], this.m[10],this.m[11],
                              this.m[12],this.m[13],this.m[14],this.m[15]);
        return mat;
    },
    identity: function()
    {
        this.m[0] = 1;  this.m[4] = 0;  this.m[8] = 0;  this.m[12] = 0;
        this.m[1] = 0;  this.m[5] = 1;  this.m[9] = 0;  this.m[13] = 0;
        this.m[2] = 0;  this.m[6] = 0;  this.m[10]= 1;  this.m[14] = 0;
        this.m[3] = 0;  this.m[7] = 0;  this.m[11]= 0;  this.m[15] = 1;
        return this;
    },
    transpose: function()
    {
        let tmp;
        tmp = this.m[1];  this.m[1] = this.m[4];  this.m[4] = tmp;
        tmp = this.m[2];  this.m[2] = this.m[8];  this.m[8] = tmp;
        tmp = this.m[3];  this.m[3] = this.m[12]; this.m[12]= tmp;
        tmp = this.m[6];  this.m[6] = this.m[9];  this.m[9] = tmp;
        tmp = this.m[7];  this.m[7] = this.m[13]; this.m[13]= tmp;
        tmp = this.m[11]; this.m[11]= this.m[14]; this.m[14]= tmp;
        return this;
    },
    getLeftAxis: function()
    {
        return new Vector3(this.m[0], this.m[1], this.m[2]);
    },
    getUpAxis: function()
    {
        return new Vector3(this.m[4], this.m[5], this.m[6]);
    },
    getForwardAxis: function()
    {
        return new Vector3(this.m[8], this.m[9], this.m[10]);
    },
    getRotationMatrix: function()
    {
        let l = new Vector3(this.m[0], this.m[1], this.m[2]);
        let u = new Vector3(this.m[4], this.m[5], this.m[6]);
        let f = new Vector3(this.m[8], this.m[9], this.m[10]);
        l.normalize();
        u.normalize();
        f.normalize();
        return new Matrix4(l.x, l.y, l.z, 0,
                           u.x, u.y, u.z, 0,
                           f.x, f.y, f.z, 0,
                           0,   0,   0,   1);
    },
    // return radian
    getAngle: function()
    {
        const EPSILON = 0.00001;

        let yaw = Math.asin(this.m[8]);
        if(this.m[10] < 0)
        {
            if(yaw >= 0) yaw = Math.PI - yaw;
            else         yaw =-Math.PI - yaw;
        }

        let roll, pitch;
        if(this.m[0] > -EPSILON && this.m[0] < EPSILON)
        {
            roll  = 0;  //@@ assume roll=0
            pitch = Math.atan2(this.m[1], this.m[5]);
        }
        else
        {
            roll  = Math.atan2(-this.m[4], this.m[0]);
            pitch = Math.atan2(-this.m[9], this.m[10]);
        }
        return new Vector3(pitch, yaw, roll);
    },
    getAngleDegree: function()
    {
        let a = this.getAngle();
        a.x = rad2deg(a.x);
        a.y = rad2deg(a.y);
        a.z = rad2deg(a.z);
        return a;
    },
    getTranslation: function()
    {
        return new Vector3(this.m[12], this.m[13], this.m[14]);
    },
    getRow: function(row)
    {
        return new Vector4(this.m[row], this.m[4+row], this.m[8+row], this.m[12+row]);
    },
    getColumn: function(col)
    {
        let i = col * 4;
        return new Vector4(this.m[i], this.m[i+1], this.m[i+2], this.m[i+3]);
    },
    setRow: function(row, v)
    {
        this.m[row]    = v.x;
        this.m[4+row]  = v.y;
        this.m[8+row]  = v.z;
        if(v instanceof Vector4)
            this.m[12+row] = v.w;
        return this;
    },
    setColumn: function(col, v)
    {
        let i = col * 4;
        this.m[i]   = v.x;
        this.m[i+1] = v.y;
        this.m[i+2] = v.z;
        if(v instanceof Vector4)
            this.m[i+3] = v.w;
        return this;
    },
    setLeftAxis: function(x, y, z)
    {
        this.m[0] = x;
        this.m[1] = y;
        this.m[2] = z;
        return this;
    },
    setUpAxis: function(x, y, z)
    {
        this.m[4] = x;
        this.m[5] = y;
        this.m[6] = z;
        return this;
    },
    setForwardAxis: function(x, y, z)
    {
        this.m[8] = x;
        this.m[9] = y;
        this.m[10]= z;
        return this;
    },
    setTranslation: function(x, y, z)
    {
        this.m[12]= x;
        this.m[13]= y;
        this.m[14]= z;
        return this;
    },
    invertEuclidean: function()
    {
        let tmp;
        tmp = this.m[1]; this.m[1] = this.m[4]; this.m[4] = tmp;
        tmp = this.m[2]; this.m[2] = this.m[8]; this.m[8] = tmp;
        tmp = this.m[6]; this.m[6] = this.m[9]; this.m[9] = tmp;

        let tx = this.m[12], ty = this.m[13], tz = this.m[14];
        this.m[12] = -(this.m[0] * tx + this.m[4] * ty + this.m[8] * tz);
        this.m[13] = -(this.m[1] * tx + this.m[5] * ty + this.m[9] * tz);
        this.m[14] = -(this.m[2] * tx + this.m[6] * ty + this.m[10]* tz);
        return this;
    },
    ///////////////////////////////////////////////////////////////////////////
    // y = M*x  ->  y = R*x + T  ->  x = R^-1*(y - T)  ->  x = R^-1*y - R^-1*T
    invertAffine: function()
    {
        let m = this.m;

        // R^-1
        let r = new Matrix3(m[0],m[1],m[2], m[4],m[5],m[6], m[8],m[9],m[10]);
        r.invert();
        m[0] = r.m[0];  m[4] = r.m[3];  m[8] = r.m[6];
        m[1] = r.m[1];  m[5] = r.m[4];  m[9] = r.m[7];
        m[2] = r.m[2];  m[6] = r.m[5];  m[10]= r.m[8];

        // -R^-1 * T
        let x = m[12];
        let y = m[13];
        let z = m[14];
        m[12] = -(r.m[0] * x + r.m[3] * y + r.m[6] * z);
        m[13] = -(r.m[1] * x + r.m[4] * y + r.m[7] * z);
        m[14] = -(r.m[2] * x + r.m[5] * y + r.m[8] * z);

        // last row should be unchanged (0,0,0,1)
        //m[3] = m[7] = m[11] = 0.0f;
        //m[15] = 1.0f;
        return this;
    },
    ///////////////////////////////////////////////////////////////////////////
    // compute cofactor
    getCofactor: function(m0,m1,m2, m3,m4,m5, m6,m7,m8)
    {
        return m0 * (m4 * m8 - m5 * m7) -
               m1 * (m3 * m8 - m5 * m6) +
               m2 * (m3 * m7 - m4 * m6);
    },
    ///////////////////////////////////////////////////////////////////////////
    // M^-1 = adj(M) / det(M)
    invertGeneral: function()
    {
        let m = this.m;

        // get cofactors of minor matrices
        let c0 = this.getCofactor(m[5],m[6],m[7], m[9],m[10],m[11], m[13],m[14],m[15]);
        let c1 = this.getCofactor(m[4],m[6],m[7], m[8],m[10],m[11], m[12],m[14],m[15]);
        let c2 = this.getCofactor(m[4],m[5],m[7], m[8],m[9], m[11], m[12],m[13],m[15]);
        let c3 = this.getCofactor(m[4],m[5],m[6], m[8],m[9], m[10], m[12],m[13],m[14]);

        // get determinant
        let det = m[0] * c0 - m[1] * c1 + m[2] * c2 - m[3] * c3;
        if(Math.abs(det) <= 0.00001)
            throw "Matrix4 is not invertible."

        // get rest of cofactors for adj(M)
        let c4 = this.getCofactor(m[1],m[2],m[3], m[9],m[10],m[11], m[13],m[14],m[15]);
        let c5 = this.getCofactor(m[0],m[2],m[3], m[8],m[10],m[11], m[12],m[14],m[15]);
        let c6 = this.getCofactor(m[0],m[1],m[3], m[8],m[9], m[11], m[12],m[13],m[15]);
        let c7 = this.getCofactor(m[0],m[1],m[2], m[8],m[9], m[10], m[12],m[13],m[14]);

        let c8 = this.getCofactor(m[1],m[2],m[3], m[5],m[6], m[7],  m[13],m[14],m[15]);
        let c9 = this.getCofactor(m[0],m[2],m[3], m[4],m[6], m[7],  m[12],m[14],m[15]);
        let c10= this.getCofactor(m[0],m[1],m[3], m[4],m[5], m[7],  m[12],m[13],m[15]);
        let c11= this.getCofactor(m[0],m[1],m[2], m[4],m[5], m[6],  m[12],m[13],m[14]);

        let c12= this.getCofactor(m[1],m[2],m[3], m[5],m[6], m[7],  m[9], m[10],m[11]);
        let c13= this.getCofactor(m[0],m[2],m[3], m[4],m[6], m[7],  m[8], m[10],m[11]);
        let c14= this.getCofactor(m[0],m[1],m[3], m[4],m[5], m[7],  m[8], m[9], m[11]);
        let c15= this.getCofactor(m[0],m[1],m[2], m[4],m[5], m[6],  m[8], m[9], m[10]);

        // inverse matrix = adj(M) / det(M)
        det = 1.0 / det;
        m[0] =  det * c0;   m[4] = -det * c1;   m[8] =  det * c2;   m[12]= -det * c3;
        m[1] = -det * c4;   m[5] =  det * c5;   m[9] = -det * c6;   m[13]=  det * c7;
        m[2] =  det * c8;   m[6] = -det * c9;   m[10]=  det * c10;  m[14]= -det * c11;
        m[3] = -det * c12;  m[7] =  det * c13;  m[11]= -det * c14;  m[15]=  det * c15;

        return this;
    },
    invert: function()
    {
        if(this.m[12] == 0 && this.m[13] == 0 && this.m[14] && this.m[15] == 1)
            return this.invertAffine();
        else
            return this.invertGeneral();
    },
    multiply: function(b)
    {
        let a = this.clone();
        this.m[0] = a.m[0] * b.m[0] + a.m[4] * b.m[1] + a.m[8] * b.m[2] + a.m[12] * b.m[3];
        this.m[1] = a.m[1] * b.m[0] + a.m[5] * b.m[1] + a.m[9] * b.m[2] + a.m[13] * b.m[3];
        this.m[2] = a.m[2] * b.m[0] + a.m[6] * b.m[1] + a.m[10]* b.m[2] + a.m[14] * b.m[3];
        this.m[3] = a.m[3] * b.m[0] + a.m[7] * b.m[1] + a.m[11]* b.m[2] + a.m[15] * b.m[3];
        this.m[4] = a.m[0] * b.m[4] + a.m[4] * b.m[5] + a.m[8] * b.m[6] + a.m[12] * b.m[7];
        this.m[5] = a.m[1] * b.m[4] + a.m[5] * b.m[5] + a.m[9] * b.m[6] + a.m[13] * b.m[7];
        this.m[6] = a.m[2] * b.m[4] + a.m[6] * b.m[5] + a.m[10]* b.m[6] + a.m[14] * b.m[7];
        this.m[7] = a.m[3] * b.m[4] + a.m[7] * b.m[5] + a.m[11]* b.m[6] + a.m[15] * b.m[7];
        this.m[8] = a.m[0] * b.m[8] + a.m[4] * b.m[9] + a.m[8] * b.m[10]+ a.m[12] * b.m[11];
        this.m[9] = a.m[1] * b.m[8] + a.m[5] * b.m[9] + a.m[9] * b.m[10]+ a.m[13] * b.m[11];
        this.m[10]= a.m[2] * b.m[8] + a.m[6] * b.m[9] + a.m[10]* b.m[10]+ a.m[14] * b.m[11];
        this.m[11]= a.m[3] * b.m[8] + a.m[7] * b.m[9] + a.m[11]* b.m[10]+ a.m[15] * b.m[11];
        this.m[12]= a.m[0] * b.m[12]+ a.m[4] * b.m[13]+ a.m[8] * b.m[14]+ a.m[12] * b.m[15];
        this.m[13]= a.m[1] * b.m[12]+ a.m[5] * b.m[13]+ a.m[9] * b.m[14]+ a.m[13] * b.m[15];
        this.m[14]= a.m[2] * b.m[12]+ a.m[6] * b.m[13]+ a.m[10]* b.m[14]+ a.m[14] * b.m[15];
        this.m[15]= a.m[3] * b.m[12]+ a.m[7] * b.m[13]+ a.m[11]* b.m[14]+ a.m[15] * b.m[15];
        return this;
    },
    scale: function(x, y, z)
    {
        this.m[0] *= x;  this.m[4] *= x;  this.m[8] *= x;  this.m[12]*= x;
        this.m[1] *= y;  this.m[5] *= y;  this.m[9] *= y;  this.m[13]*= y;
        this.m[2] *= z;  this.m[6] *= z;  this.m[10]*= z;  this.m[14]*= z;
        return this;
    },
    translate: function(x, y, z)
    {
        this.m[0] += this.m[3] *x;  this.m[4] += this.m[7] *x;  this.m[8] += this.m[11]*x;  this.m[12]+= this.m[15]*x;
        this.m[1] += this.m[3] *y;  this.m[5] += this.m[7] *y;  this.m[9] += this.m[11]*y;  this.m[13]+= this.m[15]*y;
        this.m[2] += this.m[3] *z;  this.m[6] += this.m[7] *z;  this.m[10]+= this.m[11]*z;  this.m[14]+= this.m[15]*z;
        return this;
    },
    rotate: function(a, x, y, z)
    {
        let m0 = this.m[0],  m1 = this.m[1],  m2 = this.m[2],
            m4 = this.m[4],  m5 = this.m[5],  m6 = this.m[6],
            m8 = this.m[8],  m9 = this.m[9],  m10= this.m[10],
            m12= this.m[12], m13= this.m[13], m14= this.m[14];
        let s = Math.sin(a), c = Math.cos(a), c1 = (1 - c);
        let r0 = x * x * c1 + c;
        let r1 = x * y * c1 + z * s;
        let r2 = x * z * c1 - y * s;
        let r4 = x * y * c1 - z * s;
        let r5 = y * y * c1 + c;
        let r6 = y * z * c1 + x * s;
        let r8 = x * z * c1 + y * s;
        let r9 = y * z * c1 - x * s;
        let r10= z * z * c1 + c;
        this.m[0] = r0 * m0 + r4 * m1 + r8 * m2;
        this.m[1] = r1 * m0 + r5 * m1 + r9 * m2;
        this.m[2] = r2 * m0 + r6 * m1 + r10* m2;
        this.m[4] = r0 * m4 + r4 * m5 + r8 * m6;
        this.m[5] = r1 * m4 + r5 * m5 + r9 * m6;
        this.m[6] = r2 * m4 + r6 * m5 + r10* m6;
        this.m[8] = r0 * m8 + r4 * m9 + r8 * m10;
        this.m[9] = r1 * m8 + r5 * m9 + r9 * m10;
        this.m[10]= r2 * m8 + r6 * m9 + r10* m10;
        this.m[12]= r0 * m12+ r4 * m13+ r8 * m14;
        this.m[13]= r1 * m12+ r5 * m13+ r9 * m14;
        this.m[14]= r2 * m12+ r6 * m13+ r10* m14;
        return this;
    },
    rotateX: function(a)
    {
        let m1 = this.m[1], m2 = this.m[2],  m5 = this.m[5],  m6 = this.m[6],
            m9 = this.m[9], m10= this.m[10], m13= this.m[13], m14= this.m[14];
        let c = Math.cos(a), s = Math.sin(a);
        this.m[1] = m1 * c + m2 *-s;
        this.m[2] = m1 * s + m2 * c;
        this.m[5] = m5 * c + m6 *-s;
        this.m[6] = m5 * s + m6 * c;
        this.m[9] = m9 * c + m10*-s;
        this.m[10]= m9 * s + m10* c;
        this.m[13]= m13* c + m14*-s;
        this.m[14]= m13* s + m14* c;
        return this;
    },
    rotateY: function(a)
    {
        let m0 = this.m[0], m2 = this.m[2],  m4 = this.m[4],  m6 = this.m[6],
            m8 = this.m[8], m10= this.m[10], m12= this.m[12], m14= this.m[14];
        let c = Math.cos(a), s = Math.sin(a);
        this.m[0] = m0 * c + m2 * s;
        this.m[2] = m0 *-s + m2 * c;
        this.m[4] = m4 * c + m6 * s;
        this.m[6] = m4 *-s + m6 * c;
        this.m[8] = m8 * c + m10* s;
        this.m[10]= m8 *-s + m10* c;
        this.m[12]= m12* c + m14* s;
        this.m[14]= m12*-s + m14* c;
        return this;
    },
    rotateZ: function(a)
    {
        let m0 = this.m[0], m1 = this.m[1], m4 = this.m[4],  m5 = this.m[5],
            m8 = this.m[8], m9 = this.m[9], m12= this.m[12], m13= this.m[13];
        let c = Math.cos(a), s = Math.sin(a);
        this.m[0] = m0 * c + m1 *-s;
        this.m[1] = m0 * s + m1 * c;
        this.m[4] = m4 * c + m5 *-s;
        this.m[5] = m4 * s + m5 * c;
        this.m[8] = m8 * c + m9 *-s;
        this.m[9] = m8 * s + m9 * c;
        this.m[12]= m12* c + m13*-s;
        this.m[13]= m12* s + m13* c;
        return this;
    },
    lookAt: function(tx, ty, tz, ux, uy, uz)
    {
        let f = new Vector3(tx - this.m[12], ty - this.m[13], tz - this.m[14]);
        f.normalize();

        let u = new Vector3(ux || 0, uy || 1, uz || 0);
        if(f.x == 0 && f.z == 0)
        {
            if(f.y > 0) u.set(0, 0, -1);
            else        u.set(0, 0, 1);
        }

        let l = Vector3.cross(u, f);
        l.normalize();
        u = Vector3.cross(f, l);

        this.setLeftAxis(l.x, l.y, l.z);
        this.setUpAxis(u.x, u.y, u.z);
        this.setForwardAxis(f.x, f.y, f.z);
        return this;
    },
    transform: function(v)
    {
        if(v instanceof Vector4)
        {
            let vec4 = new Vector4();
            vec4.x = this.m[0] * v.x + this.m[4] * v.y + this.m[8] * v.z + this.m[12] * v.w;
            vec4.y = this.m[1] * v.x + this.m[5] * v.y + this.m[9] * v.z + this.m[13] * v.w;
            vec4.z = this.m[2] * v.x + this.m[6] * v.y + this.m[10]* v.z + this.m[14] * v.w;
            vec4.w = this.m[3] * v.x + this.m[7] * v.y + this.m[11]* v.z + this.m[15] * v.w;
            return vec4;
        }
        else if(v instanceof Vector3)
        {
            let vec3 = new Vector3();
            vec3.x = this.m[0] * v.x + this.m[4] * v.y + this.m[8] * v.z + this.m[12] * 1;
            vec3.y = this.m[1] * v.x + this.m[5] * v.y + this.m[9] * v.z + this.m[13] * 1;
            vec3.z = this.m[2] * v.x + this.m[6] * v.y + this.m[10]* v.z + this.m[14] * 1;
            return vec3;
        }
        return null;
    },
    toString: function()
    {
        return "===== Matrix4 =====\n" +
            "| " + this.m[0].toFixed(3) + " " + this.m[4].toFixed(3) + " " + this.m[8].toFixed(3) + " " + this.m[12].toFixed(3) + " |\n" +
            "| " + this.m[1].toFixed(3) + " " + this.m[5].toFixed(3) + " " + this.m[9].toFixed(3) + " " + this.m[13].toFixed(3) + " |\n" +
            "| " + this.m[2].toFixed(3) + " " + this.m[6].toFixed(3) + " " + this.m[10].toFixed(3)+ " " + this.m[14].toFixed(3) + " |\n" +
            "| " + this.m[3].toFixed(3) + " " + this.m[7].toFixed(3) + " " + this.m[11].toFixed(3)+ " " + this.m[15].toFixed(3) + " |\n";
    }
};



///////////////////////////////////////////////////////////////////////////
// static utility methods (class methods)
///////////////////////////////////////////////////////////////////////////
Matrix4.lookat = function(position, target, upDir)
{
    //@@ Fix where upDir=forward
    let forward = new Vector3(target.x-position.x, target.y-position.y, target.z-position.z);
    forward.normalize();
    let left = Vector3.cross(upDir, forward).normalize();
    let up = Vector3.cross(forward, left).normalize();

    return new Matrix4(left.x, up.x, forward.x, 0,
                       left.y, up.y, forward.y, 0,
                       left.z, up.z, forward.z, 0,
                       0,      0,    0,         1);
}
Matrix4.makeFrustum = function(l, r, b, t, n, f)
{
    let m = new Matrix4();
    m.m[0]  = 2 * n / (r - l);
    m.m[5]  = 2 * n / (t - b);
    m.m[8]  = (r + l) / (r - l);
    m.m[9]  = (t + b) / (t - b);
    m.m[10] =-(f + n) / (f - n);
    m.m[11] =-1;
    m.m[14] =-(2 * f * n) / (f - n);
    m.m[15] = 0;
    return m;
}
Matrix4.makeOrthographic = function(l, r, b, t, n, f)
{
    let m = new Matrix4();
    m.m[0]  = 2 / (r - l);
    m.m[5]  = 2 / (t - b);
    m.m[10] =-2 / (f - n);
    m.m[12] = -(r + l) / (r - l);
    m.m[13] = -(t + b) / (t - b);
    m.m[14] = -(f + n) / (f - n);
    return m;
}
Matrix4.makePerspective = function(fovY, aspect, n, f)
{
    let tangent = Math.tan(fovY / 2 * Math.PI / 180);
    let height = n * tangent;
    let width = height * aspect;
    return Matrix4.makeFrustum(-width, width, -height, height, n, f);
}
