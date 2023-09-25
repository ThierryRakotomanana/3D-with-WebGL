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
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Définir les vertices d'une sphère
        const positions = [];
        const numSegments = 256*8; // Le nombre de segments pour la sphère

        for (let lat = 0; lat <= numSegments; lat++) {
            const theta = (lat * Math.PI) / numSegments;
            const sinTheta = Math.sin(theta);
            const cosTheta = Math.cos(theta);

            for (let long = 0; long <= numSegments; long++) {
                const phi = (long * 2 * Math.PI) / numSegments;
                const sinPhi = Math.sin(phi);
                const cosPhi = Math.cos(phi);

                const x = cosPhi * sinTheta;
                const y = cosTheta;
                const z = sinPhi * sinTheta;

                positions.push(x, y, z);
            }
        }

        // Créer un tampon pour les positions
        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

        // Créer un programme WebGL
        const vertexShaderSource = `
            // Vertex Shader
            attribute vec3 aPosition;
            void main(void) {
                gl_Position = vec4(aPosition, 1.0);
            }
        `;

        const fragmentShaderSource = `
            // Fragment Shader
            void main(void) {
                gl_FragColor = vec4(0.0, 0.0, 0.7, 1.0); // Rouge
            }
        `;

        const vertexShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertexShader, vertexShaderSource);
        gl.compileShader(vertexShader);

        const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragmentShader, fragmentShaderSource);
        gl.compileShader(fragmentShader);

        const shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);
        gl.useProgram(shaderProgram);

        // Lier le tampon de position au programme
        const positionAttributeLocation = gl.getAttribLocation(shaderProgram, 'aPosition');
        gl.enableVertexAttribArray(positionAttributeLocation);
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);

        // Dessiner la sphère
        const numVertices = positions.length / 3;
        gl.drawArrays(gl.POINTS, 0, numVertices);
})()