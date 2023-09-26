`use strict`;

const utils = {
    getCanvas(id) {
        const canvas = document.querySelector(`.${id}`);
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
    // Définir la couleur d'effacement comme étant le noir, complètement opaque
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    // Effacer le tampon de couleur avec la couleur d'effacement spécifiée
    console.log(gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT));
/*
    vertex_shader = 
    ` void main() {
        gl_Position = vect4(0.0, 0.0, 0.0, 1.0);
        gl_PointSize = 10.0;
    }
    `
    fragment_shader = 
    ` void main() {
        gl_FragColor = vect(0.0, 0.0, 0.0, 1.0);
    }
    `
    vertexShader = gl.getShader()
    frameShader = gl.getShader()
    */

    const vertices = [
        -0.5, 0.5, 0,
        -0.5, -0.5, 0,
        0.5, -0.5, 0,
        0.5, 0.5, 0
    ];
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    indices = [0,1,2,0,2,3];

    indexBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW)

    //clean

    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
})()