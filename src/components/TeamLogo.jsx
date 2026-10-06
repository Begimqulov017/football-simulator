import React, { useEffect, useState } from 'react';
import { API_BASE } from '../career/utils/careerApi';

// Klub logotipi: serverda server/gamedata/logoData/<id>.png bo'lsa - haqiqiy rasm, bo'lmasa avvalgi emoji.
// Mavjud logotiplar ro'yxati bir marta yuklanadi va hamma komponentlar orasida bo'lishiladi.
let logoFiles = null; // { real_madrid: 'png', ... }
let loading = false;
const subscribers = new Set();

function loadLogoList() {
  if (logoFiles || loading) return;
  loading = true;
  fetch(`${API_BASE}/api/logos`)
    .then((r) => r.json())
    .then((d) => { logoFiles = (d && d.files) || {}; })
    .catch(() => { logoFiles = {}; })
    .finally(() => { loading = false; subscribers.forEach((f) => f()); });
}

export function logoUrlFor(id) {
  const ext = logoFiles && id ? logoFiles[String(id).toLowerCase()] : null;
  return ext ? `${API_BASE}/api/logo/${String(id).toLowerCase()}.${ext}` : null;
}

export default function TeamLogo({ id, logo, size = 24, className = '', style, title }) {
  const [, force] = useState(0);
  const [broken, setBroken] = useState(false);
  useEffect(() => {
    const f = () => force((x) => x + 1);
    subscribers.add(f);
    loadLogoList();
    return () => { subscribers.delete(f); };
  }, []);
  const url = !broken ? logoUrlFor(id) : null;
  if (url) {
    return (
      <img
        src={url}
        alt=""
        title={title}
        width={size}
        height={size}
        className={className}
        style={{ objectFit: 'contain', verticalAlign: 'middle', display: 'inline-block', ...style }}
        onError={() => setBroken(true)}
        data-team-logo={id}
      />
    );
  }
  return <span className={className} style={style} title={title}>{logo || '\u26BD'}</span>;
}
