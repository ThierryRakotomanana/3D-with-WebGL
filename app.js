`use strict`

(function init() {
    const canvas = document.querySelector(".webgl");
    const gl = canvas.getContext("webgl2");
    console.log(gl)
    if(!gl) {
        throw new Error("WebGk not supported");
    }
})()