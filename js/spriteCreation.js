/** For backup purposes */

  // Create pacman graphics on offline canvases for animation purposes
  spriteCanvas.id = "pacmanCanvas";
  spriteCanvas.width = P_DIAMETER * 9;  // 9 frames (8 for motion, 9 for death)
  spriteCanvas.height = P_DIAMETER * 9;  // 4 directions + 4 Ghosts + Death
  
  // Pacman - 4 directions, 8 frames each
  for (let d = 0; d < 4; d++) {
    for (let f = 0; f < 8; f++) {
      spriteCtx.beginPath();
      spriteCtx.arc(P_DIAMETER*f + P_RADIUS, P_DIAMETER*d + P_RADIUS, P_RADIUS, ((f * 0.125 * 0.3) + ((0.5 * d)+1)) * Math.PI, ((2 - (f * 0.125 * 0.3) + ((0.5 * d)+1))) * Math.PI);
      spriteCtx.lineTo(P_DIAMETER*f + P_RADIUS, P_DIAMETER*d + P_RADIUS);
      spriteCtx.closePath();
    
      // Fill pacman's head yellow
      spriteCtx.fillStyle = "#FF0";
      spriteCtx.fill();
    }
  }

  // Ghosts (4 Ghosts, 4 Directions for eyes)
  for (let g = 0; g < 4; g++) {
    for (let d = 0; d < 4; d++) {
      spriteCtx.beginPath();
      // Ghost body
      spriteCtx.arc(P_DIAMETER*d + P_RADIUS, (P_DIAMETER*4+P_RADIUS)+(P_DIAMETER * g), P_RADIUS, 0, Math.PI, true);
      spriteCtx.lineTo(d*P_DIAMETER, P_DIAMETER*5+(P_DIAMETER * g));
      spriteCtx.lineTo((P_DIAMETER/4)+(P_DIAMETER * d), (P_DIAMETER*5 - P_RADIUS/2)+(P_DIAMETER * g));
      spriteCtx.lineTo((P_DIAMETER/2)+(P_DIAMETER * d), P_DIAMETER*5+(P_DIAMETER * g));
      spriteCtx.lineTo((3*P_DIAMETER/4)+(P_DIAMETER * d), (P_DIAMETER*5 - P_RADIUS/2)+(P_DIAMETER * g));
      spriteCtx.lineTo(P_DIAMETER+(P_DIAMETER * d), P_DIAMETER*5+(P_DIAMETER * g));
      spriteCtx.lineTo(P_DIAMETER+(P_DIAMETER * d), (P_DIAMETER*4+P_RADIUS)+(P_DIAMETER * g));
      spriteCtx.closePath();
      switch (g) {
        case 0:
          spriteCtx.fillStyle = "#ffA0b9";
          //spriteCtx.fillStyle = "orange";
          break;
        case 1:
          spriteCtx.fillStyle = "lightgreen";
          break;
        case 2:
          spriteCtx.fillStyle = "deepskyblue";
          break;
        case 3:
          spriteCtx.fillStyle = "orange";
      }
      spriteCtx.fill();
      // Ghost eyes (whites)
      spriteCtx.beginPath();
      spriteCtx.arc(d*P_DIAMETER + P_DIAMETER/3, (P_DIAMETER*4 + P_RADIUS/1.5)+(P_DIAMETER * g), 3.5, 0, 2 * Math.PI, false);
      spriteCtx.arc(d*P_DIAMETER + 2*P_DIAMETER/3, (P_DIAMETER*4 + P_RADIUS/1.5)+(P_DIAMETER * g), 3.5, 0, 2 * Math.PI, false);
      spriteCtx.fillStyle = "#FFFFFE";
      //spriteCtx.fillStyle = "white";
      spriteCtx.fill();
      spriteCtx.closePath();
      // Ghost eyes (blacks)
      spriteCtx.beginPath();
      let eyeX = 0, eyeY = 0;
      switch (d) {
        case 0:
          eyeX = -2;
          break;
        case 1:
          eyeY = -2;
          break;
        case 2:
          eyeX = +2;
          break;
        case 3:
          eyeY = +2;

      }

      spriteCtx.arc((d*P_DIAMETER + P_DIAMETER/3)+eyeX, (P_DIAMETER*4 + P_RADIUS/1.5)+(P_DIAMETER * g)+eyeY, 1.5, 0, 2 * Math.PI, false);
      spriteCtx.arc((d*P_DIAMETER + 2*P_DIAMETER/3)+eyeX, (P_DIAMETER*4 + P_RADIUS/1.5)+(P_DIAMETER * g)+eyeY, 1.5, 0, 2 * Math.PI, false);
      spriteCtx.fillStyle = "black";
      spriteCtx.fill();
      spriteCtx.closePath();
    }
  }

  // Death sequence (first frame)
  spriteCtx.beginPath();
  spriteCtx.arc(P_RADIUS, P_DIAMETER*8 + P_RADIUS, P_RADIUS, 0, 2 * Math.PI);
  spriteCtx.lineTo(P_RADIUS, P_DIAMETER*8 + P_RADIUS);
  spriteCtx.closePath();
  spriteCtx.fillStyle = "#FF0";
  spriteCtx.fill();
  // The rest of the death sequence
  for (let f = 1; f < 8; f++) {
    spriteCtx.beginPath();
    spriteCtx.arc(P_DIAMETER*f + P_RADIUS, P_DIAMETER*8 + P_RADIUS, P_RADIUS, 1.5 * Math.PI - (f * 0.4), 1.5 * Math.PI + (f * 0.4), true);
    spriteCtx.lineTo(P_DIAMETER*f + P_RADIUS, P_DIAMETER*8 + P_RADIUS);
    spriteCtx.closePath();
    spriteCtx.fillStyle = "#FF0";
    spriteCtx.fill();
  }
  // Final frame
  
  spriteCtx.beginPath();
  //spriteCtx.moveTo(P_DIAMETER*8 + P_RADIUS, P_DIAMETER*8 + P_RADIUS);
  //spriteCtx.arc(P_DIAMETER*8 + P_RADIUS, P_DIAMETER*8 + P_RADIUS, 3, 0, 2 * Math.PI,false);
  spriteCtx.lineWidth = 1;
  spriteCtx.moveTo(P_DIAMETER*8 + 11, P_DIAMETER*8 + 8);
  spriteCtx.lineTo(P_DIAMETER*8 + 8, P_DIAMETER*8);
  spriteCtx.moveTo(P_DIAMETER*8 + P_RADIUS + 5, P_DIAMETER*8 + P_RADIUS - 3);
  spriteCtx.lineTo(P_DIAMETER*8 + P_RADIUS + 11, P_DIAMETER*8+4);
  spriteCtx.moveTo(P_DIAMETER*8 + P_RADIUS + 6, P_DIAMETER*8 + P_RADIUS + 7);
  spriteCtx.lineTo(P_DIAMETER*9-1.5, P_DIAMETER*9-1);
  spriteCtx.moveTo(P_DIAMETER*8 + 6, P_DIAMETER*8 + P_RADIUS + 5);
  spriteCtx.lineTo(P_DIAMETER*8 + 2, P_DIAMETER*8 + P_RADIUS + 10);
  spriteCtx.strokeStyle = "#FFFF00";
  spriteCtx.stroke();
