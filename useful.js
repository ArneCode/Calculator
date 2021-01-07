//Nützliche Helferfunktionen, haben nicht umbedingt etwas mit dem Rechner zu tun

function concatRegex(regex1,regex2){ //code from https://stackoverflow.com/a/185529
  let flags = (regex1.flags + regex2.flags).split("").sort().join("").replace(/(.)(?=.*\1)/g, "")
  return new RegExp(regex1.source + regex2.source, flags);
  }
String.prototype.isOf = function(arr) {
  for (let e of arr) {
    if (this == e) {
      return true
    }
  }
  return false
}
 //map is from https://gist.github.com/xposedbones/75ebaef3c10060a3ee3b246166caab56
Number.prototype.map = function (in_min, in_max, out_min, out_max) {
  return (this - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}


function numToAlpha(n){
return (Math.floor(n/26)+10).toString(36)+((n%26)+10).toString(36)
}
function alphaToNum(alpha){
  alpha=alpha.split("")
  return (parseInt(alpha[0],36)-10)*26+parseInt(alpha[1],36)-10
}
String.prototype.searchForCorres=function(open, close, start = 0) {
    let index = start
    let level = 0
    let corres = -1
    let rechnung=this
    while (corres < 0 && index < rechnung.length) {
      if (rechnung[index] == open) {
        level++
      } else if (rechnung[index] == close) {
        level--
        if (level == 0) {
          return index
        }
      }
      index++
    }
    return corres
  }
function toFile(data){
  window.open("data:application/octet-stream," + encodeURIComponent(data), "funcdata")
}

Math.radians = function(degrees) {
  return degrees * Math.PI / 180;
};
 
// Converts from radians to degrees.
Math.degrees = function(radians) {
  return radians * 180 / Math.PI;
};