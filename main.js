window.onload = function() {

      /////////////////////
    ///// FUNCTIONS /////
  /////////////////////

  function buttonPressed(evt) {

    controller.buttonPressed(evt.type, evt.keyCode);

  }



  function resize() {
    display.resize(document.documentElement.clientWidth - 32, document.documentElement.clientHeight - 64, game.world.height / game.world.width);
    // render();
  }


  function createBackground() {
    display.drawMap(game.world.goalIndex, game.world.backgroundColor);
  }


  function render() {

    display.clear();

    display.drawSnake(game.world.gameMap, game.world.player);

    display.render();

  }




  function update() {

    if (controller.up.active)     {game.world.moveUp();}
    if (controller.left.active)   {game.world.moveLeft();}
    if (controller.down.active)   {game.world.moveDown();}
    if (controller.right.active)  {game.world.moveRight();}

    if (controller.space.active && !game.world.direction)  {cyclePlayer(); controller.space.active = false;}

    if (game.world.player !== undefined) {

      switch (game.world.update()) {

        case "needNewPlayer":

          cyclePlayer();
          controller.up.active = controller.left.active =
          controller.down.active  = controller.right.active = false;
          break;

        case "undo":

          engine.stop()
          game.world.undo();

          controller.up.active    = false;
          controller.down.active  = false;
          controller.left.active  = false;
          controller.right.active = false;

          setTimeout(engine.start, 150);
          break;
        default:

      }

    }
    else {
      game.world.direction = undefined;
      display.playerColor = 20;
      engine.stop();
    }

  };


  function cyclePlayer() {
    let player = game.world.player;
    display.playerColor = 0;
    //find available snakes
    let snake = game.world.findValues("1", game.world.gameMap);

    snake = snake.reduce(function(arr, current) {
      let currentSnake = game.world.gameMap[current].splitTile(1).removeLast();
      arr[currentSnake] = parseInt(currentSnake);

      return arr;
    }, []).sort();


    if (snake[snake.indexOf(player)+1] !== undefined) {
      game.world.player = snake[snake.indexOf(player)+1];
    }
    else {
      game.world.player = snake[0];
    }
  };



  function load() {

    engine.stop();
    controller.r.active = false;
    game.world.player = 0;
    game.world.gameStates.length = 0;

    let levelselect = document.getElementById("ddlLevelselect");
    let btn         = document.getElementById("btnLevelselect");

    levelselect.blur()
    btn.blur()

    level[levelselect.value]()


    display.background.canvas.height = display.buffer.canvas.height = display.context.canvas.height = game.world.height*tileSize;
    display.background.canvas.width  = display.buffer.canvas.width  = display.context.canvas.width  = game.world.width*tileSize;

    display.worldInfo.refMap   = game.world.refMap;
    display.worldInfo.width    = game.world.width;
    display.worldInfo.tileSize = tileSize;

    game.world.storeGameState();

    resize();

    createBackground();

    engine.start();
  }

  function undo() {
    if (!game.world.direction) {
      game.world.undo();
      controller.z.active = false;
    }
  }

  function createLevelList(levels) {
    const select = document.getElementById('ddlLevelselect');

    levels.forEach((_level, index) => {
      let option = document.createElement('option');
      option.value = index;
      option.innerHTML = " Level " + index;
      select.appendChild(option)
    })
  }
      /////////////////////
    ////// OBJECTS //////
  /////////////////////

  var engine = new Engine(1000/20, update, render);
  var controller = new Controller();
  var game = new Game();
  var display = new Display(document.getElementById('worldCanvas'));



  var level = [];

  level[1] = () => {
    game.world
      .newMap(6,6)
      .newWall(
        4,0,'bl', 5,0,'b2',
        2,1,'m2',
        1,3,'m3',
        1,4,'b1', 3,4,'tl', 4,4,'m4', 5,4,'t2',
        3,5,'l1', 4,5,'m3', 5,5,'m1',
      )
      .newGoal(4,2)

      .newSnake(0, 3,0, 2,0, 1,0, 1,1)
  }

  level[2] = () => {
    game.world
      .newMap(5,5)
      .newGoal(2,2)
      .newWall(
        0,0,'br', 4,0,'bl',
        3,2,
        0,4,'tr', 4,4,'tl',
      )

      .newSnake(0, 2,1, 3,1)

      .newFood(0, 1,1,'01')
      .newFood(1, 1,3,'02')
      .newFood(2, 3,3,'03')
      .newFood(3, 2,4,'01')
  }

  level[3] = () => {
    game.world
      .newMap(10,10)
      .newGoal(2,3)
      .newWall(
        2,0,'b2', 6,0,'m3', 7,0,'r1',
        7,1,'br',
        4,3,'tr', 8,3,'m1',
        4,4,'i3', 5,4,'t1', 7,4,'tl', 8,4,
        1,5,'vt', 7,5,'i4',
        1,6,'vm',
        1,7,'vb', 4,7,'s1', 7,7,'b2',
        9,8,'tl',
        0,9,'t1', 3,9,'tr', 8,9,'tl', 9,9,'i4'
      )
      .newSpike(
        3,0,'b1', 4,0,'b1', 5,0,'b1',
        1,9,'t1', 2,9,'t1'
      )
      .newFood(0, 8,5,'02')
      .newSnake(0, 2,2, 1,2, 1,3, 1,4, 2,4)
  }

  level[4] = () => {
    game.world
      .newMap(9,9)
      .newWall(
        4,0, 6,0, 8,0,
        4,1,
        4,3,
        0,4, 7,4, 8,4,
        8,5,
        0,6, 2,6, 8,6,
        0,7, 1,7, 2,7, 3,7, 8,7,
        0,8, 1,8, 2,8, 3,8, 6,8, 7,8, 8,8
      )
      .newSpike(
        0,0,'b1', 1,0,'b1', 2,0,'b1', 3,0,'b1', 5,0,'b1',
        4,2,
        7,3,'t1', 8,3,'t1',
        //0,4,'r1',
        0,5,'r1', 7,5,'l1',
        1,6,'t1', 3,6,'t1', 7,6,'l1',
        7,7,'l1',
        4,8,'t1', 5,8,'t1'
      )
      .newGoal(7,0)
      .newSnake(0, 0,2, 0,1, 1,1)
      .newSnake(1, 2,1, 2,2, 1,2)
  }
  
  level[5] = () => {
    game.world
      .newMap(8,8)
      .newGoal(6,2)
      .newWall(
        0,0,'b1', 1,0,'i2', 2,0,'i1', 3,0,'br', 6,0,'i2', 7,0,'m1',
        6,1,'bl', 7,1,'i2',
        1,2,'vt',
        1,3,'vb', 3,3,'tl', 4,3,'t1',
        4,4,'m4', 5,4,'m3',
        0,5,'i3', 1,5,'tr', 5,5,'i2', 6,5,'i3', 7,5,'t2',
        5,6,'l1', 6,6,'m1', 7,6,'m3',
        4,7,'tl', 5,7,'i4', 6,7,'m2', 7,7,'m4'
      )
      .newFood(0, 1,1, 5,2, 6,4, 1,6)

      .newSnake(0, 3,6, 3,7, 2,7)
  }

  level[6] = () => {
    game.world
    .newMap(6,6)
    .newWall(
    0,0,'m1', 2,0,'r2', 5,0,'m4',
    0,2,'m3', 2,2,'r1', 5,2,'i2',
    0,3,'m4', 2,3,'i3', 3,3,'tr', 5,3,'bl',
    3,5,'tl', 4,5,'t2', 5,5,'t1'
    )
    .newSpike(0,1,'r1', 5,1,'l1')
    .newFood(0, 4,1)
    .newGoal(1,0)
    .newSnake(0, 1,3, 1,4)
    .newSnake(1, 1,2, 1,1)
  }
 
  level[7] = () => {
    game.world
      .newMap(6,6)
      .newGoal(3,0)
      .newWall(
        0,0,'b1', 1,0,'b2', 2,0,
        2,1,'i1', 3,1,'b1', 4,1,'br',
        0,5,'t2', 1,5,'tr', 5,5,'tl'
      )
      .newSpike(5,3,"ul", 5,4,"l1")
      
      .newFood(0, 1,3,'01')
      .newFood(1, 5,2,'02')
      .newSnake(0, 4,5, 3,5, 2,5)
      .newSnake(1, 0,1, 1,1)
  }

  level[8] = () => {
    game.world
      .newMap(7,7)
      .newWall(
        //5,0,'i2', 6,0,'m2', 7,0,'m3',
        4,0,'l2', 5,0,'i1', 6,0,'b2',
        1,1,'tl', 2,1,'t2', 4,1,'bl',
        1,2,'m4',
        1,3,'m1', 2,3,'m3',
        0,5,'i3', 0,5,'t2', 1,5,'tr',
        0,6,'m1', 0,6,'m2', 1,6,'i3', 2,6,'t2', 3,6,'i4', 4,6,'i3', 5,6,'t2', 6,6,'i4'
      )
      .newGoal(2,2)

      .newSnake(0, 3,5, 2,5, 2,4, 1,4)
      .newSnake(1, 2,0, 1,0, 0,0, 0,1)
  }

  level[9] = () => {
    game.world
    .newMap(7,7)
    .newWall(
      0,0,'m1', 1,0,'m2', 2,0, 4,0,'r1',
      0,1, 1,1,'m4', 4,1,'br',
      0,2,'i1',
      0,3,'r1', 5,3, 's1',
      0,4,'r2',
      0,5,'r2',
      0,6,'r1'
    )

    .newSpike(
      3,0,'b1',
      2,1,'r1',
      1,2,'b1', 2,2,'br'
    )
    .newGoal(3,2)

    .newSnake(0, 3,5, 4,5, 5,5)
    .newSnake(1, 3,6, 4,6)
    .newSnake(2, 3,1, 3,2, 3,3, 4,3)

    .newFood(0, 3,4, '02')
    .newFood(1, 4,4, '03')
  }

  level[10] = () => {
      game.world
      .newMap(7,7)
      .newWall(
        0,0,'br', 3,0,'b2', 5,0,'i2', 6,0,'m1',
        5,1,'bl', 6,1,'i2',
        0,2,'r1', 6,2,'l1',
        0,4,'r2', 6,4,'l2',
        0,6,'tr', 3,6,'t2', 4,6, 6,6,'tl'
      )
      .newFood(0, 6,5, '01')
      .newFood(2, 0,1, '03')

      .newSpike(
        1,0,'b2', 2,0,'b2', 4,0,'b2',
        0,3,'r2', 6,3,'l2',
        0,5,'r2',
        1,6,'t2', 2,6,'t2', 4,6,'t2', 5,6,'t2'
      )
      .newGoal(3,3)

      .newSnake(0, 3,2, 2,2, 1,2, 1,3)
      .newSnake(1, 3,4, 4,4, 5,4, 5,3)
      .newSnake(2, 4,3, 3,3, 2,3)

  }




  level[20] = () => {
    game.world
      .newMap(10,10)
      .newGoal(1,5)
      .newWall(1,1, 1,3, 1,4, 2,4, 3,2, 6,1, 4,4, 1,6, 2,7, 7,2, 6,7, 5,8)

      .newSnake(0, 9,0, 9,1)
      .newSnake(1, 0,9, 1,9)
  }

  level[21] = () => {
    game.world
      .newMap(10,10)
      .newGoal(2,5)
      // .newWall(1,1, 'br',1,3, 1,4, 2,4, 3,2, 6,1, 1,6, 2,7, 7,2, 6,7, 5,8)
      .newWall(
        2,1, 7,1, 
        4,2,
        1,3, 2,3, 
        1,4, 2,4, 3,4, 
        1,5,
        1,6, 2,6, 
        3,7,
        6,8
      )
      .newSpike(5,4)

      .newSnake(0, 9,0, 9,1)
      .newSnake(1, 0,9, 1,9)
      .newSnake(2, 9,9, 8,9)
  }

  level[22] = () => {
    game.world
      .newMap(7,7)
      .newGoal(3,0)
      .newWall(
        0,0, 1,0, 2,0,
        3,1, 5,1,
        0,6, 1,6, 6,6,
        )
        .newSpike(6,4,"ul", 6,5,"l1")
        
        .newFood(0, 1,3,'01')
        .newFood(1, 6,3,'02')
        .newSnake(0, 5,6, 4,6, 3,6, 2,6)
        .newSnake(1, 0,1, 1,1)
  }

  level[23] = () => {
    game.world
      .newMap(7,7)
      .newGoal(4,4)
      .newWall(
        0,0,'i1', 1,0,'b1', 2,0,'br', 3,0,'m4', 4,0,'i1', 5,0,'b2', 6,0,'i2',
        0,1,'r2', 6,1,'l1',
        0,2,'br', 6,2,'i4',
        0,4,'i1', 6,4,'tl',
        0,5,'r2', 6,5,'l1',
        0,6,'i3', 1,6,'t1', 2,6,'i4', 4,6,'tl', 5,6,'t1', 6,6,'i4'
      )
      .newSpike(
        0,3,'r1', 6,3, 'l1',
        3,6,'t1'
      )
      .newFood(0, 3,3, '02')
      .newFood(1, 2,2, '03')
      .newSnake(0, 5,1, 5,2)
      .newSnake(1, 1,5, 1,4)
  }





      /////////////////////
    ///// INITIALIZE ////
  /////////////////////


  const tileSize = 16;

  createLevelList(level);

  window.addEventListener("keydown", buttonPressed);
  window.addEventListener("keyup", buttonPressed);

  window.addEventListener("keydown", () => {
      if (controller.r.active) load()
      if (controller.z.active) undo()
    }
  );
  window.addEventListener("resize", resize);

  document.getElementById("ddlLevelselect").addEventListener("change", load);
  document.getElementById("btnLevelselect").addEventListener("click", load);
  document.getElementById("btnUndo").addEventListener("click", undo);

  display.tileSheet.image.addEventListener("load", function() {
    load();
  }, { once:true });

  display.tileSheet.image.src = "tilesheet.png";

}//onload end
