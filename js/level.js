class Platform {
  constructor(x, y, w, h=24, moving=false){
    Object.assign(this, {
      x, y, w, h, baseX:x, moving, phase:0 
    });
  }
  update(dt){
    if(this.moving){
      this.phase+=dt;
      this.x=this.baseX+Math.sin(this.phase)*105;
    }
  }
  draw(ctx, cx){
    let x=this.x-cx;
    ctx.fillStyle='#624a3b';
    ctx.fillRect(x, this.y, this.w, this.h);
    ctx.fillStyle='#91bd58';
    ctx.fillRect(x, this.y, this.w, 6);
  }
}
class Coin {
  constructor(x, y){
    Object.assign(this, {
      x, y, w:14, h:14, t:0 
    });
  }
  draw(ctx, cx){
    ctx.fillStyle='#ffd34d';
    ctx.fillRect(this.x-cx, this.y, 14, 14);
    ctx.fillStyle='#fff0a3';
    ctx.fillRect(this.x-cx+4, this.y+3, 4, 8);
  }
}
class Level {
  constructor(index){
    this.index=index;
    let data=LEVELS[index];
    Object.assign(this, {
      name:data.name, width:data.width, background:data.background, platforms:data.platforms.map(p=>new Platform(...p)), spikes:data.spikes||[], coins:data.coins.map(c=>new Coin(...c)), door:data.door, enemies:data.enemies.map(e=>new Enemy(...e)), boss:null, bossQueued:index===2 
    });
  }
  update(dt){
    this.platforms.forEach(p=>p.update(dt));
  }
}
const floor=(width)=>[0, 480, width, 60];
const LEVELS=[ {
  name:'Лес', width:2300, background:'forest', platforms:[floor(2300), [260, 390, 170], [550, 330, 145], [820, 405, 160], [1120, 345, 180], [1460, 395, 160], [1800, 330, 220]], spikes:[[460, 456, 55], [970, 456, 55]], coins:[[300, 355], [590, 294], [850, 370], [1160, 310], [1510, 360]], enemies:[['goblin', 370, 444, [300, 520]], ['goblin', 920, 444, [820, 1070]], ['archer', 1200, 309, [1120, 1300]]], door:{
    x:2170, y:410, w:44, h:70 
  }
}, {
  name:'Замок', width:2450, background:'castle', platforms:[floor(2450), [250, 395, 140], [510, 330, 150], [790, 390, 150], [1050, 310, 160], [1390, 370, 140, 24, true], [1720, 320, 190], [2020, 390, 180]], spikes:[[405, 456, 62], [730, 456, 58], [1600, 456, 70]], coins:[[280, 360], [740, 295], [820, 355], [1080, 275], [1430, 330], [1750, 285]], enemies:[['goblin', 330, 444, [230, 480]], ['goblin', 860, 444, [800, 980]], ['archer', 560, 294, [510, 660]], ['archer', 1800, 284, [1720, 1910]]], door:{
    x:2300, y:410, w:44, h:70 
  }
}, {
  name:'Тронный зал', width:1600, background:'throne', platforms:[floor(1600), [300, 380, 200], [740, 350, 160], [1120, 390, 210]], spikes:[[600, 456, 55]], coins:[[350, 345], [780, 315]], enemies:[['goblin', 420, 444, [300, 560]], ['goblin', 940, 444, [820, 1100]], ['archer', 1170, 354, [1120, 1330]]], door:null 
}];
