"use strict";

/* ── CLASSE ─────────────────────────────── */
class Sensor {
  constructor(nome, tipo, valor) {
    this.id    = Date.now().toString(36);
    this.nome  = nome;
    this.tipo  = tipo;
    this.valor = parseFloat(valor);
  }

  getStatus() {
    if (this.tipo === "TEMPERATURA" && this.valor > 50)                   return "CRÍTICO";
    if (this.tipo === "PRESSÃO"     && this.valor > 100)                  return "CRÍTICO";
    if (this.tipo === "UMIDADE"     && (this.valor < 30 || this.valor > 80)) return "CRÍTICO";
    return "NORMAL";
  }

  getUnidade() {
    return { TEMPERATURA: "°C", "PRESSÃO": "Bar", UMIDADE: "%" }[this.tipo] || "";
  }
}

/* ── ESTADO ─────────────────────────────── */
const CHAVE = "telemetria_sensores";
let sensores = [];

/* ── LOCALSTORE ─────────────────────────── */
function salvar() {
  localStorage.setItem(CHAVE, JSON.stringify(sensores));
}

function carregar() {
  const raw = localStorage.getItem(CHAVE);
  if (!raw) return;
  sensores = JSON.parse(raw).map(o => Object.assign(new Sensor(o.nome, o.tipo, o.valor), { id: o.id }));
}

/* ── ADICIONAR ──────────────────────────── */
function adicionarSensor() {
  const nome  = document.getElementById("nome").value.trim();
  const tipo  = document.getElementById("tipo").value.trim().toUpperCase();
  const valor = document.getElementById("valor").value.trim();

  if (!nome || !tipo || valor === "") return alert("Preencha todos os campos.");
  if (isNaN(+valor)) return alert("Valor inválido.");
  if (tipo === "UMIDADE" && +valor > 100) return alert("Valor inválido: umidade não pode ultrapassar 100%.");
  if (tipo === "UMIDADE" && +valor < 0)   return alert("Valor inválido: umidade não pode ser negativa.");

  sensores.push(new Sensor(nome, tipo, valor));
  salvar();
  renderizar();

  document.getElementById("nome").value  = "";
  document.getElementById("tipo").value  = "";
  document.getElementById("valor").value = "";
  document.getElementById("unidade").textContent = "—";
  document.getElementById("aviso").textContent   = "";
}

/* ── REMOVER ────────────────────────────── */
function remover(id) {
  sensores = sensores.filter(s => s.id !== id);
  salvar();
  renderizar();
}

/* ── RENDERIZAR CARDS (forEach) ─────────── */
function renderizarCards() {
  const grid = document.getElementById("grid");
  grid.innerHTML = "";

  if (sensores.length === 0) {
    grid.innerHTML = "<p style='color:#888;font-size:.85rem'>Nenhum sensor cadastrado.</p>";
    return;
  }

  sensores.forEach(s => {
    const critico = s.getStatus() === "CRÍTICO";
    const div = document.createElement("div");
    div.className = "card" + (critico ? " critico" : "");
    div.dataset.tipo = s.tipo;
    div.innerHTML = `
      <h3>${s.nome}</h3>
      <p class="tipo">${s.tipo}</p>
      <p class="valor-linha">${s.valor}<small>${s.getUnidade()}</small></p>
      <div class="card-footer">
        <span class="${critico ? "status-critico" : "status-normal"}">
          ${critico ? "⚠ CRÍTICO" : "✔ NORMAL"}
        </span>
        <button onclick="remover('${s.id}')">Remover</button>
      </div>
    `;
    grid.appendChild(div);
  });
}

/* ── MÉDIAS (filter + reduce) ───────────── */
function calcularMedias() {
  return ["TEMPERATURA", "PRESSÃO", "UMIDADE"].map(cat => {
    const lista = sensores.filter(s => s.tipo === cat);
    if (!lista.length) return 0;
    const soma = lista.reduce((acc, s) => acc + s.valor, 0);
    return +(soma / lista.length).toFixed(2);
  });
}

/* ── GRÁFICO (Chart.js) ─────────────────── */
let grafico = null;

function iniciarGrafico() {
  grafico = new Chart(document.getElementById("grafico").getContext("2d"), {
    type: "bar",
    data: {
      labels: ["Temperatura (°C)", "Pressão (Bar)", "Umidade (%)"],
      datasets: [{
        label: "Média",
        data: [0, 0, 0],
        backgroundColor: ["#e67e22","#3498db","#2ecc71"],
        borderRadius: 4,
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        x: {
          ticks: { color: "#64748b" },
          grid:  { color: "#1e2a3a" }
        },
        y: {
          beginAtZero: true,
          ticks: { color: "#64748b" },
          grid:  { color: "#1e2a3a" }
        }
      }
    }
  });
}

function atualizarGrafico() {
  grafico.data.datasets[0].data = calcularMedias();
  grafico.update();
}

/* ── RENDERIZAR TUDO ────────────────────── */
function renderizar() {
  renderizarCards();
  atualizarGrafico();
}

/* ── HELPERS DO FORM ────────────────────── */
function atualizarUnidade() {
  const u = { TEMPERATURA: "°C", "PRESSÃO": "Bar", UMIDADE: "%" };
  document.getElementById("unidade").textContent = u[document.getElementById("tipo").value] || "—";
}

function avisoTempo() {
  const tipo  = document.getElementById("tipo").value;
  const valor = parseFloat(document.getElementById("valor").value);
  const av    = document.getElementById("aviso");
  if (!tipo || isNaN(valor)) { av.textContent = ""; return; }
  av.textContent = new Sensor("_", tipo, valor).getStatus() === "CRÍTICO"
    ? "⚠ Valor crítico!" : "";
}

/* ── ENTER ENVIA ────────────────────────── */
document.addEventListener("keyup", e => { if (e.key === "Enter") adicionarSensor(); });

/* ── BOOT ───────────────────────────────── */
carregar();
iniciarGrafico();
renderizar();
