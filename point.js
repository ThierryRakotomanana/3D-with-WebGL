`use strict`;

const utils = {
    getCanvas(id) {
        const canvas = document.querySelector(`${id}`);
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
    const canvas = utils.getCanvas("#webgl2");
    gl = utils.getGLContex(canvas);
    // Définir la couleur d'effacement comme étant le noir, complètement opaque
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    // Effacer le tampon de couleur avec la couleur d'effacement spécifiée
    console.log(gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT));
})()