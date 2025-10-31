
const baseCartas = [
  { nome: "morte", src: "https://thvnext.bing.com/th/id/OIP.-BabzT9tyZ99nxr6D6XK5wHaHa?w=182&h=182&c=7&r=0&o=7&cb=12&dpr=1.3&pid=1.7&rm=3&ucfimg=1", alt: "Morte" },
  { nome: "sangue", src: "https://th.bing.com/th/id/OIP.rh67qAViQcqk0XsxigdmJAHaHa?pid=ImgDet&rs=1", alt: "Sangue" },
  { nome: "conhecimento", src: "https://th.bing.com/th/id/OIP.Jcu2qDXIoH4DFVqB1EdOpgHaHa?pid=ImgDet&rs=1", alt: "Conhecimento" },
  { nome: "energia", src: "https://th.bing.com/th/id/OIP.2vYTi-stBAZsXWR8LB14ogHaHa?pid=ImgDet&rs=1", alt: "Energia" },
  { nome: "medo", src: "https://th.bing.com/th/id/OIP.irncPA2zmuMji7Dejt0PTQHaHb?pid=ImgDet&rs=1", alt: "Medo" },
  { nome: "d20", src: "https://webstockreview.net/images/d20-clipart-transparent-7.png", alt: "Dado d20" },
];

let cartas = [];
let cartasViradas = [];
let nomesVirados = [];
let tentativas = 0;
let bloquearTabuleiro = false;
let paresEncontrados = 0;

const tabuleiroEl = document.getElementById("tabuleiro");
const placarEl = document.getElementById("placar");
const reiniciarBtn = document.getElementById("reiniciar");

function embaralhar(deck) {
  return deck.sort(() => Math.random() - 0.5);
}

function criarDeck() {
  const d = [];
  baseCartas.forEach(c => { d.push({ ...c }); d.push({ ...c }); });
  return embaralhar(d);
}

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

    card.addEventListener("click", virarCarta);
    
    card.addEventListener("keydown", (ev) => {
      if (ev.key === "Enter" || ev.key === " ") {
        ev.preventDefault();
        virarCarta({ currentTarget: card });
      }
    });

    tabuleiroEl.appendChild(card);
  });
}

function atualizarPlacar(msg) {
  placarEl.textContent = msg ?? `Tentativas: ${tentativas}`;
}

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

function checarPar() {
  tentativas++;
  atualizarPlacar();

  const [n1, n2] = nomesVirados;
  if (n1 === n2) {
    desabilitarCartas();
  } else {
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
  if (paresEncontrados === baseCartas.length) {
    setTimeout(() => {
      atualizarPlacar(`Vitória em ${tentativas} tentativa${tentativas === 1 ? "" : "s"}!`);
      alert(`Vitória em ${tentativas} tentativa${tentativas === 1 ? "" : "s"}!`);
    }, 150);
  }
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

function reiniciar() {
  tentativas = 0;
  paresEncontrados = 0;
  bloquearTabuleiro = false;
  limparSelecao();
  cartas = criarDeck();
  criarTabuleiro();
  atualizarPlacar();
}

reiniciarBtn.addEventListener("click", reiniciar);
reiniciar();
