// kk.js - Jogo da Memória com funcionalidades extras

// cartas base (6 pares)
const baseCartas = [
  { nome: "morte", src: "https://thvnext.bing.com/th/id/OIP.-BabzT9tyZ99nxr6D6XK5wHaHa?w=182&h=182&c=7&r=0&o=7&cb=12&dpr=1.3&pid=1.7&rm=3&ucfimg=1", alt: "Morte" },
  { nome: "sangue", src: "https://th.bing.com/th/id/OIP.rh67qAViQcqk0XsxigdmJAHaHa?pid=ImgDet&rs=1", alt: "Sangue" },
  { nome: "conhecimento", src: "https://th.bing.com/th/id/OIP.Jcu2qDXIoH4DFVqB1EdOpgHaHa?pid=ImgDet&rs=1", alt: "Conhecimento" },
  { nome: "energia", src: "https://th.bing.com/th/id/OIP.2vYTi-stBAZsXWR8LB14ogHaHa?pid=ImgDet&rs=1", alt: "Energia" },
  { nome: "medo", src: "https://th.bing.com/th/id/OIP.irncPA2zmuMji7Dejt0PTQHaHb?pid=ImgDet&rs=1", alt: "Medo" },
  { nome: "d20", src: "https://webstockreview.net/images/d20-clipart-transparent-7.png", alt: "Dado d20" },
];

// estado principal
let cartas = [];
let cartasViradas = [];
let nomesVirados = [];
let tentativas = 0;
let bloquearTabuleiro = false;
let paresEncontrados = 0;


//limite de tentativas
let limiteTentativas = 20; // começa com 20 chances

// pega elementos do DOM
const tabuleiroEl = document.getElementById("tabuleiro");
const placarEl = document.getElementById("placar");
const reiniciarBtn = document.getElementById("reiniciar");
const tentativasValorEl = document.getElementById("tentativas-valor"); // "Tentativas Restantes: X"
const botaoDica = document.getElementById("btn-dica"); // botão Pedir Dica
const botaoTema = document.getElementById("btn-tema"); // botão alternar tema
const textoBotao = document.getElementById("texto-botao"); // span dentro do botão de tema

// embaralhar deck simples
function embaralhar(deck) {
  return deck.sort(() => Math.random() - 0.5);
}

// cria o baralho duplicando cada carta
function criarDeck() {
  const d = [];
  baseCartas.forEach(c => {
    d.push({ ...c });
    d.push({ ...c });
  });
  return embaralhar(d);
}

// monta todas as cartas na tela
function criarTabuleiro() {
  tabuleiroEl.innerHTML = "";
  cartas.forEach((carta) => {
    const card = document.createElement("div");
    card.className = "carta";
    card.dataset.nome = carta.nome;
    card.setAttribute("role", "button");
    card.setAttribute("tabindex", "0");
    card.setAttribute("aria-label", `Carta ${carta.alt || carta.nome}`);

    const inner = document.createElement("div");
    inner.className = "carta-inner";

    const frente = document.createElement("div");
    frente.className = "face frente";
    frente.setAttribute("aria-hidden", "true");
    frente.style.backgroundImage = `url('${carta.src}')`;

    const verso = document.createElement("div");
    verso.className = "face verso";
    verso.setAttribute("aria-hidden", "true");

    inner.appendChild(frente);
    inner.appendChild(verso);
    card.appendChild(inner);

    // clique de mouse
    card.addEventListener("click", virarCarta);

    // acessibilidade teclado (Enter / Espaço)
    card.addEventListener("keydown", (ev) => {
      if (ev.key === "Enter" || ev.key === " ") {
        ev.preventDefault();
        virarCarta({ currentTarget: card });
      }
    });

    tabuleiroEl.appendChild(card);
  });
}

// atualiza placares visuais
function atualizarPlacar(msg) {
  // "Tentativas: X" (se não mandou msg customizada)
  placarEl.textContent = msg ?? `Tentativas: ${tentativas}`;

  // "Tentativas Restantes: Y"
  tentativasValorEl.textContent = limiteTentativas;
}

// trava tudo quando game over
function encerrarJogo() {
  bloquearTabuleiro = true;
  const cartasDom = document.querySelectorAll(".carta");
  cartasDom.forEach(c => {
    c.replaceWith(c.cloneNode(true)); // remove eventos
  });
}

// checa se perdeu
function checarGameOver() {
  if (limiteTentativas <= 0) {
    atualizarPlacar("GAME OVER");
    alert("GAME OVER");
    encerrarJogo();
  }
}

// virar carta do jogador
function virarCarta(e) {
  if (bloquearTabuleiro) return;
  if (cartasViradas.length === 2) return;

  const cartaEl = e.currentTarget;
  if (cartaEl.classList.contains("virada")) return;
  if (cartaEl.classList.contains("bloqueada")) return;

  cartaEl.classList.add("virada");
  cartasViradas.push(cartaEl);
  nomesVirados.push(cartaEl.dataset.nome);

  if (cartasViradas.length === 2) {
    checarPar();
  }
}

// checar se as duas cartas viradas formam par
function checarPar() {
  tentativas++; // toda tentativa conta

  const [n1, n2] = nomesVirados;

  if (n1 === n2) {
    // ACERTOU (par fixo)
    desabilitarCartas();
    atualizarPlacar();
    checarVitoria();
  } else {
    // ERROU:
    // reduz tentativas restantes
    limiteTentativas--;
    atualizarPlacar();
    checarGameOver();

    virarDeVolta();
  }
}

function desabilitarCartas() {
  cartasViradas.forEach(card => {
    card.classList.add("bloqueada");
    card.removeEventListener("click", virarCarta);
  });

  limparSelecao();

  paresEncontrados++;
}

function virarDeVolta() {
  bloquearTabuleiro = true;
  setTimeout(() => {
    cartasViradas.forEach(card => card.classList.remove("virada"));
    limparSelecao();
    bloquearTabuleiro = false;
  }, 900);
}

function limparSelecao() {
  cartasViradas = [];
  nomesVirados = [];
}

// checa se encontrou todos os pares
function checarVitoria() {
  if (paresEncontrados === baseCartas.length) {
    setTimeout(() => {
      const msg = `Vitória em ${tentativas} tentativa${tentativas === 1 ? "" : "s"}!`;
      atualizarPlacar(msg);
      alert(msg);
    }, 150);
  }
}

// reiniciar jogo
function reiniciar() {
  tentativas = 0;
  paresEncontrados = 0;
  bloquearTabuleiro = false;
  limparSelecao();

  limiteTentativas = 15; // reseta chances

  cartas = criarDeck();
  criarTabuleiro();
  atualizarPlacar();
}

// liga o botão reiniciar
reiniciarBtn.addEventListener("click", reiniciar);

// inicia tudo primeira vez
reiniciar();


// =======================
// Funcionalidade 1: Alternar tema visual (seu "dark mode")
// Aqui a gente troca a classe no body (igual o professor pediu com .classList.toggle())
// e atualiza o texto do botão.
// =======================
botaoTema.addEventListener("click", () => {
  // alterna classe no <body>
  document.body.classList.toggle("santo-berco-mode");

  // atualiza texto do botão conforme o modo atual
  if (document.body.classList.contains("santo-berco-mode")) {
    textoBotao.textContent = "voltar de santo berço";
  } else {
    textoBotao.textContent = "ir para santo berço";
  }
});


//pedir dica
botaoDica.addEventListener("click", pedirDica);

function pedirDica() {
  // não dá dica se já tá animando cartas
  if (bloquearTabuleiro) return;

  // pega cartas que ainda não foram encontradas
  const candidatas = Array
    .from(document.querySelectorAll(".carta"))
    .filter(c => !c.classList.contains("bloqueada"));

  // agrupa por nome
  const mapa = {};
  candidatas.forEach(carta => {
    const nome = carta.dataset.nome;
    if (!mapa[nome]) mapa[nome] = [];
    mapa[nome].push(carta);
  });

  // escolhe um par disponível
  let parEscolhido = null;
  for (let nome in mapa) {
    if (mapa[nome].length >= 2) {
      parEscolhido = mapa[nome].slice(0, 2);
      break;
    }
  }

  if (!parEscolhido) return; // não tem par sobrando pra dica

  const [c1, c2] = parEscolhido;

  // mostra as cartas da dica viradas
  c1.classList.add("virada");
  c2.classList.add("virada");

  // trava clique durante a dica pra não bagunçar estado
  const bloquearAntigo = bloquearTabuleiro;
  bloquearTabuleiro = true;

  // depois de 3 segundos, esconde de novo SE ainda não foram bloqueadas (ou seja, achadas pelo jogador)
  setTimeout(() => {
    if (!c1.classList.contains("bloqueada")) {
      c1.classList.remove("virada");
    }
    if (!c2.classList.contains("bloqueada")) {
      c2.classList.remove("virada");
    }

    bloquearTabuleiro = bloquearAntigo;
  }, 1000); // 3000ms = 3s exatos (pedido do professor)
}

