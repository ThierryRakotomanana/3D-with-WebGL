///////////////////////////////////////////////////////////////////////////////
// MouseState.js
// =============
// state holder of mouse event
//
//  AUTHOR: Song Ho Ahn (song.ahn@gmail.com)
// CREATED: 2011-12-01
// UPDATED: 2020-09-30
//
// Copyright (C) 2011. Song Ho Ahn
///////////////////////////////////////////////////////////////////////////////

let MouseState = function()
{
    this.x = 0;
    this.y = 0;
    this.downX = 0; // x when mouse button down
    this.downY = 0; // y when mouse button down
    this.leftDown = false;
    this.middleDown = false;
    this.rightDown = false;
};
MouseState.prototype =
{
    toString: function()
    {
        let buttons = "";
        if(this.leftDown)
            buttons += "Left ";
        if(this.middleDown)
            buttons += "Middle ";
        if(this.rightDown)
            buttons += "Right";

        return "Position: (" + this.x + ", " + this.y + "),  Button: " + buttons;
    }
};
