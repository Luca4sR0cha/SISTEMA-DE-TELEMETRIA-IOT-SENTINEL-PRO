
// Variáveis
let temperaturaAtual = 40;
let intervaloSensor;
let intervaloRelogio;
let painelBloqueado = false;
let maquinaSelecionada = "";
const maquinasSemTemperatura = ["cnc_3"];

window.onload = function () {
    document.getElementById("dashboard").style.display = "none";
};

function validarAcesso() {
    const nome  = document.getElementById("nome").value;
    const verify = document.getElementById("verify");

    // --- If: nome vazio ---
    if (!nome || nome.trim() === "") {
        verify.className = "erro";
        verify.innerText = "⚠ Digite um nome válido para continuar.";
        return; // interrompe aqui
    }

    // --- Else: nome preenchido → libera ---
    verify.className = "sucesso";
    verify.innerText = "✔ Acesso liberado. Bem-vindo, " + nome.trim() + "!";

    // Pequeno delay visual antes de trocar de tela
    setTimeout(function () {
        liberarSistema(nome.trim());
    }, 600);
}

// ============================================================
// Libera o painel principal após login bem-sucedido
// ============================================================
function liberarSistema(nomeOperador) {
    // Esconde login, exibe dashboard
    document.getElementById("login").style.display = "none";
    document.getElementById("dashboard").style.display = "block";

    // Mostra o nome do operador no cabeçalho
    document.getElementById("operadorLogado").innerText =
        "OPERADOR: " + nomeOperador.toUpperCase();

    // Inicializa os módulos
    gerarListaMaquinas();
    iniciarSensor();
    iniciarRelogio();
}

// ============================================================
// AUTOMAÇÃO — gerarListaMaquinas()
// Usa laço FOR para popular o <select> dinamicamente
// ============================================================
function gerarListaMaquinas() {
    const select = document.getElementById("selectMaquinas");

    // Lista de máquinas (laço for popula o <select>)
    const maquinas = ["Prensa 1", "Torno 2", "CNC 3", "Fresadora 4", "Esteira 5"];

    for (let i = 0; i < maquinas.length; i++) {
        const option = document.createElement("option");
        option.value = maquinas[i].toLowerCase().replace(" ", "_"); // ex: "prensa_1"
        option.innerText = maquinas[i];
        select.appendChild(option);
    }
}

// ============================================================
// ROTEAMENTO DIRETO — verificarStatus(maquina)
// Usa switch para retornar status diferente por máquina
// ============================================================
function verificarStatus(maquina) {
    maquinaSelecionada = maquina;

    // Reseta a temperatura ao trocar de máquina
    temperaturaAtual = 40;
    
    if (maquinasSemTemperatura.includes(maquina)) {
        document.getElementById("tempValor").innerText = "--";
        document.getElementById("tempLabel").innerText = "Máquina fora de funcionamento";
        document.getElementById("sensorBarra").style.width = "0%";
    } else {
        atualizarDisplaySensor(temperaturaAtual);
    }

    const statusDiv = document.getElementById("status");

    // Limpa classes anteriores
    statusDiv.className = "status-box";

    switch (maquina) {
        case "prensa_1":
            statusDiv.innerText = "✔ Em operação";
            statusDiv.classList.add("status-operando");
            break;
        case "torno_2":
            statusDiv.innerText = "⚠ Manutenção necessária";
            statusDiv.classList.add("status-manutencao");
            break;
        case "cnc_3":
            statusDiv.innerText = "○ Desligada";
            statusDiv.classList.add("status-desligada");
            break;
        case "fresadora_4":
            statusDiv.innerText = "✔ Em operação";
            statusDiv.classList.add("status-operando");
            break;
        case "esteira_5":
            statusDiv.innerText = "⚠ Alerta — Verificar imediatamente";
            statusDiv.classList.add("status-alerta");
            break;
        default:
            statusDiv.innerText = "Nenhuma máquina selecionada";
            statusDiv.classList.add("status-vazio");
    }
}

// ============================================================
// SENSOR TÉRMICO — monitorarSensor()
// Cascata lógica: verde / laranja / vermelho+negrito
// Atualizado via setInterval a cada 1 segundo
// ============================================================
function iniciarSensor() {
    intervaloSensor = setInterval(function () {
        monitorarSensor();
    }, 1000);
}

function monitorarSensor() {

    if (!maquinaSelecionada) return;

    if (maquinasSemTemperatura.includes(maquinaSelecionada)) return;

    if (painelBloqueado) return;

    temperaturaAtual = Math.floor(Math.random() * 101);

    atualizarDisplaySensor(temperaturaAtual);

    verificarEmergencia(temperaturaAtual);
}

function atualizarDisplaySensor(temp) {
    const valorEl  = document.getElementById("tempValor");
    const labelEl  = document.getElementById("tempLabel");
    const barraEl  = document.getElementById("sensorBarra");

    // Atualiza o número
    valorEl.innerText = temp + "°C";

    // Remove classes de cor anteriores
    valorEl.className = "";
    labelEl.className = "";

    // Cascata lógica com if/else if/else
    if (temp < 50) {
        // --- Normal (verde) ---
        valorEl.classList.add("temp-normal");
        labelEl.classList.add("temp-normal");
        labelEl.innerText = "NORMAL";
        barraEl.style.width      = (temp / 100 * 100) + "%";
        barraEl.style.background = "var(--normal)";

    } else if (temp <= 80) {
        // --- Alerta (laranja) ---
        valorEl.classList.add("temp-alerta");
        labelEl.classList.add("temp-alerta");
        labelEl.innerText = "ALERTA";
        barraEl.style.width      = (temp / 100 * 100) + "%";
        barraEl.style.background = "var(--alerta)";

    } else {
        // --- Perigo — SUPERAQUECIMENTO (vermelho + negrito) ---
        valorEl.classList.add("temp-perigo");
        labelEl.classList.add("temp-perigo");
        labelEl.innerText = "PERIGO — SUPERAQUECIMENTO";
        barraEl.style.width      = (temp / 100 * 100) + "%";
        barraEl.style.background = "var(--perigo)";
    }
}

// ============================================================
// DESAFIO EXTRA — Botão de Emergência
// Se temperatura > 95°C por mais de 5 segundos: PARADA
// ============================================================

function verificarEmergencia(temp) {
    const emergDiv = document.getElementById("emergenciaStatus");
    const emergCounter = document.getElementById("emergenciaContador");

    if (temp > 95 && !painelBloqueado) {
        painelBloqueado = true;
        emergDiv.className = "emergencia-aviso";
        emergDiv.innerText = "🛑 PARADA DE EMERGÊNCIA ATIVADA";
        emergCounter.innerText = "Retornando em 5 segundos...";

        setTimeout(() => {
            painelBloqueado = false;
            temperaturaAtual = 40;
            atualizarDisplaySensor(temperaturaAtual);
            emergDiv.className = "emergencia-normal";
            emergDiv.innerText = "Sistema operando normalmente";
            emergCounter.innerText = "";
        }, 5000);
    }
}


// ============================================================
// RELÓGIO — atualiza o cabeçalho a cada segundo
// ============================================================
function iniciarRelogio() {
    function tick() {
        const agora = new Date();
        const h = String(agora.getHours()).padStart(2, "0");
        const m = String(agora.getMinutes()).padStart(2, "0");
        const s = String(agora.getSeconds()).padStart(2, "0");
        document.getElementById("relogio").innerText = h + ":" + m + ":" + s;
    }
    tick();
    intervaloRelogio = setInterval(tick, 1000);
}
