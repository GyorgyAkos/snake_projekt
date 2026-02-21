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
    name: 'Előretekintés',
    description: 'Minden lehetséges lépést egy előre megnéz: azt választja, ahol a legtöbb szabad hely marad, és ha egyenlő, az ételhez közelebb kerül.',
  },
] as const

export type AIStrategyId = (typeof AI_STRATEGIES)[number]['id']

export function getStrategyName(id: string | null | undefined): string {
  if (!id) return 'MI'
  const s = AI_STRATEGIES.find((x) => x.id === id)
  return s ? s.name : id
}
