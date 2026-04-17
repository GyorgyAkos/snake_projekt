# Szakdolgozat – statisztikai és elemzési rész: struktúra, további ötletek, gyakorlati megvalósítás

Ez a dokumentum segít megtervezni a dolgozat **statisztikai / elemzési** fejezeteit úgy, hogy:

- könnyen követhető legyen,
- világos hierarchiát adjon,
- támogassa az algoritmusok összehasonlítását,
- és konzisztensen kapcsolja össze a szöveget a grafikonokkal.

A projektben már rendelkezésre állnak benchmark JSON-ok (`benchmarks/results/strategy_benchmark_*.json`), összegző fájl (`strategy_benchmark_summary.json`), valamint grafikongeneráló script (`benchmarks/generate_benchmark_plots.py`).

---

## 1. Mit érdemes még hozzátenni a már megfogalmazott ötletekhez?

Az alábbiak **reálisan megvalósíthatók** a jelen adatstruktúrával, és emelik a szakmai színvonalat.

### 1.1 Robusztusság és stabilitás

- **Mean vs median**: ha az átlag jó, de a medián alacsony, az instabilitás jele (ritka „nagy” futások húzzák fel az átlagot).
- **IQR / percentilisek** (25%, 75%): boxplot mellett 1–2 mondatban összefoglalva.
- **Konfidencia-intervallum** (bootstrap, ha van idő): pl. score_mean 95%-os CI stratégiánként – különösen impresszív, ha kevés futásod van RL-re (200).

### 1.2 Halálok és viselkedésprofil (nem csak pontszám)

- **Death composition**: `wall` / `self` / `starvation` / `max_steps` arány.
- **„Miért halt meg?” narratíva**:
  - sok `starvation` → nem hatékony ételkeresés vagy túl szigorú lezárási feltétel,
  - sok `self` → agresszív, kockázatos mozgás,
  - sok `wall` → irányítási / logikai hiba vagy rossz fallback.

### 1.3 Hatékonyság trade-off: score vs lépésszám

- **Scatter plot**: `steps_mean` vs `score_mean` – ki „drágán” szerzi a pontot (sok lépés / kevés score).
- **Score per step** (másodlagos metrika): `score_mean / steps_mean` – óvatosan értelmezve (nullához közeli score esetén zajos).

### 1.4 Fair comparison (fair összehasonlítás) – módszertani fejezet

- **Azonos pálya, seed, max_steps, starvation** – ezt mindig írd le.
- **Runs szám különbség**: jelenleg heurisztikák 500, RL 200 – dokumentáld, és opcionálisan futtass egy **közös 200 run** kontrollt mindenkire.
- **Modell állapot**: melyik `dqn_snake.pt`, melyik `ppo_snake*.zip`, melyik `neat_snake_best.pkl` volt betöltve – reprodukálhatóság.

### 1.5 Edge case / érzékenység (korlátozott, de értékes)

- **Különböző starvation limit** (pl. 300 vs 400 vs 500): hogyan változik a rangsor? (kis kiegészítő kísérlet).
- **Kisebb pálya** (15×15): gyorsabb tanulás / más viselkedés – 1 táblázat + 1 mondat is elég lehet „érzékenységi jegyzetként”.

### 1.6 Számítási költség / skálázhatóság (opcionális, de professzionális)

- **Egy játék futási ideje** stratégiánként (heurisztika vs RL inference) – egyszer mérve, táblázatban.
- **Tanítási költség** (DQN/PPO/NEAT): timesteps / generációk / futásidő – összehasonlítás „eredmény / erőforrás” szempontból.

### 1.7 Összefoglaló rangsor több szempontból

Ne egyetlen „legjobb” legyen; inkább:

- **Legmagasabb median score**
- **Legstabilabb** (kis IQR)
- **Legjobb first_food%**
- **Legjobb trade-off** (magas score, elfogadható lépésszám)

---

## 2. Javasolt fejezetstruktúra (tartalomjegyzék jelleggel)

Az alábbi felépítés **logikus olvasási ívet** ad: definíciók → mérés → eredmények → értelmezés → következtetés.

### 2.1 Bevezető: miért kell statisztika ebben a projektben?

- A Snake MI stratégiák teljesítménye **véletlenszerű kezdőállapotok** mellett változik.
- Cél: **objektív összehasonlítás**, ne csak „szubjektív benyomás” egy-egy játékról.

### 2.2 Kísérleti beállítások (Measurement protocol)

- Pályaméret, `max_steps`, starvation limit, seed policy.
- Futások száma stratégiánként.
- Benchmark eszköz: `benchmarks/run_strategy_benchmark.py`.
- Kimenetek: JSON + plotok.

### 2.3 Stratégiák csoportosítása (olvasóbarát keret)

**2.3.1 Nem tanuló (heurisztikus / szabályalapú) stratégiák**  
Rövid működésleírás + erősség/gyengeség várhatóan.

**2.3.2 Tanuló stratégiák (RL + neuroevolution)**  
DQN / PPO / NEAT: mit tanul, mi a kimenet, milyen adat kell hozzá (modell fájl).

### 2.4 Metrikák definíciója

- `score`, `steps`, `death`, `reached_first_food`.
- Mi számít „jobb” (prioritás): **median score** + **first_food** + **death profile**.

### 2.5 Deskriptív statisztika

**2.5.1 Összesítő táblázat** (mean, median, stb.)  
**2.5.2 Grafikonok** (lásd 3. fejezet)  
**2.5.3 Rövid narratíva** táblázat + ábra alá (2–4 mondat stratégiánként *csak a legfontosabbakra*, ne mindenre regényt)

### 2.6 Összehasonlító elemzés

**2.6.1 Heurisztikák egymás között**  
**2.6.2 Tanuló módszerek egymás között**  
**2.6.3 Tanuló vs nem tanuló**  
Mindhárom szekció ugyanazt a sablont kövesse:

1. Rangsor (median/mean alapján).
2. Robusztusság (boxplot / IQR).
3. Viselkedés (death stacked).
4. „Miért?” hipotézis (szakmailag óvatosan).

### 2.7 Magyarázat / interpretáció (Why)

- Miért lehet, hogy LookAhead/A* erős?
- Miért gyenge lehet egy RL modell rossz reward/hyperparam mellett?
- Miért segít a NEAT bizonyos esetekben a PPO-hoz képest?

### 2.8 Korlátok és fenntartások (Limitations)

- Runs szám különbség.
- Starvation censoring: nem ugyanaz, mint természetes halál.
- Modell verziók nem feltétlen optimálisan hangoltak.

### 2.9 Következtetések és jövőbeli munka

- Melyik stratégia „éles” játékra, melyik kutatási célra.
- Mit érdemes tovább finomítani (több run, közös runszám, további pályaméret).

---

## 3. Hogyan kösd össze a leírásokat a grafikonokkal? (best practice)

### 3.1 „Egy ábra – egy üzenet” elv

Minden grafikon válaszoljon egy konkrét kérdésre:

| Grafikon | Kérdés |
|---|---|
| Bar chart (mean) | Ki a legmagasabb átlag score? |
| Boxplot | Ki a legstabilabb? Van-e szétszórás? |
| Stacked death | Miért halnak meg? (viselkedés) |
| Scatter steps vs score | Ki hatékony? Ki csak túlél? |

### 3.2 Szöveg szerkezete ábra körül (sablon)

1. **Ábra címe** (mit mutat, milyen paraméterekkel).
2. **1–2 mondat**: fő megállapítás („LookAhead a legmagasabb median score-t adja.”).
3. **1 mondat**: árnyalat („A lépésszám magasabb, ami számítási költséggel jár.”).
4. (Opcionális) **Hivatkozás** a táblázatra / JSON-ra.

### 3.3 Konzisztencia

- Ugyanaz a **stratégia-szín** minden ábrán.
- Ugyanaz a **stratégia sorrend** (pl. csökkenő median score) – kivéve, ha alphabetikus indokolt.
- Ugyanaz a **footprint**: pálya, runs, seed, starvation – ez legyen minden caption-ban.

### 3.4 Mit NE tegyél

- Ne illessz be ábrát magyarázat nélkül.
- Ne állíts „bizonyítottnak” egy rangsort, ha nincs elég futás / nincs közös protokoll.
- Ne keverd a **tanítási** eredményeket a **benchmark** eredményekkel külön jelölés nélkül.

---

## 4. Konkrét példa: hogyan néz ki egy „jó” alfejezet

### 4.1 Példa cím

**„5.4 Tanuló stratégiák összehasonlítása (benchmark, 200 futás)”**

### 4.2 Példa szöveg + hivatkozás

> A 3. ábra a tanuló stratégiák score eloszlását mutatja boxplot formában. A NEAT median score-ja magasabb, mint a PPO és a DQN esetében; utóbbi stratégiánál a futások túlnyomó többsége 0 pont körül zárt starvation miatt (4. ábra). Ez nem feltétlenül azt jelenti, hogy a DQN algoritmus általában alkalmatlen, hanem hogy **a jelenlegi modell és a benchmark protokoll** együtt gyenge játékot eredményez.

Ez a stílus: **adat → ábra → óvatos értelmezés**.

---

## 5. Gyors checklist a dolgozat statisztikai részéhez

- [ ] Van külön **mérési protokoll** alfejezet.
- [ ] Minden táblázathoz van **rövid magyarázat**.
- [ ] Minden grafikonhoz van **caption** + **fő következtetés**.
- [ ] Van **fair comparison** megjegyzés (runs, model verzió).
- [ ] Van **limitations** szekció.
- [ ] A következtetések **nem erősebbek**, mint amit az adat igazol.

---

## 6. Hogyan illeszkedik ez a meglévő projektfájlokhoz?

- Benchmark futtatás: `benchmarks/run_strategy_benchmark.py`
- Összegzés: `benchmarks/results/strategy_benchmark_summary.json`
- Részletes futások: `benchmarks/results/strategy_benchmark_<strategy>.json`
- Grafikon generálás: `benchmarks/generate_benchmark_plots.py` → `benchmarks/results/plots/*.png`
- Részletes kiértékelés példa: `docs/ai_docs/benchmark_eredmenyek_reszletes_kiertekeles.md`
- Általános útmutató: `docs/ai_docs/benchmark_kiertekeles_es_adatvizualizacio_utmutato.md`

---

## 7. Javasolt „minimum viable” publikációs csomag (ha kevés idő van)

Ha csak kevés helyet szánsz statisztikára, ez a 4 elem még mindig professzionális:

1. Táblázat: mean + median + first_food.
2. Boxplot: score.
3. Stacked bar: death.
4. 10–15 sor: limitations + fair comparison.

Ez a csomag már önmagában is megállja a helyét egy szakdolgozatban.
