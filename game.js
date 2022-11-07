String.prototype.removeLast = function() {
  return this.substring(0, this.length - 1);
};

String.prototype.splitTile = function(part) {
  return this.split('-')[part];
};

Number.prototype.toCoords = function(width, multiplier = 1) {
  let x = this % width;
  let y = Math.floor(this/width);
  return {"x":x*multiplier, "y":y*multiplier};
};

Array.prototype.findValues = function(value) {
  let values = this.reduce((arr, current, index) => {

    if (current !== undefined && current.startsWith(value)) {
      arr.push(index);
    }
    return arr;

  }, []);
  return values;
};




const Game = function() {
  this.world = {
    backgroundColor : "#123",
    
    player : 0,
    ateFood : false,

    refMap  : [],
    gameMap : [],
    width   : undefined,
    height  : undefined,

    goalIndex : undefined,

    gameStates : [],


        /////////////////////
      /////// UPDATE //////
    /////////////////////

    update : function() {

      player = this.player;
      tempMap = Object.assign([], this.gameMap);

      //Reference object for move() and testCollision()
      const playersnake = "1-" + player + "a";
      const goal = this.gameMap[this.goalIndex] || "0-0";
      let testedObjs = [];



      if (this.crashedSpike == true) {
        this.crashedSpike = false;
        return "undo";
      }
      else if (goal.startsWith("1") && goal.endsWith("a") && this.gameMap.findValues("4").length == 0) {
        return goalHandler.bind(this)(goal)
      }
      //if player is moving and movement is successfull, update playersnake pos
      else if (this.direction && this.move( tempMap.indexOf(playersnake), playersnake, tempMap, playersnake.removeLast(), testedObjs )) {

        let slitherSnake = this.findValues(playersnake.removeLast(), this.gameMap);
        slitherSnake.sort((a, b) => this.gameMap[a] > this.gameMap[b]);

        for (let i = 0; i < slitherSnake.length; i++) {
          tempMap[slitherSnake[i]] = this.gameMap[slitherSnake[i+1]] || this.refMap[slitherSnake[i]];
          //removes undefined values
          // tempMap = tempMap.filter(Boolean);
        }

        if (this.ateFood == true) {
          foodHandler.bind(this)(slitherSnake)
        }

        this.storeGameState();
        this.gameMap = tempMap.slice(0);
      }
      else {
        this.direction = undefined;
        this.canStoreGameState = true;
      }


      function goalHandler(goal) {
        let eSnake = this.findValues(goal.removeLast(), this.gameMap);
        eSnake = eSnake.map(i => this.gameMap[i]).sort();
        let eTail = this.gameMap.indexOf(eSnake[eSnake.length -1]);

        //remove tail
        this.gameMap[eTail] = this.refMap[eTail];

        if (eSnake.length <= 1) {

          if (eSnake[0] === playersnake) {
            this.direction = undefined;
            return "needNewPlayer";
          }
        }
      }

      function foodHandler(slitherSnake) {
        this.ateFood = false;
        const lastIndex = slitherSnake.length-1;
        const mapValue  = this.gameMap[slitherSnake[lastIndex]]

        const char      = String.fromCharCode(mapValue.charCodeAt(3) + 1);
        const newValue  = mapValue.removeLast() + char;

        tempMap[slitherSnake[lastIndex]] = newValue;
      }
    },



    move : function(index, mapValue, map, playersnake, testedObjs) { //returns true if movement is possible, false otherwise

      let obj = this.tileToCoords(index);
      this.nudge(obj);

      if (obj.x < 0 || obj.x > this.width -1 || obj.y < 0 || obj.y > this.height -1)
        return false;

      let newIndex = this.coordsToTile(obj);

      if (testCollision.bind(this)(newIndex)) {
        this.enteredGoal = false;
        this.crashedSpike = false;
        return false;
      }
      map[newIndex] = mapValue;

      //replace value if it hasn't been replaced before
      if (map[index] === this.gameMap[index]) {
        map[index] = this.refMap[index];
      }
      return true;


      function testCollision(index) { //Returns true if collision is detected
        let tile = map[index] || "0-0";

        switch (tile.splitTile(0)) {

          case "0": //nothing
            return false;

          case "4": //food
            if (mapValue === playersnake + "a") {
              this.ateFood = true;
              return false
            }
          case "1": //snake
          case "2": //box

            if (tile.startsWith(playersnake))
              return true;

            //don't count collision if it is with a object already visited by the function
            //this is to ensure that no objects are moved twice
            if (testedObjs.indexOf(tile.removeLast()) !== -1)
              return false;
            //add current object to the list of visited object if not already visited.
            testedObjs.push(tile.removeLast());

            //create array with all the indexes of the collided object
            let collidedIndexes = this.findValues(tile.removeLast(), map);

            //store the values in another array, because they might be deleted by recursive calls of the function
            let collidedValues = collidedIndexes.map(i => tempMap[i]);


            //if the object hasn't been visited yet, update() that object
            for (let i = 0; i < collidedIndexes.length; i++) {
                if (!this.move(collidedIndexes[i], collidedValues[i], map, playersnake, testedObjs))
                  return true;
            }

            return false;

          case "3": //wall
            return true;


          case "5": //spike
            // setTimeout(() => {this.undo()}, 200)
            if (mapValue.startsWith(1)) {
              this.crashedSpike = true;
              return false;
            }
            return true;

          case "6": //hole // DEBUG:
            let obj = this.findValues(mapValue.removeLast(), map);

            obj.forEach((mapIndex) => { //returns false if any part of the object is not over a hole
              if (!this.refMap[mapIndex].startsWith("6")) {
                return false;
              }
            })

            if (tile.startsWith("2")) { // DEBUG:
              for (let i = 0; i < obj.length; i++) {
                map[obj[i]] = this.refMap[obj[i]];
              }
              return false;
            }
            //undo()
            return true;


          default: //idk
            return true;
        }

      }
    },

    moveUp    : function() {if (!this.direction) this.direction = "up";},
    moveLeft  : function() {if (!this.direction) this.direction = "left";},
    moveDown  : function() {if (!this.direction) this.direction = "down";},
    moveRight : function() {if (!this.direction) this.direction = "right";},

    nudge : function(obj) {

      switch (this.direction) {
        case "up"   : obj.y--; break;
        case "left" : obj.x--; break;
        case "down" : obj.y++; break;
        case "right": obj.x++; break;
        default: undefined;
      }
    },

    storeGameState : function() {
      if (this.canStoreGameState) {
        this.gameStates.unshift({"map": this.gameMap.slice(0), "player": this.player})
        if (this.gameStates.length > 30)
          this.gameStates.pop()
      }
      this.canStoreGameState = false;
    },

    undo : function() {
      this.gameMap = this.gameStates[0].map.slice(0);
      this.player = this.gameStates[0].player;
      this.direction = undefined;

      if (this.gameStates.length > 1) {
        this.gameStates.shift()
      }
    },

    findValues : function(value, map) {
      let values = map.reduce(function(arr, current, index) {
        if (current === undefined)
          return arr;
        else if (current.startsWith(value)) {
          arr.push(index);
        }
        return arr;
      }, []);

      return values;
    },

    coordsToTile : function(obj) {
      tile = obj.y*this.width + obj.x;
      return tile;
    },

    tileToCoords : function(tile) {
      let y = Math.floor(tile/this.width);
      let x = tile - y*this.width;
      return {"x":x,"y":y};
    },

    nextChar: function(c) {
      return String.fromCharCode(c.charCodeAt(0) + 1);
    },

    newMap : function(width, height) {
      this.refMap = []
      this.refMap.length = width*height;
      this.width = width;
      this.height = height;

      this.gameMap = Object.assign([], this.refMap);

      return this;
    },

    newWall : function(...values) {

      this.newGameElement([,this.refMap, this.gameMap], 3, values)

      return this;
    },

    newSnake : function(...coords) {

      this.newGameElement([this.gameMap], 1, coords, true, true)

      return this;
    },

    newBox : function(...values) {

      this.newGameElement([this.gameMap], 2, values, true)

      return this;
    },

    newFood : function(...values) {

      this.newGameElement([this.gameMap], 4, values, true)

      return this;
    },

    newSpike : function(...values) {

      this.newGameElement([this.refMap, this.gameMap], 5, values)

      return this;
    },

    newGoal : function(x,y) {
      let coords = {"x": x, "y": y};
      this.goalIndex = this.coordsToTile(coords);

      return this;
    },

    newGameElement : function(maps, prefix, values, id, increment) {
      let i = 0;
      let char = "a";

      if (id === true) {
        i = 1;
      }

      for (i ; i < values.length; i+=3) {
        const coords = {"x":values[i], "y":values[i+1]}
        const index = this.coordsToTile(coords);

        let newElement = prefix + "-";

        if (id === true) {
          newElement += values[0];
        }

        if (typeof values[i+2] === "string") {
          newElement += values[i+2];
        }
        else {
          i--;
          if (prefix != 1) {
            newElement += "0";
          }
        }
        if (increment === true) {
          newElement += char;
          char = this.nextChar(char);
        }

        maps.forEach( (map) => {
          map[index] = newElement;
        })
      }
    }


  }


};
