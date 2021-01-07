//Hauptteil
let calculator = new Calculator()
let log_console = document.getElementById("console")
//operands are sorted by importance:
let operands = [
  [Pow],
  [Dot, Div, Mod],
  [Plus, Minus],
  [GrEq, LessEq, Less, Gr, Eq, NEq],
  [AND, OR,XOR],
  [SETPLUS,SETMINUS,SETDOT,SETDIV,SET]
]
let parser = new Parser(operands)

let standart_variables = get_standart_vars(calculator)
let user_variables = []
let standart_functions = gen_standart_funcs(parser)
let user_functions = []

let allfuncs = () => user_functions.concat(standart_functions)
let allfuncs_sorted=()=>allfuncs().sort((a,b)=>b.name.length-a.name.length)
let allvars = () => user_variables.concat(standart_variables)
let allvars_sorted=()=>allvars().sort((a,b)=>b.name.length-a.name.length)

let calcInput = document.getElementById("calcinput")
let calcInputForm = document.getElementById("calcinputform")
let calcOutput = document.getElementById("calcoutput")
let calcTextOutput = document.getElementById("calctextoutput")
let calcOutputUp = document.getElementById("calcoutputup")

calcOutput.style.display = "none"

let autoElements=[{elt:calcInput,output:calcTextOutput}]
enableAutoCalc(calculator,parser,autoElements)

function runcalc(event) {
  tableFuncs = []
  canavas.style.display = "none"

  event.preventDefault()
  let input = calcInput.innerText
  parser.reset()
  let inputParsed, output
  try {
    inputParsed = parser.parse(input, allvars_sorted(), allfuncs_sorted())
  } catch (e) {
    console.log(e.stack)
    alert("Error occured while parsing input.\nError:" + e.stack)
    return
  }
  console.log("parsed", inputParsed)
  try {
    output = calculator.calc(inputParsed)
  } catch (e) {
    console.log(e.stack)
    
    alert("Error occured while running calculation.\nError:" + e.stack)
    return
  }
  calcOutput.style.display = "inline"
  calcTextOutput.innerHTML = output
  console.log("calculation outputed", output)
  funcOutTable.style.display = "none"
  showVarTable()
}
calcInputForm.onsubmit = runcalc

function outputUp() {
  calcInput.innerText = calcTextOutput.innerHTML
  let event = new Event('input', { bubbles: true, cancelable: true, });
  calcInput.dispatchEvent(event)
  calcOutput.style.display = "none"
  calcTextOutput.innerHTML = ""
  return false
}
calcOutputUp.onclick = outputUp
hideable.init()

let funcnameInp = document.getElementById("funcnameinp")
let funcvarsInp = document.getElementById("funcvarsinp")
let funccodeInp = document.getElementById("funccodeinp")
let funcsubmit = document.getElementById("funcsubmit")

function addFunc() {
  let name = funcnameInp.value
  let vars = funcvarsInp.value
  let code = funccodeInp.value
  let func
  try{
  func= new ParseFunc(name, code, vars, parser,"", [allvars_sorted(), allfuncs_sorted()],true)
  }catch(e){
    console.log(e.stack)
    
    alert("Error occured while compiling function.\nError:" + e.stack)
  }
  user_functions.unshift(func)
  update_functable("functable", allfuncs())
  funcnameInp.value = ""
  funcvarsInp.value = ""
  funccodeInp.value = ""
}

funcsubmit.onclick = addFunc

function edit_user_func(i) {
  let f = user_functions[i]
  user_functions.splice(i, 1)
  funcnameInp.value = f.name
  funcvarsInp.value = f.rawvars
  funccodeInp.value = f.rawcode
  update_functable("functable", allfuncs())
}

function delete_user_func(i) {
  let f = user_functions[i]
  if (confirm(`Are you sure, that you want to delete function ${f.name}`)) {
    user_functions.splice(i, 1)
    update_functable("functable", allfuncs())

  }
}

let funcOutTable = document.getElementById("funcouttable")
let tableStart = document.getElementById("tablestart")
let tableStepSize = document.getElementById("tablestepsize")
let tableNumSteps = document.getElementById("tablenumsteps")
let tableFuncs = []

function addTableFunc() {
  for (let f of arguments) {
    tableFuncs.push(f)
  }
}

function showVarTable() {
  if (tableFuncs.length == 0) {
    return
  }
  let start = Number(tableStart.value)
  let stepsize = Number(tableStepSize.value)
  let numsteps = Number(tableNumSteps.value)

  let data = genData(tableFuncs, calculator, start, stepsize, numsteps)
  let heading = genHeading(start, stepsize, numsteps)
  dataToTable(funcOutTable, data, heading)
}
let tableFunc = new ParseFunc("table", addTableFunc, "func",null,"stellt die funktion(en) unter Visualisation/Table als Tabelle dar")
standart_functions.push(tableFunc)

let funcsFile = document.getElementById("funcsfile")
funcsFile.addEventListener("change", loadFile)

function loadFile(event) {
  alert(event.target)
  let input = event.target
  if ("files" in input && input.files.length > 0) {
    let reader = new FileReader()
    new Promise((resolve, reject) => {
      reader.onload = event => resolve(event.target.result)
      reader.onerror = error => reject(error)
      reader.readAsText(input.files[0])
    }).then(parseFuncs)
  }
}

function parseFuncs(string) {
  let funcs = eval(string)
  for (let f of funcs) {
    let docontinue = false
    for (let ownf of user_functions) {
      if (ownf.name == f.name) {
        alert(`Die Funktion ${f.name} existiert schon`)
        docontinue = true
      }
    }
    if (docontinue) {
      continue
    }
    user_functions.push(new ParseFunc(f.name, f.code, f.vars, parser, [allvars_sorted(), allfuncs_sorted()], true))
  }
  update_functable("functable", allfuncs())
}

function saveFuncs() {
  let text = "["
  for (let f of user_functions) {
    text += `{name:"${f.name}",code:"${f.rawcode}",vars:"${f.rawvars}"},`
  }
  text += "]"
  toFile(text)
}

let graphStart = document.getElementById("graphxstart")
let graphEnd = document.getElementById("graphxend")
let graphStepSize = document.getElementById("graphstepsize")
let graphMinY = document.getElementById("graphminy")
let graphMaxY = document.getElementById("graphmaxy")
let graphFuncs = []
let canavas = document.getElementById("canavas")
canavas.style.display = "none"

function updateGraph() {
  if (graphFuncs.length == 0) {
    return
  }
  canavas.style.display = "block"
  background(255)
  let start = Number(graphStart.value)
  let stepsize = Number(graphStepSize.value)
  let end = Number(graphEnd.value)
  let miny = Number(graphMinY.value)
  let maxy = Number(graphMaxY.value)
  let numsteps = (end - start) / stepsize
  let borderspace = 20

  let generate_start = millis()
  let data
  try{
  data = genData(graphFuncs, calculator, start, stepsize, numsteps)
  }catch(e){
    console.log(e.stack)
    
    alert("Error occured while generating data for graph.\nError:" + e.stack)
    }
  let generate_end = millis()
  //log_console.innerHTML = "generating Data took: " + str((generate_end - generate_start) / 1000) + "s"
  try{
  toGraph(data, borderspace, miny, maxy)
  graphBorderText(start, end, miny, maxy, borderspace)
    }
    catch(e){
    console.log(e.stack)
      
    alert("Error occured while graphing data.\nError:" + e.stack)
    }
  graphFuncs = []
}

function addGraphFunc() {
  for (let f of arguments) {
    graphFuncs.push(f)
  }
}
standart_functions.push(new ParseFunc("graph", addGraphFunc, "func",null,"stellt die funktion(en) unter Visualisation/Graph als Graph dar"))
let varTable = document.getElementById("vartable")
update_vartable(varTable, allvars())

let addVarForm = document.getElementById("addvarform")
let addVarName = document.getElementById("varnameinp")
let addVarVal = document.getElementById("varvalinp")
let rangeinp_locked = false
let curr_editing=null
let varRangeMin = document.getElementById("varrangemin")
let varRangeMax = document.getElementById("varrangemax")
let varRangeStep = document.getElementById("varrangestep")
addVarForm.onsubmit = addVar
  
function addVar(event) {
  event.preventDefault()
  let name = addVarName.value
  let value = Number(addVarVal.value)
  let min = Number(varRangeMin.value)
  let max = Number(varRangeMax.value)
  let step = Number(varRangeStep.value)
  let variable
  if(curr_editing){
    variable=curr_editing
    variable.name=name
    variable.value=value
    variable.norm=value
    variable.isUserFunc=true
    variable.min=min
    variable.max=max
    variable.step=step
    curr_editing=null
  }else{
  variable = new ParseVar(name, value, value, true, min, max, step)
  }
  user_variables.push(variable)
  update_vartable(varTable, allvars())
  addVarName.value = addVarVal.value = ""
  rangeinp_locked = false
  varRangeMin.value=""
  varRangeStep.value=""
  varRangeMax.value=""
}

function edit_user_var(i) {
  let v = user_variables.splice(i, 1)[0]
  addVarName.value = v.name
  addVarVal.value = v.value
  update_vartable(varTable, allvars())
  curr_editing=v
}

function delete_user_var(i) {
  if (!confirm("Are you sure, that you want to delete this variable")) {
    return
  }
  user_variables.splice(i, 1)
  update_vartable(varTable, allvars())

}

function set_user_var(i, value) {
  user_variables[i].value = value
  document.getElementById("vartablevalnr" + i).innerHTML = str(value)
}

function gen_var_range(value) {
  if (rangeinp_locked) {
    return
  }
  let log = Math.log10(value)
  let roundlog = Math.round(log)
  let max = 10 ** roundlog
  let min = -(10 ** Math.round(log) / 2)
  let step = max / 1000
  if (max <= value) {
    max *= 1.5
    if (max <= value) {
      max = (max / 1.5) * 3
      if (max <= value) {
        max = (max / 3) * 5
        min *= 2
      }
    }
  }
  varRangeMin.value = str(min)
  varRangeMax.value = str(max)
  varRangeStep.value = str(step)
}

function lock_var_range() {
  rangeinp_locked = true
}
let fib = new ParseFunc("fib", "round(($golden^$n-((-1/$golden)^$n))/5^0.5)", "n", parser,"", [allvars_sorted(), allfuncs_sorted()])
standart_functions.push(fib)
update_functable("functable", allfuncs())