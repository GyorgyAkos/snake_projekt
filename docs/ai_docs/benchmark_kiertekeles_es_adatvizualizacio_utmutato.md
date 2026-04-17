# Benchmark kiértékelés és adatvizualizáció – szakmai útmutató

## 1. Hogyan folytasd a projektet?

Ez a projekt jelenleg eljutott oda, hogy:

- több heurisztika (A*, Hamilton, LookAhead, stb.) benchmarkolható egységes környezetben,
- három tanuló stratégia (DQN, PPO, NEAT) implementálva és mérhető benchmarkon,
- rendelkezésre állnak reprodukálható benchmark JSON kimenetek.

A következő lépések szakmailag ajánlott sorrendje:

### 1.1 Reprodukálható „fő” benchmark futások rögzítése

Válassz 1 végleges benchmark-protokollt, és ez alapján készítsd el a dolgozatban hivatkozott eredményeket:

- Pálya: `20x20`
- Seed bázis: fix (pl. 42)
- Starvation limit: fix (jelenleg 400 lépés étel nélkül)
- Max lépésszám: fix (pl. 5000)
- Runs:
  - heurisztikák: 500
  - tanuló stratégiák: 200 vagy 300

Fontos: a dolgozatban mindig írd le ezt a protokollt, különben az eredmények nehezen értelmezhetők.

### 1.2 Eredmények „lefagyasztása” és verziózása

- A benchmark JSON fájlokat ne írd felül kontroll nélkül.
- Célszerű dátummal / futásazonosítóval menteni (pl. `strategy_benchmark_summary_2026-02-18.json`).
- Írd fel, mely modellek voltak betöltve:
  - DQN: melyik `.pt`,
  - PPO: melyik `.zip`,
  - NEAT: melyik `best.pkl`.

### 1.3 Két szintű elemzés készítése

- **Deskriptív elemzés**: átlag, medián, szórás/eloszlás.
- **Összehasonlító elemzés**: algoritmusok közötti relatív különbségek.

### 1.4 Végső szakdolgozati narratíva

Ajánlott történet:

1. Heurisztikák mint erős baseline-ok.
2. DQN/PPO/NEAT mint tanuló alternatívák.
3. Azonos környezetben mért teljesítménykülönbségek.
4. Trade-off: teljesítmény, stabilitás, hangolási igény, implementációs komplexitás.

---

## 2. Eredmények kiértékelése – hogyan hasonlítsd össze az algoritmusokat?

## 2.1 Elsődleges metrikák (amit mindenképp mutass)

- `score_mean`
- `score_median`
- `steps_mean`
- `steps_median`
- `reached_first_food` (%)
- `death_counts` (wall/self/max_steps/starvation)

Ezek közül a Snake játék célja szempontjából a legfontosabb a `score` (pont / felvett étel), a `steps` és a death típusok a viselkedést árnyalják.

## 2.2 Mit jelent a metrika kombinációja?

- **Magas score + magas first_food + kiegyensúlyozott death profile**  
  => erős, használható stratégia.
- **Magas steps, de alacsony score**  
  => túlélő, de gyenge ételgyűjtés (tipikus „körbe-körbe” viselkedés).
- **Magas score, de sok `self` death**  
  => agresszív, de kockázatos stratégia.
- **Alacsony median, magas mean**  
  => instabil, ritka „jó” futások húzzák fel az átlagot.

## 2.3 Mit érdemes hangsúlyozni az összehasonlításban?

### Hatékonyság

- Milyen gyorsan és mennyi pontot szerez.
- Score-centrikus sorrend (pl. median score alapján).

### Robusztusság

- Mennyire stabil különböző seed-ek mellett.
- Mean vs median különbség.
- Eloszlás szélessége (boxplot / IQR).

### Gyakorlati használhatóság

- Kiszámítható-e?
- Sok finomhangolást igényel-e?
- Mennyire érzékeny reward/hyperparaméter változtatásra?

---

## 3. Milyen következtetéseket érdemes levonni?

## 3.1 Jó következtetések (szakmailag erősek)

- „A heurisztikák jelen benchmark-protokollban magasabb és stabilabb score-t értek el, mint a tanuló modellek.”
- „A tanuló modellek közül a NEAT jobb volt a PPO-nál, de elmaradt a legerősebb heurisztikáktól.”
- „A median score és death profile alapján a stratégia X robusztusabb, míg Y agresszívebb.”
- „A módszerek teljesítménye erősen függ a reward/protokoll választástól; ezért a benchmark környezet fixálása kulcsfontosságú.”

## 3.2 Kerülendő túlállítások

- „Az algoritmus általánosan jobb” (ha csak egy pályaméretet / egy környezetet néztél).
- „A tanuló algoritmus alkalmatlan” (inkább: ebben a konfigurációban és erőforrás-keretben gyengébb).
- „A magas mean mindig jobb” (ha median és variancia rossz).

---

## 4. Tipikus interpretációs hibák, amiket kerülj el

## 4.1 Átlagfetisizmus

Csak `mean` alapján nem szabad rangsort felállítani. Mindig nézd a mediánt és eloszlást is.

## 4.2 Nem azonos kísérleti feltételek

Ha különböző runs, seed, max_steps, starvation limit mellett futnak a módszerek, az összehasonlítás torz.

## 4.3 Trunkált futások félreértelmezése

`max_steps` vagy `starvation` lezárás nem ugyanaz, mint „jó stratégia”.
Ez csak azt jelenti, hogy nem halt meg hamar – lehet, hogy közben alig szerzett pontot.

## 4.4 „Best model bias”

Ha csak a legjobb futást mutatod, az túl optimista képet ad. Benchmarkhoz több seed / több futás kell.

## 4.5 Könyvtár warningok túlreagálása

Pl. Gym deprecation warning önmagában nem teszi érvénytelenné az eredményt, de dokumentáld a környezetet és verziókat.

---

## 5. Adatvizualizáció – milyen diagramot mire használj?

## 5.1 Kötelező minimálcsomag (szakdolgozathoz erősen ajánlott)

### (A) Bar chart – `score_mean` + `score_median`

- **Cél**: gyors, áttekinthető rangsor.
- **Jó**: olvasó 5 másodperc alatt látja, ki a legerősebb.
- **Korlát**: eloszlást nem mutatja.

### (B) Boxplot – score eloszlás stratégiánként

- **Cél**: robusztusság és szórás bemutatása.
- **Jó**: median, IQR, outlierek látszanak.
- **Kritikus**: ez adja a stabilitási képet.

### (C) Stacked bar – death_counts megoszlás

- **Cél**: viselkedési profil (wall/self/max_steps/starvation).
- **Jó**: megmutatja, miért „olyan” egy stratégia.

### (D) Scatter – `score_mean` vs `steps_mean`

- **Cél**: hatékonyság vs túlélés trade-off.
- **Jó**: látszik, ki szerez sok pontot sok lépéssel, és ki „csak él”.

## 5.2 Opcionális plusz

- Histogram vagy KDE stratégiánként (score eloszlás finomabb képe).
- Violin plot (ha sok futás van és szépen akarod mutatni az eloszlást).
- Radar chart kerülendő (látványos, de szakmailag nehezebben olvasható).

---

## 6. Hogyan legyen publikációra alkalmas a grafikon?

## 6.1 Egységes vizuális szabályok

- Ugyanaz a szín ugyanannak az algoritmusnak minden ábrán.
- Tengelyfelirat + mértékegység mindig legyen.
- Jelmagyarázat rövid, de egyértelmű.
- Azonos skálatartomány, ahol összehasonlítható.

## 6.2 Tipográfia és export

- Betűméret: legalább 10–11 pt (nyomtatásban is olvasható).
- Export: **SVG/PDF** (vektoros) vagy 300 DPI PNG.
- Ábra címe legyen informatív, ne csak „Benchmark”.
  - Pl.: „Score eloszlás stratégiánként (20×20, 500 run, starvation=400)”

## 6.3 Ábraaláírás (caption) sablon

Minden ábránál írd le:

- pályaméret,
- runs szám,
- seed tartomány,
- max_steps,
- starvation limit,
- mely stratégiák szerepelnek.

Példa:

„Az ábra a 20×20-as pályán, 500 futás mellett mért score eloszlást mutatja. A benchmark fix seed-sorozatot (42–541), 5000 max lépést és 400 lépéses starvation limitet használ.”

---

## 7. Javasolt fejezetstruktúra a szakdolgozathoz

1. **Mérési protokoll**
   - környezet, metrikák, benchmark script, paraméterek.
2. **Összesített eredmények**
   - táblázat + fő bar chart.
3. **Robusztusság elemzés**
   - boxplot + median/mean értelmezés.
4. **Viselkedésprofil**
   - death distribution + steps/score scatter.
5. **Összegzés**
   - melyik stratégia mire erős, mire gyenge.
   - gyakorlati ajánlás (pl. valós játékhoz heurisztika, kutatási célra RL/NEAT).

---

## 8. Rövid döntési javaslat a jelenlegi projektállapotra

- **Ha a cél a legjobb játékteljesítmény**: heurisztikák (különösen LookAhead, A*, Hamilton) jelenleg erősebbek.
- **Ha a cél módszertani összehasonlítás**: DQN/PPO/NEAT mindenképp maradjon, mert tudományos értéke az összevetésben van.
- **Ha a cél publikálható összehasonlítás**: a benchmark protokollt fagyaszd le, futtasd reprodukálhatóan, és minimum 3–4 ábratípussal (bar + box + stacked death + scatter) mutasd be.

