//Ruft die Funktion zum Graph zeichnen auf
function setup() {
  createCanvas(windowWidth,windowHeight/2).parent("canavas");
  background(255)
  pixelDensity(10)
    createButton("Graph speichern").mousePressed(() => saveCanvas("Calculator" + str(new Date() / 1000), "png")).parent("canavas")

}
function draw() {
  updateGraph()
}