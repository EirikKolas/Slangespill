const Display = function(canvas) {
  this.background = document.createElement('canvas').getContext('2d');
  this.buffer     = document.createElement('canvas').getContext('2d');
  this.context    = canvas.getContext('2d');

  this.tileSheet = new Display.TileSheet(16, 9);
  this.tileSheet.map = new Display.Map([
    "1-hr", "1-lr", "1-lt", "1-rd", "1-dl", "3-tl", "3-t1", "3-t2", "3-tr",
    "1-hd", "1-ud", "1-ut", "1-ur", "1-lu", "3-l1", "3-m1", "3-m2", "3-r1",
    "1-hl", "1-rl", "1-rt", "1-dr", "1-ld", "3-l2", "3-m3", "3-m4", "3-r2",
    "1-hu", "1-du", "1-dt", "1-ru", "1-ul", "3-bl", "3-b1", "3-b2", "3-br",
    "5-ul", "5-t1", "5-tr", "5-t2", "5-r2", "3-vt", "3-hl", "3-hm", "3-hr",
    "5-l1", "5-m1", "5-r1", "5-l2", "5-b2", "3-vm", "3-s1", "3-i1", "3-i2",
    "5-bl", "5-b1", "5-br", "5-t3", "0000", "3-vb", "0000", "3-i3", "3-i4",
    "4-01", "4-02", "4-03", "gOff", "g_On", "0000", "0000", "0000", "0000",
    "0000", "0000", "0000", "0000", "0000", "0000", "0000", "0000", "0000",
    "0000", "0000", "0000", "0000", "0000", "0000", "0000", "0000", "0000",
  ]);

  this.snakeColor = [
    ["#ff8b00", "#5e4429"], //orange
    ["#0097ff", "#3f6b89"], //cyan
    ["#ed127c", "#823d70"],//magenta
    ["#62c606", "#57823d"], //probably green
  ];
  this.playerColor = 20;

  this.listVariants = function(map, value) {
    let list = map.findValues(value);

    list = list.reduce(function(arr, current) {

    let currentIndex = map[current].splitTile(1).removeLast();
    arr[currentIndex] = parseInt(currentIndex);
    return arr;

    }, []).sort();

    return list;
  }

  this.worldInfo = {
    refMap   : [],
    width    : "",
    tileSize : ""
  };



  this.drawMap = function(goal, bgColor) {

    const tileSize = this.worldInfo.tileSize;

    this.fill(this.background, bgColor);
    //walls
    this.drawGameElements(3, "m2")

    //spikes
    this.drawGameElements(5, "m1")

    //goal
    if (goal !== undefined) {
      // const goalCoords = goal.toCoords(this.worldInfo.width);
      // this.drawRect(this.background, goalCoords.x*tileSize, goalCoords.y*tileSize , "yellow");
      this.drawTile(this.background,'gOff',goal)
    }


  };


  this.drawSnake = (map, player) => {

    //Draw food
    this.drawGameElements(4, "01", this.buffer, map, true)

    const snakeArr = sort.bind(this)();
    const jointArr = listJoints.bind(this)(snakeArr);
    const colorArr = this.listVariants(map, "1")

    if (this.playerColor <= 26)
      this.playerColor++;

    for (let i = 0; i < snakeArr.length; i++) {

      if (snakeArr[i].length > 1) {

        for (let j = 0; j < snakeArr[i].length; j++) {

          let activeColor = 1;
          if (colorArr[i] === player && this.playerColor > j) {
            activeColor = 0
          }
            drawJoint.bind(this)(jointArr[i][j], snakeArr[i][j], this.snakeColor[colorArr[i]][activeColor])
        }

        for (let j = 0; j < snakeArr[i].length; j++) {

          this.drawTile(this.buffer, "1-" + jointArr[i][j], snakeArr[i][j])
        }
      }
    }

    function drawJoint(joint, index, color) {

      const coords  = index.toCoords(this.worldInfo.width, this.worldInfo.tileSize);
      const segment = joint.split("");
      const paddingSize = 4;
      loop:
      for (var i = 0; i < segment.length; i++) {

        let padding = {};
        padding.top = padding.left = padding.bottom = padding.right = paddingSize;

        switch (segment[i]) {
          case "u": padding.top    = -2; break;
          case "l": padding.left   = -2; break;
          case "d": padding.bottom = -2; break;
          case "r": padding.right  = -2; break;

          default: continue loop;
        }
        for (let j = 0; j <= 2; j++) {

          this.drawRect(
            this.buffer,
            coords.x + padding.left +2-j,
            coords.y + padding.top  +j,
            color,
            this.worldInfo.tileSize - padding.left - padding.right -4+2*j,
            this.worldInfo.tileSize - padding.top  - padding.bottom -2*j
          )
          this.render();
        }

      }

    }

    function sort() {
      let indeces = this.listVariants(map, "1")
      let returnValue = [];


      for (let i = 0; i < indeces.length; i++) {
        returnValue[i] = map.findValues("1-" + indeces[i]).sort((a, b) => map[a] > map[b]);
      }
      return returnValue;
    }


    function listJoints(snake) {
      let joints = [];
      for (let i = 0; i < snake.length; i++) {
        joints[i] = [];
        for (let j = 0; j < snake[i].length; j++) {
          joints[i][j] = findJoint.bind(this)(i,j);
        }
      }
      return joints;


      function findJoint(outer,inner) {
        let joint = "";

        let axis = [
          {"neg":"l", "pos":"r", "direction":1},                   /*x*/
          {"neg":"u", "pos":"d", "direction":this.worldInfo.width} /*y*/
        ];


        for (let i = -1; i < 2; i+=2) {
          loopAxis:
          for (let a = 0; a < 2; a++) {

            let value = axis[a]

            switch (snake[outer][inner+i]) {

              case snake[outer][inner] + value["direction"]:
              joint += value["pos"];
              break loopAxis;

              case snake[outer][inner] - value["direction"]:
              joint += value["neg"];
              break loopAxis;

              case undefined:
                if (i == -1) {
                  joint += "h";
                }
                else if (i == 1) {
                  joint += "t";
                }
                break loopAxis;

              default:
            } //switch

          } //for a
        } //for i
        return joint;

      } //findJoint()
    } //listJoints()


  };


  this.render = function() {

    this.context.drawImage(
      this.background.canvas,
      0, 0, this.background.canvas.width, this.background.canvas.height,
      0, 0, this.context.canvas.width, this.context.canvas.height
    );

    this.context.drawImage(
      this.buffer.canvas,
      0, 0, this.buffer.canvas.width, this.buffer.canvas.height,
      0, 0, this.context.canvas.width, this.context.canvas.height
    );

  };


  this.resize = function(width, height, height_width_ratio) {

    if (height / width > height_width_ratio) {

      this.context.canvas.height = width * height_width_ratio;
      this.context.canvas.width = width;

    } else {

      this.context.canvas.height = height;
      this.context.canvas.width = height / height_width_ratio;

    }

    this.context.imageSmoothingEnabled = false;

  };





  this.drawRect = function(target, x, y, color, width = this.worldInfo.tileSize, height = this.worldInfo.tileSize) {

    target.fillStyle = color;
    target.fillRect(x, y, width, height);
  };



  this.fill = function(target, color) {

    target.fillStyle = color;
    target.fillRect(0,0, this.buffer.canvas.width, this.buffer.canvas.height);
  };

  this.clear = function() {

    this.buffer.clearRect(0,0, this.buffer.canvas.width, this.buffer.canvas.height);
  };



  this.drawGameElements = function(elementType, def, target = this.background, map = this.worldInfo.refMap, id = false) {


    const values = map.findValues(elementType.toString());

    values.forEach((val) => {

      let texture = map[val].splitTile(1);
      if (id == true)
        texture = texture.slice(1);

      if (parseInt(texture) == 0) {
        texture = def;
      }

      this.drawTile(target, elementType + "-" + texture, val)
    })

  };



  this.drawTile = function(target, tileCode, sourceIndex) {

    const tileCoords = this.tileSheet.map[tileCode].toCoords(this.tileSheet.columns, this.tileSheet.tileSize);
    const mapCoords  = sourceIndex.toCoords(this.worldInfo.width, this.worldInfo.tileSize);

    target.drawImage(
      this.tileSheet.image,
      tileCoords.x, tileCoords.y, this.tileSheet.tileSize, this.tileSheet.tileSize,
      mapCoords.x, mapCoords.y, this.worldInfo.tileSize, this.worldInfo.tileSize
    )

  };

};// end of Display

Display.TileSheet = function(tileSize, columns) {

  this.image = new Image();
  this.tileSize = tileSize;
  this.columns = columns;

};
Display.Map = function(invertedMap) {
  let map = invertedMap.reduce( (arr, tileCode, key) => {
    arr[tileCode] = key;
    return arr;
  }, {});
  return map;
}
