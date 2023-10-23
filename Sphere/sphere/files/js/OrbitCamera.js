///////////////////////////////////////////////////////////////////////////////
// OrbitCamera.js
// ==============
// orbit camera class
// It is initialized by lookAt() with 2 points (camera position and target)
// NOTE: Angle values are degree, so must be converted to radian for quaternion
//
//  AUTHOR: Song Ho Ahn (song.ahn@gmail.com)
// CREATED: 2012-01-16
// UPDATED: 2021-07-21
///////////////////////////////////////////////////////////////////////////////

let OrbitCamera = function(px, py, pz, tx, ty, tz)
{
    this.position = new Vector3(0, 0, 0);
    this.target = new Vector3(0, 0, 0);
    this.distance = 0;
    this.angle = new Vector3(0, 0, 0);  // degree
    this.quaternion = new Quaternion(1, 0, 0, 0);
    this.matrix = new Matrix4();
    this.matrixRotation = new Matrix4();

    this.lookAt(px, py, pz, tx, ty, tz); // init

    // for position movement
    this.moving = false;
    this.movingId = 0;
    this.movingTime = 0;
    this.movingFrom = new Vector3();
    this.movingTo = new Vector3();

    // for rotation
    this.rotating = false;
    this.rotatingId = 0;
    this.rotatingTime = 0;
    this.rotatingDuration = 0;
    this.rotatingFrom = new Quaternion(1,0,0,0);
    this.rotatingTo = new Quaternion(1,0,0,0);
    this.rotatingAngleFrom = new Vector3();
    this.rotatingAngleTo = new Vector3();
    this.rotatingSpeed = 0;
    this.rotatingAccel = 0;
    this.rotatingMaxSpeed = 0;
    this.rotatingCallback;

    // for moving forward(+) / backward(-)
    this.forwarding = false;
    this.forwardingId = 0;
    this.forwardingTime = 0;
    this.forwardingDuration = 0;
    this.forwardingFrom = 0;
    this.forwardingTo = 0;
    this.forwardingSpeed = 0;
    this.forwardingAccel = 0;
    this.forwardingMaxSpeed = 0;
    this.forwardingCallback;

    // pan animation
    this.shifting = false;
    this.shiftingId = 0;
    this.shiftingTime = 0;
    this.shiftingDuration = 0;
    this.shiftingFrom = new Vector3();  // direction vector
    this.shiftingTo = new Vector3();
    this.shiftingVector = new Vector3();
    this.shiftingSpeed = 0;
    this.shiftingAccel = 0;
    this.shiftingMaxSpeed = 0;
    this.shiftingCallback;
};

OrbitCamera.prototype =
{
    update: function()
    {
        let l = this.matrixRotation.getLeftAxis();
        let u = this.matrixRotation.getUpAxis();
        let f = this.matrixRotation.getForwardAxis();
        let t = new Vector3(l.x * -this.target.x + u.x * -this.target.y + f.x * -this.target.z,
                            l.y * -this.target.x + u.y * -this.target.y + f.y * -this.target.z,
                            l.z * -this.target.x + u.z * -this.target.y + f.z * -this.target.z - this.distance);

        this.matrix.identity();
        this.matrix.setColumn(0, l);
        this.matrix.setColumn(1, u);
        this.matrix.setColumn(2, f);
        this.matrix.setColumn(3, t);

        // re-compute camera position
        this.computePosition();
        return this.matrix;
    },

    lookAt: function(px=0, py=0, pz=0, tx=0, ty=0, tz=0)
    {
        this.position.set(px, py, pz);
        this.target.set(tx, ty, tz);

        if(px == tx && py == ty && pz == tz)
        {
            this.matrix.identity();
            this.matrix.setColumn(3, new Vector3(-px, -py, -pz));
            this.matrixRotation.identity();
            this.angle.set(0,0,0);
            this.quaternion.set(1,0,0,0);
            return;
        }

        let forward = this.position.clone().subtract(this.target); // pos - target
        this.distance = forward.length();
        forward.scale(1 / this.distance);   // normalize

        let up = new Vector3(0, 1, 0);
        const EPSILON = 0.00001;
        if(Math.abs(forward.x) < EPSILON && Math.abs(forward.z) < EPSILON)
        {
            if(forward.y > 0)
                up.set(0, 0, -1);
            else
                up.set(0, 0, 1);
        }

        let left = Vector3.cross(up, forward);
        left.normalize();

        up = Vector3.cross(forward, left);
        //up.normalize();

        this.matrixRotation.identity();
        this.matrixRotation.setRow(0, left);
        this.matrixRotation.setRow(1, up);
        this.matrixRotation.setRow(2, forward);

        this.matrix.identity();
        this.matrix.setRow(0, left);
        this.matrix.setRow(1, up);
        this.matrix.setRow(2, forward);

        let trans = new Vector3();
        trans.x = this.matrix.m[0]*-px + this.matrix.m[4]*-py + this.matrix.m[8]*-pz;
        trans.y = this.matrix.m[1]*-px + this.matrix.m[5]*-py + this.matrix.m[9]*-pz;
        trans.z = this.matrix.m[2]*-px + this.matrix.m[6]*-py + this.matrix.m[10]*-pz;
        this.matrix.setColumn(3, trans);

        let radian = this.matrixRotation.getAngle();

        // half angles for quaternion
        this.quaternion = Quaternion.toQuaternionFromAngles(radian.x*0.5, radian.y*0.5, radian.z*0.5);

        // camera angle must negate yaw, and convert to degree
        this.angle.x = rad2deg(radian.x);
        this.angle.y = rad2deg(-radian.y);
        this.angle.z = rad2deg(radian.z);
        return this;
    },

    moveTo: function(to, duration, mode, callback)
    {
        if(!duration || duration <= 0)
        {
            this.setPosition(to);
            return;
        }
        mode = mode || AnimationMode.EASE_OUT;
        callback = callback || function(){};

        if(this.movingId != 0)
        {
            let cancelAnimationFrame = getCancelAnimationFrameFunction(window);
            cancelAnimationFrame(this.movingId);
            this.movingId = 0;
        }

        this.movingTime = Date.now();
        this.movingDuration = duration;
        this.movingFrom.set(this.position);
        this.movingTo.set(to);
        let self = this;
        let requestAnimationFrame = getRequestAnimationFrameFunction(window);
        this.movingId = requestAnimationFrame(moveToCallback);
        function moveToCallback()
        {
            let time = Date.now();
            if(time >= (self.movingTime + self.movingDuration))
            {
                self.setPosition(self.movingTo);
                self.movingId = 0;
                callback(self);
                return;
            }

            let t = (time - self.movingTime) / self.movingDuration;
            let p = Vector3.interpolate(self.movingFrom, self.movingTo, t, mode);
            self.setPosition(p);
            self.movingId = requestAnimationFrame(moveToCallback);
        }
        return this;
    },

    moveForward: function(delta, duration, mode, callback)
    {
        if(!duration || duration <= 0)
        {
            this.setDistance(this.distance - delta);
            return;
        }
        mode = mode || AnimationMode.EASE_OUT;
        callback = callback || function(){};

        if(this.forwardingId != 0)
            this.stopForward();

        let self = this;
        this.forwarding = true;
        this.forwardingFrom = this.distance;
        this.forwardingTo = this.distance - delta;
        this.forwardingTime = Date.now();
        this.forwardingDuration = duration;
        let requestAnimationFrame = getRequestAnimationFrameFunction(window);
        this.forwardingId = requestAnimationFrame(moveForwardCallback);
        function moveForwardCallback()
        {
            let time = Date.now();
            if(time >= (self.forwardingTime + self.forwardingDuration))
            {
                self.setDistance(self.forwardingTo);
                self.forwardingId = 0;
                self.forwarding = false;
                callback(self);
                return;
            }

            let t = (time - self.forwardingTime) / self.forwardingDuration;
            let d = interpolate(self.forwardingFrom, self.forwardingTo, t, mode);
            self.setDistance(d);
            self.forwardingId = requestAnimationFrame(moveForwardCallback);
        }
        return this;
    },

    startForward: function(speed, accel)
    {
        if(this.forwarding)
        {
            this.forwardingMaxSpeed = speed;
            this.forwardingAccel = accel;
            return;
        }

        let self = this;
        this.forwarding = true;
        this.forwardingSpeed = 0;
        this.forwardingMaxSpeed = speed;
        this.forwardingAccel = accel;
        this.forwardingTime = Date.now();
        let requestAnimationFrame = getRequestAnimationFrameFunction(window);
        requestAnimationFrame(function(){OrbitCamera.forwardCallback(self);});
        return this;
    },

    stopForward: function(callback)
    {
        this.forwarding = false;
        this.forwardingCallback = callback || function(){};
        if(this.forwardingId != 0)
        {
            let cancelAnimationFrame = getCancelAnimationFrameFunction(window);
            cancelAnimationFrame(this.forwardingId);
            this.forwardingId = 0;
        }
        return this;
    },

    shiftTo: function(to, duration, mode, callback)
    {
        if(!duration || duration <= 0)
        {
            this.setTarget(to);
            return;
        }
        mode = mode || AnimationMode.EASE_OUT;
        callback = callback || function(){};

        if(this.shiftingId != 0)
        {
            this.stopShift();
            this.shiftingDuration = duration + (Date.now() - this.shiftingTime);
        }
        else
        {
            this.shiftingTime = Date.now();
            this.shiftingDuration = duration;
        }

        this.shifting = true
        this.shiftingFrom.set(this.target);
        this.shiftingTo.set(to);
        let self = this;
        let requestAnimationFrame = getRequestAnimationFrameFunction(window);
        this.shiftingId = requestAnimationFrame(shiftToCallback);
        function shiftToCallback()
        {
            let time = Date.now();
            if(time >= (self.shiftingTime + self.shiftingDuration))
            {
                self.setTarget(self.shiftingTo);
                self.shiftingId = 0;
                self.shifting = false;
                callback(self);
                return;
            }

            let t = (time - self.shiftingTime) / self.shiftingDuration;
            let v = Vector3.interpolate(self.shiftingFrom, self.shiftingTo, t, mode);
            self.setTarget(v);
            self.shiftingId = requestAnimationFrame(shiftToCallback);
        }
        return this;
    },

    shift: function(delta, duration, mode, callback)
    {
        let l = new Vector3(-this.matrix.m[0], -this.matrix.m[4], -this.matrix.m[8]);
        let u = new Vector3(-this.matrix.m[1], -this.matrix.m[5], -this.matrix.m[9]);

        let v = l.clone().scale(delta.x);
        v.add(u.clone().scale(-delta.y));

        // find new target position
        v.add(this.target);

        this.shiftTo(v, duration, mode);
        return this;
    },

    startShift: function(dir, accel)
    {
        let l = new Vector3(-this.matrix.m[0], -this.matrix.m[4], -this.matrix.m[8]);
        let u = new Vector3(-this.matrix.m[1], -this.matrix.m[5], -this.matrix.m[9]);

        let v = l.clone().scale(dir.x);
        v.add(u.clone().scale(-dir.y));
        v.normalize();

        if(this.shifting)
        {
            this.shiftingVector.set(v);
            this.shiftingMaxSpeed = dir.length();
            this.shiftingAccel = accel;
            return;
        }

        let self = this;
        this.shifting = true;
        this.shiftingVector = v;
        this.shiftingSpeed = 0;
        this.shiftingMaxSpeed = dir.length();
        this.shiftingAccel = accel;
        this.shiftingTime = Date.now();
        let requestAnimationFrame = getRequestAnimationFrameFunction(window);
        requestAnimationFrame(function(){OrbitCamera.shiftCallback(self);});
        return this;
    },

    stopShift: function(callback)
    {
        this.shifting = false;
        this.shiftingCallback = callback || function(){};
        if(this.shiftingId != 0)
        {
            let cancelAnimationFrame = getCancelAnimationFrameFunction(window);
            cancelAnimationFrame(this.shiftingId);
            this.shiftingId = 0;
        }
        return this;
    },

    rotateTo: function(to, duration, mode, callback)
    {
        if(to instanceof Quaternion)
            this.rotateToByQuaternion(to, duration, mode, callback);
        else
            this.rotateToByAngle(to, duration, mode, callback);
        return this;
    },

    rotateToByQuaternion: function(to, duration, mode, callback)
    {
        if(!duration || duration <= 0)
        {
            this.setRotationByQuaternion(to);
            return;
        }
        mode = mode || AnimationMode.EASE_OUT;
        callback = callback || function(){};

        if(this.rotating)
        {
            this.stopRotate();
            this.rotatingDuration = duration + (Date.now() - this.rotatingTime);
        }
        else
        {
            this.rotatingTime = Date.now();
            this.rotatingDuration = duration;
        }

        this.rotating = true;
        this.rotatingFrom.set(this.quaternion);
        this.rotatingTo.set(to);
        let requestAnimationFrame = getRequestAnimationFrameFunction(window);
        this.rotatingId = requestAnimationFrame(rotateToCallback);
        let self = this;
        function rotateToCallback()
        {
            let time = Date.now();
            if(time >= (self.rotatingTime + self.rotatingDuration))
            {
                self.setRotationByQuaternion(self.rotatingTo);
                self.rotatingId = 0;
                self.rotating = false;
                callback(self);
                return;
            }

            let alpha = (time - self.rotatingTime) / self.rotatingDuration;
            let q = Quaternion.slerp(self.rotatingFrom, self.rotatingTo, alpha, mode);
            self.setRotationByQuaternion(q);
            self.rotatingId = requestAnimationFrame(rotateToCallback);
        }
        return this;
    },

    rotateToByAngle: function(to, duration, mode, callback)
    {
        if(!duration || duration <= 0)
        {
            this.setRotationByAngle(to);
            return;
        }

        mode = mode || AnimationMode.EASE_OUT;
        callback = callback || function(){};

        if(this.rotating)
        {
            this.stopRotate();
            this.rotatingDuration = duration + (Date.now() - this.rotatingTime);
        }
        else
        {
            this.rotatingTime = Date.now();
            this.rotatingDuration = duration;
        }

        this.rotating = true;
        this.rotatingAngleFrom.set(this.angle);
        this.rotatingAngleTo.set(to);
        let requestAnimationFrame = getRequestAnimationFrameFunction(window);
        this.rotatingId = requestAnimationFrame(rotateToCallback);
        let self = this;
        function rotateToCallback()
        {
            let time = Date.now();
            if(time >= (self.rotatingTime + self.rotatingDuration))
            {
                self.setRotationByAngle(self.rotatingAngleTo);
                self.rotatingId = 0;
                self.rotating = false;
                callback(self);
                return;
            }

            let t = (time - self.rotatingTime) / self.rotatingDuration;
            let to = self.rotatingAngleTo.clone();
            let d = self.rotatingAngleTo.clone().subtract(self.rotatingAngleFrom);
            if(d.x > 180)       to.x -= 360;
            else if(d.x < -180) to.x += 360;
            if(d.y > 180)       to.y -= 360;
            else if(d.y < -180) to.y += 360;
            if(d.z > 180)       to.z -= 360;
            else if(d.z < -180) to.z += 360;

            let a = Vector3.interpolate(self.rotatingAngleFrom, to, t, mode);
            //let a = Vector3.interpolate(self.rotatingAngleFrom, self.rotatingAngleTo, t, mode);
            self.setRotationByAngle(a);
            self.rotatingId = requestAnimationFrame(rotateToCallback);
        }
        return this;
    },

    startRotate: function(delta)
    {
        let to;
        if(delta instanceof Quaternion)
        {
        }
        else
        {
        }
        return this;
    },

    stopRotate: function(callback)
    {
        this.rotating = false;
        this.rotatingCallback = callback || function(){};
        if(this.rotatingId != 0)
        {
            let cancelAnimationFrame = getCancelAnimationFrameFunction(window);
            cancelAnimationFrame(this.rotatingId);
            this.rotatingId = 0;
        }
        return this;
    },

    // it updates angle, quaternion, matrix, matrixRotation, position
    setRotationByAngle: function(angle)
    {
        let sx, sy, sz, cx, cy, cz, theta;

        let a = new Vector3(normalizeDegree(angle.x), normalizeDegree(angle.y), normalizeDegree(angle.z));
        this.angle.set(a);
        a.x = deg2rad(a.x);
        a.y = deg2rad(a.y);
        a.z = deg2rad(a.z);
        this.quaternion = Quaternion.toQuaternionFromAngles(a.x, -a.y, a.z);

        sx = Math.sin(a.x);
        cx = Math.cos(a.x);

        sy = Math.sin(-a.y);
        cy = Math.cos(-a.y);

        sz = Math.sin(a.z);
        cz = Math.cos(a.z);

        this.matrixRotation.setLeftAxis(cy*cz, sx*sy*cz + cx*sz, -cx*sy*cz + sx*sz);
        this.matrixRotation.setUpAxis(-cy*sz, -sx*sy*sz + cx*cz, cx*sy*sz + sx*cz);
        this.matrixRotation.setForwardAxis(sy, -sx*cy, cx*cy);
        this.update();
        return this;
    },

    // it updates quaternion, matrix, matrixRotation, angle (degree)
    setRotationByQuaternion: function(q)
    {
        this.quaternion.set(q);
        this.matrixRotation = q.toMatrix();
        let a = this.matrixRotation.getAngle();
        this.angle.x = rad2deg(a.x);
        this.angle.y = rad2deg(-a.y);
        this.angle.z = rad2deg(a.z);
        this.update();
        return this;
    },

    setPosition: function(x, y, z)
    {
        if(x instanceof Vector3)
            this.lookAt(x.x, x.y, x.z, this.target.x, this.target.y, this.target.z);
        else
            this.lookAt(x, y, z, this.target.x, this.target.y, this.target.z);
        return this;
    },

    setTarget: function(x, y, z)
    {
        if(x instanceof Vector3)
            this.target.set(x.x, x.y, x.z);
        else
            this.target.set(x, y, z);
        this.update();
        return this;
    },

    setDistance: function(d)
    {
        this.distance = d;
        this.update();
        return this;
    },

    setOffset: function(x, y)
    {
        this.offset.set(x, y);
        return this;
    },

    setQuaternion: function(x, y, z, w)
    {
        this.quaternion.set(x, y, z, w);
        return this;
    },

    computePosition: function()
    {
        this.position.x = this.target.x - (this.distance * -this.matrix.m[2]);
        this.position.y = this.target.y - (this.distance * -this.matrix.m[6]);
        this.position.z = this.target.z - (this.distance * -this.matrix.m[10]);
    },

    isAnimating: function()
    {
        return this.moving || this.rotating || this.forwarding || this.forwardingSpeed || this.shifting || this.shiftingSpeed;
    },

    toString: function()
    {
        return "===== OrbitCamera =====\n" +
               "  Position: " + this.position + "\n" +
               "    Target: " + this.target + "\n" +
               "  Distance: " + this.distance + "\n" +
               "     Angle: " + this.angle + "\n" +
               "Quaternion: " + this.quaternion + "\n";
    }
};



///////////////////////////////////////////////////////////////////////////////
// callback for camera shifting animation
///////////////////////////////////////////////////////////////////////////////
OrbitCamera.shiftCallback = function(cam)
{
    let time = Date.now();
    let frameTime = (time - cam.shiftingTime) * 0.001; // delta time per frame in sec
    cam.shiftingTime = time; // for next frame
    cam.shiftingSpeed = adjustSpeed(cam.shifting, cam.shiftingSpeed, cam.shiftingMaxSpeed, cam.shiftingAccel, frameTime);
    let d = cam.shiftingSpeed * frameTime;

    let t = new Vector3();
    t.x = cam.target.x + cam.shiftingVector.x * d;
    t.y = cam.target.y + cam.shiftingVector.y * d;
    t.z = cam.target.z + cam.shiftingVector.z * d;
    cam.setTarget(t);

    // loop
    if(cam.shifting || cam.shiftingSpeed > 0)
    {
        let requestAnimationFrame = getRequestAnimationFrameFunction(window);
        requestAnimationFrame(function(){OrbitCamera.shiftCallback(cam);});
    }
    else if(!cam.shifting && cam.shiftingSpeed == 0)
    {
        cam.shiftingCallback(cam);
    }
};



///////////////////////////////////////////////////////////////////////////////
// callback for moving camera forward/backward animation
///////////////////////////////////////////////////////////////////////////////
OrbitCamera.forwardCallback = function(cam)
{
    let time = Date.now();
    let frameTime = (time - cam.forwardingTime) * 0.001;  // delta time per frame in sec
    cam.forwardingTime = time;    // for next frame
    cam.forwardingSpeed = adjustSpeed(cam.forwarding, cam.forwardingSpeed, cam.forwardingMaxSpeed, cam.forwardingAccel, frameTime);

    cam.setDistance(cam.distance - cam.forwardingSpeed * frameTime);
    cam.update();

    // loop
    if(cam.forwarding || cam.forwardingSpeed != 0)
    {
        let requestAnimationFrame = getRequestAnimationFrameFunction(window);
        requestAnimationFrame(function(){OrbitCamera.forwardCallback(cam);});
    }
    else if(!cam.forwarding && cam.forwardingSpeed == 0)
    {
        cam.forwardingCallback(cam);
    }
};



///////////////////////////////////////////////////////////////////////////////
// callback for rotating animation
///////////////////////////////////////////////////////////////////////////////
OrbitCamera.rotateCallback = function()
{
}
