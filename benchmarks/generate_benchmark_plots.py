#!/usr/bin/env python3
"""
Benchmark grafikonok generálása a strategy_benchmark_*.json fájlokból.

Futtatás (projekt gyökeréből):
  python benchmarks/generate_benchmark_plots.py

Kimenet:
  benchmarks/results/plots/
    - score_mean_bar.png
    - score_distribution_boxplot.png
    - death_distribution_stacked.png
    - score_vs_steps_scatter.png
"""
from __future__ import annotations

import json
from pathlib import Path

try:
    import matplotlib.pyplot as plt
except ImportError as e:
    raise SystemExit(
        "matplotlib nincs telepítve. Telepítsd: pip install matplotlib"
    ) from e


ROOT = Path(__file__).resolve().parent.parent
RESULTS_DIR = ROOT / "benchmarks" / "results"
PLOTS_DIR = RESULTS_DIR / "plots"


def load_strategy_files():
    files = sorted(RESULTS_DIR.glob("strategy_benchmark_*.json"))
    files = [f for f in files if f.name != "strategy_benchmark_summary.json"]
    data = {}
    for f in files:
        with open(f, "r", encoding="utf-8") as fh:
            payload = json.load(fh)
        summary = payload["summary"]
        runs = payload["runs"]
        data[summary["strategy"]] = {"summary": summary, "runs": runs}
    return data


def plot_score_mean_bar(data):
    items = sorted(data.items(), key=lambda kv: kv[1]["summary"]["score_mean"], reverse=True)
    names = [k for k, _ in items]
    means = [v["summary"]["score_mean"] for _, v in items]

    plt.figure(figsize=(12, 6))
    bars = plt.bar(names, means)
    plt.title("Score mean strategia szerint")
    plt.ylabel("Atlag score")
    plt.xlabel("Strategia")
    plt.xticks(rotation=35, ha="right")
    for b, m in zip(bars, means):
        plt.text(b.get_x() + b.get_width() / 2, b.get_height(), f"{m:.2f}", ha="center", va="bottom", fontsize=8)
    plt.tight_layout()
    plt.savefig(PLOTS_DIR / "score_mean_bar.png", dpi=200)
    plt.close()


def plot_score_distribution_boxplot(data):
    # Score eloszlas: strategiankent boxplot
    items = sorted(data.items(), key=lambda kv: kv[1]["summary"]["score_median"], reverse=True)
    names = [k for k, _ in items]
    score_lists = [[r["score"] for r in v["runs"]] for _, v in items]

    plt.figure(figsize=(13, 6))
    plt.boxplot(score_lists, tick_labels=names, showfliers=False)
    plt.title("Score eloszlas strategia szerint (boxplot)")
    plt.ylabel("Score")
    plt.xlabel("Strategia")
    plt.xticks(rotation=35, ha="right")
    plt.tight_layout()
    plt.savefig(PLOTS_DIR / "score_distribution_boxplot.png", dpi=200)
    plt.close()


def plot_death_distribution_stacked(data):
    items = sorted(data.items(), key=lambda kv: kv[1]["summary"]["score_mean"], reverse=True)
    names = [k for k, _ in items]

    death_keys = set()
    for _, v in items:
        death_keys.update(v["summary"]["death_counts"].keys())
    death_keys = sorted(death_keys)

    base = [0] * len(names)
    plt.figure(figsize=(13, 6))
    for dk in death_keys:
        vals = [v["summary"]["death_counts"].get(dk, 0) for _, v in items]
        plt.bar(names, vals, bottom=base, label=dk)
        base = [b + vv for b, vv in zip(base, vals)]

    plt.title("Halalok megoszlasa strategia szerint")
    plt.ylabel("Darabszam")
    plt.xlabel("Strategia")
    plt.xticks(rotation=35, ha="right")
    plt.legend(title="Death type")
    plt.tight_layout()
    plt.savefig(PLOTS_DIR / "death_distribution_stacked.png", dpi=200)
    plt.close()


def plot_score_vs_steps_scatter(data):
    items = sorted(data.items(), key=lambda kv: kv[1]["summary"]["score_mean"], reverse=True)
    plt.figure(figsize=(10, 7))
    for name, v in items:
        s = v["summary"]["score_mean"]
        st = v["summary"]["steps_mean"]
        plt.scatter(st, s, s=70)
        plt.text(st, s, f" {name}", fontsize=9, va="center")
    plt.title("Atlag score vs atlag lepes (strategiankent)")
    plt.xlabel("Atlag lepes (steps_mean)")
    plt.ylabel("Atlag score (score_mean)")
    plt.grid(alpha=0.25)
    plt.tight_layout()
    plt.savefig(PLOTS_DIR / "score_vs_steps_scatter.png", dpi=200)
    plt.close()


def main():
    PLOTS_DIR.mkdir(parents=True, exist_ok=True)
    data = load_strategy_files()
    if not data:
        raise SystemExit("Nincs strategy_benchmark_*.json a benchmarks/results mappaban.")

    plot_score_mean_bar(data)
    plot_score_distribution_boxplot(data)
    plot_death_distribution_stacked(data)
    plot_score_vs_steps_scatter(data)
    print(f"Grafikonok elkeszultek: {PLOTS_DIR}")


if __name__ == "__main__":
    main()

