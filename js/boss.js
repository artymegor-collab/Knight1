class Boss {
  constructor(x, y, hp){
    Object.assign(this, {
      x, y, w:54, h:64, hp, maxHp:hp, dir:-1, cd:1, hitCd:0, dead:false 
    });
  }
  update(dt, player, difficulty, shots){
    this.hitCd=Math.max(0, this.hitCd-dt);
    let phase=this.hp<50;
    this.x+=(Math.sign(player.x-this.x)||this.dir)*(phase?105:55)*difficulty.speed*dt;
    this.x=Math.max(80, Math.min(1400, this.x));
    this.cd-=dt;
    if(this.cd<=0){
      shots.push(new Projectile(this.x+25, this.y+25, Math.sign(player.x-this.x)||-1, 'enemy', difficulty.damage+3));
      this.cd=phase?.75:1.55;
    }
  }
  hit(d){
    this.hp-=d;
    this.hitCd=.14;
    if(this.hp<=0)this.dead=true;
  }
  draw(ctx, cx){
    let x=this.x-cx;
    if(!window.sprites?.boss?.draw(ctx, x, this.y, this.w, this.h)){
      ctx.fillStyle='#553265';
      ctx.fillRect(x, this.y, this.w, this.h);
      ctx.fillStyle='#9d77b8';
      ctx.fillRect(x+12, this.y+7, 28, 17);
      ctx.fillStyle='#d5b34a';
      ctx.fillRect(x+4, this.y+35, 46, 6);
    }
    drawBar(ctx, x, this.y-10, this.w, this.hp, this.maxHp);
  }
}
