//zusammensetzen von vorcompiliertem Code
class Calculator {
  calc(trees) {
    for(let tree of trees){
    let nodes = [...tree.nodes]
    let state = 0
    let next_state = true
    for(let opImp of tree.opImpPos){
      let state = opImp.importance
      let i=opImp.index
        let n = nodes[i]
          if (n.type == "op" && i > 0 && i < nodes.length - 1) {
            
            let a = nodes[i - 1].get(this)
            let b = nodes[i + 1].get(this)
            let result = n.val.operate(a, b)
            let node = new ParseNode("d", 0, [], result)
            nodes.splice(i - 1, 3, node)
            i = nodes.length
            next_state = false
          }
        
      
    }
      
      let result=nodes[0].get(this)
      if(tree.return||trees.length==1){
    return result
      }
  }
    }
}