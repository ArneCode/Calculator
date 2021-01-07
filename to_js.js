function newf_to_js(f, existing_funcs = [], existing_vars = []) {
  //f = f[0]
  if (f.isF) {
    return {
      code: f.code.toString(),
      name: f.name
    }
  } else {
    let arguments = f.rawvars
    existing_vars=existing_vars.concat(f.vars)
    let instructions = instruct_to_js(f.code, existing_funcs, existing_vars)
    let code = `(${arguments})=>{${instructions}}`
    return {
      code,
      name: f.name
    }
  }
}
function ifelse_to_js(ifelse, existing_funcs = [], existing_vars = []) {
  let condition=instruct_to_js(ifelse.condition,existing_funcs,existing_vars)
  let thenBlock=instruct_to_js(ifelse.thenBlock,existing_funcs,existing_vars)
  let elseBlock=instruct_to_js(ifelse.elseBlock,existing_funcs,existing_vars)
  return `if(${condition}){${thenBlock}}else{${elseBlock}}`
  }

function for_to_js(node, existing_funcs = [], existing_vars = []) {
  let condition=instruct_to_js(node.cond,existing_funcs,existing_vars)
  let start=instruct_to_js(node.start,existing_funcs,existing_vars)
  let aug=instruct_to_js(node.aug,existing_funcs,existing_vars)
  let instructions=instruct_to_js(node.instructions,existing_funcs,existing_vars)
  return `for(${start};${condition};${aug}){${instructions}}`
}
function while_to_js(node, existing_funcs = [], existing_vars = []) {
  let condition=instruct_to_js(node.cond,existing_funcs,existing_vars)
  let instructions=instruct_to_js(node.instructions,existing_funcs,existing_vars)
  return `while(${condition}){${instructions}}`
}
function instruct_to_js(instruct, existing_funcs = [], existing_vars = []) {
  let code = ""
  let newfuncs = instruct[0].emptyfuncs.filter(x => !existing_funcs.includes(x));
  let newvars = instruct[0].vars.filter(x => !existing_vars.includes(x));

  let n_existing_f = newfuncs.concat(existing_funcs)
  let n_existing_v = newvars.concat(existing_vars)
  let funcs = []
  for (let i in newfuncs) {
    let f = newfuncs[i]
    let jsf = newf_to_js(f, n_existing_f, n_existing_v)
    funcs.push(jsf)
    code += `let ${jsf.name}=${jsf.code};\n`
  }
  for (let i in newvars) {
    let v = newvars[i]
    code += `let ${v.name}=${v.value};\n`
  }
  for (let tree of instruct) {
    if (tree.return) {
      code += "return "
    }
    for (let node of tree.nodes) {
      if (node.type == "g") {
        code += `(${instruct_to_js(node.val,n_existing_f,n_existing_v)})`
      } else if (node.type == "d") {
        if (typeof(node.val) == "number") {
          code += node.val
        } else if (typeof(node.val) == "string") {
          code += `"${node.val}"`
        }else{
        code+=node.val
        }
      } else if (node.type == "op") {
        code += node.val.string
      } else if (node.type == "func") {
        let args = node.vars.map(arg => instruct_to_js(arg, n_existing_f, n_existing_v)).join(",")
        code += `${node.func.name}(${args})`
      } else if (node.type == "point") {
        if (node.val instanceof ParseFunc) {
          code += `{name:"${node.val.name}",code:${node.val.name},isF:true}`
        } else {
          code += node.val.name
        }
      } else if (node.type == "ifelse") {
        code+=ifelse_to_js(node,n_existing_f,n_existing_v)
      } else if (node.type == "var") {
        code+=node.val.name
      } else if (node.type == "for") {
        code+=for_to_js(node,n_existing_f,n_existing_v)
      } else if (node.type == "while") {
        code+=while_to_js(node,n_existing_f,n_existing_v)
      }
    }
    if(instruct.length>1&&code[code.length-1]!=";"){
    code += ";\n"
    }
  }
  console.log(code)
  return code
}
