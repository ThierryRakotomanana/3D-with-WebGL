const canvas = document.querySelector(".canvas");
const gl = canvas.getContext("webgl2")

if(!gl){
    throw new Error("WebGk not supported");
}