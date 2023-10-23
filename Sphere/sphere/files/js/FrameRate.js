///////////////////////////////////////////////////////////////////////////////
// FrameRate.js
// ============
// It computes FPS and prints it to the specified DOM element (outputNodeId).
// NOTE:
// It requires to call tick() every frame to accumulate frame count.
// You can change the update interval with setUpdateInterval().
//
//  AUTHOR: Song Ho Ahn (song.ahn@gmail.com)
// CREATED: 2011-02-07
// UPDATED: 2021-07-09
///////////////////////////////////////////////////////////////////////////////

let FrameRate = function(outputNodeId)
{
    let element = document.getElementById(outputNodeId);
    if(element)
        this.textNode = element.childNodes[0];
    else
        this.textNode = null;
    this.frameCount = 0;
    this.startTime = Date.now();

    // start time event with default interval
    // remember interval ID to stop this time event
    let self = this;
    this.intervalId = setInterval(function(){self.print();}, 1000);
};
FrameRate.prototype =
{
    ///////////////////////////////////////////////////////////////////////////
    // print fps text
    print: function()
    {
        if(!this.textNode) return;
        let fps = this.frameCount * 1000 / (Date.now() - this.startTime);
        this.textNode.nodeValue = fps.toFixed(1) + " FPS";
        // reset
        this.startTime = Date.now();
        this.frameCount = 0;
    },
    toString: function()
    {
        let fps = this.frameCount * 1000 / (Date.now() - this.startTime);
        return "FrameRate(" + fps.toFixed(1) + " FPS)";
    },
    ///////////////////////////////////////////////////////////////////////////
    // should be called every frame to compute accurate frame rate
    tick: function()
    {
        this.frameCount++;
    },
    ///////////////////////////////////////////////////////////////////////////
    // set update interval
    setUpdateInterval: function(interval)
    {
        clearInterval(this.intervalId); // stop prev interval
        // restart interval with new interval
        let self = this;
        this.intervalId = setInterval(function(){self.print();}, interval);
        return this;
    }
};
