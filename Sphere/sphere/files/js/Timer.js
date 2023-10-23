///////////////////////////////////////////////////////////////////////////////
// Timer.js
// ========
// Timer class to measure elapsed time in millisec
//
//  AUTHOR: Song Ho Ahn (song.ahn@gmail.com)
// CREATED: 2011-02-01
// UPDATED: 2020-09-30
//////////////////////////////////////////////////////////////////////////////
let Timer = function()
{
    this.startTime = 0;
    this.endTime = 0;
    this.prevTime = 0;      // for frame time
    this.stopped = true;
};
Timer.prototype =
{
    start: function()
    {
        this.startTime = this.endTime = Date.now();
        this.prevTime = this.startTime;
        this.stopped = false;
    },
    stop: function()
    {
        this.endTime = Date.now();
        this.prevTime = 0;
        this.stopped = true;
    },
    getTime: function()
    {
        if(!this.stopped)
            this.endTime = Date.now();

        return this.endTime - this.startTime;
    },
    ///////////////////////////////////////////////////////////////////////////
    // getFrameTime() should not be affected by getTime()
    // So, it uses additional variable to remember the previous time
    getFrameTime: function()
    {
        // if timer is not started. return 0
        if(this.prevTime == 0) return 0;

        let currTime = Date.now();
        let frameTime = currTime - this.prevTime;
        this.prevTime = currTime;   // remember for next frame time
        return frameTime;
    }
};



