import React, { useEffect, useRef } from 'react';

const LANDMASSES = [
  // North America
  [[-130,60],[-80,70],[-55,50],[-52,47],[-68,44],[-65,25],[-85,15],[-88,18],[-103,20],[-117,22],[-120,34],[-122,48],[-130,50],[-140,60],[-148,62],[-150,70],[-130,60]],
  // South America
  [[-81,8],[-62,10],[-50,5],[-35,-5],[-35,-23],[-52,-33],[-65,-55],[-68,-50],[-78,-2],[-81,8]],
  // Europe
  [[0,50],[15,55],[30,60],[25,70],[10,63],[5,52],[0,50]],
  // Africa
  [[10,37],[35,30],[42,12],[40,-2],[35,-5],[27,-12],[18,-17],[12,-18],[15,-8],[10,5],[3,5],[-5,5],[-15,12],[10,37]],
  // Asia
  [[30,42],[50,42],[60,22],[80,10],[100,5],[120,20],[140,35],[145,43],[130,48],[100,53],[80,55],[60,53],[40,50],[30,42]],
  // Australia
  [[115,-30],[120,-22],[130,-12],[138,-14],[148,-18],[152,-24],[152,-35],[140,-38],[128,-35],[115,-30]],
  // UK / Scandinavia
  [[5,55],[8,58],[18,65],[28,70],[22,60],[8,58]],
];

const US_OUTLINE = [
  [-125,49],[-104,49],[-95,49],[-82,46],[-70,46],
  [-67,44],[-70,41],[-74,40],[-76,37],[-80,32],
  [-85,30],[-90,29],[-97,26],[-97,30],[-103,29],
  [-110,31],[-117,32],[-122,37],[-124,42],[-125,49],
];

const GlobeBackground = () => {
  const canvasRef = useRef(null);
  const animRef   = useRef(null);
  const rotRef    = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width  = canvas.offsetWidth  * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize);

    const toXY = (lon, lat, rot, cx, cy, r) => {
      const lonR = ((lon + rot) * Math.PI) / 180;
      const latR = (lat * Math.PI) / 180;
      return {
        x: cx + r * Math.cos(latR) * Math.sin(lonR),
        y: cy - r * Math.sin(latR),
        z: Math.cos(latR) * Math.cos(lonR),
      };
    };

    const drawPolygon = (points, rot, cx, cy, r, fill, stroke, lw = 0.8) => {
      ctx.beginPath();
      let first = true;
      for (const [lon, lat] of points) {
        const p = toXY(lon, lat, rot, cx, cy, r);
        if (p.z < -0.05) { first = true; continue; }
        if (first) { ctx.moveTo(p.x, p.y); first = false; }
        else ctx.lineTo(p.x, p.y);
      }
      ctx.closePath();
      if (fill)   { ctx.fillStyle   = fill;   ctx.fill(); }
      if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); }
    };

    const draw = () => {
      const W = canvas.offsetWidth;
      const H = canvas.offsetHeight;
      if (!W || !H) return;
      ctx.clearRect(0, 0, W, H);

      const cx  = W * 0.5;
      const cy  = H * 0.52;
      const r   = Math.min(W, H) * 0.38;
      const rot = rotRef.current;

      // Globe base fill
      const baseGrad = ctx.createRadialGradient(cx - r * 0.2, cy - r * 0.2, r * 0.05, cx, cy, r);
      baseGrad.addColorStop(0,   'rgba(17,122,202,0.18)');
      baseGrad.addColorStop(0.5, 'rgba(10,45,90,0.12)');
      baseGrad.addColorStop(1,   'rgba(10,20,50,0.08)');
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = baseGrad;
      ctx.fill();

      // Latitude grid
      ctx.strokeStyle = 'rgba(100,160,230,0.13)';
      ctx.lineWidth   = 0.6;
      for (let lat = -80; lat <= 80; lat += 20) {
        ctx.beginPath();
        let first = true;
        for (let lon = -180; lon <= 180; lon += 3) {
          const p = toXY(lon, lat, rot, cx, cy, r);
          if (p.z < 0) { first = true; continue; }
          if (first) { ctx.moveTo(p.x, p.y); first = false; }
          else ctx.lineTo(p.x, p.y);
        }
        ctx.stroke();
      }

      // Longitude grid
      for (let lon = -180; lon < 180; lon += 20) {
        ctx.beginPath();
        let first = true;
        for (let lat = -85; lat <= 85; lat += 3) {
          const p = toXY(lon, lat, rot, cx, cy, r);
          if (p.z < 0) { first = true; continue; }
          if (first) { ctx.moveTo(p.x, p.y); first = false; }
          else ctx.lineTo(p.x, p.y);
        }
        ctx.stroke();
      }

      // Other landmasses
      LANDMASSES.forEach(mass =>
        drawPolygon(mass, rot, cx, cy, r, 'rgba(17,122,202,0.18)', 'rgba(90,170,255,0.22)', 0.7)
      );

      // US glow halo
      const usCentre = toXY(-98, 38, rot, cx, cy, r);
      if (usCentre.z > 0.1) {
        const pulse = (Math.sin(Date.now() * 0.002) + 1) / 2;
        const pg = ctx.createRadialGradient(usCentre.x, usCentre.y, 0, usCentre.x, usCentre.y, r * 0.25);
        pg.addColorStop(0,   `rgba(17,122,202,${0.38 + pulse * 0.14})`);
        pg.addColorStop(0.45, `rgba(17,122,202,${0.10 + pulse * 0.08})`);
        pg.addColorStop(1,   'rgba(17,122,202,0)');
        ctx.beginPath();
        ctx.arc(usCentre.x, usCentre.y, r * 0.25, 0, Math.PI * 2);
        ctx.fillStyle = pg;
        ctx.fill();
      }

      // US highlighted outline
      drawPolygon(US_OUTLINE, rot, cx, cy, r, 'rgba(17,122,202,0.42)', 'rgba(100,190,255,0.75)', 1.2);

      // US pulse rings + dot
      if (usCentre.z > 0.1) {
        const pulse = (Math.sin(Date.now() * 0.002) + 1) / 2;
        [0, 1].forEach(i => {
          const rr    = r * 0.08 + i * r * 0.06 + pulse * r * 0.04;
          const alpha = (0.55 - i * 0.18) * (1 - pulse * 0.5);
          ctx.beginPath();
          ctx.arc(usCentre.x, usCentre.y, rr, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(100,200,255,${alpha})`;
          ctx.lineWidth   = i === 0 ? 1.5 : 0.8;
          ctx.stroke();
        });
        ctx.beginPath();
        ctx.arc(usCentre.x, usCentre.y, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(130,210,255,0.95)';
        ctx.fill();
      }

      // Atmosphere rim
      const rim = ctx.createRadialGradient(cx, cy, r * 0.88, cx, cy, r * 1.1);
      rim.addColorStop(0,   'rgba(17,90,180,0)');
      rim.addColorStop(0.65,'rgba(17,90,180,0.05)');
      rim.addColorStop(1,   'rgba(17,122,202,0.14)');
      ctx.beginPath();
      ctx.arc(cx, cy, r * 1.1, 0, Math.PI * 2);
      ctx.fillStyle = rim;
      ctx.fill();

      // Edge stroke
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(100,160,230,0.2)';
      ctx.lineWidth   = 1;
      ctx.stroke();

      rotRef.current += 0.06;
    };

    const animate = () => {
      draw();
      animRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
    />
  );
};

export default GlobeBackground;