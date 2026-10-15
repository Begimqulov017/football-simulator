// Logotipni brauzerda tayyorlaydi: orqa fon (chetga ulangan bir xil rang) shaffof qilinadi, ortiqcha bo'sh joy kesiladi,
// 96x96 kvadratga joylanadi va PNG (data URL) qaytadi. Serverga yuborishdan oldin chaqiriladi.
const TOL = 38;       // fonga "yaqin" rang chegarasi
const FEATHER = 70;   // yumshoq chekka uchun
const SIZE = 96;
const PAD = 4;

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Rasmni o\u2018qib bo\u2018lmadi')); };
    img.src = url;
  });
}

export async function processLogoFile(file) {
  const img = await loadImage(file);
  const scale = Math.min(1, 256 / Math.max(img.width, img.height));
  const w = Math.max(1, Math.round(img.width * scale));
  const h = Math.max(1, Math.round(img.height * scale));
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(img, 0, 0, w, h);
  const data = ctx.getImageData(0, 0, w, h);
  const px = data.data;
  const idx = (x, y) => (y * w + x) * 4;

  // Chegara piksellari: asosan shaffof bo'lsa - fon allaqachon yo'q
  const border = [];
  for (let x = 0; x < w; x += 1) { border.push(idx(x, 0), idx(x, h - 1)); }
  for (let y = 0; y < h; y += 1) { border.push(idx(0, y), idx(w - 1, y)); }
  const opaque = border.filter((i) => px[i + 3] > 200);
  let removed = false;
  if (opaque.length / border.length >= 0.5) {
    const med = (ch) => { const a = opaque.map((i) => px[i + ch]).sort((p, q) => p - q); return a[Math.floor(a.length / 2)]; };
    const bg = [med(0), med(1), med(2)];
    const dist = new Float32Array(w * h);
    for (let y = 0; y < h; y += 1) {
      for (let x = 0; x < w; x += 1) {
        const i = idx(x, y);
        dist[y * w + x] = Math.max(Math.abs(px[i] - bg[0]), Math.abs(px[i + 1] - bg[1]), Math.abs(px[i + 2] - bg[2]));
      }
    }
    const near = (x, y) => dist[y * w + x] < TOL || px[idx(x, y) + 3] < 20;
    const isBg = new Uint8Array(w * h);
    const stack = [];
    const push = (x, y) => { if (x < 0 || y < 0 || x >= w || y >= h) return; const k = y * w + x; if (isBg[k] || !near(x, y)) return; isBg[k] = 1; stack.push(k); };
    for (let x = 0; x < w; x += 1) { push(x, 0); push(x, h - 1); }
    for (let y = 0; y < h; y += 1) { push(0, y); push(w - 1, y); }
    while (stack.length) {
      const k = stack.pop(); const x = k % w; const y = (k / w) | 0;
      push(x + 1, y); push(x - 1, y); push(x, y + 1); push(x, y - 1);
    }
    // Fonni shaffof qilish + chekkani yumshatish (fonga tegib turgan 2 piksel)
    for (let y = 0; y < h; y += 1) {
      for (let x = 0; x < w; x += 1) {
        const k = y * w + x; const i = k * 4;
        if (isBg[k]) { px[i + 3] = 0; continue; }
        let nearBg = false;
        for (let dy = -2; dy <= 2 && !nearBg; dy += 1) {
          for (let dx = -2; dx <= 2; dx += 1) {
            const xx = x + dx; const yy = y + dy;
            if (xx >= 0 && yy >= 0 && xx < w && yy < h && isBg[yy * w + xx]) { nearBg = true; break; }
          }
        }
        if (nearBg) {
          const soft = Math.max(0, Math.min(1, (dist[k] - TOL) / (FEATHER - TOL))) * 255;
          px[i + 3] = Math.min(px[i + 3], soft);
        }
      }
    }
    removed = true;
  }
  ctx.putImageData(data, 0, 0);

  // Ko'rinadigan qismning chegarasi (bo'sh joyni kesish)
  let x0 = w; let y0 = h; let x1 = -1; let y1 = -1;
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      if (px[idx(x, y) + 3] > 8) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    }
  }
  if (x1 < 0) throw new Error('Rasm butunlay bo\u2018sh');
  const cw = x1 - x0 + 1; const ch = y1 - y0 + 1;
  const out = document.createElement('canvas');
  out.width = SIZE; out.height = SIZE;
  const octx = out.getContext('2d');
  octx.imageSmoothingQuality = 'high';
  const k = Math.min((SIZE - 2 * PAD) / cw, (SIZE - 2 * PAD) / ch);
  const dw = Math.round(cw * k); const dh = Math.round(ch * k);
  octx.drawImage(c, x0, y0, cw, ch, Math.round((SIZE - dw) / 2), Math.round((SIZE - dh) / 2), dw, dh);
  return { dataUrl: out.toDataURL('image/png'), backgroundRemoved: removed };
}
