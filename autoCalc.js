function enableAutoCalc(calculator,parser,elements){
  for(let element of elements){
    element.elt.addEventListener("input",addToCalc.bind(element))
    }
  let to_calc=elements
  function addToCalc(){
    if(!to_calc.includes(this)){
      to_calc.push(this)
      }
    }
  let notcalcablerx=RegExp(/[a-z]\w*\(/i)
  function autoCalc(){
    if(to_calc!=[]){
      for(let element of to_calc){
        let text=element.elt.innerText
        if(!notcalcablerx.test(text)){
          let result,parsed
          try{
          parsed=parser.parse(text)
          result=calculator.calc(parsed)
          }catch(e){
            result=undefined
            }
          element.output.innerHTML=result
          element.output.style.display="inline"
          element.output.parentNode.style.display="inline"
          
          }
        }
      to_calc=[]
      }
    }
  setInterval(autoCalc,100)
  }