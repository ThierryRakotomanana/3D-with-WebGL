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

function initShaderProgram(gl, vsSource, fsSource) {
        const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
        const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
    
        // Créer le programme shader
    
        const shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);
    
        // Si la création du programme shader a échoué, alerte
    
        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert(
            "Impossible d'initialiser le programme shader : " +
            gl.getProgramInfoLog(shaderProgram),
        );
        return null;
        }
    
        return shaderProgram;
}
  
  //
  // Crée un shader du type fourni, charge le source et le compile.
  //
function loadShader(gl, type, source) {
  const shader = gl.createShader(type);
    
  // Envoyer le source à l'objet shader

  gl.shaderSource(shader, source);

  // Compiler le programme shader

  gl.compileShader(shader);

  // Vérifier s'il a ét compilé avec succès

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader),);
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

(function init() {
    const canvas = utils.getCanvas("#webgl2");
    gl = utils.getGLContex(canvas);
    // Définir la couleur d'effacement comme étant le noir, complètement opaque
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    // Effacer le tampon de couleur avec la couleur d'effacement spécifiée
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const pointVertices = [
        -0.5,0.5,0.0,
        -0.5,-0.5,0.0,
         0.5,-0.5,0.0,
         0.5,0.5,0.0,

         0.0,0.0,0.5,
         0.0,0.75,0.5,
         0.75,0.75,0.5,
         0.75,0.0,0.5
    ];

    const indexArray = [
        0,1,2,
        0,2,3,

        0,3,5,
        5,3,6,

        3,2,7,
        3,7,6
    ]

    pointBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pointBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pointVertices), gl.STATIC_DRAW);

    indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexArray), gl.STATIC_DRAW);

    // Programme shader de sommet

    const vsSource = `
    attribute vec4 aVertexPosition;

    void main() {
        gl_Position = aVertexPosition;
    }
    `;

    const fsSource = `
    void main() {
        gl_FragColor = vec4(0.5, 1.0, 0.0, 1.0);
    }
    `;
  const shaderProgram = initShaderProgram(gl, vsSource, fsSource);


  gl.useProgram(shaderProgram)
  gl.vertexAttribPointer(gl.getAttribLocation(shaderProgram, "aVertexPosition"), 3, gl.FLOAT, false, 0, 0);

  gl.enableVertexAttribArray(gl.getAttribLocation(shaderProgram, "aVertexPosition"));
  gl.drawElements(gl.TRIANGLES, 18 , gl.UNSIGNED_SHORT, 0);
  
})()