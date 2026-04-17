import { useEffect, useMemo, useState } from 'react'
import { benchmarkPlotUrl, fetchBenchmarkSummaries, type BenchmarkSummary } from '../api'
import { getStrategyById, getStrategyName } from '../ai/strategies'
import { getStrategyBenchmarkDetail } from '../ai/strategyBenchmarkDetail'

/** Benchmarkban tanult / neurális stratégiák (a többi heurisztika). */
const NEURAL_STRATEGY_IDS = new Set(['dqn', 'ppo', 'neuroevolution'])

interface StatisticsProps {
  onBack: () => void
}

type SortKey =
  | 'strategy'
  | 'runs'
  | 'score_mean'
  | 'score_median'
  | 'steps_mean'
  | 'reached_first_food'
  | 'wall'
  | 'self'
  | 'starvation'
  | 'max_steps'

function deathPct(summary: BenchmarkSummary, key: string): string {
  if (summary.runs <= 0) return '—'
  const n = summary.death_counts[key] ?? 0
  return `${((100 * n) / summary.runs).toFixed(1)}%`
}

function deathCount(summary: BenchmarkSummary, key: string): number {
  return summary.death_counts[key] ?? 0
}

function compareRows(a: BenchmarkSummary, b: BenchmarkSummary, key: SortKey, dir: 'asc' | 'desc'): number {
  const m = dir === 'asc' ? 1 : -1
  switch (key) {
    case 'strategy':
      return m * a.strategy.localeCompare(b.strategy, 'hu')
    case 'runs':
      return m * (a.runs - b.runs)
    case 'score_mean':
      return m * (a.score_mean - b.score_mean)
    case 'score_median':
      return m * (a.score_median - b.score_median)
    case 'steps_mean':
      return m * (a.steps_mean - b.steps_mean)
    case 'reached_first_food':
      return m * (a.reached_first_food - b.reached_first_food)
    case 'wall':
      return m * (deathCount(a, 'wall') - deathCount(b, 'wall'))
    case 'self':
      return m * (deathCount(a, 'self') - deathCount(b, 'self'))
    case 'starvation':
      return m * (deathCount(a, 'starvation') - deathCount(b, 'starvation'))
    case 'max_steps':
      return m * (deathCount(a, 'max_steps') - deathCount(b, 'max_steps'))
    default:
      return 0
  }
}

function SortHeader({
  label,
  sort,
  columnKey,
  onSort,
}: {
  label: string
  sort: { key: SortKey; dir: 'asc' | 'desc' }
  columnKey: SortKey
  onSort: (k: SortKey) => void
}) {
  const active = sort.key === columnKey
  const arrow = !active ? '' : sort.dir === 'asc' ? ' ↑' : ' ↓'
  return (
    <th scope="col">
      <button type="button" className="stats-th-btn" onClick={() => onSort(columnKey)} aria-pressed={active}>
        {label}
        <span className="stats-sort-ind" aria-hidden>
          {arrow}
        </span>
      </button>
    </th>
  )
}

export function Statistics({ onBack }: StatisticsProps) {
  const [rows, setRows] = useState<BenchmarkSummary[]>([])
  const [benchDir, setBenchDir] = useState<string | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [visibleIds, setVisibleIds] = useState<Set<string>>(new Set())
  const [sort, setSort] = useState<{ key: SortKey; dir: 'asc' | 'desc' }>({ key: 'score_mean', dir: 'desc' })
  const [detailFor, setDetailFor] = useState<BenchmarkSummary | null>(null)
  const [plotLightbox, setPlotLightbox] = useState<{ src: string; caption: string } | null>(null)

  useEffect(() => {
    setDetailFor((d) => (d && !visibleIds.has(d.strategy) ? null : d))
  }, [visibleIds])

  useEffect(() => {
    if (!plotLightbox) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPlotLightbox(null)
    }
    window.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [plotLightbox])

  useEffect(() => {
    let cancelled = false
    fetchBenchmarkSummaries()
      .then((data) => {
        if (cancelled) return
        const list = data.summaries ?? []
        setRows(list)
        setBenchDir(data.benchmark_dir ?? null)
        if (data.error) setLoadError(data.error)
        else setLoadError(null)
        setVisibleIds(new Set(list.map((r) => r.strategy)))
        setDetailFor(null)
      })
      .catch((e) => {
        if (!cancelled) setLoadError(e instanceof Error ? e.message : 'Ismeretlen hiba')
      })
    return () => {
      cancelled = true
    }
  }, [])

  const allIdsSorted = useMemo(() => {
    const ids = [...new Set(rows.map((r) => r.strategy))]
    ids.sort((a, b) => getStrategyName(a).localeCompare(getStrategyName(b), 'hu'))
    return ids
  }, [rows])

  const sortedFiltered = useMemo(() => {
    const list = rows.filter((r) => visibleIds.has(r.strategy))
    return [...list].sort((a, b) => compareRows(a, b, sort.key, sort.dir))
  }, [rows, visibleIds, sort])

  const toggleSort = (key: SortKey) => {
    setSort((s) =>
      s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: key === 'strategy' ? 'asc' : 'desc' },
    )
  }

  const toggleVisibleId = (id: string) => {
    setVisibleIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectAllIds = () => setVisibleIds(new Set(rows.map((r) => r.strategy)))
  const selectNoIds = () => setVisibleIds(new Set())

  const selectHeuristicsOnly = () => {
    setVisibleIds(new Set(rows.map((r) => r.strategy).filter((id) => !NEURAL_STRATEGY_IDS.has(id))))
  }

  const selectNeuralOnly = () => {
    setVisibleIds(new Set(rows.map((r) => r.strategy).filter((id) => NEURAL_STRATEGY_IDS.has(id))))
  }

  const onRowActivate = (s: BenchmarkSummary) => {
    setDetailFor((d) => (d?.strategy === s.strategy ? null : s))
  }

  const detailText = detailFor ? getStrategyBenchmarkDetail(detailFor.strategy) : null
  const detailShort = detailFor ? getStrategyById(detailFor.strategy)?.description : null

  return (
    <div className="card stats-card">
      <h2 className="card-subtitle">Statisztika és benchmark</h2>

      <section className="stats-section">
        <h3 className="stats-heading">Mit mutat ez az oldal?</h3>
        <p className="stats-prose">
          Itt a <strong>szimulált játékok</strong> alapján összegzett eredmények láthatók: több stratégia ugyanazon pályán (alapértelmezésben 20×20),
          előre megadott véletlenszerű magokkal. A cél nem „verseny a játékos ellen”, hanem hogy <strong>összehasonlítható módon</strong> látszódjon,
          melyik döntési logika hoz átlagosan jobb pontszámot, és <strong>mi okozza a bukást</strong> (fal, önmaga, éhség / időkorlát).
        </p>
      </section>

      <section className="stats-section">
        <h3 className="stats-heading">Metodika (hogyan értelmezd a számokat)</h3>
        <ul className="stats-list">
          <li>
            <strong>Futások száma (<code>runs</code>)</strong>: hány külön játékot indítottunk. Nagyobb <code>runs</code> → stabilabb átlag, de hosszabb mérés.
          </li>
          <li>
            <strong>Átlag / medián pont</strong>: az átlag érzékeny a szélső értékekre; a medián jól jelzi a „tipikus” játékot.
          </li>
          <li>
            <strong>Lépések átlaga</strong>: hosszabb játék gyakran (de nem mindig) jobb stratégiát vagy óvatosabb túlélést jelent.
          </li>
          <li>
            <strong>Halál okok</strong>: a benchmark futtató rögzíti, mi zárta le a kört. Az <strong>éhség</strong> itt gyakorlatilag azt jelenti, hogy hosszú ideig
            nem nőtt a pontszám (a futtató ezt leállítja), nem „valós” játékbeli ütközés.
          </li>
          <li>
            <strong>Halál oszlopok 0%</strong>: ha egy adott ok egyetlen futásban sem fordult elő, a JSON gyakran nem tartalmazza a mezőt — ekkor <strong>0%</strong>-ot
            mutatunk (nem hiányzó adat).
          </li>
          <li>
            <strong>Első étel elérése (%)</strong>: ha ez alacsony, a stratégia sokszor „elakad” anélkül, hogy stabilan tudna haladni az étel felé.
          </li>
        </ul>
      </section>

      <section className="stats-section">
        <h3 className="stats-heading">Heurisztikák vs. tanult stratégiák</h3>
        <p className="stats-prose">
          A <strong>heurisztikus</strong> megközelítések explicit szabályokat követnek (út keresés, előretekintés, farok-követés stb.), ezért gyakran
          <strong> magasabb átlagpontot</strong> adnak rövid távon, ha a szabály jól illeszkedik a pályamérethez. A <strong>tanuló</strong> (RL / evolúciós)
          rendszerek ugyanazon felületen sokszor gyengébben indulnak: a jutalom és az állapotleképezés finomhangolása nélkül könnyen kialakul
          „biztonságos toporgás” vagy instabil viselkedés — ez sok <strong>éhség</strong> jellegű leállásban látszik.
        </p>
        <p className="stats-prose">
          Fontos: <strong>rosszabb benchmark nem jelenti automatikusan, hogy a módszer rossz</strong>, csak azt, hogy ebben a környezetben / beállításban
          még nem versenyképes. A heurisztikák viszont jó <strong>bázisvonalnak</strong> (baseline) számítanak: ha egy tanult ügynök nem közelíti meg őket,
          érdemes először a jutalmat, az episzód hosszát és a megfigyelést finomítani.
        </p>
      </section>

      {loadError && (
        <p className="stats-error" role="alert">
          Nem sikerült betölteni a benchmark adatokat ({loadError}). Indítsd el az AI szolgáltatást (alapértelmezés:{' '}
          <code>http://localhost:8000</code>), és futtasd a benchmarkot, hogy a <code>benchmarks/results</code> mappa kitöltődjön.
        </p>
      )}

      {benchDir && !loadError && rows.length === 0 && (
        <p className="empty-state">Nincs betölthető <code>strategy_benchmark_*.json</code> a(z) {benchDir} mappában.</p>
      )}

      {rows.length > 0 && (
        <section className="stats-section">
          <h3 className="stats-heading">Összefoglaló táblázat</h3>

          <details className="stats-filter">
            <summary>
              Stratégiák szűrése ({visibleIds.size} / {allIdsSorted.length})
            </summary>
            <div className="stats-filter-actions">
              <button type="button" className="btn btn-secondary stats-filter-btn" onClick={selectAllIds}>
                Mind
              </button>
              <button type="button" className="btn btn-secondary stats-filter-btn" onClick={selectNoIds}>
                Egyik sem
              </button>
              <button type="button" className="btn btn-secondary stats-filter-btn" onClick={selectHeuristicsOnly}>
                Csak heurisztikák
              </button>
              <button type="button" className="btn btn-secondary stats-filter-btn" onClick={selectNeuralOnly}>
                Csak neurális hálók
              </button>
            </div>
            <ul className="stats-filter-list">
              {allIdsSorted.map((id) => (
                <li key={id}>
                  <label className="stats-filter-label">
                    <input type="checkbox" checked={visibleIds.has(id)} onChange={() => toggleVisibleId(id)} />
                    <span>
                      {getStrategyName(id)} <span className="stats-mono">({id})</span>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </details>

          <p className="stats-note stats-note-spaced">
            Oszlopfejlécre kattintva rendezhetsz (ismételt kattintás: növekvő ↔ csökkenő). Egy sorra kattintva megjelenik a részletes leírás és a tipikus
            benchmark-magyarázat.
          </p>

          {sortedFiltered.length === 0 ? (
            <p className="empty-state">Nincs megjeleníthető stratégia — jelölj ki legalább egyet a szűrőben.</p>
          ) : (
            <>
              <div className="stats-table-wrap">
                <table className="stats-table">
                  <thead>
                    <tr>
                      <SortHeader label="Stratégia" sort={sort} columnKey="strategy" onSort={toggleSort} />
                      <SortHeader label="Futás" sort={sort} columnKey="runs" onSort={toggleSort} />
                      <SortHeader label="Átlag pont" sort={sort} columnKey="score_mean" onSort={toggleSort} />
                      <SortHeader label="Medián" sort={sort} columnKey="score_median" onSort={toggleSort} />
                      <SortHeader label="Átlag lépés" sort={sort} columnKey="steps_mean" onSort={toggleSort} />
                      <SortHeader label="1. étel %" sort={sort} columnKey="reached_first_food" onSort={toggleSort} />
                      <SortHeader label="Fal %" sort={sort} columnKey="wall" onSort={toggleSort} />
                      <SortHeader label="Önmaga %" sort={sort} columnKey="self" onSort={toggleSort} />
                      <SortHeader label="Éhség %" sort={sort} columnKey="starvation" onSort={toggleSort} />
                      <SortHeader label="Lépéslimit %" sort={sort} columnKey="max_steps" onSort={toggleSort} />
                    </tr>
                  </thead>
                  <tbody>
                    {sortedFiltered.map((s) => (
                      <tr
                        key={s.strategy}
                        className={`stats-row-clickable${detailFor?.strategy === s.strategy ? ' stats-row-selected' : ''}`}
                        onClick={() => onRowActivate(s)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            onRowActivate(s)
                          }
                        }}
                        tabIndex={0}
                        role="button"
                        aria-expanded={detailFor?.strategy === s.strategy}
                        aria-label={`Részletek: ${getStrategyName(s.strategy)}`}
                      >
                        <td>
                          <strong>{getStrategyName(s.strategy)}</strong>
                          <div className="stats-mono">{s.strategy}</div>
                        </td>
                        <td>{s.runs}</td>
                        <td>{s.score_mean.toFixed(2)}</td>
                        <td>{s.score_median}</td>
                        <td>{s.steps_mean.toFixed(0)}</td>
                        <td>{s.reached_first_food.toFixed(1)}%</td>
                        <td>{deathPct(s, 'wall')}</td>
                        <td>{deathPct(s, 'self')}</td>
                        <td>{deathPct(s, 'starvation')}</td>
                        <td>{deathPct(s, 'max_steps')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {detailFor && detailText && (
                <div className="stats-detail-panel" role="region" aria-label="Kiválasztott stratégia részletei">
                  <h4 className="stats-detail-title">
                    {getStrategyName(detailFor.strategy)}{' '}
                    <span className="stats-mono stats-detail-id">({detailFor.strategy})</span>
                  </h4>
                  {detailShort && (
                    <p className="stats-prose stats-muted">
                      <strong>Röviden:</strong> {detailShort}
                    </p>
                  )}
                  <h5 className="stats-detail-sub">Működési logika</h5>
                  <p className="stats-prose">{detailText.howItWorks}</p>
                  <h5 className="stats-detail-sub">Miért lehetnek ilyenek a számok?</h5>
                  <p className="stats-prose">{detailText.whyTheseResults}</p>
                  <h5 className="stats-detail-sub">A te gépeden mért összefoglaló</h5>
                  <ul className="stats-detail-metrics">
                    <li>
                      Futások: <strong>{detailFor.runs}</strong>, pálya: {detailFor.rows}×{detailFor.cols}, max lépés/futás: {detailFor.max_steps}, mag:{' '}
                      {detailFor.seed_base}
                    </li>
                    <li>
                      Átlag pont: <strong>{detailFor.score_mean.toFixed(2)}</strong>, medián: <strong>{detailFor.score_median}</strong>, átlag lépés:{' '}
                      <strong>{detailFor.steps_mean.toFixed(0)}</strong>
                    </li>
                    <li>
                      Első étel elérése: <strong>{detailFor.reached_first_food.toFixed(1)}%</strong>
                    </li>
                    <li>
                      Halál okok (db):{' '}
                      {Object.entries(detailFor.death_counts)
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(', ') || '—'}
                    </li>
                  </ul>
                  <button type="button" className="btn btn-secondary stats-detail-close" onClick={() => setDetailFor(null)}>
                    Részletek bezárása
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      )}

      <section className="stats-section">
        <h3 className="stats-heading">Grafikonok generált PNG-k</h3>
        <p className="stats-prose">
          Az alábbi ábrák a <code>benchmarks/generate_benchmark_plots.py</code> szkripttel készülnek. Ha nem látszanak, ellenőrizd, hogy az AI szolgáltatás
          kiszolgálja-e a fájlokat, és léteznek-e a PNG-k a <code>benchmarks/results/plots</code> mappában.{' '}
          <strong>Kattints a képre</strong> a nagyban megjelenítéshez (bezárás: kattintás a háttérre, ✕ vagy Escape).
        </p>
        <div className="stats-plots">
          {[
            ['score_mean_bar.png', 'Átlagpontok összehasonlítása (oszlopdiagram)'],
            ['score_distribution_boxplot.png', 'Ponteloszlás (boxplot)'],
            ['death_distribution_stacked.png', 'Halál okok megoszlása (stacked)'],
            ['score_vs_steps_scatter.png', 'Pont vs. lépésszám (szórás)'],
          ].map(([file, caption]) => {
            const src = benchmarkPlotUrl(file)
            return (
              <figure key={file} className="stats-figure">
                <button
                  type="button"
                  className="stats-figure-zoom"
                  onClick={() => setPlotLightbox({ src, caption })}
                  aria-label={`${caption} megnyitása nagyban`}
                >
                  <img src={src} alt="" loading="lazy" />
                </button>
                <figcaption>{caption}</figcaption>
              </figure>
            )
          })}
        </div>
      </section>

      <section className="stats-section">
        <h3 className="stats-heading">Rövid értelmezés (tipikus minták)</h3>
        <ul className="stats-list">
          <li>
            <strong>Magas pont + alacsony éhség</strong>: a stratégia tartósan növeli a pontot; jó jel.
          </li>
          <li>
            <strong>Alacsony pont + domináló éhség</strong>: gyakran „beragadás” / nem elég agresszív célvezetés / rossz jutalom (tanulóknál tipikus).
          </li>
          <li>
            <strong>Sok fal / önütközés</strong>: túl kockázatos döntés vagy rövid távú nyereség rovására megy a biztonság.
          </li>
          <li>
            <strong>Nagy szórás (boxplot / scatter)</strong>: a stratégia instabil; egy része nagyon jó futásokat ad, más része korán elvérzik.
          </li>
        </ul>
      </section>

      <button type="button" className="btn btn-secondary" onClick={onBack}>
        Vissza
      </button>

      {plotLightbox && (
        <div
          className="stats-lightbox-backdrop"
          role="presentation"
          onClick={() => setPlotLightbox(null)}
        >
          <div
            className="stats-lightbox-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="stats-lightbox-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="stats-lightbox-close"
              onClick={() => setPlotLightbox(null)}
              aria-label="Bezárás"
            >
              ×
            </button>
            <img
              src={plotLightbox.src}
              alt={plotLightbox.caption}
              className="stats-lightbox-img"
            />
            <p id="stats-lightbox-title" className="stats-lightbox-caption">
              {plotLightbox.caption}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
