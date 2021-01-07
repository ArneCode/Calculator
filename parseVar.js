//Variablen
class ParseVar {
  constructor(name, value,norm=null,isUserVar=false,min=0,max=10,step=1) {
    this.name = name
    this.value = value
    this.isUserVar=isUserVar
    this.min=min
    this.max=max
    this.step=step
    if(norm){
      this.norm=norm
    }
    else{
    this.norm=value
    }
  }
  reset(){
  this.value=this.norm
  }
}

function get_standart_vars(calculator){
  let golden=new ParseVar("golden",1.6180339887498948482)
  let e=new ParseVar("e",1.61803398875)
  let G=new ParseVar("G",6.67e-11)
  let c=new ParseVar("c",299792458)
  let pi=new ParseVar("pi",3.14159265359)
  let globalCalc=new ParseVar("calculator",calculator)
  
let vars=[golden,e,G,c,pi].sort((a,b)=>b.name.length-a.name.length)
return vars
}