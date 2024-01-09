/* A prototype PacMan clone as a means of learning the
   HTML5 Canvas object and graphics controls.

  Plans: Fix or simplify collision code
         Allow for scaling         
         Mobile usability (swipe actions? onscreen controls?)
         Hide globals
         Invincability Food
*/

/* So many global variables... gross. Need to fix this, but how? */
const STEP = 2;
const P_DIAMETER = 24;
const P_RADIUS = 12;
const C_WIDTH = 632;
const C_HEIGHT = 464;
const UP = 38;
const DOWN = 40;
const LEFT = 37;
const RIGHT = 39;
const MAP = "PacmanMap.png";
const POWER_DOTS = "PowerDots.png";

// Using a few different canvases with layers
let gCanvas;
let gCtx;
let spriteCanvas = document.createElement('canvas');
let spriteCtx = spriteCanvas.getContext('2d', {
      powerPreference: "high-performance"
    });
spriteCtx.globalAlpha = 1;

let mCanvas = document.createElement('canvas');
let mCtx = mCanvas.getContext('2d', {
      powerPreference: "high-performance"
    });
mCtx.globalAlpha = 1;
let dCanvas = document.createElement('canvas');
let dCtx = dCanvas.getContext('2d', {
      powerPreference: "high-performance"
    });
dCtx.globalAlpha = 1;

let scoreBox;
let ready;
let paused;
let score = 0;
let currentFrame = -1;
let deathSequence = false;
let splash = true;
let gameOn = false;
let pauseEnabled = false;
let eatUp = true;
let pacman;
let ghosts = [];
let assets;
let sirenBuffer;

/* Object representing a sprite */
class Sprite {
  constructor(left, top, direction, speed) {
    this.left = left;
    this.top = top;
    this.direction = direction;
    this.speed = speed;
  }

  // Move the sprite (need to merge with the four functions)
  move() {
    switch (this.direction) {
      case UP:
        this.top -= this.speed;
        break;
      case RIGHT:
        this.left += this.speed;
        // Check wrap-around
        if (this.left > gCanvas.width-P_RADIUS-1) {
          this.left = 0 - P_RADIUS;
        }
        break;
      case LEFT:
        this.left -= this.speed;
        // Check wrap-around
        if (this.left < 0 - P_RADIUS-1) {
          this.left = gCanvas.width - P_RADIUS;
        }
        break;
      case DOWN:
        this.top += this.speed;
    }
  }
}

// Keyboard control (arrow keys)
document.addEventListener('keydown', function(e) {
  let event = window.event ? window.event : e;
  event.preventDefault(); 

  // Press any key to begin playing
  if (splash) {
    splash = false;
    finalSetup();

    return;
  }

  if (gameOn) {
    switch (event.keyCode) {
      case UP:
      case 87:
        pacman.wantDirection = UP;
      break;
      case DOWN:
      case 83:
        pacman.wantDirection = DOWN;
      break;
      case LEFT:
      case 65:
        pacman.wantDirection = LEFT;
      break;
      case RIGHT:
      case 68:
        pacman.wantDirection = RIGHT;
        break;
      case 32:
        pause();
        break;
    }
  } else if (event.keyCode == 32) {
    pause();
  } 

});

function init() {
  let assetNames = ["SplashScreen.png", MAP, POWER_DOTS, "PacmanSprites.png", "Paused.png", "ReadyShadow.png"];

  score = 0;
  currentFrame = -1;
  deathSequence = false;
  splash = true;
  gameOn = false;
  pauseEnabled = false;
  eatUp = false;

  scoreBox = document.getElementById("score");
  gCanvas = document.getElementById("gCanvas");
  gCtx = gCanvas.getContext("2d", {
      powerPreference: "high-performance"
    });
  
  // Setup Pacman obj
  pacman = new Sprite(304, 364, UP, STEP);
  pacman.startLeft = pacman.left;
  pacman.startTop = pacman.top;
  pacman.eating = false;
  pacman.mouthOpening = true;
  pacman.frame = 0;
  pacman.wantDirection = LEFT;
  // Setup the ghost objs
  for (let g = 0; g < 4; g++) {
    ghosts[g] = new Sprite(4, 4, UP, STEP);
    ghosts[g].startTop = Math.ceil(C_HEIGHT/2);
    ghosts[g].index = g;
    ghosts[g].wantDirection = UP;
  }
  ghosts[0].startLeft = Math.ceil(C_WIDTH/2) - (P_DIAMETER*2);
  ghosts[1].startLeft = ghosts[0].startLeft + P_DIAMETER;
  ghosts[2].startLeft = ghosts[1].startLeft + P_DIAMETER;
  ghosts[3].startLeft = Math.ceil(C_WIDTH/2) - P_RADIUS;
  ghosts[3].startTop = 190;

  // Load the assets and setup the canvas
  if (assets === undefined) {
    assets = {};
    console.log("Loading Images")
    loadAssets(assetNames, showSplashScreen);
  } else {
    showSplashScreen();
  }

  // Offline canvas sizes
  mCanvas.width = dCanvas.width = C_WIDTH;
  mCanvas.height = dCanvas.height = C_HEIGHT;
  spriteCanvas.width = P_DIAMETER * 9; 
  spriteCanvas.height = P_DIAMETER * 9; 
  dCtx.fillStyle = 'black';
  mCtx.fillStyle = 'black';
  
  // For debugging the canvases, uncomment this and in the HTML file
  //document.getElementById("extra").appendChild(spriteCanvas);
  //document.getElementById("extra").appendChild(dCanvas);
  //document.getElementById("extra").appendChild(mCanvas);

  // Start with 3 Lives
  pacman.lives = {
    number: 3,
    left: [C_WIDTH - P_DIAMETER - (P_RADIUS + P_DIAMETER*2 + 10), C_WIDTH - P_DIAMETER - (P_RADIUS + P_DIAMETER + 5), C_WIDTH - P_DIAMETER - P_RADIUS],
    top: C_HEIGHT+10
  };

  ready = assets["ReadyShadow.png"];
  paused = assets["Paused.png"];
}

// Load the list of assets (does this need to be a separate function?)
function loadAssets(names, callback) {
  initSounds();

  let n,name,
      count  = names.length,
      call = function() {
        //console.log(`Loaded image ${count} of ${names.length}: ${names[count-1]}`);
        if (--count == 0) callback();
      };

  for(let n = 0 ; n < names.length ; n++) {
    name = names[n];

    assets[name] = document.createElement('img');
    assets[name].addEventListener('load', call);
    assets[name].src = "../images/" + name;
  }
}

// Gets called after the splash screen is removed
function finalSetup() {
  console.log("Final Setup");
  //volume(document.getElementById("volume").value/100);
  
  // Hide the splash screen and draw the assets
  gCtx.clearRect(0, 0, C_WIDTH, C_HEIGHT);
  mCtx.drawImage(assets[MAP], 0, 0);
  dCtx.drawImage(assets[POWER_DOTS], 0, 0);
  gCtx.drawImage(mCanvas, 0, 0);
  gCtx.drawImage(dCanvas, 0, 0);
  spriteCtx.drawImage(assets["PacmanSprites.png"], 0, 0);

  document.getElementById("score").innerText = "Score: 0";

  // Draw the 3 Lives to start
  let lX = P_DIAMETER*4;
  gCtx.drawImage(spriteCanvas, lX, 0, P_DIAMETER, P_DIAMETER, pacman.lives.left[0], pacman.lives.top, P_DIAMETER, P_DIAMETER);
  gCtx.drawImage(spriteCanvas, lX, 0, P_DIAMETER, P_DIAMETER, pacman.lives.left[1], pacman.lives.top, P_DIAMETER, P_DIAMETER);
  gCtx.drawImage(spriteCanvas, lX, 0, P_DIAMETER, P_DIAMETER, pacman.lives.left[2], pacman.lives.top, P_DIAMETER, P_DIAMETER);

  setTimeout(() => {  
      // Starting animation with "READY!" and the start delay.
      console.log("Starting the game...");
      // Opening music
      playSound(BEGINNING);

      startGame();
  }, 400); 
}

// Begin the game, after the opening animations
function startGame() {
  //volume(document.getElementById("volume").value/100);
  setTimeout(() => {  
    showHideReady();
    pacman.lives.number--;
    gCtx.clearRect(pacman.lives.left[2-pacman.lives.number], pacman.lives.top, P_DIAMETER, P_DIAMETER);
  }, 1000);
  setTimeout(() => {  showHideReady(true); }, 4000);
  setTimeout(() => {  
    gameOn = true; 
    pauseEnabled = true;
    currentFrame = requestAnimationFrame(update);
    sirenBuffer = playSound(SIREN, true);
  }, 4500);  
}

// Ask for user to press any key before playing
function showSplashScreen() {
  splash = true;
  document.getElementById("score").innerText = "New Game";
  gCtx.drawImage(assets["SplashScreen.png"], 0, 0);
}

// Does what it says...
function showHideReady(hide = false) {
  if (!hide) {
    // Ready!
    drawSprites(true);
    gCtx.drawImage(ready, 164, 296);
  } else {
    // Copy over from the map
    gCtx.clearRect(164, 296, ready.width, ready.height);
    gCtx.drawImage(mCanvas, 164, 296, ready.width, ready.height,164, 296, ready.width, ready.height);
  }
}

// New frame
function update(timeStamp) {
    
  if (gameOn) {
    // Blink the power dots

    // Pacman
    if (pacman.wantDirection != pacman.direction) {
      if (!checkWallCollision(pacman, pacman.wantDirection)) {
        pacman.direction = pacman.wantDirection;
        pacman.eating = true;
      }
    }

    if (pacman.eating) {
      // Check wall collision
      pacman.eating = !checkWallCollision(pacman, pacman.direction);
      // Check "food" collision
      checkFoodCollision();
    }

    // Ghost movement and wall collisions
    // Turning & Forward collision check
    for (let g = 0; g < 4; g++) {
      if (ghosts[g].wantDirection != ghosts[g].direction) {
        if (!checkWallCollision(ghosts[g], ghosts[g].wantDirection)) {
          ghosts[g].direction = ghosts[g].wantDirection;
        }
      }

      // Check for wall collision, turn if colliding... This is temporary
      while (checkWallCollision(ghosts[g], ghosts[g].direction)) {
        ghosts[g].direction = randInt(37, 40);

      }

      // Want to turn at random?
      if (randInt(1,20) == 5) {
        let newDirection = randInt(1,2);

        switch (ghosts[g].direction){
          case UP:
          case DOWN:
            ghosts[g].wantDirection = (newDirection == 1) ? LEFT : RIGHT;
          break;
          case LEFT:
          case RIGHT:
            ghosts[g].wantDirection = (newDirection == 1) ? UP : DOWN;
          break;
        }
      }
    }
    
    // Check for ghost collisions
    if (checkGhostCollision()) {
      gameOn = pauseEnabled = false;
      sirenBuffer.stop();
      setTimeout(() => { 
        // Death animation...
        playSound(DEATH_SOUND);
        pacman.frame = 0;
        deathSequence = true;
        currentFrame = requestAnimationFrame(update);
      }, 500);
      return;
    }

    // Next frame
    drawSprites();
    currentFrame = requestAnimationFrame(update); 

  } else if (deathSequence) {
    /* DEATH SEQUENCE */
    // Go through the frames of the death sequence and then return to normal
    gCtx.drawImage(mCanvas, 0, 0);
    gCtx.drawImage(dCanvas, 0, 0);
    gCtx.drawImage(spriteCanvas, P_DIAMETER*pacman.frame, P_DIAMETER*8, P_DIAMETER, P_DIAMETER, pacman.left, pacman.top, P_DIAMETER, P_DIAMETER);
    if (++pacman.frame == 10) {
      pacman.frame = 0;
      deathSequence = false;
        // if there are lives left, start again, otherwise game over
      if (pacman.lives.number > 0) {
        gCtx.clearRect(0, 0, C_WIDTH, C_HEIGHT);
        gCtx.drawImage(mCanvas, 0, 0);
        gCtx.drawImage(dCanvas, 0, 0);
        startGame();
      } else {
        alert("Game over");
        init();
      }
    }
    setTimeout(() => { currentFrame = requestAnimationFrame(update); }, 130);
  }

}

/** Is pacman over a food dot? If yes, delete it and score++ **/
function checkFoodCollision() {
  
  let lookx = pacman.left + P_RADIUS;
  let looky = pacman.top + P_RADIUS;

  // Look slightly ahead of center
  switch (pacman.direction) {
    case RIGHT:   // right
      lookx += 4;
      break;
    case DOWN:   // down
      looky += 4;
      break;
    case LEFT:   // left
      lookx -= 4;
      break;
    case UP:   // up
      looky -= 4;
  }

  let c = mCtx.getImageData(lookx, looky, 1, 1).data;
  
  // Check the colour 225, 216, 145 (this is gross!)
  if ((c[0] == 225) && (c[1] == 216) && (c[2] == 145)) {
    //console.log("Yum!");
    mCtx.fillRect(pacman.left, pacman.top, P_DIAMETER, P_DIAMETER);
    score = score + 10;
    scoreBox.innerText = "Score: " + score;
    playSound((eatUp) ? EAT_UP : EAT_DOWN);

    eatUp = !eatUp;
  } else {
    c = dCtx.getImageData(lookx, looky, 1, 1).data;
    
    if ((c[0] == 255) && (c[1] == 50) && (c[2] == 100)) {
      console.log("Power pellet!");
      dCtx.clearRect(pacman.left - 12, pacman.top - 12, P_DIAMETER + 24, P_DIAMETER + 24);
      score = score + 50;
      scoreBox.innerText = "Score: " + score;
    } else {
      //console.log(c[0],c[1],c[2]);
    }
  }
}

// Check for a collision in the given direction
function checkWallCollision(obj, dir) {
  let lookx, looky;
  let lookw = 1, lookh = 1;

  // Where are we looking?
  switch (dir) {
    case RIGHT:   // right
      lookx = obj.left + P_DIAMETER;
      looky = obj.top;
      lookh = P_DIAMETER;
      break;
    case DOWN:   // down
      lookx = obj.left;
      looky = obj.top + P_DIAMETER;
      lookw = P_DIAMETER;
      break;
    case LEFT:   // left
      lookx = obj.left - 1;
      looky = obj.top;
      lookh = P_DIAMETER;
      break;
    case UP:   // up
      lookx = obj.left;
      looky = obj.top - 1;
      lookw = P_DIAMETER;
      
  }

  // If the colour of the pixels in front are white, hit wall
  let p = mCtx.getImageData(lookx, looky, lookw, lookh).data;
  
  // This is AWFUL, loop through all the pixels and look for a collision
  for (let i = 0; i < p.length; i += 4) {
    if ((p[i] == 255) && (p[i+1] == 255) && (p[i+2] == 255)) {
      return true;
    }
    
  }
  return false;
}

// Did Pacman hit a ghost? And is he powered up?
function checkGhostCollision() {
  // Rudementary at first, but we'll get there...
  
  // Pacman is a circle of r = 12, let's create that equation and see if a ghost is in it
  let cx = pacman.left + P_RADIUS;
  let cy = pacman.top + P_RADIUS;

  let rSquared = 27;

  // Check multiple points of each ghost
  for (let g = 0; g < 4; g++) {
    // Could get smart about things and NOT check if they aren't close in tops/lefts
    
    // left
    if (inCircle(rSquared, cx, cy, ghosts[g].left, ghosts[g].top+P_RADIUS)) return true;;
    // right
    if (inCircle(rSquared, cx, cy, ghosts[g].left+P_DIAMETER, ghosts[g].top+P_RADIUS)) return true;;
    // top
    if (inCircle(rSquared, cx, cy, ghosts[g].left+P_RADIUS, ghosts[g].top)) return true;;
    // bottom
    if (inCircle(rSquared, cx, cy, ghosts[g].left+P_RADIUS, ghosts[g].top+P_DIAMETER)) return true;;
  }
  return false;
}

// Return whether a given point is inside (or on) the given circle
function inCircle(rS, cx, cy, x, y) {
  return (rS >= Math.pow((x - cx), 2) + Math.pow((y - cy), 2));
}

function drawSprites(restart = false) {
  // Redraw the map and dots
  gCtx.drawImage(mCanvas, 0, 0);

  // Try to blink the power dots
  //Int(374/10) mod 10 = 7
  if ((Math.round(currentFrame/40) % 40) % 2 == 0)
    gCtx.drawImage(dCanvas, 0, 0);
    
  // Go through all the sprites and draw them
  for (let g = 0; g < ghosts.length; g++) {
    // Place the ghosts in its starting position?
    if (restart) {
      ghosts[g].top = ghosts[g].startTop;
      ghosts[g].left = ghosts[g].startLeft;
    }
    ghosts[g].move();
  }
  
  // Reset Pacman to starting position?
  if (restart) {
    pacman.direction = UP;
    pacman.wantDirection = LEFT;
    pacman.left = pacman.startLeft;
    pacman.top = pacman.startTop;
    pacman.eating = false;
    pacman.mouthOpening = true;
    pacman.frame = 0;
  }

  // Update Pacman's location and animation
  if (pacman.eating) {
    // Move the Pacman
    pacman.move();

    // Pick the mouth animation frame 
    if (pacman.mouthOpening) {
      if (++pacman.frame == 7) pacman.mouthOpening = false;
    }
    else {
      if (--pacman.frame === 0) pacman.mouthOpening = true;
    }
  }

  // Redraw the ghosts
  for (let g = 0; g < ghosts.length; g++) {
    // Draw the ghost, picking colour from index
    gCtx.drawImage(spriteCanvas, P_DIAMETER * (ghosts[g].direction-37), (P_DIAMETER*4)+(ghosts[g].index*P_DIAMETER), P_DIAMETER, P_DIAMETER, ghosts[g].left, ghosts[g].top, P_DIAMETER, P_DIAMETER);
  }

  // Redraw Pacman
  gCtx.drawImage(spriteCanvas, P_DIAMETER * pacman.frame, P_DIAMETER * (pacman.direction-37), P_DIAMETER, P_DIAMETER, pacman.left, pacman.top, P_DIAMETER, P_DIAMETER);
}

// Self-explanatory
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) ) + min;
}

// Pause or play
function pause() {
  if (pauseEnabled) {
    if (!gameOn) {
      if (currentFrame > 0) {
        // Clear the overlay
        gCtx.clearRect(0, 0, C_WIDTH, C_HEIGHT);
        gCtx.drawImage(mCanvas, 0, 0);
        gCtx.drawImage(dCanvas, 0, 0);
        //drawSprites();
        currentFrame = requestAnimationFrame(update);
        gameOn = !gameOn;
      }
      playPause();
    } else {   
      // Draw overlay
      gCtx.drawImage(paused, 0, 0);
      gameOn = !gameOn;
      playPause();
    }
  } 
}
