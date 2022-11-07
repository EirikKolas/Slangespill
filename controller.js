const Controller = function() {

  this.up = new Controller.ButtonInput();
  this.left = new Controller.ButtonInput();
  this.down = new Controller.ButtonInput();
  this.right = new Controller.ButtonInput();

  this.space = new Controller.ButtonInput();
  this.r = new Controller.ButtonInput();
  this.z = new Controller.ButtonInput();

  this.buttonPressed = function(type, keyCode) {

    var keyDown = (type == "keydown" ? true : false);

    switch (keyCode) {
      case 87:
      case 38:
        this.up.getInput(keyDown);
        break;
      case 65:
      case 37:
        this.left.getInput(keyDown);
        break;
      case 83:
      case 40:
        this.down.getInput(keyDown);
        break;
      case 68:
      case 39:
        this.right.getInput(keyDown);
        break;
      case 32:
        this.space.getInput(keyDown);
        break;
      case 82:
        this.r.getInput(keyDown);
        break;
      case 90:
        this.z.getInput(keyDown);
        break;
      default:;

    }

  }

};



Controller.ButtonInput = function() {
  this.down = this.active = false;
};

Controller.ButtonInput.prototype = {

  getInput : function(keyDown) {
    if (this.down != keyDown) this.active = keyDown;
    this.down = keyDown;

  }
};
