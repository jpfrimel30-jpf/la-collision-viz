import React, { useEffect, useRef } from 'react';

const CarAnimation = () => {
  const canvasRef = useRef(null);
  const stRef    = useRef(null);

  useEffect(() => {
    const C    = canvasRef.current;
    const stEl = stRef.current;
    if (!C || !stEl) return;

    const ctx = C.getContext('2d');
    const W = C.width, H = C.height;

    // Road geometry
    const RL = 90, RR = 330, RW = RR - RL;
    const LANE_W = RW / 4;
    const LC = [
      RL + LANE_W * 0 + LANE_W / 2,
      RL + LANE_W * 1 + LANE_W / 2,
      RL + LANE_W * 2 + LANE_W / 2,
      RL + LANE_W * 3 + LANE_W / 2,
    ];
    const PW = 30, PH = 50;

    let scrolling = true, roadY = 0, frame = 0;
    const dashY = [];
    for (let i = 0; i < 12; i++) dashY.push(i * 60);

    const player = {
      x: LC[1] - PW / 2,
      y: H - 120,
      targetX: LC[1] - PW / 2,
      laneIdx: 1,
      speed: 2.8,
      vis: true,
      state: 'drive',
      timer: 0,
      blinkTick: 0,
      blinkCount: 0,
    };

    let others = [];
    let hazards = [];
    let crashTarget = null;
    let otherTimer = 0;
    let otherInterval = 90 + Math.random() * 60;
    let hazardTimer = Math.floor((7 + Math.random() * 4) * 60);
    let laneTimer   = 180 + Math.floor(Math.random() * 200);

    // ── Helpers ──────────────────────────────────────────────────────────────

    function rndLane() { return Math.floor(Math.random() * 4); }

    function laneTaken(li) {
      return others.some(o => o.li === li) || hazards.some(h => h.li === li);
    }

    function overlaps(ax, ay, aw, ah, bx, by, bw, bh) {
      return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
    }

    function darken(hex, amt) {
      const n = parseInt(hex.replace('#', ''), 16);
      return `rgb(${Math.max(0, (n >> 16) - amt)},${Math.max(0, ((n >> 8) & 0xff) - amt)},${Math.max(0, (n & 0xff) - amt)})`;
    }

    // ── Spawning ─────────────────────────────────────────────────────────────

    function spawnOther() {
      const li = rndLane();
      if (laneTaken(li)) return;
      const fromTop = Math.random() > 0.4;
      const sp = 1 + Math.random() * 2.5;
      others.push({
        x: LC[li] - 14, y: fromTop ? -60 : H + 10,
        w: 28, h: 46,
        speed: fromTop ? sp : -sp,
        color: ['#378ADD', '#1D9E75', '#BA7517', '#7F77DD', '#5F5E5A'][Math.floor(Math.random() * 5)],
        li, vis: true,
      });
    }

    function spawnHazard() {
      const type = Math.random() > 0.5 ? 'biker' : 'car';
      const li = rndLane();
      if (laneTaken(li)) return;
      hazards.push({
        x: LC[li] - 10, y: -70,
        w: 20, h: type === 'car' ? 36 : 26,
        type, speed: 1.5 + Math.random() * 1.5,
        li, vis: true,
      });
    }

    function doLaneChange() {
      let ni = rndLane();
      if (ni === player.laneIdx) ni = (ni + 1) % 4;
      player.laneIdx = ni;
      player.targetX = LC[ni] - PW / 2;
      laneTimer = 120 + Math.floor(Math.random() * 240);
    }

    function triggerCrash(target) {
      if (player.state !== 'drive') return;
      stEl.textContent = 'CRASH!';
      player.state = 'frozen';
      player.timer = 45;
      player.blinkCount = 0;
      player.blinkTick = 0;
      scrolling = false;
      crashTarget = target || null;
    }

    // ── Drawing ───────────────────────────────────────────────────────────────

    function drawRoad() {
      ctx.fillStyle = '#4a8a4a';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#585858';
      ctx.fillRect(RL, 0, RW, H);
      ctx.fillStyle = '#3a3a3a';
      ctx.fillRect(RL, 0, 6, H);
      ctx.fillRect(RR - 6, 0, 6, H);
      ctx.fillStyle = 'rgba(255,255,255,0.82)';
      dashY.forEach(d => {
        const yy = ((d + roadY) % H + H) % H;
        for (let lane = 1; lane < 4; lane++) {
          ctx.fillRect(RL + LANE_W * lane - 2, yy, 4, 30);
        }
      });
    }

    function drawCar(x, y, w, h, col, vis = true) {
      if (!vis) return;
      ctx.fillStyle = col;
      ctx.beginPath(); ctx.roundRect(x, y, w, h, 5); ctx.fill();
      ctx.fillStyle = darken(col, 40);
      ctx.beginPath(); ctx.roundRect(x + 4, y + 9, w - 8, h * 0.38, 3); ctx.fill();
      ctx.fillStyle = 'rgba(170,215,255,0.88)';
      ctx.fillRect(x + 4, y + 9, w - 8, 10);
      ctx.fillRect(x + 4, y + h * 0.47, w - 8, 9);
      ctx.fillStyle = '#FFD700';
      ctx.fillRect(x + 2, y + 2, 6, 4);
      ctx.fillRect(x + w - 8, y + 2, 6, 4);
      ctx.fillStyle = '#cc2222';
      ctx.fillRect(x + 2, y + h - 6, 6, 4);
      ctx.fillRect(x + w - 8, y + h - 6, 6, 4);
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(x - 4, y + 7, 5, 10);
      ctx.fillRect(x + w - 1, y + 7, 5, 10);
      ctx.fillRect(x - 4, y + h - 17, 5, 10);
      ctx.fillRect(x + w - 1, y + h - 17, 5, 10);
    }

    function drawBiker(x, y, vis = true) {
      if (!vis) return;
      const cx = x + 10, cy = y + 4;
      ctx.strokeStyle = '#333'; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(cx - 7, cy + 22, 7, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(cx + 7, cy + 22, 7, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = '#777'; ctx.lineWidth = 1;
      [-1, 1].forEach(s => {
        const wx = cx + s * 7;
        ctx.beginPath(); ctx.moveTo(wx, cy + 15); ctx.lineTo(wx, cy + 29); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(wx - 7, cy + 22); ctx.lineTo(wx + 7, cy + 22); ctx.stroke();
      });
      ctx.strokeStyle = '#e05'; ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx - 7, cy + 22); ctx.lineTo(cx, cy + 10); ctx.lineTo(cx + 7, cy + 22);
      ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx - 4, cy + 13); ctx.lineTo(cx + 7, cy + 13); ctx.stroke();
      ctx.strokeStyle = '#333'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(cx + 5, cy + 10); ctx.lineTo(cx + 12, cy + 10); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx + 12, cy + 8); ctx.lineTo(cx + 12, cy + 12); ctx.stroke();
      ctx.fillStyle = '#222'; ctx.fillRect(cx - 6, cy + 9, 8, 3);
      ctx.fillStyle = '#1a5fa8';
      ctx.beginPath();
      ctx.moveTo(cx - 1, cy + 9); ctx.lineTo(cx + 9, cy + 11);
      ctx.lineTo(cx + 9, cy + 4); ctx.lineTo(cx - 1, cy + 4);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#1a5fa8'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(cx + 8, cy + 6); ctx.lineTo(cx + 12, cy + 9); ctx.stroke();
      ctx.fillStyle = '#d44';
      ctx.beginPath(); ctx.arc(cx + 4, cy + 1, 5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#f5c4b3';
      ctx.beginPath(); ctx.arc(cx + 4, cy + 2, 3.5, 0.2, Math.PI - 0.2); ctx.fill();
      ctx.strokeStyle = '#333'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(cx, cy + 9); ctx.lineTo(cx - 2, cy + 16); ctx.lineTo(cx - 8, cy + 18); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx, cy + 9); ctx.lineTo(cx + 3, cy + 16); ctx.lineTo(cx + 2, cy + 19); ctx.stroke();
    }

    function drawHazard(h) {
      if (h.type === 'biker') drawBiker(h.x, h.y, h.vis);
      else drawCar(h.x, h.y, h.w, h.h, '#A32D2D', h.vis);
    }

    // ── Game loop ─────────────────────────────────────────────────────────────

    let blinkFlash = false;

    function update() {
      frame++;

      if (player.state === 'drive') {
        player.x += (player.targetX - player.x) * 0.08;
        laneTimer--;
        if (laneTimer <= 0) doLaneChange();
        otherTimer++;
        if (otherTimer >= otherInterval) {
          spawnOther();
          otherTimer = 0;
          otherInterval = 70 + Math.random() * 100;
        }
        hazardTimer--;
        if (hazardTimer <= 0) {
          spawnHazard();
          hazardTimer = Math.floor((7 + Math.random() * 5) * 60);
        }
        if (scrolling) roadY = (roadY + player.speed * 2) % H;
        others.forEach(o => { o.y -= (player.speed - o.speed); });
        others = others.filter(o => o.y > -80 && o.y < H + 80);
        hazards.forEach(h => { h.y += h.speed; });
        hazards = hazards.filter(h => h.y < H + 60);
        const px = player.x, py = player.y;
        for (const o of others) {
          if (overlaps(px, py, PW, PH, o.x, o.y, o.w, o.h)) { triggerCrash(o); return; }
        }
        for (const h of hazards) {
          if (overlaps(px, py, PW, PH, h.x, h.y, h.w, h.h)) { triggerCrash(h); return; }
        }
        player.vis = true;

      } else if (player.state === 'frozen') {
        player.timer--;
        blinkFlash = frame % 8 < 4;
        player.vis = blinkFlash;
        if (crashTarget) crashTarget.vis = blinkFlash;
        if (player.timer <= 0) {
          player.state = 'blink_crash';
          player.blinkCount = 0; player.blinkTick = 0;
          player.vis = true;
          if (crashTarget) crashTarget.vis = true;
        }

      } else if (player.state === 'blink_crash') {
        player.blinkTick++;
        if (player.blinkTick % 9 === 0) {
          player.vis = !player.vis;
          if (crashTarget) crashTarget.vis = player.vis;
          player.blinkCount++;
        }
        if (player.blinkCount >= 8) {
          if (crashTarget) {
            others = others.filter(o => o !== crashTarget);
            hazards = hazards.filter(h => h !== crashTarget);
            crashTarget = null;
          }
          player.state = 'recover';
          player.blinkCount = 0; player.blinkTick = 0; player.vis = true;
          player.laneIdx = 1;
          player.targetX = LC[1] - PW / 2;
          player.x = W / 2 - PW / 2;
          scrolling = true;
          stEl.textContent = 'recovering...';
        }

      } else if (player.state === 'recover') {
        player.blinkTick++;
        player.x += (player.targetX - player.x) * 0.06;
        if (player.blinkTick % 18 === 0) { player.vis = !player.vis; player.blinkCount++; }
        if (scrolling) roadY = (roadY + player.speed * 2) % H;
        others.forEach(o => { o.y -= (player.speed - o.speed); });
        hazards.forEach(h => { h.y += h.speed; });
        others = others.filter(o => o.y > -80 && o.y < H + 80);
        hazards = hazards.filter(h => h.y < H + 60);
        if (player.blinkCount >= 6) {
          player.state = 'drive'; player.vis = true;
          stEl.textContent = 'cruising';
          hazardTimer = Math.floor((7 + Math.random() * 4) * 60);
          laneTimer   = 120 + Math.floor(Math.random() * 160);
        }
      }
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      drawRoad();
      others.forEach(o => drawCar(o.x, o.y, o.w, o.h, o.color, o.vis));
      hazards.forEach(h => drawHazard(h));
      if (player.state === 'frozen' && blinkFlash) {
        ctx.fillStyle = 'rgba(255,60,60,0.2)';
        ctx.fillRect(0, 0, W, H);
      }
      drawCar(player.x, player.y, PW, PH, '#E24B4A', player.vis);
    }

    let animId;
    function loop() { update(); draw(); animId = requestAnimationFrame(loop); }
    loop();

    return () => { if (animId) cancelAnimationFrame(animId); };
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
      <canvas
        ref={canvasRef}
        width={420}
        height={540}
        style={{ borderRadius: '10px', display: 'block', boxShadow: '0 4px 24px rgba(0,0,0,0.1)' }}
      />
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)', letterSpacing: '0.06em' }}>
        <span ref={stRef} style={{ color: 'var(--text-sec)' }}>cruising</span>
      </div>
    </div>
  );
};

export default CarAnimation;
