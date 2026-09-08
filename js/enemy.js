class Projectile {
  constructor(x, y, dir, team, damage=20){
    Object.assign(this, {
      x, y, w:10, h:6, vx:dir*430, team, damage, life:2.2 
    });
  }
  update(dt){
    this.x+=this.vx*dt;
    this.life-=dt;
  }
  draw(ctx, cx){
    ctx.fillStyle=this.team==='player'?'#55cfff':'#f48a65';
    ctx.fillRect(this.x-cx, this.y, this.w, this.h);
  }
}
class Enemy {
  constructor(type, x, y, range){
    Object.assign(this, {
      type, x, y, w:30, h:36, hp:type==='goblin'?40:30, maxHp:type==='goblin'?40:30, range, dir:-1, cd:1.3, hitCd:0, dead:false 
    });
  }
  update(dt, player, difficulty, enemyShots){
    this.hitCd=Math.max(0, this.hitCd-dt);
    this.cd-=dt;
    if(this.type==='goblin'){
      let chase=Math.abs(player.x-this.x)<210?Math.sign(player.x-this.x):this.dir;
      this.x+=chase*55*difficulty.speed*dt;
      if(this.x<this.range[0]||this.x+this.w>this.range[1])this.dir*=-1;
    }
    else if(this.cd<=0){
      let d=Math.sign(player.x-this.x)||-1;
      enemyShots.push(new Projectile(this.x+15, this.y+14, d, 'enemy', difficulty.damage));
      this.cd=2;
    }
  }
  hit(d){
    this.hp-=d;
    this.hitCd=.15;
    if(this.hp<=0)this.dead=true;
  }
  draw(ctx, cx){
    let x=this.x-cx;
    if(!window.sprites?.[this.type]?.draw(ctx, x, this.y, this.w, this.h)){
      ctx.fillStyle=this.type==='goblin'?'#67bf58':'#c26d5b';
      ctx.fillRect(x, this.y, this.w, this.h);
      ctx.fillStyle=this.type==='goblin'?'#b2ea78':'#f3c08f';
      ctx.fillRect(x+7, this.y+5, 16, 11);
      if(this.type==='archer'){
        ctx.fillStyle='#77452f';
        ctx.fillRect(x+23, this.y+9, 4, 22) 
      }
    }
    drawBar(ctx, x, this.y-8, this.w, this.hp, this.maxHp);
  }
}
function drawBar(ctx, x, y, w, value, max){
  ctx.fillStyle='#361b2a';
  ctx.fillRect(x, y, w, 4);
  ctx.fillStyle='#75e16b';
  ctx.fillRect(x, y, w*Math.max(0, value)/max, 4);
}
