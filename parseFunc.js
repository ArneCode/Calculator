//Funktionen
class ParseFunc {
  constructor(name, code, vars, parser, description = "", parseargs = [
    [],
    []
  ], isUserFunc = false) {
    this.name = name
    this.isUserFunc = isUserFunc
    this.description = description
    this.rawcode = "no raw code"
    this.rawvars = "none"
    this.r = Math.random() * 155
    this.g = Math.random() * 155
    this.b = Math.random() * 155
    if (typeof(vars) == "string") {
      this.rawvars = vars
      this.vars = []
      for (let v of vars.split(",")) {
        v = v.split("=")
        let name = v[0]
        if (v.length > 1) {
          let value = Number(v[1])
          this.vars.push(new ParseVar(name, value))
        } else {
          this.vars.push(new ParseVar(name, undefined))
        }
      }
    } else {
      this.vars = vars
    }
    this.isF = typeof(code) == "function"
    if (this.isF) {
      this.code = code
    } else {
      this.rawcode = code
      this.code = parser.parse(code, this.vars.concat(parseargs[0]), parseargs[1].concat([this]))
    }
  }
  reset() {
    for (let v of this.vars) {
      v.reset()
    }
  }
}

function gen_standart_funcs(parser) {
  let sin = new ParseFunc("sin", Math.sin, "x", parser, "sinus von x")
  let cos = new ParseFunc("cos", Math.cos, "x", parser, "cosinus von x")
  let tan = new ParseFunc("tan", Math.tan, "x", parser, "tangent von x")
  let random = new ParseFunc("random", Math.random, [], parser, "zufallszahl zwischen 0 und 1")
  let log10 = new ParseFunc("log", Math.log10, "x", parser, "logarithmus zur basis 10")
  let log2 = new ParseFunc("log2", Math.log2, "x", parser, "logarithmus zur basis 2")
  let ln = new ParseFunc("ln", Math.log, "x", parser, "logarithmus zur basis e")
  let collatz = new ParseFunc("collatz", "if($n<2){$level}else{if(($n%2)==0){collatz($n/2,$level+1)}else{collatz(($n*3+1)/2,$level+2)}}", "n,level=0", parser, "Collatz <a href='https://de.m.wikipedia.org/wiki/Collatz-Problem'>mehr informationen</a>")
  let round = new ParseFunc("round", Math.round, "x", parser, "rundet eine zahl")
  let floor = new ParseFunc("floor", Math.floor, "x", parser, "rundet eine zahl ab")
  let ceil = new ParseFunc("ceil", Math.ceil, "x", parser, "rundet eine zahl auf")
  let alertr = new ParseFunc("alert", x => {
    if(confirm(x)){
    return x
      }else{
      throw "Programm wurde abgebrochen"
      }
  }, "x", parser, "alert, gibt ersten input zurück") //alert with return
  let console_logr = new ParseFunc("console", (...args) => {
    console.log.apply(null, args);
    return args[0]
  }, "x", parser, "console.log, gibt ersten input zurück") //console.log with return
  let NOT = new ParseFunc("not", x => !x, "x", parser, "true zu false, false zu true") //Not Gate
  let baselog = new ParseFunc("baselog", (b, x) => Math.log(x) / Math.log(b), "b,y", parser, "logarithmus zur basis b von y")
  let max = new ParseFunc("max", Math.max, "a,b", parser, "maximum")
  let min = new ParseFunc("min", Math.min, "a,b", parser, "minimum")
  let deg = new ParseFunc("deg", Math.degrees, "radians", parser, "radians to degrees")
  let promptc=new ParseFunc("prompt",prompt,"text",parser,"lets user input text")
  
  let rad = new ParseFunc("rad", Math.radians, "degrees", parser, "degrees to radians")
  let number = new ParseFunc("Number", Number, "str", parser, "string to number")
  let str = new ParseFunc("String", (n) => n.toString(), "number", parser, "variable to string")
  let run = new ParseFunc("run", function(f) {
    let args = Object.values(arguments).slice(1)
    if (f.isF) {
      return f.code.apply(null, args)
    } else {
      let calculator = args.pop()
      alert("test2")
      if (f.vars.length > 0) {
        for (let i in args) {
          alert("running" + args[i])
          f.vars[i].value = args[i]
        }
      }
      alert(f)
      return calculator.calc(f.code)
    }
  }, "function,arguments", parser, "runs function with specified arguments")

/*  let createFunc = new ParseFunc("newFunc", function(name, code, variables, custom_parser = null) {
    if (custom_parser == null) {
      custom_parser = parser
    }
    /*let newfunc = new ParseFunc(name, code, variables, custom_parser)
    parser.emptyfuncs.push(newfunc)
    alert("test-1")
    */
  let funcs = [sin, cos, tan, random, log10, log2, collatz, round, floor, ceil, alertr, console_logr, NOT, baselog, min, max, rad, deg, number, str, run,promptc].sort((a, b) => b.name.length - a.name.length)
  return funcs
}