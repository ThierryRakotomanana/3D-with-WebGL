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
    gl.clear(gl.COLOR_BUFFER_BIT || gl.DEPTH_BUFFER_BIT);
    const vertices = [
        -0.5, 0.5, 0,
        -0.5, -0.5, 0,
        0.5, -0.5, 0,
        0.5, 0.5, 0
        ];
        // Indices defined in counter-clockwise order
        indices = [0, 1, 2, 0, 2, 3];
        // Setting up the VBO
        squareVertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), 
        gl.STATIC_DRAW);
        // Setting up the IBO
        squareIndexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, squareIndexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), 
        gl.STATIC_DRAW);
        // Clean
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
})()