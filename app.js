`use strict`;

const utils = {
    getCanvas(id) {
        const canvas = document.getElementById(id);
        if (!canvas) {
            console.error(`There is no canvas with id ${id} on this page.`);
            return null;
        }
        return canvas;
    },

    getGLContex(canvas) {
        return canvas.getContext("webgl2") || console.error('WebGL2 is not available in your browser.');
    }
};

(function init() {
    const canvas = utils.getCanvas("webgl");
    gl = utils.getGLContex(canvas);
})()