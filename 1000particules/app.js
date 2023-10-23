'use strict'

Math.TAU = Math.PI * 2
Math.RAD = Math.PI / 180
Math.DEG = 180 / Math.PI
Math.PHI = 0.5 + 0.5 * Math.sqrt 5

Math.random = do (x = 1) -> ->
  x ^= x << 13; x ^= x >>> 17; x ^= x << 5
  1 - (x >>> 0) / 0xFFFFFFFF

window.addEventListener 'load', ->
  canvas  = document.createElement 'canvas'
  context = canvas.getContext '2d'
  document.body.appendChild canvas

  buffer     = mat4.create()
  model      = mat4.create()
  view       = mat4.create()
  projection = mat4.create()
  mvp        = mat4.create()

  points  = []
  colors  = []
  palette = [
    [ 1.00, 0.50, 0.25, 0.75 ]
    [ 0.25, 0.50, 1.00, 0.75 ]
  ].map vec4.clone

  for _ in [0...25e3]
    ρ = 4/5
    θ = Math.acos Math.random() * 2 - 1
    φ = Math.random() * Math.PI * 2
    x = ρ * Math.sin(θ) * Math.cos(φ)
    y = ρ * Math.sin(θ) * Math.sin(φ)
    z = ρ * Math.cos(θ)
    points.push v = vec4.fromValues x, y, z, 1
    colors.push palette[0]

  for _ in [0...25e3]
    x = (1 - Math.random()**5) * ((Math.random()*2 << 1) - 1)
    y = (1 - Math.random()**5) * ((Math.random()*2 << 1) - 1)
    z = (1 - Math.random()**5) * ((Math.random()*2 << 1) - 1)
    points.push v = vec4.fromValues x, y, z, 1
    colors.push palette[1]

  for _ in [0...50e3]
    x = Math.random() * 2 - 1
    y = Math.random() * 2 - 1
    z = Math.random() * 2 - 1
    points.push v = vec4.fromValues x, y, z, 1
    colors.push palette[if ρ < vec3.len v then 1 else 0]

  data = null
  zero = null

  do render = ->
    requestAnimationFrame render

    T = 1e-3 * Date.now()
    W = canvas.clientWidth
    H = canvas.clientHeight

    if W isnt canvas.width or H isnt canvas.height
      canvas.width  = W
      canvas.height = H

      data = context.createImageData W, H
      zero = context.createImageData W, H
      zero.data[i] = 0xFF for i in [3...zero.data.length] by 4
      data.data.set zero.data

    mat4.identity model
    mat4.rotateX model, model, T/5
    mat4.rotateY model, model, T/6
    mat4.rotateZ model, model, T/7
    mat4.lookAt view, [0, 0, 3], [0, 0, 0], [0, 1, 0]
    mat4.perspective projection, 30 * Math.RAD, W/H, 1e-3, 1e3
    [ model, view, projection ].reduce (a, b) -> mat4.mul mvp, b, a

    for point, i in points
      vec4.transformMat4 buffer, point, mvp
      vec3.scale buffer, buffer, 1/buffer[3]
      [ x, y, z, w ] = buffer

      if -1<z<1 and -1<y<1 and -1<x<1
        [ r, g, b, a ] = colors[i]

        x = (1 + x) * 0.5 * W | 0
        y = (1 - y) * 0.5 * H | 0
        i = x + y*W << 2
        a = a * H/w

        data.data[i++] += r * a
        data.data[i++] += g * a
        data.data[i++] += b * a

    context.putImageData data, 0, 0
    data.data.set zero.data
