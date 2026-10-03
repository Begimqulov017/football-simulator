// PHASE 6 — Dynamic Messages & Notifications.
//
// Pure helpers for the inbox:
//  - categoryOf / unreadCounts : shared by Navbar (AppShell) and MessagesPage
//  - generateMessages(player)  : procedural messages derived from the player's
//    CURRENT state (last match, stamina, caps, milestones...). Every message
//    has a deterministic id, so calling this on every render is safe - the
//    hook (useProceduralMessages) only appends ids that are not in the inbox yet.
//
// No Math.random() here on purpose: variety comes from hashing the match /
// event id, so the same event always produces the same text (and never twice).

import { INITIAL_TEAMS } from '../../data/teamsData';
import { getMergedSquad } from '../data/clubRosterStore';
import { flagOfNation } from '../international/calendar';

// ---------------------------------------------------------------------------
// Categories (inbox tabs)
// ---------------------------------------------------------------------------
export const INBOX_TABS = [
  { key: 'all', label: 'All' },
  { key: 'coach', label: 'Coach' },
  { key: 'club', label: 'Club' },
  { key: 'national', label: 'National' },
  { key: 'system', label: 'System' },
  { key: 'starred', label: 'Starred' }
];

// Old messages (made by season.js / server) have no `category`, so it is
// derived from `type`. Anything unknown falls back to Club.
export function categoryOf(m) {
  if (m.category) return m.category;
  if (m.type === 'coach') return 'coach';
  if (m.type === 'national') return 'national';
  if (m.type === 'system' || m.from === 'League Awards') return 'system';
  return 'club'; // club, transfer, contract, scout, teammate, milestone
}

export function unreadCounts(messages = []) {
  const out = { total: 0, coach: 0, club: 0, national: 0, system: 0, starred: 0 };
  messages.forEach((m) => {
    if (m.read) return;
    out.total += 1;
    out[categoryOf(m)] += 1;
    if (m.starred) out.starred += 1;
  });
  return out;
}

// ---------------------------------------------------------------------------
// Tiny deterministic helpers
// ---------------------------------------------------------------------------
function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
const pickBy = (arr, seed) => arr[hash(String(seed)) % arr.length];
const fill = (tpl, vars) => tpl.replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? ''));
const highestReached = (value, steps) => steps.filter((s) => value >= s).pop();
const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;
const fmtRating = (r) => (Number.isFinite(Number(r)) ? Number(r).toFixed(1) : '-');

const make = (id, fields) => ({
  id, read: false, resolved: true, generated: true, ...fields
});

// ---------------------------------------------------------------------------
// 1) Post-match performance report (Coach)
// ---------------------------------------------------------------------------
const VERDICTS = {
  elite: [
    'That was a complete performance - exactly the standard we expect from you.',
    'World-class from first minute to last. Opponents will be studying that tape.',
    'You were the difference-maker today. Keep this level and the bigger clubs will notice.'
  ],
  good: [
    'A solid, reliable display. You did your job and then some.',
    'Good intensity and good decisions today - that is what wins league titles.',
    'Positive game. A little sharper in the final third and it is perfect.'
  ],
  average: [
    'Okay, but not your best. There was more in the tank - I want to see it next time.',
    'You were involved, though a few touches let us down. Work on it in training.',
    'A quiet afternoon. Nothing to worry about, but nothing to celebrate either.'
  ],
  poor: [
    'Below your standard today. Shake it off, review the clips and reset.',
    'Tough day at the office. Everyone has them - what matters is the reaction.',
    'You looked a step off the pace. Rest up, and we will get you back on track.'
  ]
};

function matchReport(player, last) {
  const diff = last.golFor - last.golAgainst;
  const resultWord = diff > 0 ? 'win' : diff < 0 ? 'defeat' : 'draw';
  const tier = last.rating >= 8.5 ? 'elite' : last.rating >= 7 ? 'good' : last.rating >= 6 ? 'average' : 'poor';

  let body = `${resultWord[0].toUpperCase()}${resultWord.slice(1)} ${last.golFor}-${last.golAgainst} ${last.isHome ? 'vs' : 'at'} ${last.opponent}. `;
  body += `You played ${last.minutes}' and were rated ${fmtRating(last.rating)}/10`;
  if (last.goals) body += `, scoring ${plural(last.goals, 'goal')}`;
  if (last.assists) body += `${last.goals ? ' and' : ','} providing ${plural(last.assists, 'assist')}`;
  body += '. ';
  if (last.mvp) body += 'You were our Man of the Match. ';
  body += pickBy(VERDICTS[tier], `${last.id}_v`);
  if (player.career.form) body += ` Your recent form reads: ${player.career.form}.`;

  return make(`gen_report_${last.id}`, {
    type: 'coach', date: last.date, from: `Head Coach · ${player.club.name}`,
    subject: `Performance report: ${last.opponent}`, body
  });
}

// ---------------------------------------------------------------------------
// 2) Coach advice - rotation / stamina management / starting XI readiness
// ---------------------------------------------------------------------------
function coachAdvice(player, last) {
  const { career, club } = player;
  const stamina = Number.isFinite(career.stamina) ? career.stamina : 100;
  const base = { type: 'coach', date: last.date, from: `Head Coach · ${club.name}` };
  const id = `gen_advice_${last.id}`;

  if (career.injury) {
    return make(id, {
      ...base, subject: 'Recovery first',
      body: `Do not rush back from the knock. The medical team says about ${plural(career.injury.daysLeft || 0, 'day')} more. Your place in the squad is safe - get fit, then we talk about the starting XI.`
    });
  }
  if (stamina < 35) {
    return make(id, {
      ...base, subject: 'Rotation plan: you will be rested',
      body: `Your stamina is down to ${stamina}%. To avoid injury I am planning to rotate you - expect a place on the bench or a reduced role next game. Skip heavy training and let the body recover.`
    });
  }
  if (stamina < 65) {
    return make(id, {
      ...base, subject: 'Stamina management',
      body: `You are at ${stamina}% stamina. Fine for a game, but a tired player makes mistakes and gets hurt more often. Keep training light this week and let the quiet days refill the tank.`
    });
  }
  // Fresh enough - only send a readiness note on some games, so the inbox does not spam.
  if (hash(`${last.id}_xi`) % 2 !== 0) return null;
  const inForm = career.form === 'Good' || career.form === 'Excellent';
  return make(id, {
    ...base,
    subject: inForm ? 'Starting XI: you are in the plan' : 'Starting XI: nothing is guaranteed',
    body: inForm
      ? `Stamina ${stamina}% and form is ${career.form}. You are fit and sharp - expect to be named in the starting XI for the next fixture.`
      : `Stamina ${stamina}% - physically you are ready, but form is ${career.form || 'Average'}. The starting XI spot is yours to lose, so show me something in training.`
  });
}

// ---------------------------------------------------------------------------
// 3) Teammate dialogues (5 dynamic lines per situation)
// ---------------------------------------------------------------------------
const MATE_LINES = {
  scorer: [
    'What a finish against {opponent}! Drinks are on you tonight.',
    '{goals_word} today - are you trying to take my spot in the dressing room playlist too?',
    'That goal was unreal. I am still replaying it in my head.',
    'Keep scoring like that and the whole stadium will be singing your name.',
    'Honestly, I just made the run - you did the magic. Great goal!'
  ],
  great: [
    'You were everywhere today. Great game, mate!',
    'Coach was buzzing about your display in the dressing room.',
    'Playing next to you makes my job easy. Let us keep this run going.',
    'That performance against {opponent} deserved the three points.',
    'If you play like that every week we are winning the league.'
  ],
  average: [
    'Not our best, but we got through it. Onto the next one.',
    'Tough game against {opponent}. Fancy some extra passing work tomorrow?',
    'We will click soon, I can feel it. Keep your head up.',
    'Small margins today. Let us fix them in training.',
    'Grab a coffee later? We can go through the game together.'
  ],
  bad: [
    'Do not stress over today. One bad game means nothing over a season.',
    'Rough one, but we are all in this together. We will bounce back.',
    'I have had worse days than that, trust me. Chin up.',
    'Fancy an extra shooting session tomorrow? Could help both of us.',
    'The fans know what you are capable of. So do I.'
  ],
  injured: [
    'Sorry to see you go off. Take your time - we will hold the fort.',
    'Get well soon! The dressing room is not the same without you.',
    'Do the rehab properly, do not rush it. We need you back at 100%.',
    'Heard about the knock. Anything you need, just shout.',
    'Rest up. I will keep your peg warm until you are back.'
  ]
};

function teammateChat(player, last) {
  if (hash(`${last.id}_mate`) % 100 >= 25) return null; // ~1 game in 4

  const mood = last.injured ? 'injured'
    : last.goals > 0 ? 'scorer'
    : last.rating >= 7.5 ? 'great'
    : last.rating >= 6 ? 'average' : 'bad';

  let mate = { name: 'Teammate' };
  try {
    const team = INITIAL_TEAMS.find((t) => t.id === player.club.id);
    const squad = team ? getMergedSquad(team).filter((p) => p.id !== player.id) : [];
    if (squad.length) mate = squad[hash(`${last.id}_who`) % squad.length];
  } catch (e) { /* roster store unavailable - keep generic name */ }

  const body = fill(pickBy(MATE_LINES[mood], `${last.id}_line`), {
    opponent: last.opponent,
    goals_word: last.goals > 1 ? `${last.goals} goals` : 'A goal'
  });
  return make(`gen_mate_${last.id}`, {
    type: 'teammate', date: last.date, from: mate.name || 'Teammate',
    subject: `Message from ${mate.name || 'a teammate'}`, body
  });
}

// ---------------------------------------------------------------------------
// 4) National team call-ups and milestones (National)
// ---------------------------------------------------------------------------
const CAP_STEPS = [1, 10, 25, 50, 100];

function nationalMessages(player) {
  const intl = player.career.international;
  if (!intl) return [];
  const out = [];
  const country = intl.country || player.nationality || 'Your country';
  const flag = flagOfNation(country);
  const from = `${flag} ${country} Football Association`;

  const cu = intl.lastCallUp;
  if (cu && cu.date) {
    let body = `Congratulations! You have been called up to represent ${country} in ${cu.competition || 'an international fixture'} against ${cu.opponent || 'our opponents'}.`;
    if (cu.rating) {
      body += ` You came away with a ${fmtRating(cu.rating)} rating`;
      body += cu.goals ? ` and ${plural(cu.goals, 'goal')}.` : '.';
    }
    out.push(make(`gen_callup_${cu.date}_${cu.competition || ''}_${cu.opponent || ''}`, {
      type: 'national', date: cu.date, from, subject: `National team call-up: ${country}`, body
    }));
  }

  const capStep = highestReached(intl.caps || 0, CAP_STEPS);
  if (capStep) {
    out.push(make(`gen_caps_${capStep}`, {
      type: 'national', date: player.career.gameDate, from,
      subject: capStep === 1 ? 'Your first senior cap!' : `Milestone: ${capStep} caps for ${country}`,
      body: capStep === 1
        ? `You have made your senior debut for ${country}. A moment you will remember forever - well done!`
        : `Congratulations on reaching ${capStep} international caps for ${country}. You are becoming a true national team leader.`
    }));
  }

  const trophy = (intl.trophies || []).slice(-1)[0];
  if (trophy) {
    out.push(make(`gen_intl_trophy_${trophy.name}_${trophy.year}`, {
      type: 'national', date: player.career.gameDate, from,
      subject: `Champions: ${trophy.name} ${trophy.year}`,
      body: `${country} have won the ${trophy.name} ${trophy.year} and you were part of it. Congratulations - this is history!`
    }));
  }
  return out;
}

// ---------------------------------------------------------------------------
// 5) Career milestones (Club)
// ---------------------------------------------------------------------------
const MILESTONES = [
  { key: 'goals', field: 'goals', steps: [10, 25, 50, 100, 150, 200, 300], text: (n) => `${n} career goals` },
  { key: 'apps', field: 'appearances', steps: [25, 50, 100, 200, 300], text: (n) => `${n} career appearances` },
  { key: 'mvp', field: 'mvpCount', steps: [5, 10, 25], text: (n) => `${n} Man of the Match awards` }
];

function milestoneMessages(player) {
  const out = [];
  MILESTONES.forEach(({ key, field, steps, text }) => {
    const step = highestReached(player.career[field] || 0, steps);
    if (!step) return;
    out.push(make(`gen_ms_${key}_${step}`, {
      type: 'milestone', date: player.career.gameDate, from: player.club.name,
      subject: `Milestone: ${text(step)}`,
      body: `Congratulations from everyone at ${player.club.name}! You have reached ${text(step)}. The numbers speak for themselves - keep going.`
    }));
  });
  return out;
}

// ---------------------------------------------------------------------------
// 6) One-off system notice
// ---------------------------------------------------------------------------
function welcomeMessage(player) {
  return make('gen_system_welcome', {
    type: 'system', date: player.career.gameDate, from: 'System',
    subject: 'Your inbox has been upgraded',
    body: 'Messages are now sorted into Coach, Club, National and System tabs. Tap the star on any message to pin it to the Starred tab. A red dot in the menu means you have unread messages.'
  });
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------
export function generateMessages(player) {
  if (!player?.career || !player.club) return [];
  const out = [welcomeMessage(player)];

  const last = (player.career.matchHistory || []).slice(-1)[0];
  if (last && last.id) {
    out.push(matchReport(player, last));
    const advice = coachAdvice(player, last);
    if (advice) out.push(advice);
    const chat = teammateChat(player, last);
    if (chat) out.push(chat);
  }

  out.push(...nationalMessages(player), ...milestoneMessages(player));
  return out;
}
