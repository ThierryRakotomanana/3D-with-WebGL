`use strict`;

const utils = {
    getCanvas(id) {
        return document.querySelector(".webgl");
    },

    getGLContex(canvas) {
        return canvas.getContext("webgl2");
    }
};

(function init() {
    const canvas = utils.getCanvas("webgl");
    gl = utils.getGLContex(canvas);
    console.log(gl)
})()