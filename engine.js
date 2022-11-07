var gameLoop;
var displayLoop;
const Engine = function(fps, update, render) {

  this.start = function() {


      gameLoop = setInterval(update, fps);
      displayLoop = setInterval(render, fps);

  },
  this.stop = function() {
    clearInterval(gameLoop);
    clearInterval(displayLoop);
  }
}
