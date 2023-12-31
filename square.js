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
   // Définir les vertices d'une sphère
    // Vertex shader source code
    const vsSource = `
    attribute vec4 aVertexPosition;
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    void main(void) {
        gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
    }
`;

// Fragment shader source code
const fsSource = `
    void main(void) {
        gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); // Red color
    }
`;

// Compile and link shaders
function initShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        console.error("Unable to initialize the shader program");
        return null;
    }

    return shaderProgram;
}

// Create a shader
function loadShader(gl, type, source) {
    const shader = gl.createShader(type);

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

// Define the sphere's vertices
const vertices = [];
const radius = 1.0;
const latitudes = 16;
const longitudes = 32;

for (let lat = 0; lat <= latitudes; lat++) {
    const theta = (lat * Math.PI) / latitudes;
    const sinTheta = Math.sin(theta);
    const cosTheta = Math.cos(theta);

    for (let long = 0; long <= longitudes; long++) {
        const phi = (long * 2 * Math.PI) / longitudes;
        const sinPhi = Math.sin(phi);
        const cosPhi = Math.cos(phi);

        const x = cosPhi * sinTheta;
        const y = cosTheta;
        const z = sinPhi * sinTheta;
        const u = 1 - (long / longitudes);
        const v = 1 - (lat / latitudes);

        vertices.push(x * radius, y * radius, z * radius, u, v);
    }
}

const indices = [];
for (let lat = 0; lat < latitudes; lat++) {
    for (let long = 0; long < longitudes; long++) {
        const first = lat * (longitudes + 1) + long;
        const second = first + longitudes + 1;
        indices.push(first, second, first + 1, second, second + 1, first + 1);
    }
}

const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

const indexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

const positionAttributeLocation = gl.getAttribLocation(shaderProgram, "aVertexPosition");
gl.enableVertexAttribArray(positionAttributeLocation);
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 5 * Float32Array.BYTES_PER_ELEMENT, 0);

const texCoordAttributeLocation = gl.getAttribLocation(shaderProgram, "aTextureCoord");
gl.enableVertexAttribArray(texCoordAttributeLocation);
gl.vertexAttribPointer(texCoordAttributeLocation, 2, gl.FLOAT, false, 5 * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT);

const projectionMatrix = new Float32Array(16);
const modelViewMatrix = new Float32Array(16);

const projectionMatrixLocation = gl.getUniformLocation(shaderProgram, "uProjectionMatrix");
const modelViewMatrixLocation = gl.getUniformLocation(shaderProgram, "uModelViewMatrix");

// Set up the projection matrix
mat4.perspective(projectionMatrix, 45 * (Math.PI / 180), canvas.width / canvas.height, 0.1, 100.0);
gl.uniformMatrix4fv(projectionMatrixLocation, false, projectionMatrix);

// Set up the model-view matrix
mat4.identity(modelViewMatrix);
mat4.translate(modelViewMatrix, modelViewMatrix, [0.0, 0.0, -5.0]);
gl.uniformMatrix4fv(modelViewMatrixLocation, false, modelViewMatrix);

// Rendering function
function drawScene() {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.useProgram(shaderProgram);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

    requestAnimationFrame(drawScene);
}

drawScene();

})()