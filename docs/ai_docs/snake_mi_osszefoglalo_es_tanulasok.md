# Snake + MI – Összefoglaló és tanítások (laikusoknak)

Ez a dokumentum **egy helyen** összefoglalja a Snake játék MI (mesterséges intelligencia) projektjét: mit csinál a rendszer, hogyan működik, milyen stratégiák vannak, és részletesen elmagyarázza a **DQN**, **PPO** és **Neuroevolution** tanításokat úgy, hogy egy laikus is megérthesse.

---

## 1. Miről szól a projekt? (rövid áttekintés)

A **Snake** egy klasszikus játék: egy kígyó mozog a pályán, ételt eszik, és minden falatnál hosszabb lesz. Cél: minél több ételt megenni anélkül, hogy a falba vagy a saját testébe ütközne.

Ebben a projektben:

- **Játékos mód:** te irányítod a kígyót (billentyűzet).
- **MI mód:** a számítógép irányítja a kígyót egy **stratégia** alapján. A stratégia azt dönti el, hogy „most menjen felfelé, lefelé, balra vagy jobbra”.

A projekt célja, hogy többféle **stratégiát** össze lehessen hasonlítani: van olyan, ami szabályokra épül (pl. „mindig a legrövidebb úton menj az ételhez”), és olyan is, ami **tanulás** alapján dönt (pl. neurális háló, ami gyakorlással megtanulja, melyik lépés jó).

---

## 2. Hogyan működik a rendszer? (architektúra egyszerűen)

A rendszer három fő részből áll:

1. **Frontend (böngésző)**  
   React alkalmazás: megjeleníti a pályát, a kígyót, az ételt. Kezeli a játékos billentyűit, és ha MI mód van, akkor **kér irányt** a backendtől.

2. **Backend (Node)**  
   Felhasználók, bejelentkezés, eredmények mentése (pl. pontszámok, hogy melyik stratégiával játszottál).

3. **AI szolgáltatás (Python)**  
   A MI logika itt fut. A frontend WebSocketen vagy HTTP-n megkéri: „Itt van a játék állapota (hol a kígyó, hol az étel), mondd meg a következő lépést.” Az AI szolgáltatás a kiválasztott **stratégiával** kiszámolja az irányt (pl. Up, Down, Left, Right) és visszaküldi.

Tehát: **állapot be → stratégia → irány ki.** Minden stratégia ugyanazt az interfészt használja: kap egy állapotot, visszaad egy irányt. Így könnyű új stratégiákat hozzáadni és őket össze hasonlítani.

---

## 3. Milyen stratégiák vannak? (kategóriák)

A stratégiák két nagy csoportba sorolhatók:

- **Heurisztikus / szabályalapú:** előre megírt szabályok (útkeresés, körök, biztonság ellenőrzés). Nem „tanulnak”, csak a programozott logika szerint döntenek.
- **Tanuló (ML/RL):** modell (pl. neurális háló) **tanítás** után dönt. A DQN, PPO és Neuroevolution ebbe a csoportba tartoznak; jelenleg ezek **placeholder**-ek (ha nincs betanított modell, egy egyszerű biztonságos stratégia, pl. Greedy, helyettük lép).

A következő alfejezetekben röviden áttekintjük a **megvalósított** stratégiákat, majd a **tanítási** módszereket részletesen.

---

### 3.1 Útkeresés és kör alapú stratégiák

- **A\***  
  Keres egy **legrövidebb útvonalat** a kígyó fejétől az ételig (Manhattan távolság + lépésszám). Ha ez az út veszélyes (pl. bezárja magát), akkor fallback: pl. farok felé vagy a legbiztonságosabb lépés.

- **BFS (szélességi keresés)**  
  Szintén „legrövidebb út az ételig”, de heurisztika nélkül: minden szomszédot egyenlőnek kezel. Egyszerűbb mint az A*, jó összehasonlítási alap.

- **Hamilton (spirál, zigzag, rövid ciklusok)**  
  A pályán **előre megrajzolt kör(ök)** vannak. A kígyó a kör mentén halad; az étel felé csak akkor tér le, ha biztonságos. Így elkerülheti a falat. A spirál a külső peremről megy befelé; a zigzag sávokban; a rövid ciklusok több kis körrel dolgoznak.

- **Farok-követés (Follow the tail)**  
  Ha van biztonságos út az ételig, arra megy. Ha nincs, a **farok** felé tart – így „körbe jár” és ne ütközzön falba.

Ezek mind **determinisztikus szabályok**: ugyanarra az állapotra mindig ugyanazt a lépést adják (ha ugyanaz a stratégia és konfiguráció).

---

### 3.2 Biztonság és előretekintés

- **Greedy (biztonság első)**  
  Minden lépésnél azt az irányt választja, ahol a **legtöbb szabad cella** van (pl. flood fill alapján). Nem kockáztat az étel miatt; nagyon óvatos.

- **Maximal safety**  
  Csak olyan lépést tesz, ami után **még van út a fej és a farok között**. Ezek közül a legjobbnak tűnőt választja. Extra óvatos.

- **Előretekintés (1, 3 vagy 5 lépés)**  
  **Szimulálja** az 1, 3 vagy 5 lépést minden lehetséges irányból (greedy vagy hasonló alapon), és azt az első lépést választja, ami a szimuláció szerint a legjobb (pl. több szabad hely, étel közelebb). Minél több lépés, annál okosabb döntés, de lassabb.

- **Minimax (rövid horizont)**  
  1–2 lépésre előre gondolkodik: értékeli az állapotot (étel közel, szabad hely), és egy **maximin** típusú döntést hoz (a legjobb első lépés a legrosszabb második lépés ellenére is).

Ezek is szabályalapúak; a „tanulás” itt csak annyi, hogy a programozó által megírt értékelést és keresést használják.

---

### 3.3 Tanuló stratégiák (placeholder)

A következő stratégiák a **tanulás** alapján döntenének; jelenleg **nincs betanított modell**, ezért **placeholder**: a rendszer egy egyszerű biztonságos stratégiát (pl. Greedy) futtat helyettük.

- **DQN (Deep Q-Network)**  
  Egy **neurális háló** tanulja meg: adott állapothoz melyik irány mennyire „jó” (Q érték). A legjobb irányt választja. A tanítás **erősítéses tanulással** történik (lásd később).

- **PPO (Proximal Policy Optimization)**  
  Szintén neurális háló, de nem Q értékeket tanul, hanem közvetlenül egy **politikát** (melyik irányt mennyire valószínű legyen választani). Policy gradient alapú, gyakran Stable-Baselines3 könyvtárral.

- **Neuroevolution / NEAT**  
  Itt nincs klasszikus „gradiens alapú” tanulás: a háló **súlyait evolúcióval** (genetikai algoritmus szerűen) alakítjuk. A jobban teljesítő hálók maradnak, a rosszabbak kiesnek; így generációk alatt egyre jobb döntéseket hoz a háló.

A dokumentum hátralevő része ezeknek a **tanítási folyamatának** a lényegét magyarázza el laikus szinten, majd technikai részleteket is ad.

---

## 4. Mi az „állapot”, „akció” és „jutalom”? (alapfogalmak)

Mielőtt a tanuló módszereket részleteznénk, három fogalmat érdemes tisztázni. Ezek mindegyik tanuló stratégiánál megjelennek.

- **Állapot (state / observation)**  
  A játék egy „fényképe” egy adott pillanatban: hol van a kígyó feje és teste, hol az étel, mekkora a pálya. A MI ennek alapján dönt. A számítógépnek ezt **számokból** kell felépíteni (vektor vagy mátrix), pl. „étel balra vagy jobbra”, „fal 2 lépésre”, „veszély közel” stb.

- **Akció (action)**  
  A döntés: **egy lépés** – felfelé, lefelé, balra vagy jobbra (4 lehetőség). A tanuló algoritmus ezek közül választ.

- **Jutalom (reward)**  
  Egy **szám**, ami azt mondja meg: „ez a lépés (vagy ez a játékhelyzet) mennyire jó”. Példa: étel megevés = nagy pozitív (pl. +1 vagy +10), halál = nagy negatív (pl. -10), „élsz tovább” = 0 vagy kicsi pozitív. A tanulás célja, hogy a modell olyan döntéseket hozzon, amelyek **összesített jutalmat** maximalizálnak (sok étel, kevés halál).

Egyszerűen: a gép **állapotot** lát, **akciót** választ, és **jutalmat** kap (közvetve: a játék kimenete alapján). Ezt sokszor megismételve **megtanulja**, melyik akciók vezetnek nagy jutalomhoz.

---

## 5. Közös alap: a Snake „környezet” a tanításhoz

A DQN, PPO és Neuroevolution **nem** a valós böngészős játékban tanul, hanem egy **szimulátorban** (környezetben). Ez egy program, ami:

- **Reset:** üres pálya, rövid kígyó, egy étel; opcionálisan fix vagy véletlen seed (reprodukálhatóság).
- **Step(akció):** „Ha most ezt az irányt választod, mi történik?” – a szimulátor egy képkockát léptet, és visszaadja: új állapot, jutalom, és hogy vége van-e a játéknak (pl. halál vagy tovább megy).

A tanítás során ez a környezet fut **ezer meg ezer** epizódot: minden epizód = egy játék a reset-től a halálig (vagy egy időlimitig). Az algoritmus lépéseket ad, jutalmat kap, és a hálót (vagy a politikát) ennek alapján frissíti.

Az állapot reprezentációja lehet például:

- **Rács alapú:** minden cella egy szám (üres / kígyó / fej / étel) → nagy vektor (pl. 20×20 = 400 szám).
- **Jellemző alapú:** kevesebb szám, pl. „étel balra vagy jobbra”, „fal távolság 4 irányban”, „veszély közel” → gyorsabb tanulás, kevesebb input.

A jutalom példa: étel +1, halál -10, lépés 0; opcionálisan „közelebb az ételhez” +0.01, „távolabb” -0.01 (reward shaping).

---

## 6. DQN (Deep Q-Network) – mi ez és hogyan tanul?

### 6.1 Mi a DQN laikus szinten?

Képzeld el, hogy a gép minden „helyzethez” (állapothoz) **négy számot** tanul meg: „Ha felfelé megyek, mennyire jó hosszú távon? Ha lefelé? Balra? Jobbra?” Ezek a **Q értékek**. A gép azt az irányt választja, aminek a legnagyon a Q értéke. A **neurális háló** (deep network) ezeket a Q értékeket becsüli: bemenet = állapot, kimenet = 4 szám (egy-egy irányhoz).

Tehát: **nem** szabályt írunk („menj az étel felé”), hanem **sok játék** alatt a háló megtanulja, hogy melyik irány hozza a legtöbb jutalmat hosszú távon.

### 6.2 Hogyan tanul? (rövid és egyszerű)

1. A háló kezdetben véletlen Q értékeket ad.
2. A környezetben **sok epizódot** játszunk. Minden lépésnél:
   - Az aktuális állapotot beadjuk a hálónak → kapunk 4 Q értéket.
   - **Epsilon-greedy:** valószínűséggel **véletlen** irányt választunk (felfedezés), egyébként a **legnagyobb Q**-t (kihasználás). Kezdetben sok a véletlen, később egyre kevesebb.
   - Meglépünk a választott iránnyal, kapunk jutalmat és új állapotot. Ezt (régi állapot, akció, jutalom, új állapot) **memóriába** (replay buffer) tesszük.
3. Időnként a memórából **véletlen mintákat** veszünk (batch), és a hálót ezekre **frissítjük**: a cél az, hogy a jósolt Q érték közelebb kerüljön a „valódi” hosszú távú jutalomhoz (TD cél). Ehhez egy **célhálót** (target network) is használunk, ami ritkán frissül, hogy a tanulás stabil legyen.

Ezt ismételjük sok epizódig. Az epizódok átlagos jutalma (és a játékban elért pontszám) fokozatosan nő – ez a **tanulási görbe**.

### 6.3 Mit kell technikailag megvalósítani?

- **PyTorch** (vagy TensorFlow): a háló (bemenet = állapot dimenzió, kimenet = 4).
- **Replay buffer:** tárolja a (állapot, akció, jutalom, következő állapot) négyeseket; batch mintavételezés.
- **Target network:** a háló másolata, ami pl. minden 100–500 lépésben frissül.
- **Tanítási script:** pl. `train_dqn.py` – ciklus: reset → step(epsilon-greedy) → store → sample batch → gradient lépés → periodikus target update. Mentés: `torch.save(model.state_dict(), "models/dqn_snake.pt")`.
- **Inference az AI szolgáltatásban:** modell betöltése, állapot → ugyanaz a megfigyelés konverzió mint tanításnál → háló(állapot) → argmax a 4 Q érték közül → irány. Ha nincs mentett modell: Greedy fallback.

---

## 7. PPO (Proximal Policy Optimization) – mi ez és hogyan tanul?

### 7.1 Mi a PPO laikus szinten?

A DQN **Q értékeket** tanult (melyik akció mennyire jó). A **PPO** más megközelítés: egy **politikát** tanul – azaz közvetlenül azt, hogy „ebben az állapotban mennyi legyen a valószínűsége a felfelé, lefelé, balra, jobbra lépésnek”. A háló kimenete: 4 valószínűség (vagy logit), ezekből **sorsolunk** egy irányt (tanítás közben), inference-nél pedig a **legnagyobb valószínűségű** irányt választjuk (determinisztikus).

Előny: könnyebb kezelni folytonos és bonyolultabb döntéseket, és a PPO speciális lépéskorlátozás (**proximal**) miatt a tanulás stabil. Gyakran **Stable-Baselines3** könyvtárral használják (PPO, A2C).

### 7.2 Hogyan tanul? (rövid és egyszerű)

1. A **policy háló** adott állapothoz valószínűségeket ad a 4 irányra. Kezdetben majdnem egyenlők (véletlenhez közeli).
2. Sok lépést játszunk a környezetben; minden lépésnél a háló szerint **sorsolunk** egy irányt, léptetünk, jutalmat kapunk.
3. Egy **kritikus** (value) háló becsüli: „ebben az állapotban mennyi a várható összesített jutalom?” (ezt a policy javításához használjuk).
4. PPO **kis batch-ekben** (pl. 2048 lépés) gyűjt adatot, majd több **epoch**-on át frissíti a policy-t úgy, hogy a **várható jutalom** nőjön, de a lépés **ne legyen túl nagy** (proximal réteg) – így nem romlik el hirtelen a viselkedés.

A tanítás parancs gyakran: `model.learn(total_timesteps=100_000)` (vagy 500k–1M). Mentés: `model.save("models/ppo_snake.zip")`. Az AI szolgáltatás: `PPO.load(...)`, majd `model.predict(obs, deterministic=True)[0]` → akció index → irány.

### 7.3 Mit kell technikailag megvalósítani?

- **Stable-Baselines3:** `pip install stable-baselines3`. A Snake környezetet **Gym** kompatibilissé kell tenni: `reset()` → (obs, info), `step(action)` → (obs, reward, terminated, truncated, info).
- **SnakeEnv:** ugyanaz a logika mint a DQN-nél (observation, reward, done), csak a formátum illeszkedjen a Gym/SB3 elvárásaihoz.
- **train_ppo.py:** `PPO("MlpPolicy", env, ...)`, `model.learn(...)`, `model.save(...)`.
- **Inference:** `ppo.py` stratégiában: betöltés, state → observation → `predict` → irány. Ha nincs .zip: Greedy fallback.

---

## 8. Neuroevolution (pl. NEAT) – mi ez és hogyan „tanul”?

### 8.1 Mi a Neuroevolution laikus szinten?

Itt **nincs** gradiens, backpropagation vagy Q érték. A **neurális háló** ugyanúgy állapotból irányt ad, de a **súlyait** nem „hiba alapján” módosítjuk, hanem **evolúcióval**:

- Sok **egyed** (háló) van; mindegyik más súlyokkal (és NEAT-nél más topológiával is).
- Minden egyed **több játékot** játszik (epizódot); a **fitness** = pl. átlagos jutalom vagy pontszám (+ esetleg túlélési bónusz).
- A **jól teljesítő** egyedek maradnak, a **gyengébbek** kiesnek; a maradékból **új generáció** születik (keresztezés, mutáció).
- Generációk során a populáció **egyre jobb** lesz; a **legjobb egyed** (winner) lesz a végleges modell.

Tehát: nem „hibát minimalizálunk”, hanem „túlélésre játszunk” – a jobb hálók maradnak, a rosszabbak eltűnnek. Ez **neuroevolution**: evolúció a háló(k)ra.

### 8.2 NEAT konkrétan

A **NEAT** (NeuroEvolution of Augmenting Topologies) nem csak a **súlyokat** evolválja, hanem a **háló szerkezetét** is: új neuronok, új élek jöhetnek be mutációval. Így kezdhetjük kis hálóval, és a feladat nehézsége szerint nőhet a topológia.

- **Konfiguráció:** input neuronok = állapot dimenzió (pl. 12), output = 4 (irányok). Populáció 50–100, generációk 50–200.
- **Fitness:** egy genome (egyed) → háló. Egy vagy több epizód a Snake környezetben; a háló adja az akciót; fitness = összesített jutalom (pl. pont + lépésszám bónusz, hogy ne álljon meg).
- **Tanítási script:** `train_neat.py` – NEAT Population, `population.run(fitness_fn, generations)`. A fitness függvény: genome → futtat N epizódot → átlagos reward. Mentés: a **winner** genome (és konfig) pickle vagy fájlba.
- **Inference:** betöltjük a konfigot és a winner genome-ot, `neat.nn.FeedForwardNetwork.create(genome, config)` → háló. Állapot → observation → `net.activate(obs)` → 4 kimenet, argmax → irány. Ha nincs mentett: Greedy fallback.

### 8.3 Miért érdekes ez egy laikusnak?

- **Könnyebb elképzelni:** nincs „derivált” vagy „gradiens”, csak: játszol, pontot kapsz, a jobbak maradnak, újak születnek. Mint a természetes evolúció.
- **Összehasonlítás:** a szakdolgozatban jól mutathatod, hogy ugyanarra a Snake feladatra a **szabályalapú** (A*, Hamilton), a **gradiens alapú tanuló** (DQN, PPO) és az **evolúciós** (NEAT) megközelítés hogyan viselkedik (konvergencia, végső pontszám, stabilitás).

---

## 9. Összehasonlítás: DQN vs PPO vs Neuroevolution (rövid táblázat)

| Szempont              | DQN                    | PPO                         | Neuroevolution (NEAT)      |
|-----------------------|------------------------|-----------------------------|----------------------------|
| **Mire tanul**        | Q értékek (4 irány)    | Policy (valószínűségek)     | Háló súlyok (+ topológia)  |
| **Hogyan**            | Replay + TD cél, grad. | Policy gradient, proximal  | Evolúció, fitness         |
| **Könyvtár**          | PyTorch / TF           | Stable-Baselines3          | neat-python                |
| **Stabilitás**        | Target net, eps-greedy| Proximal lépés             | Generációk, szelekció     |
| **Kimenet**           | 4 szám → argmax        | 4 valószínűség → választás | 4 kimenet → argmax         |
| **Laikus metafora**   | „Minden helyzethez 4 jegy” | „Minden helyzethez 4 esély” | „A jobb kígyók maradnak” |

Mindhárom ugyanazt a **Snake környezetet** (állapot, akció, jutalom) használja; a különbség a **tanulási mechanizmusban** van.

---

## 10. Fájlstruktúra és lépéssorrend (gyors referencia)

A tanítások és az inference a projektben így illeszkednek be (részletek a `rl_es_neuroevolution_tanitas_terv.md`-ben):

- **Közös:** `ai_service/src/env/snake_env.py` – SnakeEnv: reset, step, observation_space, action_space (Gym-szerű).
- **DQN:** `training/train_dqn.py` → `models/dqn_snake.pt`; inference: `strategies/dqn.py`.
- **PPO:** `training/train_ppo.py` → `models/ppo_snake.zip`; inference: `strategies/ppo.py`.
- **NEAT:** `training/train_neat.py` + `neat_config.txt` → `models/neat_winner.pkl`; inference: `strategies/neuroevolution.py`.

Ajánlott sorrend: először környezet, majd DQN (teljes pipeline), utána PPO és NEAT ugyanazzal az env-vel.

---

## 11. Összefoglaló egy mondatban

A projektben a Snake játékot **többféle stratégiával** lehet játszatni: szabályalapúak (A*, Hamilton, BFS, Greedy, előretekintés, minimax, stb.) és **tanuló** stratégiák (DQN, PPO, Neuroevolution). A tanuló stratégiák jelenleg **placeholder**-ek (Greedy fallback), amíg nincs betanított modell. A **DQN** Q értékeket tanul és a legjobb irányt választja; a **PPO** egy politikát tanul (valószínűségek az irányokra); a **Neuroevolution (NEAT)** pedig evolúcióval alakítja a hálót (fitness = játékbeli eredmény). Mindhárom ugyanazt a Snake szimulátort (állapot, akció, jutalom) használja; a dokumentum célja, hogy ezt egy laikus is átlátja és megértse a tanítások lényegét.
