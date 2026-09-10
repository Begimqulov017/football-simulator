import React from 'react';

// Hodisa turini ikonkadan aniqlaymiz — voqea obyektida alohida "type" maydoni
// yo'q, lekin icon aynan shu maqsad uchun mos keladigan yagona mavjud maydon
// (⚽ gol, 🟨 sariq, 🟥 qizil, 🔄 almashtirish).
const EVENT_TYPE_BY_ICON = {
  '⚽': 'goal',
  '🟨': 'yellow',
  '🟥': 'red',
  '🔄': 'sub',
};

export default function EventLog({ matchEvents, liveChances, teamA, teamB, isRiskA, isRiskB }) {
  return (
    <div className="event-log-wrap">
      <div className="live-chances-mini">
        <div className="lcm-row">
          <span className="lcm-label text-a">{teamA.name}{isRiskA && ' 🎲'}</span>
          <span className="lcm-val text-a">{liveChances.winA}%</span>
        </div>
        <div className="lcm-bar-container">
          <div className="lcm-bar-a" style={{ width: `${liveChances.winA}%` }} />
          <div className="lcm-bar-draw" style={{ width: `${liveChances.draw}%` }} />
          <div className="lcm-bar-b" style={{ width: `${liveChances.winB}%` }} />
        </div>
        <div className="lcm-row">
          <span className="lcm-label text-b">{teamB.name}{isRiskB && ' 🎲'}</span>
          <span className="lcm-val text-b">{liveChances.winB}%</span>
        </div>
        <div className="lcm-draw-label">Durang: {liveChances.draw}%</div>
      </div>

      <div className="events-timeline">
        {matchEvents.length === 0 && (
          <div className="no-events">Hali hodisalar yo'q — o'yin boshlanishini kuting...</div>
        )}
        {[...matchEvents].reverse().map((ev, idx) => {
          const typeKey = EVENT_TYPE_BY_ICON[ev.icon];
          const typeClass = typeKey ? `event-type-${typeKey}` : '';
          return (
            <div key={idx} className={`event-row event-side-${ev.side} ${typeClass}`}>
              <span className="event-minute">{ev.minute > 90 ? `90+${ev.minute - 90}` : ev.minute}'</span>
              <span className="event-icon">{ev.icon}</span>
              <div className="event-body">
                <div className="event-text">{ev.text}</div>
                {ev.sub && <div className="event-sub">{ev.sub}</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
