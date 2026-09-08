class SpriteSheet {
  // Работает и с одиночным PNG, и с первым кадром sprite sheet.
  constructor(src){
    this.image=new Image();
    this.ready=false;
    this.image.onload=()=>this.ready=true;
    this.image.onerror=()=>this.ready=false;
    this.image.src=src;
  }
  draw(ctx, x, y, w, h){
    if(!this.ready)return false;
    ctx.drawImage(this.image, 0, 0, this.image.width, this.image.height, x, y, w, h);
    return true;
  }
}
class Player {
  constructor(x, y, hp){
    Object.assign(this, {
      x, y, w:45, h:45, vx:0, vy:0, hp, maxHp:hp, facing:1, onGround:false, inv:0, shootCd:0 
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
  }
  draw(ctx, cx){
    let x=this.x-cx;
    if(window.sprites?.knight?.draw(ctx, x, this.y, this.w, this.h))return;
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
