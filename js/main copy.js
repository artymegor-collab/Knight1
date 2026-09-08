const canvas=document.querySelector('#game'), ctx=canvas.getContext('2d'), overlay=document.querySelector('#overlay');
ctx.imageSmoothingEnabled=false;
window.sprites={
  knight:new SpriteSheet('assets/knight.png'), goblin:new SpriteSheet('assets/goblin.png'), archer:new SpriteSheet('assets/archer.png'), boss:new SpriteSheet('assets/boss.png') 
};

const backgrounds = {
  forest: new Image(),
  castle: new Image(),
  throne: new Image()
};

backgrounds.forest.src = 'assets/forest.png';
backgrounds.castle.src = 'assets/castle.png';
backgrounds.throne.src = 'assets/throne.png';

// Add these files to assets/: music.mp3, shoot.mp3, jump.mp3, death.mp3, victory.mp3.
const audio={
  music:new Audio('assets/music.mp3'),
  shoot:new Audio('assets/shoot.mp3'),
  jump:new Audio('assets/jump.mp3'),
  death:new Audio('assets/death.mp3'),
  victory:new Audio('assets/victory.mp3')
};

audio.music.loop=true;
audio.music.volume=.35;
Object.values(audio).forEach(track=>track.preload='auto');
const DIFFICULTIES={
  easy:{
    label:'ЛЁГКИЙ', hp:100, damage:5, speed:.8, boss:150 
  }, normal:{
    label:'НОРМАЛЬНЫЙ', hp:75, damage:10, speed:1, boss:200 
  }, hard:{
    label:'СЛОЖНЫЙ', hp:50, damage:15, speed:1.3, boss:250 
  }
};
let state='MENU', difficulty=DIFFICULTIES.normal, level, player, projectiles=[], enemyShots=[], camera=0, coins=0, last=0, keys={
  left:false, right:false, jump:false 
}, soundOn=true;

function playMusic(){
  if(!soundOn)return;
  audio.music.play().catch(()=>{});
}

function stopMusic(){
  audio.music.pause();
  audio.music.currentTime=0;
}

function playEffect(name){
  if(!soundOn||!audio[name])return;
  const effect=audio[name];
  effect.currentTime=0;
  effect.play().catch(()=>{});
}
function sound(kind){
  const effectNames={jump:'jump', shot:'shoot', death:'death', victory:'victory'};
  if(effectNames[kind]){
    playEffect(effectNames[kind]);
    return;
  }
  if(!soundOn)return;
  try{
    let a=new AudioContext(), o=a.createOscillator(), g=a.createGain();
    o.frequency.value={
      jump:380, shot:620, hit:140, hurt:100, win:760 
    }
    [kind]||300;
    g.gain.value=.035;
    o.connect(g).connect(a.destination);
    o.start();
    o.stop(a.currentTime+.08);
  }
  catch(e){
  }
}
function button(text, fn, secondary=false){
  let b=document.createElement('button');
  b.textContent=text;
  b.className=secondary?'secondary':'';
  b.onclick=fn;
  return b;
}
function screen(title, text, buttons){
  overlay.innerHTML='';
  let p=document.createElement('div');
  p.className='panel';
  p.innerHTML=`<h1 class="title">${title}</h1><p class="subtitle">${text}</p>`;
  let box=document.createElement('div');
  box.className='buttons';
  buttons.forEach(b=>box.append(b));
  p.append(box);
  overlay.append(p);
  overlay.classList.remove('hidden');
}
function menu(){
  state='MENU';
  stopMusic();
  screen('РЫЦАРЬ:<br>ПОСЛЕДНИЙ ЗАМОК', 'Яркое приключение с магией, монетами и последней битвой.', [button('ИГРАТЬ', chooseDifficulty), button('НАСТРОЙКИ', settings, true)]);
}
function chooseDifficulty(){
  state='DIFFICULTY';
  screen('ВЫБЕРИ СЛОЖНОСТЬ', 'Параметры меняют здоровье героя, силу и скорость врагов.', Object.entries(DIFFICULTIES).map(([k, v])=>button(v.label, ()=>start(k))));
}
function settings(){
  screen('НАСТРОЙКИ', `Звук: ${soundOn?'включён':'выключен'}`, [button(soundOn?'ВЫКЛЮЧИТЬ ЗВУК':'ВКЛЮЧИТЬ ЗВУК', ()=>{
  soundOn=!soundOn;
    if(soundOn&&state==='PLAYING')playMusic();
    if(!soundOn)audio.music.pause();
    settings() 
  }), button('НАЗАД', menu, true)]);
}
function start(key){
  difficulty=DIFFICULTIES[key];
  coins=0;
  playMusic();
  loadLevel(0);
}
function loadLevel(n){
  level=new Level(n);
  player=new Player(70, 420, difficulty.hp);
  projectiles=[];
  enemyShots=[];
  camera=0;
  state='PLAYING';
  playMusic();
  overlay.classList.add('hidden');
}
function shoot(){
  if(state!=='PLAYING'||player.shootCd>0||projectiles.length>=3)return;
  projectiles.push(new Projectile(player.x+(player.facing>0?player.w:0), player.y+18, player.facing, 'player'));
  player.shootCd=.28;
  sound('shot');
}
addEventListener('keydown', e=>{
  if(['ArrowLeft', 'ArrowRight', ' ', 'a', 'd', 'A', 'D', 'Escape'].includes(e.key))e.preventDefault();
  if(e.key==='ArrowLeft'||e.key.toLowerCase()==='a')keys.left=true;
  if(e.key==='ArrowRight'||e.key.toLowerCase()==='d')keys.right=true;
  if(e.key===' ')keys.jump=true;
  if(e.key==='Escape'&&state==='PLAYING')pause();
  else if(e.key==='Escape'&&state==='PAUSED')resume();
});
addEventListener('keyup', e=>{
  if(e.key==='ArrowLeft'||e.key.toLowerCase()==='a')keys.left=false;
  if(e.key==='ArrowRight'||e.key.toLowerCase()==='d')keys.right=false;
});
canvas.addEventListener('mousedown', shoot);
function pause(){
  state='PAUSED';
  audio.music.pause();
  screen('ПАУЗА', 'Игра остановлена.', [button('ПРОДОЛЖИТЬ', resume), button('В МЕНЮ', menu, true)]);
}
function resume(){
  state='PLAYING';
  playMusic();
  overlay.classList.add('hidden');
}

const overlaps=(a, b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;

function isExitUnlocked(){
  return level.coins.length===0&&level.enemies.length===0;
}

function damagePlayer(n){
  if(player.hit(n)){
    sound('hurt');
    if(player.hp<=0)gameOver();
  }
}

function gameOver(){
  state='GAME_OVER';
  stopMusic();
  sound('death');
  screen('РЫЦАРЬ ПОВЕРЖЕН', 'Соберись с силами и попробуй ещё раз.', [button('ПОВТОРИТЬ', ()=>loadLevel(level.index)), button('В МЕНЮ', menu, true)]);
}
function complete(){
  state='LEVEL_COMPLETE';
  screen('УРОВЕНЬ ПРОЙДЕН!', `Монет собрано: ${coins}`, [button('СЛЕДУЮЩИЙ УРОВЕНЬ', ()=>loadLevel(level.index+1))]);
}
function victory(){
  state='VICTORY';
  stopMusic();
  sound('victory');
  screen('КОРОЛЕВСТВО СПАСЕНО!', 'Тёмный рыцарь повержен, а последний замок снова в безопасности.', [button('ИГРАТЬ СНОВА', menu)]);
}
function update(dt){
  if(state!=='PLAYING')return;
  level.update(dt);
  player.update(dt, keys, level.platforms);
  if(player.y>560)return gameOver();
  level.enemies.forEach(e=>e.update(dt, player, difficulty, enemyShots));
  if(level.boss)level.boss.update(dt, player, difficulty, enemyShots);
  for(const e of level.enemies)if(!e.dead&&overlaps(player, e))damagePlayer(difficulty.damage);
  if(level.boss&&overlaps(player, level.boss))damagePlayer(difficulty.damage+3);
  for(const s of level.spikes)if(overlaps(player, {
    x:s[0], y:s[1], w:s[2], h:24 
  }))damagePlayer(difficulty.damage);
  projectiles.forEach(p=>p.update(dt));
  enemyShots.forEach(p=>p.update(dt));
  for(const p of projectiles){
    for(const e of level.enemies)if(!e.dead&&overlaps(p, e)){
      e.hit(p.damage);
      p.life=0;
      sound('hit');
    }
    if(level.boss&&!level.boss.dead&&overlaps(p, level.boss)){
      level.boss.hit(p.damage);
      p.life=0;
      sound('hit');
    }
  }
  for(const p of enemyShots)if(overlaps(p, player)){
    p.life=0;
    damagePlayer(p.damage);
  }
  projectiles=projectiles.filter(p=>p.life>0);
  enemyShots=enemyShots.filter(p=>p.life>0);
  level.enemies=level.enemies.filter(e=>!e.dead);
  level.coins=level.coins.filter(c=>{
    if(overlaps(player, c)){
      coins++;
      sound('hit');
      return false 
    }
    return true 
  });
  if(level.index===2&&level.enemies.length===0&&!level.boss&&level.bossQueued){
    level.boss=new Boss(1290, 416, difficulty.boss);
    level.bossQueued=false;
  }
  if(level.boss?.dead)victory();
  if(level.door&&isExitUnlocked()&&overlaps(player, level.door))complete();
  camera=Math.max(0, Math.min(level.width-canvas.width, player.x-300));
}

function draw() {
  ctx.fillStyle = '#12213b';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (!level) return;

  const background = backgrounds[level.background];

  if (background && background.complete && background.naturalWidth > 0) {
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
  }

  // остальной код функции draw() оставьте без изменений
  for(let i=0;
  i<20;
  i++){
    ctx.fillStyle='rgba(255,255,255,.08)';
    ctx.fillRect((i*137-camera*.18)%1100, 80+(i%5)*42, 3, 3);
  }
  level.platforms.forEach(p=>p.draw(ctx, camera));
  level.spikes.forEach(s=>{
    ctx.fillStyle='#e7eaf7';
    for(let x=s[0];
    x<s[0]+s[2];
    x+=12){
      ctx.beginPath();
      ctx.moveTo(x-camera, 480);
      ctx.lineTo(x+6-camera, 456);
      ctx.lineTo(x+12-camera, 480);
      ctx.fill();
    }
  });
  level.coins.forEach(c=>c.draw(ctx, camera));
  level.enemies.forEach(e=>e.draw(ctx, camera));
  level.boss?.draw(ctx, camera);
  projectiles.forEach(p=>p.draw(ctx, camera));
  enemyShots.forEach(p=>p.draw(ctx, camera));
  
  player.draw(ctx, camera);
  if(level.door){
    const exitUnlocked=isExitUnlocked();
    ctx.fillStyle=exitUnlocked?'#e6b85d':'#5c5a66';
    ctx.fillRect(level.door.x-camera, level.door.y, 44, 70);
    ctx.fillStyle=exitUnlocked?'#563d48':'#20222d';
    ctx.fillRect(level.door.x+8-camera, level.door.y+12, 28, 58);
  }
  ctx.fillStyle='#0a1120cc';
  ctx.fillRect(14, 14, 250, 72);
  ctx.fillStyle='#fff';
  ctx.font='16px monospace';
  ctx.fillText(`❤ HP: ${Math.max(0,Math.ceil(player.hp))}/${player.maxHp}`, 25, 38);
  ctx.fillText(`◉ Монеты: ${coins}`, 25, 60);
  ctx.fillText(`Уровень: ${level.index+1}/3 — ${level.name}`, 25, 82);
}
function loop(t){
  let dt=Math.min(.033, (t-last)/1000||0);
  last=t;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}
menu();
requestAnimationFrame(loop);
