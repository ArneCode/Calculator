function make_coloureditable(){
for (let elt of document.getElementsByClassName("coloureditable")) {
  //elt.contentEditable = "true"
  //elt.addEventListener("input", setTextColors)
  setTextColors.bind(elt)(null,false)
}
}
let to_colour=[]
function addToColour(elt){
  if(!to_colour.includes(elt))
  to_colour.push(elt)
  }
function colorUpdate(){
  //console.log(to_colour)
  for(let elt of to_colour){
  setTextColors.bind(elt)(null,true)
    }
  to_colour=[]
window.requestAnimationFrame(colorUpdate)
  
  }
window.requestAnimationFrame(colorUpdate)

colorUpdate()
function setTextColors(evt,withCaret=true) {
  withCaret=withCaret&&document.activeElement==this //checks wether element is focused
  let chars = []
  let text = this.innerText
  let caretPos
  if(withCaret){
  caretPos=getCaretPos(this)
    }
  let stringList=[]
  let bracketList=[]
  let nopointerrx=RegExp(/[^@]\$\w*\s*[+\-*/]=/g)
    let numrx = RegExp(/(\+|\-)?(\d+(\.\d+)?(e(\+|\-)\d+)?|Infinity|true|false)/gm)
  let operrx=RegExp(/([\+\-\/%=<>]|\*|\^|xor)/g)
  let stringrx=RegExp(/("[^"]*"?)/g)
  let specialrx=RegExp(/(if|else|let|for|while|function|return)/g)
  let varrx=RegExp(/\$[a-z]+\w*/gi)
  let bracketrx=RegExp(/(\([^(){}]*\)|{[^(){}]*})/gm)
  let funcrx=RegExp(/([a-z]\w*(?=\()|(?<=@)[a-z]\w*)/gi)
 // text = text.replace(nopointerrx, replaceColour.bind({color: "black",error:true}))
  
  text=text.replace(stringrx,replaceString.bind({stringList,firstTime:true,index:0}))
  text = text.replace(operrx, replaceColour.bind({color: "orange"}))
  text = text.replace(numrx, replaceColour.bind({color: "darkblue"}))
  text = text.replace(specialrx, replaceColour.bind({color: "purple"}))
  text = text.replace(varrx, replaceColour.bind({color: "red"}))
  text = text.replace(funcrx, replaceColour.bind({color: "cornflowerblue"}))
  text = text.replace("@", replaceColour.bind({color: "orange"}))
  
  while(bracketrx.test(text)){
  text=text.replace(bracketrx,replaceBracket.bind({bracketList}))
  }
  text = text.replace(/[{}()]/g, replaceColour.bind({color: "black",error:true}))
  for(let b of bracketList){
    text=text.replace(/~#b\d+#~/,match=>bracketList[Number(match.slice(3,-2))])
    }
  text=text.replace(/~#s#~/g,replaceString.bind({stringList,firstTime:false,index:0}))
  
  this.innerHTML=text
  if(withCaret){
  setCaretPos(this,caretPos)
    }
}
function replaceString(match){
  if(this.firstTime){
  this.stringList.push(match)
  return "~#s#~"
  }else{
    this.index+=1
    return `<span style="color:green">${this.stringList[this.index-1]}</span>`
    }
  }
  function replaceBracket(match){
    this.bracketList.push(`<span style="color:purple">${match[0]}</span>${match.slice(1,-1)}<span style="color:purple">${match[match.length-1]}</span>`)
    return `~#b${this.bracketList.length-1}#~`
    }
function replaceColour(match) {
  let err=""
  if(this.error){
  err=";background-color:red"
  }
  return `<span style="color:${this.color+err}">${match}</span>`
}
function getCaretPos(elt){
  let sel=window.getSelection()
  let childs=Object.values(elt.childNodes)
  let currNode=sel.anchorNode
  if(currNode instanceof Text&&currNode.parentNode!=elt){
    currNode=currNode.parentNode
    }
  let nodePos=childs.indexOf(currNode)
  let nodesUpToNode=childs.slice(0,nodePos)
  
  let nodeCaretPos=sel.getRangeAt(0).endOffset
  let caretPos=nodeCaretPos
  for(let pnode of nodesUpToNode){
    if(pnode instanceof Text){
      caretPos+=pnode.wholeText.length
      }else{
    caretPos+=pnode.innerText.length
      }
    }
  return caretPos
  }
function setCaretPos(elt,pos){
  let childs=Object.values(elt.childNodes)
  let nodePos=pos
  let selectedNode=childs[0]
  for(let child of childs){
    if(!(child instanceof Text)){
    child=child.childNodes[0]
    }
    let length=child.wholeText.length
      selectedNode=child
    if(nodePos>length){
    nodePos-=length    
    }else{
      break;
      }
    }
  if(selectedNode==undefined){return}
  let sel=window.getSelection()
  let range=document.createRange()
  try{
  if(selectedNode instanceof Text){
  range.setStart(selectedNode,nodePos)
  }else{
  range.setStart(selectedNode.childNodes[0],nodePos)
    }
  range.collapse(true)
  
  sel.removeAllRanges()
  sel.addRange(range)}catch(e){
  console.log(e.stack)
  }
}
  
make_coloureditable()