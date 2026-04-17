/** MI stratégiák választható listája: id (API/backend), megjelenített név, rövid leírás. */
export const AI_STRATEGIES = [
  {
    id: 'astar',
    name: 'A*',
    description: 'Útkeresés az étel felé a legrövidebb útvonalon (Manhattan távolság). Ha az étel veszélyes, a kígyó a farok felé megy vagy a legbiztonságosabb lépést választja.',
  },
  {
    id: 'hamilton',
    name: 'Hamilton (spirál)',
    description: 'Egy előre megrajzolt „kör” mentén halad a pályán (spirál: külső perem befelé). Az étel felé csak akkor tér le, ha biztonságos – így garantáltan nem ütközik a falba.',
  },
  {
    id: 'bfs',
    name: 'BFS',
    description: 'Szélességi keresés: mindig a legrövidebb lépésszámú út az ételig, heurisztika nélkül. Ha nincs biztonságos út, farok felé vagy legbiztonságosabb lépés.',
  },
  {
    id: 'greedy',
    name: 'Greedy (biztonság első)',
    description: 'Minden lépésnél azt az irányt választja, ahol a legtöbb szabad cella van (nem megy kockázatosan az étel felé). Nagyon óvatos, hosszú játékra alkalmas.',
  },
  {
    id: 'follow_tail',
    name: 'Farok-követés',
    description: 'Ha van biztonságos út az ételig, arra megy. Egyébként a farok felé tart – így „körbe jár” és kerüli a falat. Az A*-hoz hasonló, erősen a farokra támaszkodik.',
  },
  {
    id: 'hamilton_zigzag',
    name: 'Hamilton (zigzag)',
    description: 'Mint a spirál, de a kör sávokban van: soronként balra–jobbra, majd jobbra–balra. Az étel felé biztonságosan „levág”, ha lehet.',
  },
  {
    id: 'lookahead',
    name: 'Előretekintés (1 lépés)',
    description: 'Minden lehetséges lépést egy előre megnéz: azt választja, ahol a legtöbb szabad hely marad, és ha egyenlő, az ételhez közelebb kerül.',
  },
  {
    id: 'minimax',
    name: 'Minimax (rövid horizont)',
    description: '1–2 lépésre előre gondolkodik: értékeli az állapotot (étel közel, szabad hely), és a maximin szerint választ (legjobb első lépés a legrosszabb második lépés ellenére).',
  },
  {
    id: 'hamilton_short_cycles',
    name: 'Hamilton (rövid ciklusok)',
    description: 'A pályát 2×2 blokkokra bontja; minden blokkban egy kis kör. A kígyó a blokk ciklusát követi, étel felé a szomszédos blokk irányába vált, ha biztonságos.',
  },
  {
    id: 'max_safety',
    name: 'Maximal safety',
    description: 'Csak olyan lépést tesz, ami után még van út a fej és a farok között; ezek közül a legtöbb szabad cellát adó irányt választja. Nagyon óvatos.',
  },
  {
    id: 'lookahead_3',
    name: 'Előretekintés (3 lépés)',
    description: '3 lépést szimulál minden irányból (greedy aláírányokkal), és a legjobb értékelésű kezdő irányt választja. Mélyebb keresés mint az 1 lépéses.',
  },
  {
    id: 'lookahead_5',
    name: 'Előretekintés (5 lépés)',
    description: '5 lépést szimulál minden irányból; jobb minőség, de lassabb. Idő és minőség közti trade-off.',
  },
  {
    id: 'dqn',
    name: 'DQN',
    description:
      'Deep Q-Network: a neurális háló közelíti a Q(s,a) értékeket; tanítás közben célváltozó és tapasztalat-visszajátszás. A benchmark a betanított súlyokkal dönt, nem heurisztikus fallback.',
  },
  {
    id: 'ppo',
    name: 'PPO',
    description:
      'Proximal Policy Optimization: a policy (irányeloszlás) tanul jutalom alapján. A benchmark a mentett policy hálóval lép.',
  },
  {
    id: 'neuroevolution',
    name: 'NEAT',
    description:
      'NEAT: evolúcióval tanított neurális háló (súlyok, opcionálisan topológia). A benchmark a legjobb egyed hálóját használja.',
  },
] as const

export type AIStrategyId = (typeof AI_STRATEGIES)[number]['id']

export function getStrategyById(id: string | null | undefined) {
  if (!id) return undefined
  return AI_STRATEGIES.find((x) => x.id === id)
}

export function getStrategyName(id: string | null | undefined): string {
  if (!id) return 'MI'
  const s = getStrategyById(id)
  return s ? s.name : id
}
