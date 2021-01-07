//Compilieren des Codes
class Parser {
  constructor(operands) {
    this.numrx = RegExp(/(\+|\-)?(\d+(\.\d+)?(e(\+|\-)\d+)?|Infinity)/gm)
    this.strrx = RegExp(/"[^"]*"/gm)
    this.bracketrx = RegExp(/\([^\(\)]+\)/gm)
    this.varrx = RegExp(/\$[a-z]+\w*/gim)
    this.funcrx = RegExp(/[a-z]+\w*[\t ]*\(.*\)/gim)
    this.varfuncrx = RegExp(/(\$\w|\w[ \t]*\()/im)
    this.ifElserx = RegExp(/if[ \t]*\(.*\)\s*\{(\s|.)*\}(\s*else\{(\s|.)*\})?/m)
    this.boolrx = RegExp(/(true|false)/gm)
    this.pointerrx = RegExp(/@\$?[a-z]+\w*/gim)
    this.newFuncrx = RegExp(/function\s+[a-z]*[ \t]*\(.*\)\s*\{(\s|.)*\}/gmi)
    this.newVarrx=RegExp(/let\s*\$[a-z]+/gmi)
    this.forLooprx=RegExp(/for[ \t]*\(.*;.*;.*\)\s*\{(\s|.)*\}/gmi)
    this.whileLooprx=RegExp(/while[\t ]*\(.*\)\s*\{(\s|.)*\}/gmi)
    this.operands = operands
    this.vals = []
    this.groups = []
    this.funcs = []
    this.ifElses = []
    this.forLoops=[]
    this.whileLoops=[]
  }
  replaceNum(match) {
    let num = Number(match)
    let result = `&d~${numToAlpha(this.vals.length)} `
    this.vals.push(num)
    return result
  }
  replaceStr(match) {
    let string = match.slice(1, -1)
    let result = `&d~${numToAlpha(this.vals.length)} `
    this.vals.push(string)
    return result
  }
  replaceOp(match) {
    let n = this[0]
    let importance = parseInt(this[1])
    importance = (importance + 10).toString(36)
    let result = `&op~${numToAlpha(n)}~${importance} `+match[match.length-1]
    return result
  }
  replaceBracket(match) {
    let content = match.slice(1, -1)
    let result = `&g~${numToAlpha(this.groups.length)} `
    let newParser = this.newParser
    let parsed = this.parse(content, this.variables, this.emptyfuncs, true)
    this.groups.push(parsed)
    //alert(this.groups)
    return result
  }
  replaceVar(match) {
    //alert("var,"+match)
    match = match.slice(1)
    let index
    for (let i in this.variables) {
      let v = this.variables[i]
      if (v.name == match) {
        index = i
      }
    }
    if (index == undefined) {
      throw ("no such variable as " + match)
    }
    let result = `&var~${numToAlpha(index)} `
    return result
  }
  replaceFunc(match) {
    let paramStart = match.indexOf("(")
    let name = match.substr(0, paramStart)
    let func
    for (let i in this.emptyfuncs) {
      let f = [...this.emptyfuncs][i]
      if (f.name == name) {
        func = f
      }
    }
    if (func) {
      let paramEnd = match.searchForCorres("(", ")")
      let params = match.slice(paramStart + 1, paramEnd).split(",")
      let paramsParsed = []
      for (let p of params) {
        paramsParsed.push(this.parse(p, this.variables, this.emptyfuncs))
      }

      let result = `&func~${numToAlpha(this.funcs.length)}` + match.substr(paramEnd + 1)

      this.funcs.push([func, paramsParsed])

      return result
    } else {
      throw ("no such function as: " + name)
      return "&error"
    }
  }
  replaceIfElse(match) {
    let conditionStart = match.indexOf("(")
    let conditionEnd = match.searchForCorres("(", ")")
    let condition = match.slice(conditionStart + 1, conditionEnd)
    condition = this.parse(condition, this.variables, this.emptyfuncs)
    let thenStart = match.indexOf("{")
    let thenEnd = match.searchForCorres("{", "}", conditionEnd - 1)
    let thenBlock = match.slice(thenStart + 1, thenEnd)
    let newParser = this.newParser
    thenBlock = newParser.parse(thenBlock, this.variables, this.emptyfuncs)
    let elseStart = match.indexOf("else")
    let elseBlockStart = match.indexOf("{", elseStart)
    let elseBlockEnd = match.searchForCorres("{", "}", elseStart + 1)
    let elseBlock = match.slice(elseBlockStart + 1, elseBlockEnd)
    let newElseParser = this.newParser
    elseBlock = newElseParser.parse(elseBlock, this.variables, this.emptyfuncs)
    let result = `&ifelse~${numToAlpha(this.ifElses.length)} `+match.slice(elseBlockEnd+1)
    this.ifElses.push([condition, thenBlock, elseBlock])
    return result
  }
  replaceBool(match) {
    let bool = match == "true"
    let result = `&d~${numToAlpha(this.vals.length)} `
    this.vals.push(bool)
    return result
  }
  replacePointer(match) {
    match = match.slice(1)
    if (match[0] == "$") {
      match = match.slice(1)
      let index
      for (let i in this.variables) {
        let v = this.variables[i]
        if (match == v.name) {
          index = i
        }
      }
      if (index) {
        let result = `&point~${numToAlpha(index)}~var `
        return result
      } else {
        throw "no such variable as " + match
      }
    } else {
      let index
      for (let i in this.emptyfuncs) {
        let f = this.emptyfuncs[i]
        if (f.name == match) {
          index = i
        }
      }
      if (index) {
        let result = `&point~${numToAlpha(index)}~func `
        return result
      } else {
        throw "no such function as" + match
      }
    }
  }
  replaceNewFunc(match) {
    match = match.slice(8).trim()
    let firstBrack = match.indexOf("(")
    let lastBrack = match.searchForCorres("(",")")
    let name = match.slice(0, firstBrack)
    let vars = match.slice(firstBrack + 1, lastBrack)
    let firstCurlBrack = match.indexOf("{", lastBrack)
    let lastCurlBrack = match.searchForCorres("{","}",lastBrack)
    let code=match.slice(firstCurlBrack+1,lastCurlBrack)
    
    let newParser = this.newParser
    let newFunc=new ParseFunc(name,code,vars,newParser)
    this.emptyfuncs.push(newFunc)
    return "0"+match.slice(lastCurlBrack+1)
  }
  replaceNewVar(match){
  let name=match.slice(5)
  let variable=new ParseVar(name)
  this.variables.push(variable)
    return "@$"+name
  }
  replaceFor(match){
    let firstBrack=match.indexOf("(")
    let lastBrack=match.searchForCorres("(",")",firstBrack-1)
    let startCondAug=match.slice(firstBrack+1,lastBrack).split(";")
    let newParser = this.newParser
    let start=newParser.parse(startCondAug[0],this.variables,this.emptyfuncs)
    let cond=newParser.parse(startCondAug[1])
    let aug=newParser.parse(startCondAug[2])
    let firstCurlBrack=match.indexOf("{",lastBrack)
    let lastCurlBrack=match.searchForCorres("{","}",lastBrack)
    let instructions=newParser.parse(match.slice(firstCurlBrack+1,lastCurlBrack))
    let result=`&for~${numToAlpha(this.forLoops.length)} `+match.slice(lastCurlBrack+1)
    this.forLoops.push({start,cond,aug,instructions})
    return result
    }
  replaceWhile(match){
    let firstBrack=match.indexOf("(")
    let lastBrack=match.searchForCorres("(",")",firstBrack-1)
    let newParser=this.newParser
    let cond=newParser.parse(match.slice(firstBrack+1,lastBrack),this.variables,this.emptyfuncs)
    let firstCurlBrack=match.indexOf("{",lastBrack)
    let lastCurlBrack=match.searchForCorres("{","}",lastBrack)
    let instructions=newParser.parse(match.slice(firstCurlBrack+1,lastCurlBrack))
    let result=`&while~${numToAlpha(this.whileLoops.length)} `+match.slice(lastCurlBrack+1)
    this.whileLoops.push({cond,instructions})
    return result
    }
  extract(rechnung, parsenums = true) {
    rechnung = rechnung.replace(this.strrx, this.replaceStr.bind(this))
    rechnung = rechnung.replace(this.newVarrx, this.replaceNewVar.bind(this))

    rechnung = rechnung.replace(this.ifElserx, this.replaceIfElse.bind(this))
    rechnung = rechnung.replace(this.forLooprx, this.replaceFor.bind(this))
    rechnung = rechnung.replace(this.whileLooprx, this.replaceWhile.bind(this))
    rechnung = rechnung.replace(this.newFuncrx, this.replaceNewFunc.bind(this))
    rechnung = rechnung.replace(this.pointerrx, this.replacePointer.bind(this))
    while (this.varfuncrx.test(rechnung)) {
      //alert(rechnung)
      rechnung = rechnung.replace(this.funcrx, this.replaceFunc.bind(this))
      rechnung = rechnung.replace(this.varrx, this.replaceVar.bind(this))
    }
    while (this.bracketrx.test(rechnung)) {
      rechnung = rechnung.replace(this.bracketrx, this.replaceBracket.bind(this))
    }
    if (parsenums) {
      rechnung = rechnung.replace(this.numrx, this.replaceNum.bind(this))
      rechnung = rechnung.replace(this.boolrx, this.replaceBool.bind(this))
    }
    for (let importance in operands) {
      for (let i in this.operands[importance]) {
        let op = this.operands[importance][i]

        rechnung = rechnung.replace(concatRegex(op.sign,/[^\+\-=\*\/]/), this.replaceOp.bind([i, (importance)]))
      }
    }
    rechnung = rechnung.replace(/[\s \n\t]/gm, "")
    return rechnung
  }
  parse(rechnung, variables=null, emptyfuncs=null, parsenums = true) {
    rechnung = rechnung.trim()
    if(variables){
    this.variables = [...variables]
      }
    if(emptyfuncs){
    this.emptyfuncs = [...emptyfuncs]
    }
    let extracted = this.extract(rechnung, parsenums).split(/;/)
    let trees=[]
    for(let line of extracted)
    {
      let instructions=line.split("&").filter(instruction=>instruction!="")
    trees.push(new ParseTree(instructions, this.vals, this.groups, this.variables, this.operands, this.funcs, this.ifElses, this.forLoops, this.whileLoops, this.emptyfuncs))
    }
    return trees
  }
  get newParser(){
    let newParser = Object.assign(new Parser(), this)    
    return newParser
    }
  reset() {
    this.vals = []
    this.groups = []
    this.funcs = []
    this.ifElses = []
    this.forLoops=[]
    this.whileLoops=[]
  }
}