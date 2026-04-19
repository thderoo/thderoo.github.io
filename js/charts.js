/**
 * Charts — Chart.js benchmark progression + tabs
 */

const GENERATIONS = ['Monarch-0', 'Monarch-1', 'Monarch-2', 'Monarch-3', 'Monarch-4', 'Monarch-5'];

const BENCHMARK_DATA = {
  'ARC-AGI-3': {
    scores: [12.8, 25.4, 36.1, 53.9, 64.2, 76.3],
    color: '#C96442',
    minY: 0,
    maxY: 85,
  },
  'FrontierMath': {
    scores: [79.3, 81.7, 86.2, 87.1, 91.4, 93.8],
    color: '#B45438',
    minY: 75,
    maxY: 100,
  },
  'RE-Bench Extended': {
    scores: [21.5, 29.8, 42.3, 48.6, 59.4, 65.8],
    color: '#C98058',
    minY: 0,
    maxY: 75,
  },
  'SWE-bench Ultra': {
    scores: [28.3, 39.7, 46.2, 57.8, 63.1, 71.4],
    color: '#A8492E',
    minY: 0,
    maxY: 80,
  },
  'VeriFormal': {
    scores: [14.7, 22.9, 35.4, 41.8, 52.3, 57.2],
    color: '#3D7A6E',
    minY: 0,
    maxY: 65,
  },
  'AutoSci-Bench': {
    scores: [17.1, 28.9, 35.7, 47.3, 53.1, 61.5],
    color: '#C9956A',
    minY: 0,
    maxY: 70,
  },
  'Vending-Bench 2': {
    scores: [21408, 28734, 34192, 41847, 52316, 68415],
    color: '#6B4C3B',
    unit: '$',
    minY: 15000,
    maxY: 75000,
  },
};

const CYCLE_DATA = {
  duration: [45, 44, 39, 38, 34],
  interventions: [23, 14, 8, 5, 3],
};

let progressionChart = null;
let cycleChart = null;

document.addEventListener('DOMContentLoaded', () => {
  initChartTabs();
  initProgressionChart();
  initCycleChart();
});

/* ---- Tab switching ---- */
function initChartTabs() {
  const tabs = document.querySelectorAll('.chart-tab[data-benchmark]');
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      updateProgressionChart(tab.dataset.benchmark);
    });
  });
}

/* ---- Progression Chart (line) ---- */
function initProgressionChart() {
  const canvas = document.getElementById('progressionChart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const firstKey = Object.keys(BENCHMARK_DATA)[0];
  const data = BENCHMARK_DATA[firstKey];

  progressionChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: GENERATIONS,
      datasets: [
        {
          label: firstKey,
          data: data.scores,
          borderColor: data.color,
          backgroundColor: hexToRgba(data.color, 0.1),
          fill: true,
          tension: 0.3,
          borderWidth: 3,
          pointRadius: 5,
          pointHoverRadius: 8,
          pointBackgroundColor: '#fff',
          pointBorderColor: data.color,
          pointBorderWidth: 2,
        },
      ],
    },
    options: chartOptions(data.unit === '$' ? 'Score ($)' : 'Score (%)', data.unit, data.minY, data.maxY),
  });
}

function updateProgressionChart(benchmarkName) {
  if (!progressionChart || !BENCHMARK_DATA[benchmarkName]) return;

  const data = BENCHMARK_DATA[benchmarkName];
  const isDollar = data.unit === '$';
  progressionChart.data.datasets[0].label = benchmarkName;
  progressionChart.data.datasets[0].data = data.scores;
  progressionChart.data.datasets[0].borderColor = data.color;
  progressionChart.data.datasets[0].backgroundColor = hexToRgba(data.color, 0.1);
  progressionChart.data.datasets[0].pointBorderColor = data.color;

  // Update Y axis for dollar vs percentage benchmarks
  const yAxis = progressionChart.options.scales.y;
  yAxis.title.text = isDollar ? 'Score ($)' : 'Score (%)';
  yAxis.min = data.minY || 0;
  yAxis.max = isDollar ? (data.maxY || 75000) : (data.maxY || 100);
  yAxis.ticks.callback = isDollar
    ? (v) => '$' + v.toLocaleString()
    : (v) => v + '%';

  // Update tooltip
  progressionChart.options.plugins.tooltip.callbacks.label = isDollar
    ? (ctx) => `${ctx.dataset.label}: $${ctx.parsed.y.toLocaleString()}`
    : (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y}%`;

  progressionChart.update('active');
}

/* ---- Cycle Efficiency Chart (multi-axis) ---- */
function initCycleChart() {
  const canvas = document.getElementById('cycleChart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const labels = ['Monarch-1', 'Monarch-2', 'Monarch-3', 'Monarch-4', 'Monarch-5'];

  cycleChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Cycle Duration (days)',
          data: CYCLE_DATA.duration,
          backgroundColor: CYCLE_DATA.duration.map((_, i) => hexToRgba(
            ['#C9956A', '#C98058', '#C96442', '#B45438', '#A8492E'][i], 0.8
          )),
          borderRadius: 4,
          yAxisID: 'y',
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            font: { family: 'Inter', size: 11 },
            padding: 20,
            usePointStyle: true,
            pointStyleWidth: 12,
          },
        },
        tooltip: {
          backgroundColor: '#1B1B1B',
          titleFont: { family: 'Inter', size: 12 },
          bodyFont: { family: 'JetBrains Mono', size: 12 },
          cornerRadius: 6,
          padding: 10,
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { font: { family: 'JetBrains Mono', size: 11 } },
        },
        y: {
          position: 'left',
          title: {
            display: true,
            text: 'Days',
            font: { family: 'Inter', size: 11 },
          },
          min: 0,
          max: 55,
          grid: { color: 'rgba(0,0,0,0.05)' },
          ticks: { font: { family: 'JetBrains Mono', size: 11 } },
        },
      },
    },
  });
}

/* ---- Shared chart options ---- */
function chartOptions(yLabel, unit, minY, maxY) {
  const isDollar = unit === '$';
  return {
    responsive: true,
    maintainAspectRatio: true,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1B1B1B',
        titleFont: { family: 'Inter', size: 12 },
        bodyFont: { family: 'JetBrains Mono', size: 12 },
        cornerRadius: 6,
        padding: 10,
        callbacks: {
          label: isDollar
            ? (ctx) => `${ctx.dataset.label}: $${ctx.parsed.y.toLocaleString()}`
            : (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y}%`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { family: 'JetBrains Mono', size: 11 } },
      },
      y: {
        title: {
          display: true,
          text: yLabel,
          font: { family: 'Inter', size: 11 },
        },
        min: minY || 0,
        max: isDollar ? (maxY || 75000) : (maxY || 100),
        grid: { color: 'rgba(0,0,0,0.05)' },
        ticks: {
          font: { family: 'JetBrains Mono', size: 11 },
          callback: isDollar ? (v) => '$' + v.toLocaleString() : (v) => v + '%',
        },
      },
    },
  };
}

/* ---- Utility ---- */
function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
