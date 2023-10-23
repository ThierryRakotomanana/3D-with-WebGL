///////////////////////////////////////////////////////////////////////////////
// ShaderManager.js
// ================
// GLSL shader container
//
//  AUTHOR: Song Ho Ahn (song.ahn@gmail.com)
// CREATED: 2012-07-25
// UPDATED: 2020-09-30
///////////////////////////////////////////////////////////////////////////////

let ShaderManager = function(gl)
{
    this.gl = gl;
    if(!gl)
        log("[ERROR] ShaderManager.contructor requires GL context as a param.");

    this.programs = {}; // associative array (key, value)
    this.count = 0;
};

ShaderManager.prototype =
{
    ///////////////////////////////////////////////////////////////////////////
    // load shader file
    // it returns promise object
    ///////////////////////////////////////////////////////////////////////////
    load: function(vertUrl, fragUrl, key)
    {
        // if Id is not defined, use file name
        if(!key)
            key = vertUrl.substring(vertUrl.lastIndexOf("/")+1, vertUrl.lastIndexOf("."));

        // add null program to list
        this.programs[key] = null;
        this.count++;

        let files = [vertUrl, fragUrl];
        let self = this;
        return Promise.all(files.map(this.loadShaderSource)).then(sources =>
        {
            // create GLSL shader and program from sources
            let program = self.createProgram(sources[0], sources[1]);
            if(program)
            {
                // if deleted before, increment counter
                if(typeof self.programs[key] === "undefined")
                    self.count++;
                self.programs[key] = program;
            }
            else
                self.removeProgram(key);
            return program;
        }).catch(e =>
        {
            // if failed, remove it
            self.removeProgram(key);
            return null;
        });
    },

    ///////////////////////////////////////////////////////////////////////////
    // load shader source, it returns promise
    ///////////////////////////////////////////////////////////////////////////
    loadShaderSource: function(url)
    {
        return new Promise((resolve, reject) =>
        {
            let xhr = new XMLHttpRequest();
            xhr.open("GET", url);
            xhr.send();
            xhr.onload = () =>
            {
                if(xhr.status == 200)
                {
                    //log("Loaded glsl file: " + url.substring(url.lastIndexOf("/")+1));
                    resolve(xhr.response);
                }
                else
                {
                    let message = "[ERROR] Failed to load glsl file(" + xhr.status + "): " + url.substring(url.lastIndexOf("/")+1);
                    //log(message);
                    reject(message);
                }
            };
            xhr.onerror = () => reject("[ERROR] Failed to load glsl file: " + url);
        });
    },

    ///////////////////////////////////////////////////////////////////////////
    // create GLSL shader program
    ///////////////////////////////////////////////////////////////////////////
    createProgram: function(vertSource, fragSource)
    {
        let gl = this.gl;

        // create OpenGL shader
        let vertShader = gl.createShader(gl.VERTEX_SHADER);
        let fragShader = gl.createShader(gl.FRAGMENT_SHADER);

        // attach shader source to the shader and compile
        gl.shaderSource(vertShader, vertSource);
        gl.compileShader(vertShader);
        if(!gl.getShaderParameter(vertShader, gl.COMPILE_STATUS))
        {
            log("[ERROR] " + gl.getShaderInfoLog(vertShader));
            return null;
        }
        gl.shaderSource(fragShader, fragSource);
        gl.compileShader(fragShader);
        if(!gl.getShaderParameter(fragShader, gl.COMPILE_STATUS))
        {
            log("[ERROR] " + gl.getShaderInfoLog(fragShader));
            return null;
        }

        // create a program object and attach shader objects to it
        let program = gl.createProgram();
        gl.attachShader(program, vertShader);
        gl.attachShader(program, fragShader);
        gl.deleteShader(vertShader);
        gl.deleteShader(fragShader);
        program.uniform = [];
        program.attribute = [];

        // link
        gl.linkProgram(program);
        if(!gl.getProgramParameter(program, gl.LINK_STATUS))
        {
            log("[ERROR] Failed to initialize GLSL: " + gl.getProgramInfoLog(program));
            return null;
        }

        // add uniform locations
        let i;
        let count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
        for(i = 0; i < count; ++i)
        {
            let info = gl.getActiveUniform(program, i); // return WebGLActiveInfo (name, type, size)
            let structName;
            let memberName;
            let dotPos = info.name.indexOf(".");

            if(dotPos >= 0) // it is struct var
            {
                structName = info.name.substring(0, dotPos);
                memberName = info.name.substring(dotPos+1);
                if(program.uniform[structName] === undefined)
                    program.uniform[structName] = {};
                program.uniform[structName][memberName] = gl.getUniformLocation(program, info.name);
                //log(info.name + " = " + program.uniform[structName][memberName]);
                //log("struct: " + program.uniform.pointLight.position);
            }
            else
            {
                //program["u_"+info.name] = gl.getUniformLocation(program, info.name);
                program.uniform[info.name] = gl.getUniformLocation(program, info.name);
            }
            //log("UNIFORM: " + info.name + " = " + program.uniform[info.name]);
        }

        // add attributes locations
        count = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
        for(i = 0; i < count; ++i)
        {
            let info = gl.getActiveAttrib(program, i); // return WebGLActiveInfo
            program.attribute[info.name] = gl.getAttribLocation(program, info.name);
            //program["a_"+info.name] = gl.getAttribLocation(program, info.name);
            //log("ATTRIBUTE: " + info.name + " = " + program.attribute[info.name]);
        }
        return program;
    },

    ///////////////////////////////////////////////////////////////////////////
    // remove a program from array
    ///////////////////////////////////////////////////////////////////////////
    removeProgram: function(key)
    {
        if(typeof this.programs[key] !== "undefined")
        {
            delete this.programs[key];
            this.count--;
        }
    },

    ///////////////////////////////////////////////////////////////////////////
    // return a program
    ///////////////////////////////////////////////////////////////////////////
    getProgram: function(name)
    {
        return this.programs[name];
    },

    ///////////////////////////////////////////////////////////////////////////
    // return array of program names
    ///////////////////////////////////////////////////////////////////////////
    getProgramNames: function()
    {
        let names = [];
        for(key in this.programs)
            names.push(key);
        return names;
    },

    ///////////////////////////////////////////////////////////////////////////
    // return names of uniforms
    ///////////////////////////////////////////////////////////////////////////
    getProgramUniforms: function(name)
    {
        let names = [];
        for(key in this.programs[name].uniform)
            names.push(key);
        return names;
    },

    ///////////////////////////////////////////////////////////////////////////
    // return names of attributes
    ///////////////////////////////////////////////////////////////////////////
    getProgramAttributes: function(name)
    {
        let names = [];
        for(key in this.programs[name].attribute)
            names.push(key);
        return names;
    },

    ///////////////////////////////////////////////////////////////////////////
    // print itself
    ///////////////////////////////////////////////////////////////////////////
    toString: function()
    {
        let str = "===== ShaderManager =====\n";
        str += "Shader Count: " + this.count + "\n";
        let count = 1;
        for(key in this.programs)
        {
            str += count++ + ": " + key + "\n";
            //str += "    uniforms: " + this.programs[key].uniforms + "\n";
            //str += "  attributes: " + this.programs[key].attributes + "\n";
        }
        return str;
    }
};

