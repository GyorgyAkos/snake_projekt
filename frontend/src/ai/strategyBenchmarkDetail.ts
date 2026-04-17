/**
 * Részletes szöveg a statisztika oldalhoz: működési logika + tipikus benchmark-magyarázat.
 * A benchmark számok a gépen futtatott méréstől függnek; a „miért” rész általános mintákat ír le.
 */
export type StrategyBenchmarkDetail = {
  howItWorks: string
  whyTheseResults: string
}

export const STRATEGY_BENCHMARK_DETAIL: Record<string, StrategyBenchmarkDetail> = {
  astar: {
    howItWorks:
      'Gráfon útkeresés: cél az étel cellája, költség a lépésszám, heurisztika az étel Manhattan-távolsága. Ha a legrövidebb út „bezárná” a kígyót vagy falnak ütközne, a stratégia biztonsági ágra vált: farok felé haladás vagy olyan szomszéd választása, ahol marad elég szabad tér.',
    whyTheseResults:
      'Jól kiegyensúlyozott heurisztika: gyorsan közelít az ételhez, de igyekszik nem zsákutcába menni. Tipikusan közepesen–magas átlagpont, a halálok megoszlanak fal/önütközés között, ha a pálya zsúfolttá válik. Az éhség aránya általában alacsonyabb, mint a túl óvatos vagy a tanulatlan ügynököknél.',
  },
  hamilton: {
    howItWorks:
      'Előre definiált Hamilton-kör szerinti bejárás (itt spirál a peremtől befelé). Az étel felé csak akkor tér le rövid útra, ha a lépés továbbra is biztonságos — célja, hogy strukturáltan bejárja a pályát és elkerülje a kaotikus zsákutcákat.',
    whyTheseResults:
      'Kiszámítható, hosszú túlélés, de az étel felé történő „levágás” nem mindig optimális: előfordul, hogy hosszabb utat tesz meg, mint egy agresszívabb útkereső. A pontszám és a lépésszám összefüggése jól látszik; önütközés viszonylag ritka, ha a biztonsági feltétel szigorú.',
  },
  bfs: {
    howItWorks:
      'Szélességi keresés az üres cellákon: mindig a legkevesebb lépésből elérhető út az ételig (heurisztika nélkül). Ha nincs biztonságos út az ételhez, ugyanaz a biztonsági tartalék, mint az A*-nál: farok felé vagy legkevésbé kockázatos szomszéd.',
    whyTheseResults:
      'Az A*-hoz hasonló eredménysáv gyakori, mert mindkettő optimális lépésszámú utat keres — az A* kevesebb csomópontot néz meg. Ha a pálya tele van, a BFS drágább lehet időben, de a benchmarkban a minőség (pont, halál okok) gyakran összevethető az A*-ral.',
  },
  greedy: {
    howItWorks:
      'Minden lépésben azt az irányt részesíti előnyben, amely a legtöbb elérhető üres cellát hagyja („legtöbb lélegzet”). Nem célvezérelt az étel felé: extrém óvatos, ezért sokszor köröz vagy nagyon lassan növekszik.',
    whyTheseResults:
      'Alacsony átlagpont és magas „éhség” (benchmark stop) arány jellemző: a kígyó nem megy agresszívan az ételhez, ezért a pont nem nő, a futás idő előtt leáll. Fal/önütközés aránya változó: óvatosság miatt néha kevesebb ütközés, de a játék így is rövid maradhat.',
  },
  follow_tail: {
    howItWorks:
      'Ha van biztonságos út az ételhez (út keresés), azt követi. Ha nincs, a farok felé próbál haladni, hogy fenntartsa a teret és később újra nyisson utat az ételhez — tipikus „space filling” viselkedés.',
    whyTheseResults:
      'Gyakran erős közepes–magas pontszám: jól kombinálja a célvezetést és a túlélést. Ha a kígyó hosszú, a farok-követés néha körbe kényszeríti a testet, és falnak/önnek ütközhet — ez növelheti a fal/self arányt bizonyos fázisokban.',
  },
  hamilton_zigzag: {
    howItWorks:
      'Mint a spirálos Hamilton, de soronként váltott irányú „zigzag” sávokban járja be a pályát. Az étel felé rövidítés csak akkor engedett, ha nem szúrja szét a biztonságos bejárást.',
    whyTheseResults:
      'Hasonló mintázat a spirálhoz: stabil túlélés, néha más eloszlású hibák, mert a bejárás geometriája más. A pontszám függ attól, milyen gyakran tud biztonságosan levágni az étel felé.',
  },
  lookahead: {
    howItWorks:
      'Egy lépésre előre szimulál minden legális irányt: minden gyerekállapotban megszámolja a kígyó által elérhető üres cellák számát (BFS flood fill a farok időzítésével). A legnagyobb „teret” adó lépést választja; döntetlennél az ételhez közelebb eső irány nyer.',
    whyTheseResults:
      'Gyakran a legerősebb heurisztikák között: lokálisan jól kerüli a zsákutcát, és mégis cél orientált. Magas átlagpont és relatíve alacsony éhség jellemző; a halálok gyakran fal/ön, amikor a kígyó már nagyon hosszú és minden irány szűk.',
  },
  minimax: {
    howItWorks:
      'Rövid horizont (1–2 lépés): minden saját lépésre egy egyszerűsített „ellenség” választ feltételez, majd maximin szerint választ. Az állapotot számmal értékeli (étel távolság, szabad tér, ütközés).',
    whyTheseResults:
      'A horizont rövidsége miatt nem lát messzire: néha túl optimista vagy túl pesszimista döntések. A pontszám és a halál okok szórása lehet nagyobb, mint az 1 lépéses előretekintésnél; instabilabb viselkedés zsúfolt végjátékban.',
  },
  hamilton_short_cycles: {
    howItWorks:
      'A pályát kis (pl. 2×2) ciklusokra bontja; blokkon belül egy rövid körön halad. Ételnél a szomszédos blokk felé vált, ha a lépés biztonságos — így lokális struktúrát tart fenn.',
    whyTheseResults:
      'A blokkos bejárás miatt más hibaminták jelennek meg, mint az egybefüggő spirálnál: néha lassabb növekedés vagy más arányú fal/self. A teljesítmény erősen függ a pályamérettől és attól, milyen gyakran engedélyezett az étel felé térés.',
  },
  max_safety: {
    howItWorks:
      'Csak olyan lépést enged, amely után is fennáll, hogy van út a fej és a farok között (kígyó teste mint akadály). A megmaradt lépések közül azt választja, amely a legtöbb szabad cellát hagyja.',
    whyTheseResults:
      'Extrém konzervatív: hasonlóan a greedy-hez, sok futásban alig eszik, ezért alacsony pont és magas éhség arány gyakori. Ha mégis növekszik, hosszú, óvatos játékot látunk; ütközés aránya lehet alacsony, de a benchmark stop dominálhat.',
  },
  lookahead_3: {
    howItWorks:
      'Három lépésre előre szimulál minden első irányt; a további lépéseket egyszerűsített (pl. greedy) szabályokkal közelíti. Azt az első lépést választja, amely a legjobb értékű előrejelzett végpontot adja.',
    whyTheseResults:
      'Több lépés = jobb zsákutcakerülés, mint 1 lépésnél, de nagyobb számítási költség. A benchmarkban általában jó pontszám, halál okok hasonlóak az 1 lépéses előretekintéshez, esetleg kevesebb korai önbeütközés zsúfolt állapotban.',
  },
  lookahead_5: {
    howItWorks:
      'Öt lépésre előre szimulál; ugyanaz a séma, mint a 3 lépésnél, de mélyebb ág. Célja, hogy messzebbre „lásson” a zsákutcák felé.',
    whyTheseResults:
      'A mélység növelése nem mindig javít: a belső greedy közelítés torzíthatja a 4–5. lépést, és lassabb döntés mellett is előfordulhat rossz lokális minimum. Előfordulhat gyenge átlag és magas éhség, ha a szimuláció nem egyezik a valós dinamikával vagy túl óvossá válik.',
  },
  dqn: {
    howItWorks:
      'Tanulás: a háló Q(s,a) értékeket becsül, tapasztalatokból és célváltozóból frissül (target háló, replay buffer). Következtetés: a legnagyobb Q értékű akció (a benchmarkban tipikusan determinisztikus). Az állapot vektor a pályáról készült feature-ökből áll.',
    whyTheseResults:
      'Ha a jutalom, az állapotleképezés vagy a tanítási idő nem elég jó, a policy könnyen „topog”: nem eszik rendszeresen, ezért magas az éhség arány és alacsony az átlagpont. Ha már tanult ételközelítést, növekszik az első étel elérési arány és a pont; ön/fal arány a kockázatvállalástól függ.',
  },
  ppo: {
    howItWorks:
      'Tanulás: sztochasztikus policy, amelyet a PPO célja frissít klipelt gradienssel; a háló közvetlenül ad irányeloszlást állapotra. Következtetés: a tanítás után a legvalószínűbb vagy mintavételezett akció; a benchmark a mentett policy szerint fut.',
    whyTheseResults:
      'A DQN-hez hasonlóan erősen függ a reward shaping-től és az episzód hosszától. Rossz jutalom esetén a policy nem tanul agresszív ételgyűjtést → éhség dominál. Jó beállításnál növekvő pont és vegyes halál okok (ön/fal) jelentkezhetnek, ha a kígyó már merészebben megy az ételhez.',
  },
  neuroevolution: {
    howItWorks:
      'NEAT populáció: minden egyed egy kis neurális háló (súlyok, szükség szerint kapcsok). Fitness alapján szelekció, mutáció, generációk. A benchmark a legjobb egyed súlyaival számolja a következő irányt ugyanabból az állapotreprezentációból, mint tanításkor.',
    whyTheseResults:
      'A fitness függvény és a bemeneti feature-ök határozzák meg a viselkedést. Ha a fitness nem bünteti az éhezést vagy nem jutalmazza az evést elég erősen, sok egyed „biztonságos” körözést tanul. Jó fitness mellett a tanult policy néha versenyre kelhet gyengébb heurisztikákkal; a halál okok a kialakult viselkedéstől függnek.',
  },
}

export function getStrategyBenchmarkDetail(strategyId: string): StrategyBenchmarkDetail {
  const d = STRATEGY_BENCHMARK_DETAIL[strategyId]
  if (d) return d
  return {
    howItWorks:
      'Ehhez az azonosítóhoz nincs előre megírt részletes leírás a kliensben. A stratégia valószínűleg a backend STRATEGIES regiszterében van definiálva; a rövid összefoglaló a beállítások listában olvasható.',
    whyTheseResults:
      'Általános szabály: magasabb átlagpont általában jobb egyensúlyt jelent étel és túlélés között; magas éhség arány gyakran azt jelenti, hogy a döntések nem növelik a pontot elég gyakran a benchmark időkorlata alatt.',
  }
}
