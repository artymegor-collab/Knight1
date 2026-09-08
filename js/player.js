class SpriteSheet {
  constructor(src, frames = 1) {
    this.image = new Image();
    this.frames = frames;
    this.ready = false;

    this.image.onload = () => {
      this.ready = true;
    };

    this.image.onerror = () => {
      this.ready = false;
    };

    this.image.src = src;
  }

  draw(ctx, x, y, w, h, frame = 0) {
  if (!this.ready) return false;

  const frameWidth = this.image.width / this.frames;
  const sourceX = frame * frameWidth;

  ctx.drawImage(
    this.image,
    sourceX,
    0,
    frameWidth,
    this.image.height,
    x,
    y,
    w,
    h
  );

  return true;
}
  }

class Player {
  constructor(x, y, hp){
    Object.assign(this, {
      x, y, w:45, h:45, vx:0, vy:0, hp, maxHp:hp, facing:1, onGround:false, inv:0, shootCd:0, idleTime: 0, runTime: 0,
    });
  }
  hit(damage){
    if(this.inv>0)return false;
    this.hp-=damage;
    this.inv=.65;
    return true;
  }
  update(dt, keys, platforms){
    this.vx=(keys.left?-220:0)+(keys.right?220:0);
    if(this.vx)this.facing=Math.sign(this.vx);
    if(keys.jump&&this.onGround){
      this.vy=-500;
      this.onGround=false;
      keys.jump=false;
      sound('jump') 
    }
    this.vy+=1200*dt;
    this.x+=this.vx*dt;
    this.y+=this.vy*dt;
    this.onGround=false;
    for(const p of platforms){
      if(this.vy>=0&&this.x+this.w>p.x&&this.x<p.x+p.w&&this.y+this.h>=p.y&&this.y+this.h-this.vy*dt<=p.y){
        this.y=p.y-this.h;
        this.vy=0;
        this.onGround=true;
      }
    }
    this.inv=Math.max(0, this.inv-dt);
    this.shootCd=Math.max(0, this.shootCd-dt);
    if (this.onGround && this.vx === 0) {
  this.idleTime += dt;
  this.runTime = 0;
} else if (this.onGround && this.vx !== 0) {
  this.runTime += dt;
  this.idleTime = 0;
} else {
  this.idleTime = 0;
  this.runTime = 0;
}
  }

  draw(ctx, cx) {
  const x = this.x - cx;
  const isRunning = this.onGround && this.vx !== 0;

  const sprite = isRunning
    ? window.sprites?.knightRun
    : window.sprites?.knightIdle;

  const animationTime = isRunning ? this.runTime : this.idleTime;
  const animationSpeed = isRunning ? 12 : 8;
  const frame = Math.floor(animationTime * animationSpeed) % 6;

  const spriteWidth = 45;
  const spriteHeight = 90;

  const spriteOffsetY = 15;
  const spriteY = this.y - (spriteHeight - this.h) + spriteOffsetY;

  if (sprite?.draw(ctx, x, spriteY, spriteWidth, spriteHeight, frame)) {
    return;
  }

  // Код цветной заглушки остаётся ниже

    ctx.save();
    ctx.translate(x+15, this.y+21);
    ctx.scale(this.facing, 1);
    ctx.fillStyle=this.inv>0?'#fff':'#72d4ff';
    ctx.fillRect(-11, -13, 22, 28);
    ctx.fillStyle='#dbefff';
    ctx.fillRect(-8, -20, 16, 10);
    ctx.fillStyle='#ffd45a';
    ctx.fillRect(8, -5, 13, 5);
    ctx.fillStyle='#27365c';
    ctx.fillRect(-8, 15, 6, 8);
    ctx.fillRect(2, 15, 6, 8);
    ctx.restore();
  }
}
