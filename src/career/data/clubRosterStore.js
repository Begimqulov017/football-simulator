// ---------------------------------------------------------------------------
// Global club rosters
// ---------------------------------------------------------------------------
// INITIAL_TEAMS (teamsData.js) is the built-in, read-only squad for every
// club. This module layers *human-created* players on top of it: whenever
// someone starts a career at a club, they're written in here as an "extra"
// squad member (marked as a starter or a bench player, same as the built-in
// pros), completely separate from any single save file.
//
// Because this store lives under its own localStorage key (not the player's
// save key), it survives resetting/deleting a career, and every save that
// runs on this browser reads and writes the *same* pool of clubs. So if you
// finish/reset a career and start a new one, or open a second profile, and
// end up at a club someone already joined, you'll see them sitting in the
// squad too - the roster is shared/global rather than tied to one save.
//
// Note: without a backend server + database, "global" here means "shared
// across every save on this device/browser", not synced across different
// people's devices in real time. Wiring this same API up to a real backend
// (e.g. Firebase/Supabase) later would make it truly cross-device without
// touching any of the call sites below.
// ---------------------------------------------------------------------------

const STORE_KEY = 'fpcs_global_club_rosters_v1';

function loadRosters() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (err) {
    console.error('Failed to load global club rosters', err);
    return {};
  }
}

function saveRosters(rosters) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(rosters));
  } catch (err) {
    console.error('Failed to save global club rosters', err);
  }
}

// All human-added players at one club, e.g. [{ id, name, pos, ovr, stats, tier, isUser }]
export function getClubExtras(clubId) {
  const rosters = loadRosters();
  return rosters[clubId] || [];
}

export function addPlayerToClubRoster(clubId, entry) {
  const rosters = loadRosters();
  const list = (rosters[clubId] || []).filter((p) => p.id !== entry.id);
  list.push(entry);
  rosters[clubId] = list;
  saveRosters(rosters);
}

export function removePlayerFromClubRoster(clubId, playerId) {
  const rosters = loadRosters();
  if (!rosters[clubId]) return;
  rosters[clubId] = rosters[clubId].filter((p) => p.id !== playerId);
  saveRosters(rosters);
}

// Built-in squad + every human-added extra for a club, ranked by OVR just
// like the Club Page already does (top 11 = starting XI, rest = bench).
export function getMergedSquad(team) {
  const extras = getClubExtras(team.id).map((p) => ({ ...p, isUser: true }));
  const squad = [...(team?.squad || []), ...extras];
  return squad.sort((a, b) => (b.ovr || 0) - (a.ovr || 0));
}

// Given a club's *current* squad (built-in + everyone already added), work
// out whether a new player's OVR is good enough to break into the top 11, or
// whether they start out on the bench - then persist them into the shared
// roster for that club so anyone at (or later joining) this club sees them.
export function joinClubRoster(team, playerEntry) {
  const before = getMergedSquad(team);
  const betterCount = before.filter((p) => (p.ovr || 0) > (playerEntry.ovr || 0)).length;
  const tier = betterCount < 11 ? 'starter' : 'bench';
  addPlayerToClubRoster(team.id, { ...playerEntry, tier });
  return tier;
}

// Read-only preview of the tier a player *would* get at a club right now,
// without writing anything - used by the Start Page to show a live "you'll
// start as..." hint while the person is still spinning.
export function previewClubTier(team, ovr) {
  if (!team) return null;
  const before = getMergedSquad(team);
  const betterCount = before.filter((p) => (p.ovr || 0) > (ovr || 0)).length;
  return betterCount < 11 ? 'starter' : 'bench';
}
