//Graph, Tabelle, generierung von Daten

function update_functable(functableId, funcs) {
  let table = document.getElementById(functableId)
  let html = "<tr><th><strong>name</strong></th><th><strong>variables</strong></th><th><strong>code</strong></th><th><strong>description</strong></th><th><strong>action</strong></th></tr>"
  for (let i in funcs) {
    let f = funcs[i]
    html += `<tr id="functablerow${i}"><td>${f.name}</td><td>${f.rawvars}</td><td class="coloureditable">${f.rawcode}</td><td>${f.description}</td>`
    if (f.isUserFunc) {
      html += `<td><button onclick="edit_user_func(${i})">edit</button><button onclick="delete_user_func(${i})">delete</button></td></tr>`
    } else {
      html += "<td>no actions</td></tr>"
    }
  }
  table.innerHTML = html
  make_coloureditable()
}

function update_vartable(table, vars) {
  let html = "<tr><th><strong>name</strong></th><th><strong>value</strong></th><th><strong>actions</strong></th></tr>"
  for (let i in vars) {
    let v = vars[i]
    html += `<tr><td>${v.name}</td><td id="vartablevalnr${i}">${v.value}</td>`
    if (v.isUserVar) {
      html += `<td><button onclick="edit_user_var(${i})">edit</button><button onclick="delete_user_var(${i})">delete</button></td><td><input type="range" oninput="set_user_var(${i},Number(this.value))" value="${v.value}" min="${v.min}" max="${v.max}" step="${v.step}"></td></tr>`
    } else {
      html += "<td>no actions</td></tr>"
    }
  }
  table.innerHTML = html
}

function dataToTable(table, data, headings = false) {
  table.style.display = "block"
  if (!headings) {
    headings = data.shift()
  }
  let html = "<tr>"
  for (let e of headings) {
    html += `<th><strong>${e}</strong></th>`
  }
  html += "</tr>"
  for (let row of data) {
    html += "<tr>"
    for (let i in row) {
      let e
      if (i == 0) {
        e = row[i].name
      } else {
        e = row[i]
      }
      html += `<td>${e}</td>`
    }
    html += "</tr>"
  }
  table.innerHTML = html
}

function genData(functions, calculator, start = 0, stepsize = 1, numsteps = 10) {
  console.log(functions)
  let end = start + stepsize * numsteps
  let data = []
  for (let f of functions) {
    let row_x = range(start, end, stepsize)
    let row
    if (f.isF) {
      row = row_x.map(v => f.code(v))
    } else {
      let parameter = f.vars[0]
      row = row_x.map(v => {
        f.reset();
        parameter.value = v;
        try {
          return calculator.calc(f.code)
        } catch (e) {
          if (e instanceof returnExeption) {
            return e.value
          } else {
            throw e
          }
        }
      })
    }
    row.unshift(f)
    data.push(row)
  }
  return data
}

function genHeading(start = 0, stepsize = 1, numsteps = 10) {
  let heading = ["function"]
  let end = start + stepsize * numsteps
  for (let x = 0; x < numsteps + 1; x++) {
    let x_map = x.map(0, numsteps, start, end)
    heading.push(x_map)
  }
  return heading
}
//randbeschriftung des Graphen
function graphBorderText(minx, maxx, miny, maxy, borderspace) {
  let sizex = maxx - minx
  let log = Math.round(Math.log10(sizex * 1.5))
  let logsize = 10 ** log
  let partxsize = (logsize / 10)
  let numparts = Math.round(sizex / partxsize)
  let dosub = numparts < 5
  let startx = minx - minx % partxsize
  let d = (width - borderspace) / numparts
  fill(0, 70)
  stroke(0, 100)
  for (let x = 0; x < numparts + 1; x++) {
    let number = (Math.round((startx + partxsize * x) * 10 / logsize) * logsize) / 10
    if (((number / logsize) * 10) % 2 != 0 && numparts > 15 || number < minx) {
      continue
    }
    let posx = map(x * partxsize + startx, startx, startx + partxsize * numparts, borderspace, width)
    line(posx, height - borderspace, posx, height - borderspace * 0.7)
    let numbertext = number.toString(10)
    if (numbertext.includes(".")) {
      numbertext = numbertext.replace(/0{5,}[1-9]$/g, '')
    }
    text(numbertext, posx, height)
    if (numparts < 5) {
      line(posx + (d / 2), height - borderspace, posx + (d / 2), height - borderspace * 0.8)
      number = number + partxsize / 2
      numbertext = number.toString(10)
      if (numbertext.includes("."))
        numbertext = numbertext.replace(/0{5,}[1-9]$/g, '')
      text(numbertext, posx + d / 2, height)
    }
  }
  let sizey = maxy - miny
  log = Math.round(Math.log10(sizey * 1.5))
  logsize = 10 ** log
  let partysize = (logsize / 10)
  numparts = round(sizey / partysize)
  let starty = miny - miny % partysize
  d = (height - borderspace) / numparts
  for (let y = 0; y < numparts + 1; y++) {
    let number = (Math.round((starty + partysize * y) * 10 / logsize) * logsize) / 10
    if (((number / logsize) * 10) % 2 != 0 && numparts > 15 || number < miny) {
      continue
    }
    let posy = map(y * partysize + starty, starty, starty + partysize * numparts, borderspace, height)
    line(borderspace, height - posy, borderspace * 0.7, height - posy)
    let numbertext = number.toString(10)
    if (numbertext.includes(".")) {
      numbertext = numbertext.replace(/0{5,}[1-9]$/g, '')
    }
    text(numbertext, 0, height - posy)
    if (numparts < 5) {
      line(borderspace, height - (posy + (d / 2)), borderspace * 0.8, height - (posy + (d / 2)))
      number = number + partysize / 2
      numbertext = number.toString(10)
      if (numbertext.includes("."))
        numbertext = numbertext.replace(/0{5,}[1-9]$/g, '')
      text(numbertext, 0, height - (posy + d / 2))
    }
  }
  noFill()
  stroke(100, 80)
  let posy = height - (0).map(starty, starty + partysize * numparts, borderspace, height)
  let posx = (0).map(minx, maxx, borderspace, width)
  drawingContext.setLineDash([5, 15]);
  line(borderspace, posy, width, posy)
  line(posx, 0, posx, height - borderspace)
  stroke(150, 60)
  drawingContext.setLineDash([]);
  line(borderspace, height - borderspace, width, height - borderspace)
  line(borderspace, 0, borderspace, height - borderspace)
  stroke(0)
}

function toGraph(data, borderspace, miny, maxy, functions) {
  noFill()
  let _width = width - borderspace
  let _height = height - borderspace
  let lastGraphed
  for (let row of data) {
    let func = row.shift()
    stroke(func.r, func.g, func.b)
    beginShape()
    for (let i = 0; i < row.length; i++) {
      let e = row[i]
      if (e == undefined) {
        continue
      }
      let x = borderspace + i.map(0, row.length, 0, _width)
      let y = (height - e.map(miny, maxy, 0, _height)) - borderspace
      if (y < 0 || y > height) {
        //endShape()
        //beginShape()
        continue
      }
      vertex(x, y)

      lastgraphed = [x, y]

    }
    endShape()
    fill(func.r, func.g, func.b)
    if (lastgraphed) {
      if (lastgraphed[0] > _width * 0.8) {
        let x = _width * 0.8 + borderspace
        let y = (height - row[round(row.length * 0.8)].map(miny, maxy, 0, _height)) - borderspace
        text(func.name, x, y + 10)
      } else {
        text(func.name, lastgraphed[0], lastgraphed[1] + 10)
      }
    }
    noFill()
  }
}
function gen_2d_data(f,startx,endx,starty,endy,width,height,rangemin,rangemax,outputColourful){
  //console.log(new Array(arguments))
  let sizex = (endx - startx) / (width)
  let sizey = (endy - starty) / (height)
  let data=[]
  let i=0
  for(let y=0;y<height;y+=1){
    let y_m=y.map(0,height,starty,endy)
    //console.log(y_m,y)
  for(let x=0;x<width;x+=1){
    let x_m=x.map(0,width,startx,endx)
    
    let val=f(x_m,y_m)
    if(outputColourful&&val>0){
      let rgb=HSVtoRGB(val.map(rangemin,rangemax,0.5,1),1,1)
      data[i]=rgb.r
      data[i+1]=rgb.g
      data[i+2]=rgb.b
      data[i+3]=255
      
      }else{
        val=val.map(rangemin,rangemax,0,255)
    data[i]=val
    data[i+1]=val
    data[i+2]=val
    data[i+3]=255
    }
    i+=4
  }
  }
  //console.log(data.slice(0,100))
return data}
    function updateCanvasSize(canvasid,sizexid,sizeyid){
      let canvas=document.getElementById(canvasid)
      let sizex=document.getElementById(sizexid)
      let sizey=document.getElementById(sizeyid)
      canvas.width=sizex.value*document.documentElement.clientWidth
      canvas.height=sizey.value*document.documentElement.clientHeight
      }
function show2dFunc(f) {
  let canvas=document.getElementById("2dcanvas")
  let startx=Number(document.getElementById("graph2dstartx").value)
  let starty=Number(document.getElementById("graph2dstarty").value)
  let endx=Number(document.getElementById("graph2dendx").value)
  let endy=Number(document.getElementById("graph2dendy").value)
  let rangemin=Number(document.getElementById("graph2drangemin").value)
  let rangemax=Number(document.getElementById("graph2drangemax").value)
  let outputColourful=document.getElementById("graph2doutput").checked
  let width=canvas.width
  let height = canvas.height
  
  let arr=gen_2d_data(f,startx,endx,starty,endy,width,height,rangemin,rangemax,outputColourful)
  //console.log(width,height,arr.length,width*height*4)
  let ctx=canvas.getContext("2d")
  let idata=ctx.createImageData(width,height)
  idata.data.set(new Uint8ClampedArray(arr))
  ctx.putImageData(idata,0,0)
}