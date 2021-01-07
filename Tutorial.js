//Tutorial

let textpart1=
`Anleitung:

Rechnungen in das calculation Feld eingeben. 
Mögliche Rechenzeichen sind: 
* mal
/ geteilt
+ plus
- minus
^ hoch
% modulo/rest
( ) klammern
Logische Operanden:
> < <= >= == || &&
|| logisches oder
&& logisches und

Variablen:
Vollständige Liste der Variablen unter Variables/existing Variables
Syntax: $variablenname Bsp: $pi => 3.14159265359
Eigene Variablen können unter Variables/create new Variable erstellt werden
`
let textpart2=
`
Funktionen:
Es gibt mehrere vorgefertigte Funktionen, vollständige Liste unter functions/existing functions. Syntax: function(variable1,variable2,variable3,etc.)
Funktionen können in einem Graph oder einer Tabelle dargestellt werden:
Syntax: graph(@function1,@function2,etc.) oder table(@function1,@function2,etc.)
Tabelle und Graph unter Visualisation/

Eigene Funktionen:
Unter functions/create new function kann man eine neue function erstellen.

IfElse:
Man kann auch Bedingungen verwenden.
Bsp: if(random()>0.5){alert("größer als 0.5")}else{alert("kleiner als 0.5")}
Der else Block muss immer vorhanden sein.
`
let tutorialButton=document.getElementById("tutorialbutton")
tutorialButton.onclick=function(){
  alert(textpart1)
  alert(textpart2)
}