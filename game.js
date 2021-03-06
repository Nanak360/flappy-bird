const cvs = document.getElementById("bird");
const ctx = cvs.getContext("2d");

let frames = 0;
let score = 0;

const sprite = new Image();
sprite.src = "img/sprite.png";

//LOAD SOUNDS
const SCORE_S = new Audio();
SCORE_S.src = "audio/sfx_point.wav";

const FLAP = new Audio();
FLAP.src = "audio/sfx_flap.wav";

const HIT = new Audio();
HIT.src = "audio/sfx_hit.wav";

const SWOOSH = new Audio();
SWOOSH.src = "audio/sfx_swooshing.wav";

const DIE = new Audio();
DIE.src = "audio/sfx_die.wav";

//GAME STATE
const state = {
  current: 0,
  getReady: 0,
  game: 1,
  over: 2
}

//START BUTTON PROPS
const startBtn = {
  x: 120,
  y: 263,
  w: 83,
  h: 29,
}

//Control the game
cvs.addEventListener("click", function (evt) {
  switch (state.current) {
    case state.getReady:
      state.current = state.game;
      SWOOSH.play();
      break;
    case state.game:
      bird.flap();
      FLAP.play();
      break;
    case state.over:
      let rect = cvs.getBoundingClientRect();
      let clickX = evt.clientX - rect.left;
      let clickY = evt.clientY - rect.top;

      //START BUTTON CLICK CHECK
      if (clickX >= startBtn.x && clickX <= startBtn.x + startBtn.w && clickY >= startBtn.y && clickY <= startBtn.y + startBtn.h) {
        pipes.reset(); 
        score.reset();
        bird.resetSpeed();
        state.current = state.getReady;
      }
      break;
  }
});


//BACKGROUND
const bg = {
  sX: 0,
  sY: 0,
  w: 275,
  h: 266,
  x: 0,
  y: cvs.height - 226,
  dx: 0.3,

  draw: function () {
    ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
    ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x + this.w, this.y, this.w, this.h);
  },
  update: function () {
    if (state.current == state.game) {
      this.x = (this.x - this.dx) % (this.w / 2);
    }
  }
}
//FOREGROUND
const fg = {

  sX: 276,
  sY: 0,
  w: 224,
  h: 112,
  x: 0,
  dx: 2,
  y: cvs.height - 112,
  draw: function () {
    ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
    ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x + this.w, this.y, this.w, this.h);
  },

  update: function () {
    if (state.current == state.game) {
      this.x = (this.x - this.dx) % (this.w / 2);
    }
  }

}
//BIRD  
const bird = {
  animation: [
    { sX: 276, sY: 112 },
    { sX: 276, sY: 139 },
    { sX: 276, sY: 164 },
    { sX: 276, sY: 139 },
  ],
  x: 50,
  y: 150,
  w: 34,
  h: 26,
  radius: 12,
  frame: 0,

  gravity: 0.25,
  jump: 4.6,
  speed: 0,
  period: 0,
  draw: function () {
    let brd = this.animation[this.frame];
    ctx.drawImage(sprite, brd.sX, brd.sY, this.w, this.h, this.x - this.w / 2, this.y - this.h / 2, this.w, this.h);
  },
  flap: function () {
    this.speed = -this.jump;
  },
  update: function () {
    this.period = state.current == state.getReady ? 10 : 5;
    this.frame += frames % this.period == 0 ? 1 : 0;
    this.frame = this.frame % this.animation.length;

    if (state.current == state.getReady) {
      this.y = 150;
    } else {
      this.speed += this.gravity;
      this.y += this.speed;
      if (this.y + this.h / 2 >= cvs.height - fg.h) {
        this.y = cvs.height - fg.h - this.h / 2;
        this.frame = 1;
        if (state.current == state.game) {
          state.current = state.over;
          DIE.play();
        }
      }
    }
  },
  resetSpeed: function (){
    this.speed = 0;
  }
}
//PIPES
const pipes = {
  position: [],

  top: {
    sX: 553,
    sY: 0,
  },
  bottom: {
    sX: 502,
    sY: 0
  },
  w: 53,
  h: 400,
  gap: 120,
  maxYPos: -150,
  dx: 2,
  flag : true,

  draw: function () {
    for (let i = 0; i < this.position.length; i++) {
      let p = this.position[i];
      let topYPos = p.y;
      let bottomYPos = p.y + this.h + this.gap;

      //top pipe
      ctx.drawImage(sprite, this.top.sX, this.top.sY, this.w, this.h, p.x, topYPos, this.w, this.h);

      //bottom pipe
      ctx.drawImage(sprite, this.bottom.sX, this.bottom.sY, this.w, this.h, p.x, bottomYPos, this.w, this.h);
    }
  },

  update: function () {
    if (state.current !== state.game) {
      return;
    }
    if (frames % 100 == 0) {
      this.position.push({
        x: cvs.width,
        y: this.maxYPos * (Math.random() + 1)
      });
    }
    for (let i = 0; i < this.position.length; i++) {
      let p = this.position[i];
      let bottomPipeYPos = p.y + this.h + this.gap;

      //collision detection
      //top pipe
      if (bird.x + bird.radius > p.x && bird.x - bird.radius < p.x + this.w && bird.y + bird.radius > p.y && bird.y - bird.radius < p.y + this.h) {
        state.current = state.over;
        HIT.play();
      }
      //botton pipe
      if (bird.x + bird.radius > p.x && bird.x - bird.radius < p.x + this.w && bird.y + bird.radius > bottomPipeYPos && bird.y - bird.radius < bottomPipeYPos + this.h) {
        state.current = state.over;
        HIT.play();
      }
      p.x -= this.dx;
      if(this.flag && p.x + this.w/2 <= bird.x){
        score.value += 1;
        SCORE_S.play();
        score.best = Math.max(score.value, score.best);
        localStorage.setItem("best", score.best);
        this.flag = false;
      }
      if (p.x + this.w <= 0) {
        this.position.shift();
        this.flag=true;
      }
    }
  },

  reset: function(){
    this.position = [];
    this.flag = true;
  }
};
//GET READY MESSAGE
const getReady = {
  sX: 0,
  sY: 228,
  w: 173,
  h: 152,
  x: cvs.width / 2 - 173 / 2,
  y: 80,

  draw: function () {
    if (state.current === state.getReady) {
      ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
    }
  }
}
//GAME OVER MESSAGE
const gameOver = {
  sX: 175,
  sY: 228,
  w: 225,
  h: 202,
  x: cvs.width / 2 - 225 / 2,
  y: 90,

  draw: function () {
    if (state.current === state.over) {
      ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
    }
  }
}
//SCORE
score = {
  best: parseInt(localStorage.getItem("best")) || 0,
  value: 0,

  draw: function () {
    ctx.fillStyle = "#FFF";
    ctx.strokeStyle = "#000";
    if (state.current === state.game) {
      ctx.lineWidth = 2;
      ctx.font = "35px Russo One";
      ctx.fillText(this.value, cvs.width / 2, 50);
      ctx.strokeText(this.value, cvs.width / 2, 50);

    } else if (state.current == state.over) {
      ctx.font = "25px Russo One";
      ctx.fillText(this.value, 225, 186);
      ctx.strokeText(this.value, 225, 186);
      //BEST SCORE
      ctx.fillText(this.best, 225, 228);
      ctx.strokeText(this.best, 225, 228);
    }
  },
  reset: function (){
    this.value = 0;
  }
}

function draw() {
  ctx.fillStyle = "#70c5ce";
  ctx.fillRect(0, 0, cvs.width, cvs.height);
  bg.draw();
  pipes.draw();
  fg.draw();
  bird.draw();
  getReady.draw();
  gameOver.draw();
  score.draw();
}

function update() {
  bird.update();
  fg.update();
  bg.update();
  pipes.update();
}

function loop() {
  update();
  draw();
  frames++;

  requestAnimationFrame(loop);
}
loop();
