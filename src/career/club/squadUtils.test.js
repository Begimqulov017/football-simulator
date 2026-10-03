import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { INITIAL_TEAMS } from '../../data/teamsData';
import { FORMATIONS } from '../../utils/formations';
import { buildLineup, computeChemistry, suggestFormation, getSurname, splitBench } from './squadUtils';
import TacticalPitch from './TacticalPitch';

test('surnames', () => {
  expect(getSurname('Trent Alexander-Arnold')).toBe('Alexander-Arnold');
  expect(getSurname('Kevin De Bruyne')).toBe('De Bruyne');
  expect(getSurname('Vinícius Júnior')).toBe('Vinícius Júnior');
  expect(getSurname('Rodrygo')).toBe('Rodrygo');
  expect(getSurname('Ali Karimov (ali99)')).toBe('Karimov');
});

test('every team x every formation gives a full, duplicate-free lineup', () => {
  const bad = [];
  INITIAL_TEAMS.forEach((t) => {
    FORMATIONS.forEach((f) => {
      const { slots, emptySlots, bench } = buildLineup(t.squad, f);
      const ids = slots.map((s) => s.player.id);
      const all = [...ids, ...bench.map((p) => p.id)];
      if (slots.length + emptySlots.length !== 11 || new Set(all).size !== all.length || all.length !== t.squad.length) {
        bad.push(`${t.id} ${f.name}: slots=${slots.length} empty=${emptySlots.length} total=${all.length}/${t.squad.length}`);
      }
    });
  });
  expect(bad.length).toBe(0);
});

test('chemistry, suggestion, pitch render', () => {
  const t = INITIAL_TEAMS.find((x) => x.id === 'real_madrid');
  const f = suggestFormation(t.squad, 80);
  const g = suggestFormation(t.squad, 10);
  const { slots, emptySlots, bench } = buildLineup(t.squad, f);
  const chem = computeChemistry(slots);
  const html = renderToStaticMarkup(<TacticalPitch slots={slots} emptySlots={emptySlots} myId="x" nameMode="surname" onSelect={() => {}} />);
  ['Courtois', 'Mbappé', 'Alexander-Arnold', 'Vinícius Júnior'].forEach((n) => expect(html).toContain(n));
  const full = renderToStaticMarkup(<TacticalPitch slots={slots} emptySlots={emptySlots} myId="x" nameMode="full" onSelect={() => {}} />);
  expect(full).toContain('Thibaut Courtois');
  // thin squad: only 6 players -> empty pins instead of a crash
  const thin = buildLineup(t.squad.slice(0, 6), FORMATIONS[0]);
  expect(thin.slots.length + thin.emptySlots.length).toBe(11);
});
