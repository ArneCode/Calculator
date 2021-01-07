//Die Struktur für den compilierten Code

class ParseTree {
  constructor(parsed, vals, groups, vars, operands, funcs, ifElses, forLoops, whileLoops, emptyfuncs) {
    this.nodes = []
    this.vals = vals
    this.vars = vars
    this.operands = operands
    this.groups = groups
    this.funcs = funcs
    this.ifElses = ifElses
    this.forLoops = forLoops
    this.whileLoops = whileLoops
    this.return = false
    let pnode = null //previous node
    for (let i in parsed) {
      let e = parsed[i]
      if (e.trim() == "return") {
        this.return = true
        continue
      }
      let esplit = e.split("~")
      let type = esplit[0]
      let ref = alphaToNum(esplit[1])
      let node
      if (type == "g") {
        node = new ParseNode(type, ref, groups)
      } else if (type == "var") {
        node = new ParseNode(type, ref, vars)
      } else if (type == "func") {
        node = new ParseNode(type, ref, funcs)
      } else if (type == "ifelse") {
        node = new ParseNode(type, ref, ifElses)
      } else if (type == "op") {
        let importance = parseInt(esplit[2], 36) - 10
        node = new ParseNode(type, ref, operands[importance], null, importance)
      } else if (type == "point") {
        let poss
        if (esplit[2] == "func") {
          poss = emptyfuncs
        } else {
          poss = vars
        }
        node = new ParseNode(type, ref, poss)
      } else if (type == "for") {
        node = new ParseNode(type, ref, forLoops)
      } else if(type=="while"){
        node=new ParseNode(type,ref,whileLoops)
        }
        else {
        node = new ParseNode(type, ref, vals)
      }
      if (pnode && pnode.type != "op" && node.type != "op") {
        if (pnode.type.isOf(["ifelse", "g", "func"]) && node.type.isOf(["ifelse", "g", "func"])) {
          this.nodes.push(new ParseNode("op", 0, [], Dot, 2)) //Dot from operand.js, last arg is importance
        } else {
          this.nodes.push(new ParseNode("op", 0, [], Plus, 3)) //Plus from operand.js, last arg is importance
        }
      }
      this.nodes.push(node)
      pnode = node
    }
    this.opImpPos = this.nodes.map((node, index) => {
      return (node.type == "op" ? {
        importance: node.importance,
        index
      } : null)
    }).filter(elt => elt != null)
    this.opImpPos.sort((a, b) => a.importance - b.importance)
    let newOpImpPos = []
    for (let opPos of this.opImpPos) {
      let opPosI = opPos.index
      for (let otherOpPos of this.opImpPos) {
        if (otherOpPos.index < opPos.index && otherOpPos.importance <= opPos.importance) {
          opPosI -= 2
        }
      }
      newOpImpPos.push({
        index: opPosI,
        importance: opPos.importance
      })
    }
    this.opImpPos = newOpImpPos
  }
}
class ParseNode {
  constructor(type, ref, poss = [] /*possible values*/ , val = null, info = null) {
    //this.id = Math.random()
    this.type = type
    this.ref = ref
    if (val == null) {
      this.val = poss[this.ref]
    } else {
      this.val = val
    }
    if (this.type == "func") {
      this.vars = this.val[1]
      this.func = this.val[0]
    } else if (this.type == "ifelse") {
      this.condition = this.val[0]
      this.thenBlock = this.val[1]
      this.elseBlock = this.val[2]
    } else if (this.type == "op") {
      this.importance = info
    } else if (this.type == "for") {
      this.start = this.val.start
      this.cond = this.val.cond
      this.aug = this.val.aug
      this.instructions = this.val.instructions
    }else if(this.type=="while"){
    this.cond=this.val.cond
      this.instructions=this.val.instructions
    }
  }
  get(calculator = null) {
    if (this.type.isOf(["d", "point"])) {
      return this.val
    } else if (this.type == "g") {
      return calculator.calc(this.val)
    } else if (this.type == "var") {
      return this.val.value
    } else if (this.type == "func") {
      let num_vars = []
      if (this.func.vars.length > 0) {
        for (let i in this.vars) {
          if (this.func.isF) {
            num_vars.push(calculator.calc(this.vars[i]))
          } else {
            this.func.vars[i].value = calculator.calc(this.vars[i])
          }
        }
      }
      let result
      if (this.func.isF) {
        result = this.func.code.apply(null, num_vars)
      } else {
        result = calculator.calc(this.func.code)
      }
      this.func.reset()
      return result
    } else if (this.type == "ifelse") {
      if (calculator.calc(this.condition)) {
        return calculator.calc(this.thenBlock)
      } else {
        return calculator.calc(this.elseBlock)
      }
    } else if (this.type == "for") {
      calculator.calc(this.start)
      while (calculator.calc(this.cond)) {
        calculator.calc(this.instructions)
        calculator.calc(this.aug)
      }
    }else if(this.type=="while"){
    while(calculator.calc(this.cond)){
    calculator.calc(this.instructions)
    }
    }
  }
}