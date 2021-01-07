//Operanden
class Operand {
  constructor(sign, action, string=null) {
    this.sign = sign
    this.operate = action
    if(string){
      this.string=string
      }else{
      this.string=this.sign.source.replace(/\\/g,"")
      }
  }
}
const Plus = new Operand(/\+/g, (a, b) => a + b)
const Minus = new Operand(/\-/g, (a, b) => a - b)
const Dot = new Operand(/\*/g, (a, b) => a * b)
const Div = new Operand(/\//g, (a, b) => a / b)
const Pow = new Operand(/\^/g, (a, b) => a ** b)
const Mod = new Operand(/%/g, (a, b) => a % b)
const GrEq = new Operand(/>=/g, (a, b) => a >= b)
const LessEq = new Operand(/<=/g, (a, b) => a <= b)
const Eq = new Operand(/==/g, (a, b) => a == b)
const Gr = new Operand(/>/g, (a, b) => a > b)
const Less = new Operand(/</g, (a, b) => a < b)
const NEq = new Operand(/!=/g, (a, b) => a != b)
const AND = new Operand(/&&/g, (a, b) => a && b)
const OR = new Operand(/\|\|/g, (a, b) => {
  return a || b
})
const SET=new Operand(/=/g,(a,b)=>a.value=b)
const SETPLUS=new Operand(/\+=/g,(a,b)=>a.value+=b)
const SETMINUS=new Operand(/\-=/g,(a,b)=>a.value-=b)
const SETDOT=new Operand(/\*=/g,(a,b)=>a.value*=b)
const SETDIV=new Operand(/\/=/g,(a,b)=>a.value/=b)


const XOR = new Operand(/xor/gi, (a, b) => (a || b) && !(a && b))