const PADRAO = {
  pontos: [
    { id: "geral-ete-caixa-d-agua", fabrica: 0, setor: "ETE", tipo: "Caixa d'água", ativo: true },
    { id: "f1-producao-bebedouro", fabrica: 1, setor: "Produção", tipo: "Bebedouro", ativo: true },
    { id: "f1-producao-torneira", fabrica: 1, setor: "Produção", tipo: "Torneira", ativo: true },
    { id: "f1-corte-bebedouro", fabrica: 1, setor: "Corte", tipo: "Bebedouro", ativo: true },
    { id: "f1-corte-torneira", fabrica: 1, setor: "Corte", tipo: "Torneira", ativo: true },
    { id: "f1-bpa-bebedouro", fabrica: 1, setor: "BPA", tipo: "Bebedouro", ativo: true },
    { id: "f1-lavagem-de-monobloco-bebedouro", fabrica: 1, setor: "Lavagem de Monobloco", tipo: "Bebedouro", ativo: true },
    { id: "f1-manutencao-bebedouro", fabrica: 1, setor: "Manutenção", tipo: "Bebedouro", ativo: true },
    { id: "f2-producao-bebedouro", fabrica: 2, setor: "Produção", tipo: "Bebedouro", ativo: true },
    { id: "f2-producao-torneira", fabrica: 2, setor: "Produção", tipo: "Torneira", ativo: true },
    { id: "f2-granulado-bebedouro", fabrica: 2, setor: "Granulado", tipo: "Bebedouro", ativo: true },
    { id: "f2-embalagem-bebedouro", fabrica: 2, setor: "Embalagem", tipo: "Bebedouro", ativo: true },
    { id: "f2-embalagem-torneira", fabrica: 2, setor: "Embalagem", tipo: "Torneira", ativo: true },
    { id: "f2-corte-bebedouro", fabrica: 2, setor: "Corte", tipo: "Bebedouro", ativo: true },
    { id: "f2-corte-torneira", fabrica: 2, setor: "Corte", tipo: "Torneira", ativo: true },
    { id: "f2-dmp-bebedouro", fabrica: 2, setor: "DMP", tipo: "Bebedouro", ativo: true },
    { id: "f2-refeitorio-bebedouro", fabrica: 2, setor: "Refeitório", tipo: "Bebedouro", ativo: true }
  ],
  regras: { Torneira: 1, Bebedouro: 2 }
};
const LIM = {
  cloro: { nome: "Cloro livre", un: "mg/L", min: 0.2, max: 5, ref: "0,2 a 5" },
  ph: { nome: "pH", un: "", min: 6, max: 9, ref: "6 a 9" },
  turbidez: { nome: "Turbidez", un: "uT", min: null, max: 5, ref: "até 5" }
};
const CAMPOS = ["cloro", "ph", "turbidez"];
const ORDEM_TIPO = { "Caixa d'água": 0, "Torneira": 1, "Bebedouro": 2 };
const ABAS = ["hoje", "pontos", "graficos", "historico", "ajustes"];
const SEMANA = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
const MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
const ICO = {
  "Torneira": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 10h10a4 4 0 0 1 4 4v1.5"/><path d="M9 10V6.5"/><path d="M6 6.5h6"/><circle cx="17" cy="19.5" r="1.3" fill="currentColor" stroke="none"/></svg>',
  "Bebedouro": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 13h16l-2.5 4h-11z"/><path d="M12 17v4"/><path d="M8 21h8"/><path d="M9 13c0-4 3-6.5 7-5.5"/></svg>',
  "Caixa d'água": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="4" width="14" height="11" rx="2"/><path d="M5 9c2.3 1 4.7 1 7 0s4.7-1 7 0"/><path d="M8 15v6M16 15v6"/></svg>'
};

const S = {
  pronto: false, modo: "local", soLeitura: false,
  config: null, dias: {},
  aba: "hoje", data: hojeISO(), fabManual: null, fab: 1, sel: {}, obs: "", dirty: false,
  confirmando: null, removendo: null, importando: null,
  nc: {}, ncAberto: null, hora: "", resp: "", agendaMais: false, csvPeriodo: "tudo", mesesAbertos: {}
};

const $ = (s) => document.querySelector(s);
function esc(s) { return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
function clone(o) { return JSON.parse(JSON.stringify(o)); }
function pad(n) { return String(n).padStart(2, "0"); }
function hojeISO() { const d = new Date(); return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
function utc(s) { const [y, m, d] = s.split("-").map(Number); return Date.UTC(y, m - 1, d); }
function diffDias(a, b) { return Math.round((utc(a) - utc(b)) / 86400000); }
function fmt(s) { const [y, m, d] = s.split("-"); return d + "/" + m + "/" + y; }
function fmtCurto(s) { const [, m, d] = s.split("-"); return d + "/" + m; }
function semana(s) { return SEMANA[new Date(utc(s)).getUTCDay()]; }
function nomeFab(f) { return f === 0 ? "Todo dia" : "Fábrica " + f; }
function num(v) { if (v === null || v === undefined) return null; if (typeof v === "number") return Number.isFinite(v) ? v : null; const t = String(v).trim().replace(",", "."); if (!/^(\d+(\.\d*)?|\.\d+)$/.test(t)) return null; return Number(t); }
function invalido(v) { return String(v ?? "").trim() !== "" && num(v) === null; }
function fmtNum(n) { return n === null || n === undefined ? "" : String(n).replace(".", ","); }
function fora(campo, v) { const n = num(v); if (n === null) return false; const l = LIM[campo]; return (l.min !== null && n < l.min) || (l.max !== null && n > l.max); }
function nivel(d) { return d === Infinity || d > 20 ? "bad" : d > 10 ? "warn" : "ok"; }
function dataValida(s) {
  if (typeof s !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const [y, m, d] = s.split("-").map(Number); const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}
function diasUteisEntre(a, b) { let n = 0; for (let t = utc(a) + 86400000; t < utc(b); t += 86400000) { const w = new Date(t).getUTCDay(); if (w !== 0 && w !== 6 && !semColetaEm(isoUtc(t))) n++; } return n; }
function semColetaEm(d) { const r = S.dias[d]; return !!(r && r.semColeta); }
function slug(s) { return String(s).normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""); }

function toast(msg) {
  const t = $("#toast"); t.textContent = msg; t.hidden = false;
  clearTimeout(toast.h); toast.h = setTimeout(() => { t.hidden = true; }, 3200);
}
function msgErro(e) {
  if (e && e.status !== undefined) return e.status === 401 ? "Sua sessão expirou. Entre de novo." : traduzirErro(e);
  const c = e && e.code;
  if (c === "local") return "O navegador não deixou salvar. Verifique se o modo anônimo está desligado.";
  return "Não foi possível salvar. Verifique a conexão e tente de novo.";
}

/* ---------- Armazenamento ---------- */
const LS_KEY = "coleta-agua:v1";
const DEMO_KEY = "coleta-agua:visitante:dados";
function chaveLocal() { return S.visitante ? DEMO_KEY : LS_KEY; }
function lerLocal() { try { return JSON.parse(localStorage.getItem(chaveLocal()) || "null"); } catch { return null; } }
function gravarLocal() { try { localStorage.setItem(chaveLocal(), JSON.stringify({ config: S.config, dias: S.dias })); return true; } catch { return false; } }

async function salvarDia(dia) {
  if (S.modo === "servidor") { enfileirar({ op: "dia", data: dia.data, corpo: dia }); return; }
  S.dias = { ...S.dias, [dia.data]: dia };
  if (!gravarLocal()) throw { code: "local" };
  aoMudarDados();
}
async function excluirDia(data) {
  if (S.modo === "servidor") { enfileirar({ op: "del", data }); return; }
  const m = { ...S.dias }; delete m[data]; S.dias = m;
  if (!gravarLocal()) throw { code: "local" };
  aoMudarDados();
}
async function salvarConfig(cfg) {
  S.config = cfg;
  if (S.modo === "servidor") { enfileirar({ op: "config", corpo: cfg }); return; }
  if (!gravarLocal()) throw { code: "local" };
  aoMudarDados();
}

/* ---------- Conta e servidor ---------- */
const API_URL = ((document.querySelector('meta[name="coleta-api"]') || {}).content || "").trim().replace(/\/+$/, "");
const TOKEN_KEY = "coleta-agua:token", CONTA_KEY = "coleta-agua:conta", VISITANTE_KEY = "coleta-agua:visitante";
const SRV = { token: null, conta: null, fila: [], enviando: false, erro: "", acordando: false, tmr: null, tmrSync: null };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ERROS_SERVIDOR = {
  "invalid credentials": "E-mail ou senha incorretos.",
  "invalid email format": "Informe um e-mail válido.",
  "password must be at least 6 characters long": "A senha deve ter pelo menos 6 caracteres.",
  "password must be at most 72 bytes long": "A senha é longa demais: use até 72 caracteres (letras com acento contam como dois).",
  "name, email and password are required": "Preencha nome, e-mail e senha.",
  "email and password are required": "Preencha e-mail e senha.",
  "email already registered": "Este e-mail já está cadastrado.",
  "too many attempts, please try again later": "Muitas tentativas. Espere alguns minutos e tente de novo.",
  "email not configured": "A recuperação de senha por e-mail ainda não foi ativada.",
  "invalid or expired reset link": "Este link expirou ou já foi usado. Peça um novo em \"Esqueci minha senha\".",
  "token and password are required": "Informe a nova senha."
};
const ROTULO_LOGIN = { entrar: "Entrar", criar: "Criar conta", esqueci: "Enviar link", redefinir: "Salvar nova senha" };
const SUB_LOGIN = {
  entrar: "Entre para guardar suas coletas e ver tudo em qualquer aparelho.",
  criar: "Crie uma conta para guardar suas coletas e ver tudo em qualquer aparelho.",
  esqueci: "Informe o e-mail da sua conta. Vamos enviar um link para você criar uma senha nova.",
  redefinir: "Crie uma senha nova para a sua conta."
};
const CAMPOS_LOGIN = ["nome", "email", "senha", "senha2"];
function lsGet(k) { try { return localStorage.getItem(k); } catch { return null; } }
function lsSet(k, v) { try { if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch {} }
function kCache() { return "coleta-agua:cache:" + SRV.conta.id; }
function kFila() { return "coleta-agua:pendentes:" + SRV.conta.id; }
const ACORDANDO = { pendentes: 0, tmr: null, tick: null };
function avisoAcordando(desde) {
  const el = $("#acordando"), falhou = desde === "falhou", tempo = el.querySelector("[data-tempo]");
  clearInterval(ACORDANDO.tick);
  el.hidden = !desde;
  tempo.textContent = "";
  if (!desde) return;
  el.querySelector("[data-esperando]").hidden = falhou;
  el.querySelector("[data-falhou]").hidden = !falhou;
  el.querySelector(".giro").hidden = falhou;
  $("#b-acordando").hidden = !falhou;
  if (falhou) return;
  const tick = () => { tempo.textContent = "Aguardando há " + Math.round((Date.now() - desde) / 1000) + " s"; };
  tick(); ACORDANDO.tick = setInterval(tick, 1000);
}
async function apiReq(path, { method = "GET", body } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (SRV.token) headers.Authorization = "Bearer " + SRV.token;
  if (++ACORDANDO.pendentes === 1) { avisoAcordando(null); const inicio = Date.now(); ACORDANDO.tmr = setTimeout(() => avisoAcordando(inicio), 4000); }
  const ctrl = new AbortController(), limite = setTimeout(() => ctrl.abort(), 90000);
  let res, esgotou = false;
  try { res = await fetch(API_URL + path, { method, headers, body: body !== undefined ? JSON.stringify(body) : undefined, signal: ctrl.signal }); }
  catch { esgotou = ctrl.signal.aborted; const e = new Error("network"); e.status = 0; throw e; }
  finally { clearTimeout(limite); if (--ACORDANDO.pendentes === 0) { clearTimeout(ACORDANDO.tmr); avisoAcordando(esgotou ? "falhou" : null); } }
  if (res.status === 204) return null;
  const data = await res.json().catch(() => null);
  if (!res.ok) { const e = new Error((data && data.error) || "HTTP " + res.status); e.status = res.status; throw e; }
  return data;
}
function traduzirErro(e) {
  if (e && e.status === 0) return "Não foi possível falar com o servidor. Verifique a internet e tente de novo.";
  return ERROS_SERVIDOR[e && e.message] || "Algo deu errado no servidor. Tente de novo em instantes.";
}
function gravarCache() { if (SRV.conta) lsSet(kCache(), JSON.stringify({ config: S.config, dias: S.dias })); }
function gravarFila() { if (SRV.conta) lsSet(kFila(), JSON.stringify(SRV.fila)); }
function aplicarOp(op) {
  if (op.op === "dia") S.dias = { ...S.dias, [op.data]: op.corpo };
  else if (op.op === "del") { const m = { ...S.dias }; delete m[op.data]; S.dias = m; }
  else if (op.op === "config") S.config = op.corpo;
}
function enfileirar(op) {
  op.k = op.op === "config" ? "config" : "dia:" + op.data;
  SRV.fila = SRV.fila.filter((x) => x.k !== op.k);
  SRV.fila.push(op);
  aplicarOp(op); gravarCache(); gravarFila(); aoMudarDados(); mostrarSync();
  enviarFila();
}
async function enviarFila() {
  if (SRV.enviando || !SRV.token) return;
  SRV.enviando = true; clearTimeout(SRV.tmr); mostrarSync();
  try {
    while (SRV.fila.length) {
      const op = SRV.fila[0];
      try {
        if (op.op === "dia") await apiReq("/dados/dias/" + op.data, { method: "PUT", body: op.corpo });
        else if (op.op === "del") await apiReq("/dados/dias/" + op.data, { method: "DELETE" });
        else await apiReq("/dados/config", { method: "PUT", body: op.corpo });
      } catch (e) {
        if (e.status === 401) { sessaoExpirada(); return; }
        if (e.status >= 400 && e.status < 500) { SRV.fila = SRV.fila.filter((x) => x !== op); gravarFila(); toast("O servidor recusou uma alteração de " + (op.data ? fmt(op.data) : "ajustes") + "."); continue; }
        SRV.erro = "offline"; SRV.tmr = setTimeout(enviarFila, 20000); return;
      }
      SRV.fila = SRV.fila.filter((x) => x !== op); gravarFila();
    }
    SRV.erro = "";
  } finally { SRV.enviando = false; mostrarSync(); }
}
async function sincronizarDoServidor() {
  const lento = setTimeout(() => { SRV.acordando = true; mostrarSync(); }, 3000);
  try {
    const d = await apiReq("/dados");
    S.config = normalizarConfig(d && d.config);
    S.dias = {};
    for (const x of (d && d.dias) || []) { const v = limparDia(x); if (v) S.dias[v.data] = v; }
    for (const op of SRV.fila) aplicarOp(op);
    gravarCache(); S.pronto = true; SRV.erro = "";
    verificarLegado();
    aoMudarDados();
  } finally { clearTimeout(lento); SRV.acordando = false; mostrarSync(); }
}
function tentarSincronizar() {
  clearTimeout(SRV.tmrSync);
  sincronizarDoServidor().then(() => enviarFila()).catch((e) => {
    if (e.status === 401) { sessaoExpirada(); return; }
    SRV.erro = "offline"; mostrarSync();
    if (!S.pronto) $("#v-hoje").innerHTML = '<div class="empty"><b>Sem conexão com o servidor</b><span class="hint">Tentando de novo a cada 15 segundos. No primeiro acesso do dia o servidor pode levar até 1 minuto para acordar.</span><span class="actions"><button class="btn small" type="button" id="b-sincronizar">Tentar de novo</button></span></div>';
    SRV.tmrSync = setTimeout(tentarSincronizar, 15000);
  });
}
function verificarLegado() {
  S.legado = null;
  if (Object.keys(S.dias).length) return;
  const j = lerLocal();
  const dias = Object.values((j && j.dias) || {}).map(limparDia).filter(Boolean);
  if (dias.length) S.legado = { config: j.config && Array.isArray(j.config.pontos) ? normalizarConfig(j.config) : null, dias };
}
function mostrarSync() {
  mostrarStatusLado();
  const el = $("#sync"); if (!el) return;
  if (S.modo !== "servidor" || !SRV.conta) { el.hidden = true; return; }
  const n = SRV.fila.length;
  el.className = "sync";
  if (SRV.acordando) { el.textContent = "Conectando…"; el.hidden = false; return; }
  if (n && SRV.erro === "offline") { el.textContent = n + (n === 1 ? " pendente" : " pendentes"); el.title = n + (n === 1 ? " alteração ainda não enviada ao servidor" : " alterações ainda não enviadas ao servidor"); el.className = "sync off"; el.hidden = false; return; }
  if (n) { el.textContent = "Salvando…"; el.hidden = false; return; }
  if (SRV.erro === "offline") { el.textContent = "Sem conexão"; el.className = "sync off"; el.hidden = false; return; }
  el.textContent = "Conectado"; el.className = "sync on"; el.title = "Tudo salvo na sua conta"; el.hidden = false;
}
function mostrarStatusLado() {
  const el = $("#lado-status"); if (!el) return;
  const n = S.modo === "servidor" ? SRV.fila.length : 0;
  const off = S.modo === "servidor" && SRV.erro === "offline";
  const onde = S.modo === "servidor" ? (SRV.conta ? "na conta de <b>" + esc(SRV.conta.name) + "</b>" : "na sua conta") : "só neste navegador";
  const ico = off ? '<path d="M3 3l18 18"/><path d="M8.5 6.6A6 6 0 0 1 17.6 10 4 4 0 0 1 20.4 16M17 18H7a4.5 4.5 0 0 1-1.6-8.7"/>'
    : n ? '<path d="M20 11.5A8 8 0 0 0 5.6 6.8L4 8.5"/><path d="M4 4v4.5h4.5"/><path d="M4 12.5a8 8 0 0 0 14.4 4.7l1.6-1.7"/><path d="M20 20v-4.5h-4.5"/>'
    : '<path d="M7 18.5a4.5 4.5 0 0 1-.6-9 6 6 0 0 1 11.6 1.5 4 4 0 0 1-1 7.5z"/><path d="M9.5 13.5l2 2 3.5-3.7"/>';
  el.innerHTML = `<span class="st-linha"><span class="st-ico ${off || n ? "off" : ""}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ico}</svg></span><span>Status: <span class="${off || n ? "st-off" : "st-on"}">${off ? "sem conexão" : n ? n + (n === 1 ? " alteração pendente" : " alterações pendentes") : "tudo salvo"}</span></span></span><span>Registros salvos ${onde}</span>`;
}
function iniciarServidor() {
  S.modo = "servidor";
  SRV.token = lsGet(TOKEN_KEY);
  try { SRV.conta = JSON.parse(lsGet(CONTA_KEY) || "null"); } catch { SRV.conta = null; }
  const redefinir = new URLSearchParams(location.search).get("redefinir");
  if (redefinir) { S.tokenRedefinir = redefinir; S.loginModo = "redefinir"; SRV.token = null; mostrarLogin(); return; }
  if (!SRV.token || !SRV.conta || typeof SRV.conta.id !== "number") { if (lsGet(VISITANTE_KEY)) entrarVisitante(); else mostrarLogin(); return; }
  entrarApp();
}
function entrarVisitante() {
  lsSet(VISITANTE_KEY, "1"); S.visitante = true;
  if (!lerLocal()) lsSet(DEMO_KEY, JSON.stringify(dadosExemplo()));
  document.body.classList.remove("sem-conta"); $("#login").hidden = true; $("#demo-faixa").hidden = false;
  carregarLocal(); mostrarSync();
}
function sairVisitante(modo) {
  lsSet(VISITANTE_KEY, null); lsSet(DEMO_KEY, null); lsSet("coleta-agua:resp", null); S.visitante = false;
  for (const k of Object.keys(RASC)) delete RASC[k];
  gravarRascunhos();
  S.modo = "servidor"; S.pronto = false; S.dias = {}; S.legado = null;
  S.data = hojeISO(); S.fabManual = null; S.dirty = false; S.resp = "";
  S.loginModo = modo; $("#demo-faixa").hidden = true;
  mostrarLogin(); mostrarSync();
}
function dadosExemplo() {
  const antes = { config: S.config, dias: S.dias };
  S.config = clone(PADRAO); S.dias = {};
  let semente = 11, n = 0;
  const rnd = () => { semente = (semente * 9301 + 49297) % 233280; return semente / 233280; };
  const val = (min, max, casas) => Number((min + rnd() * (max - min)).toFixed(casas));
  const hoje = hojeISO(), agora = new Date().toISOString();
  for (let d = addDias(hoje, -63); d < hoje; d = addDias(d, 1)) {
    if ([0, 6].includes(new Date(utc(d)).getUTCDay())) continue;
    n++;
    if (n === 25) { S.dias[d] = { data: d, semColeta: true, motivo: "Fábrica parada", fabrica: null, itens: [], obs: "Parada para manutenção geral.", atualizadoEm: agora }; continue; }
    const fab = fabricaSugerida(d), itens = [], naoColetados = [];
    sugeridos(fab, d).forEach((id, i, ids) => {
      const p = S.config.pontos.find((x) => x.id === id);
      if (n === 34 && i === ids.length - 1) { naoColetados.push({ ponto: id, setor: p.setor, tipo: p.tipo, fabrica: p.fabrica, motivo: "Em manutenção" }); return; }
      const it = { ponto: id, setor: p.setor, tipo: p.tipo, fabrica: p.fabrica, cloro: val(0.8, 2.2, 2), ph: val(6.8, 7.6, 1), turbidez: val(0.2, 1.4, 2) };
      if (n === 30 && i === 1) it.cloro = 0.12;
      if (n === 38 && i === 2) it.turbidez = 5.8;
      itens.push(it);
    });
    S.dias[d] = { data: d, fabrica: fab, itens, naoColetados, hora: pad(7 + Math.floor(rnd() * 3)) + ":" + pad(Math.floor(rnd() * 4) * 15), responsavel: "", obs: "", atualizadoEm: agora };
  }
  const ex = { config: S.config, dias: S.dias };
  S.config = antes.config; S.dias = antes.dias;
  return ex;
}
function limparRedefinir() {
  S.tokenRedefinir = null;
  history.replaceState(null, "", location.pathname + location.hash);
}
function entrarApp() {
  document.body.classList.remove("sem-conta"); $("#login").hidden = true; $("#demo-faixa").hidden = true;
  S.pronto = false; S.dias = {}; S.legado = null;
  try { SRV.fila = JSON.parse(lsGet(kFila()) || "[]"); if (!Array.isArray(SRV.fila)) SRV.fila = []; } catch { SRV.fila = []; }
  let c = null; try { c = JSON.parse(lsGet(kCache()) || "null"); } catch {}
  if (c && c.config) {
    S.config = normalizarConfig(c.config);
    for (const x of Object.values(c.dias || {})) { const v = limparDia(x); if (v) S.dias[v.data] = v; }
    S.pronto = true; aoMudarDados();
  } else {
    $("#v-hoje").innerHTML = '<div class="empty"><b>Carregando os seus registros</b><span class="hint">No primeiro acesso do dia o servidor pode levar até 1 minuto para acordar.</span></div>';
  }
  mostrarSync();
  tentarSincronizar();
}
function mostrarLogin() {
  document.body.classList.add("sem-conta"); $("#login").hidden = false;
  if (SRV.conta && SRV.conta.email && !$("#l-email").value) $("#l-email").value = SRV.conta.email;
  modoLogin(S.loginModo || "entrar");
}
function modoLogin(m) {
  S.loginModo = m;
  const criar = m === "criar", esqueci = m === "esqueci", redefinir = m === "redefinir", acesso = !esqueci && !redefinir;
  $("#lm-entrar").setAttribute("aria-checked", String(m === "entrar"));
  $("#lm-criar").setAttribute("aria-checked", String(criar));
  $("#l-seg").hidden = !acesso;
  $("#l-sub").textContent = SUB_LOGIN[m] || SUB_LOGIN.entrar;
  $("#l-nome-campo").hidden = !criar;
  $("#l-email-campo").hidden = redefinir;
  $("#l-senha-campo").hidden = esqueci;
  $("#l-senha2-campo").hidden = !redefinir;
  $("#l-senha-rot").textContent = redefinir ? "Nova senha" : "Senha";
  $("#l-senha").setAttribute("autocomplete", criar || redefinir ? "new-password" : "current-password");
  $("#b-esqueci").hidden = m !== "entrar";
  $("#b-voltar-login").hidden = acesso;
  $("#l-visitante").hidden = !acesso;
  $("#b-login").textContent = ROTULO_LOGIN[m];
  for (const c of CAMPOS_LOGIN) { $("#e-" + c).textContent = ""; $("#l-" + c).classList.remove("invalido"); $("#l-" + c).removeAttribute("aria-invalid"); }
  $("#l-erro").hidden = true; $("#l-ok").hidden = true;
}
async function enviarLogin(ev) {
  ev.preventDefault();
  const m = S.loginModo || "entrar", criar = m === "criar", redefinir = m === "redefinir";
  const nome = $("#l-nome").value.trim(), email = $("#l-email").value.trim(), senha = $("#l-senha").value, senha2 = $("#l-senha2").value;
  const erros = {};
  if (criar && !nome) erros.nome = "Informe seu nome.";
  if (!redefinir && !EMAIL_RE.test(email)) erros.email = "Informe um e-mail válido.";
  if (m !== "esqueci") {
    if (!senha) erros.senha = redefinir ? "Informe a nova senha." : "Informe sua senha.";
    else if ((criar || redefinir) && senha.length < 6) erros.senha = "A senha deve ter pelo menos 6 caracteres.";
  }
  if (redefinir && !erros.senha && senha2 !== senha) erros.senha2 = "As duas senhas não são iguais.";
  for (const c of CAMPOS_LOGIN) { $("#e-" + c).textContent = erros[c] || ""; $("#l-" + c).classList.toggle("invalido", !!erros[c]); if (erros[c]) $("#l-" + c).setAttribute("aria-invalid", "true"); else $("#l-" + c).removeAttribute("aria-invalid"); }
  $("#l-erro").hidden = true; $("#l-ok").hidden = true;
  const primeiro = CAMPOS_LOGIN.find((c) => erros[c]);
  if (primeiro) { $("#l-" + primeiro).focus(); return; }
  const b = $("#b-login");
  b.disabled = true; b.textContent = { entrar: "Entrando…", criar: "Criando conta…", esqueci: "Enviando…", redefinir: "Salvando…" }[m];
  try {
    SRV.token = null;
    if (m === "esqueci") {
      await apiReq("/auth/forgot", { method: "POST", body: { email } });
      $("#l-ok").textContent = "Se houver uma conta com este e-mail, enviamos um link para criar uma senha nova. Ele vale 30 minutos. Confira também a caixa de spam.";
      $("#l-ok").hidden = false;
      return;
    }
    let r;
    if (redefinir) r = await apiReq("/auth/reset", { method: "POST", body: { token: S.tokenRedefinir, password: senha } });
    else {
      if (criar) await apiReq("/auth/register", { method: "POST", body: { name: nome, email, password: senha } });
      r = await apiReq("/auth/login", { method: "POST", body: { email, password: senha } });
    }
    SRV.token = r.token;
    const conta = await apiReq("/auth/me");
    SRV.conta = { id: conta.id, name: conta.name, email: conta.email };
    lsSet(TOKEN_KEY, SRV.token); lsSet(CONTA_KEY, JSON.stringify(SRV.conta));
    lsSet(VISITANTE_KEY, null); S.visitante = false;
    $("#l-senha").value = ""; $("#l-senha2").value = "";
    if (redefinir) { limparRedefinir(); S.loginModo = "entrar"; toast("Senha nova salva."); }
    entrarApp();
  } catch (e) {
    SRV.token = null;
    $("#l-erro").textContent = traduzirErro(e); $("#l-erro").hidden = false;
  } finally {
    b.disabled = false; b.textContent = ROTULO_LOGIN[S.loginModo] || ROTULO_LOGIN.entrar;
  }
}
function sessaoExpirada() {
  lsSet(TOKEN_KEY, null); SRV.token = null;
  clearTimeout(SRV.tmr); clearTimeout(SRV.tmrSync);
  toast("Sua sessão expirou. Entre de novo; nada do que você salvou se perdeu.");
  mostrarLogin();
}
function sairConta() {
  if (SRV.conta) { lsSet(kCache(), null); lsSet(kFila(), null); }
  lsSet(TOKEN_KEY, null); lsSet(CONTA_KEY, null); lsSet("coleta-agua:resp", null);
  clearTimeout(SRV.tmr); clearTimeout(SRV.tmrSync);
  for (const k of Object.keys(RASC)) delete RASC[k];
  gravarRascunhos();
  SRV.token = null; SRV.conta = null; SRV.fila = []; SRV.erro = "";
  S.pronto = false; S.dias = {}; S.confirmSair = false; S.legado = null; S.dirty = false; S.resp = "";
  $("#l-email").value = ""; $("#l-senha").value = "";
  mostrarLogin(); mostrarSync();
}

function limparPonto(p) {
  if (!p || typeof p.id !== "string" || !/^[a-z0-9-]+$/.test(p.id) || typeof p.setor !== "string" || typeof p.tipo !== "string" || ![0, 1, 2].includes(p.fabrica)) return null;
  return { id: p.id, fabrica: p.fabrica, setor: p.setor.slice(0, 80), tipo: p.tipo.slice(0, 40), ativo: p.ativo !== false };
}
function limparRegras(r) {
  r = r || {};
  return { Torneira: Math.max(0, Math.min(10, Math.round(Number(r.Torneira)) || 0)), Bebedouro: Math.max(0, Math.min(10, Math.round(Number(r.Bebedouro)) || 0)) };
}
const MOTIVOS = ["Feriado", "Falta", "Fábrica parada", "Outro"];
const MOTIVOS_NC = ["Sem água", "Interditado", "Em manutenção", "Outro"];
function limparDia(d) {
  if (d && d.semColeta === true && dataValida(d.data)) {
    return { data: d.data, semColeta: true, motivo: MOTIVOS.includes(d.motivo) ? d.motivo : "Outro", fabrica: null, itens: [],
      obs: typeof d.obs === "string" ? d.obs.slice(0, 500) : "", atualizadoEm: typeof d.atualizadoEm === "string" ? d.atualizadoEm : new Date().toISOString() };
  }
  if (!d || !dataValida(d.data) || (d.fabrica !== 1 && d.fabrica !== 2) || !Array.isArray(d.itens)) return null;
  return {
    data: d.data, fabrica: d.fabrica, obs: typeof d.obs === "string" ? d.obs.slice(0, 500) : "",
    itens: d.itens.filter((it) => it && typeof it.ponto === "string" && /^[a-z0-9-]+$/.test(it.ponto)).map((it) => ({
      ponto: it.ponto, setor: String(it.setor ?? "").slice(0, 80), tipo: String(it.tipo ?? "").slice(0, 40),
      fabrica: [0, 1, 2].includes(it.fabrica) ? it.fabrica : d.fabrica,
      cloro: num(it.cloro), ph: num(it.ph), turbidez: num(it.turbidez)
    })),
    naoColetados: Array.isArray(d.naoColetados) ? d.naoColetados.filter((x) => x && typeof x.ponto === "string" && /^[a-z0-9-]+$/.test(x.ponto)).map((x) => ({
      ponto: x.ponto, setor: String(x.setor ?? "").slice(0, 80), tipo: String(x.tipo ?? "").slice(0, 40),
      fabrica: [0, 1, 2].includes(x.fabrica) ? x.fabrica : d.fabrica, motivo: MOTIVOS_NC.includes(x.motivo) ? x.motivo : "Outro"
    })) : [],
    hora: typeof d.hora === "string" && /^\d{2}:\d{2}$/.test(d.hora) ? d.hora : "",
    responsavel: typeof d.responsavel === "string" ? d.responsavel.slice(0, 60) : "",
    atualizadoEm: typeof d.atualizadoEm === "string" ? d.atualizadoEm : new Date().toISOString()
  };
}
function normalizarConfig(c) {
  if (!c || !Array.isArray(c.pontos)) return clone(PADRAO);
  return { pontos: c.pontos.map(limparPonto).filter(Boolean), regras: limparRegras(c.regras) };
}

async function iniciar() {
  $("#hoje-label").textContent = semana(hojeISO()) + " " + fmt(hojeISO());
  iniciarTema();
  try { const a = localStorage.getItem("coleta-agua:aba"); if (ABAS.includes(a)) S.aba = a; } catch {}
  const h = location.hash.replace("#", ""); if (ABAS.includes(h)) S.aba = h;
  trocarAba(S.aba);
  if (API_URL) {
    iniciarServidor();
  } else {
    carregarLocal();
  }
}
function carregarLocal() {
  S.modo = "local";
  const j = lerLocal();
  S.config = normalizarConfig(j && j.config);
  S.dias = {}; for (const d of Object.values((j && j.dias) || {})) { const v = limparDia(d); if (v) S.dias[v.data] = v; }
  S.pronto = true;
  aoMudarDados();
}
/* ---------- Regras do rodízio ---------- */
function ultimas(ate, incluir) {
  const m = {};
  for (const d of Object.values(S.dias)) {
    if (ate && (incluir ? d.data > ate : d.data >= ate)) continue;
    for (const it of d.itens || []) if (!m[it.ponto] || m[it.ponto] < d.data) m[it.ponto] = d.data;
  }
  return m;
}
function ultimoDia(antes) {
  let best = null;
  for (const d of Object.values(S.dias)) {
    if (d.data < antes && (d.fabrica === 1 || d.fabrica === 2) && (!best || d.data > best.data)) best = d;
  }
  return best;
}
function fabricaSugerida(data) { const u = ultimoDia(data); return u ? 3 - u.fabrica : 1; }
function filaDe(fab, ult, ref) {
  return S.config.pontos
    .map((p, i) => ({ p, i }))
    .filter((x) => x.p.ativo !== false && x.p.fabrica === fab)
    .map(({ p, i }) => { const u = ult[p.id] || null; return { p, i, ult: u, dias: u ? diffDias(ref, u) : Infinity }; })
    .sort((a, b) => (b.dias - a.dias) || (a.i - b.i));
}
function sugeridos(fab, data) { return escolherPontos(fab, data, ultimas(data)); }
function escolherPontos(fab, data, ult) {
  const ids = filaDe(0, ult, data).map((e) => e.p.id);
  const cont = {};
  for (const e of filaDe(fab, ult, data)) {
    const n = Number(S.config.regras[e.p.tipo] || 0);
    cont[e.p.tipo] = cont[e.p.tipo] || 0;
    if (cont[e.p.tipo] < n) { cont[e.p.tipo]++; ids.push(e.p.id); }
  }
  return ids;
}
function cicloEsperado(p) {
  if (!p || p.fabrica === 0) return 1;
  const n = S.config.pontos.filter((x) => x.ativo !== false && x.fabrica === p.fabrica && x.tipo === p.tipo).length;
  const r = Number(S.config.regras[p.tipo] || 0);
  if (!r || !n) return null;
  return Math.max(2, Math.round(Math.ceil(n / r) * 2 * 7 / 5));
}
function nivelPonto(p, dias) {
  if (dias === Infinity) return "bad";
  const c = cicloEsperado(p);
  if (!c) return nivel(dias);
  const ok = p.fabrica === 0 ? 3 : c + 2, at = p.fabrica === 0 ? 5 : c * 2;
  return dias <= ok ? "ok" : dias <= at ? "warn" : "bad";
}
function avisoNC(id, ult, ate) {
  let n = null;
  for (const d of Object.values(S.dias)) {
    if (ate && d.data > ate) continue;
    for (const x of d.naoColetados || []) if (x.ponto === id && (!n || d.data > n.data)) n = { data: d.data, motivo: x.motivo };
  }
  return n && (!ult || n.data > ult) ? n : null;
}
function maxPrevia() { return addDias(hojeISO(), 14); }
function minData() { const ini = (Number(hojeISO().slice(0, 4)) - 1) + "-01-01", d = Object.keys(S.dias).sort()[0]; return d && d < ini ? d : ini; }
function simularAgenda() {
  const hoje = hojeISO(), limite = maxPrevia();
  const sim = ultimas(hoje, true);
  const ativos = S.config.pontos.filter((p) => p.ativo !== false);
  const ultReal = ultimoDia(addDias(hoje, 1));
  let ultFab = ultReal ? ultReal.fabrica : null;
  const agenda = [], prox = {};
  let d = S.dias[hoje] ? addDias(hoje, 1) : hoje;
  for (let n = 0; n < 90; n++, d = addDias(d, 1)) {
    if (d > limite && ativos.every((p) => prox[p.id])) break;
    if ([0, 6].includes(new Date(utc(d)).getUTCDay())) continue;
    if (semColetaEm(d)) { agenda.push({ data: d, semColeta: true, motivo: S.dias[d].motivo, ids: [] }); continue; }
    const fab = ultFab ? 3 - ultFab : 1;
    const ids = escolherPontos(fab, d, sim);
    const antes = {};
    for (const id of ids) { antes[id] = sim[id] || null; sim[id] = d; if (!prox[id]) prox[id] = d; }
    agenda.push({ data: d, fab, ids, antes });
    ultFab = fab;
  }
  return { agenda, prox };
}
function quandoTxt(d) {
  if (!d) return "sem previsão";
  const hoje = hojeISO();
  return d === hoje ? "hoje" : d === addDias(hoje, 1) ? "amanhã" : semana(d) + " " + fmtCurto(d);
}
function pontoInfo(id) {
  const p = S.config.pontos.find((x) => x.id === id);
  if (p) return p;
  const reg = S.dias[S.data];
  const it = reg && (reg.itens || []).find((x) => x.ponto === id);
  return it ? { id, setor: it.setor, tipo: it.tipo, fabrica: it.fabrica } : { id, setor: id, tipo: "", fabrica: S.fab };
}

const RASC = {};
const RASC_KEY = "coleta-agua:rascunhos";
try { const r = JSON.parse(localStorage.getItem(RASC_KEY) || "{}"); if (r && typeof r === "object") Object.assign(RASC, r); } catch {}
function gravarRascunhos() { try { localStorage.setItem(RASC_KEY, JSON.stringify(RASC)); } catch {} }
function rascunhoAtual() { return { sel: clone(S.sel), nc: clone(S.nc), obs: S.obs, hora: S.hora, resp: S.resp, em: new Date().toISOString() }; }
function lerResp() { try { return localStorage.getItem("coleta-agua:resp") || ""; } catch { return ""; } }
function guardarRascunho() { if (S.dirty) { RASC[S.data + "|" + S.fab] = rascunhoAtual(); gravarRascunhos(); } }
function marcarRascunho() {
  S.dirty = true;
  RASC[S.data + "|" + S.fab] = rascunhoAtual();
  clearTimeout(marcarRascunho.t); marcarRascunho.t = setTimeout(gravarRascunhos, 300);
}
function montarRascunho() {
  S.ncAberto = null;
  if (S.data > hojeISO()) { S.sel = {}; S.nc = {}; S.obs = ""; S.dirty = false; return; }
  const reg = S.dias[S.data];
  S.fab = S.fabManual ?? (reg && reg.fabrica ? reg.fabrica : fabricaSugerida(S.data));
  const r = RASC[S.data + "|" + S.fab];
  if (r && reg && reg.atualizadoEm && r.em && reg.atualizadoEm > r.em) { delete RASC[S.data + "|" + S.fab]; gravarRascunhos(); }
  else if (r && r.sel && typeof r.sel === "object") {
    S.sel = clone(r.sel); S.nc = r.nc && typeof r.nc === "object" ? clone(r.nc) : {};
    S.obs = typeof r.obs === "string" ? r.obs : ""; S.hora = typeof r.hora === "string" ? r.hora : ""; S.resp = typeof r.resp === "string" ? r.resp : lerResp();
    S.dirty = true; return;
  }
  S.sel = {}; S.nc = {};
  if (reg && S.fab === reg.fabrica) {
    for (const it of reg.itens || []) S.sel[it.ponto] = { cloro: fmtNum(it.cloro), ph: fmtNum(it.ph), turbidez: fmtNum(it.turbidez) };
    for (const x of reg.naoColetados || []) S.nc[x.ponto] = x.motivo;
    S.obs = reg.obs || ""; S.hora = reg.hora || ""; S.resp = reg.responsavel || "";
  } else {
    S.obs = ""; S.hora = ""; S.resp = lerResp();
  }
  S.dirty = false;
}

/* ---------- Telas ---------- */
function editandoHoje() {
  const a = document.activeElement;
  return !!(a && a.closest && a.closest("#v-hoje") && a.matches("input:not([type=checkbox]), textarea"));
}
function aoMudarDados() {
  if (!S.pronto) return;
  if (!S.dirty) { montarRascunho(); if (!editandoHoje()) renderHoje(); }
  renderTudo();
}
function renderTudo() {
  if (!S.pronto) return;
  mostrarStatusLado();
  if (!S.dirty && !editandoHoje()) renderHoje();
  renderPontos(); renderHistorico(); renderAjustes();
  if (S.aba === "graficos") renderGraficos();
}

function idadeHTML(e) {
  if (e.dias === Infinity) return '<span class="pill bad">nunca</span>';
  return `<span class="pill ${e.p ? nivelPonto(e.p, e.dias) : nivel(e.dias)}" title="Dias desde a última coleta">${e.dias} ${e.dias === 1 ? "dia" : "dias"}</span>`;
}
function ncHTML(id) {
  if (S.soLeitura) return "";
  const m = S.nc[id];
  if (m) return `<div class="nc"><span class="nc-tag">${ICO_ALERTA}Não coletado · ${esc(m)}</span><button type="button" class="link" data-nc-limpar="${id}">Desfazer</button></div>`;
  if (S.ncAberto === id) return `<div class="nc"><span class="nc-q">Por que não deu para coletar?</span><div class="chips">${MOTIVOS_NC.map((x) => `<button type="button" data-nc="${id}" data-nc-motivo="${x}">${x}</button>`).join("")}</div><button type="button" class="link nc-link" data-nc-fechar="1">Cancelar</button></div>`;
  return `<div class="nc"><button type="button" class="link nc-link" data-nc-abrir="${id}">Não deu para coletar?</button></div>`;
}
function resHTML(id) {
  const v = S.sel[id];
  return '<div class="res">' + CAMPOS.map((c) => {
    const l = LIM[c];
    return `<label for="r-${id}-${c}"><span>${l.nome}${l.un ? " (" + l.un + ")" : ""} <span class="ref">${l.ref}</span></span>` +
      `<input id="r-${id}-${c}" inputmode="decimal" enterkeyhint="next" autocomplete="off" data-ponto="${id}" data-campo="${c}" value="${esc(v[c])}" class="${fora(c, v[c]) || invalido(v[c]) ? "fora" : ""}" ${S.soLeitura ? "disabled" : ""}></label>`;
  }).join("") + "</div>";
}
function tagHTML(e, comNc) {
  const id = e.p.id, on = !!S.sel[id], nc = !on && !!S.nc[id];
  const aviso = avisoNC(id, e.ult, addDias(S.data, -1));
  return `<li class="tag ${on ? "on" : ""}${nc ? " nc-on" : ""}">
    <label class="tag-row" for="ck-${id}">
      <input type="checkbox" class="check" id="ck-${id}" data-ponto="${id}" ${on ? "checked" : ""} ${S.soLeitura ? "disabled" : ""} aria-label="Coletei ${esc(e.p.setor + ", " + e.p.tipo)}">
      <span class="ico">${ICO[e.p.tipo] || ICO["Torneira"]}</span>
      <span class="nm"><span class="setor">${esc(e.p.setor)}</span><span class="sub">${esc(e.p.tipo)}${e.p.fabrica === 0 ? " · todo dia" : ""}${e.ult ? " · última " + fmtCurto(e.ult) : " · sem registro"}${aviso ? ` · <span class="nc-sub">${esc(aviso.motivo.toLowerCase())} em ${fmtCurto(aviso.data)}</span>` : ""}</span></span>
      ${idadeHTML(e)}
    </label>
    ${on ? resHTML(id) : comNc ? ncHTML(id) : ""}
  </li>`;
}
const SEMANA_LONGA = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];
const SVG_A = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">';
const ICO_LIXO = SVG_A + '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>';
const ICO_COPIA = SVG_A + '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/></svg>';
const ICO_X = SVG_A + '<path d="M6 6l12 12M18 6L6 18"/></svg>';
const SETA_E = SVG_A + '<path d="M15 5l-7 7 7 7"/></svg>';
const SETA_D = SVG_A + '<path d="M9 5l7 7-7 7"/></svg>';
const ICO_CAL = SVG_A + '<rect x="3.5" y="5" width="17" height="15" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>';
const ICO_OK = SVG_A + '<circle cx="12" cy="12" r="9"/><path d="M8 12.5l2.7 2.7L16.5 9.5"/></svg>';
const ICO_INFO = SVG_A + '<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5"/><circle cx="12" cy="7.8" r=".7" fill="currentColor"/></svg>';
function nota(tipo, texto, acao) { return `<div class="note ${tipo}">${tipo === "info" ? ICO_INFO : tipo === "ok" ? ICO_OK : ICO_ALERTA}<div class="note-txt"><span>${texto}</span>${acao || ""}</div></div>`; }
function proxDiaUtil(s) { let d = addDias(s, 1); while ([0, 6].includes(new Date(utc(d)).getUTCDay()) || semColetaEm(d)) d = addDias(d, 1); return d; }
function irParaDia(d) {
  guardarRascunho();
  const max = maxPrevia();
  const min = minData();
  S.data = d > max ? max : d < min ? min : d; S.fabManual = null; S.outrosAberto = false; S.semColAberto = false; S.motivo = null; S.trocandoFab = false;
  montarRascunho(); renderHoje();
}
function listaNomes(arr) { return arr.length <= 1 ? arr.join("") : arr.slice(0, -1).join(", ") + " e " + arr[arr.length - 1]; }

function semColetaForm() {
  if (S.soLeitura) return "";
  return `<details class="outros" id="d-semcol" ${S.semColAberto ? "open" : ""}>
    <summary><span>Não houve coleta neste dia?<small>Feriado, falta ou fábrica parada: o dia não conta no rodízio</small></span></summary>
    <div class="semcol-form">
      <div class="chips" role="group" aria-label="Motivo">${MOTIVOS.map((m) => `<button type="button" data-motivo="${m}" aria-pressed="${S.motivo === m}">${m}</button>`).join("")}</div>
      <button class="btn" type="button" id="b-semcol" ${S.motivo ? "" : "disabled"}>Marcar ${semana(S.data)} ${fmtCurto(S.data)} sem coleta</button>
    </div>
  </details>`;
}
function renderSemColeta(el, reg) {
  const hoje = hojeISO(), max = maxPrevia();
  const [, mm, dd] = S.data.split("-");
  const rel = diffDias(hoje, S.data);
  const relTxt = rel === 0 ? "Hoje" : rel === 1 ? "Ontem" : rel > 1 ? `Há ${rel} dias` : rel === -1 ? "Amanhã" : `Daqui a ${-rel} dias`;
  const prox = proxDiaUtil(S.data);
  el.innerHTML = `
    <div class="hero">
      <div class="hero-top">
        <button type="button" class="nav-dia" id="b-dia-ant" data-dia="-1" aria-label="Dia anterior" ${S.data <= minData() ? "disabled" : ""}>${SETA_E}</button>
        <label class="hero-data" for="f-data">
          <span class="hero-rel">${relTxt} · ${SEMANA_LONGA[new Date(utc(S.data)).getUTCDay()]}</span>
          <span class="hero-dia">${Number(dd)} de ${MESES[Number(mm) - 1]}${S.data.slice(0, 4) !== hojeISO().slice(0, 4) ? " de " + S.data.slice(0, 4) : ""}${ICO_CAL}</span>
          <input type="date" id="f-data" value="${S.data}" min="${minData()}" max="${max}" aria-label="Escolher a data da coleta">
        </label>
        <button type="button" class="nav-dia" id="b-dia-prox" data-dia="1" aria-label="Próximo dia" ${S.data >= max ? "disabled" : ""}>${SETA_D}</button>
      </div>
    </div>
    <div class="card semcol-card">
      <span class="eyebrow">Dia sem coleta</span>
      <h2>${esc(reg.motivo)}</h2>
      ${reg.obs ? `<p class="obs">${esc(reg.obs)}</p>` : ""}
      <p class="hint">Este dia não conta no rodízio nem como atraso. A próxima coleta continua de onde parou.</p>
      <div class="actions">
        ${S.soLeitura ? "" : '<button class="btn" type="button" id="b-desfazer-semcol">Desfazer</button>'}
        ${prox <= max ? `<button class="link" type="button" data-ir="${prox}">Ir para ${semana(prox)} ${fmtCurto(prox)}</button>` : ""}
      </div>
    </div>
  `;
}
function renderPrevia(el) {
  if (semColetaEm(S.data)) { renderSemColeta(el, S.dias[S.data]); return; }
  const hoje = hojeISO(), max = maxPrevia();
  const { agenda } = simularAgenda();
  const plano = agenda.find((a) => a.data === S.data && !a.semColeta);
  const [, mm, dd] = S.data.split("-");
  const rel = diffDias(S.data, hoje);
  const proxUtil = agenda.find((a) => a.data > S.data && !a.semColeta);
  const info = (id) => S.config.pontos.find((x) => x.id === id) || { id, setor: id, tipo: "", fabrica: 0 };
  const lista = plano ? plano.ids.map((id) => {
    const p = info(id), u = plano.antes[id];
    const real = u && S.dias[u] && (S.dias[u].itens || []).some((it) => it.ponto === id);
    return `<li class="tag previa"><div class="tag-row">
      <span class="ico">${ICO[p.tipo] || ICO["Torneira"]}</span>
      <span class="nm"><span class="setor">${esc(p.setor)}</span><span class="sub">${esc(p.tipo)}${p.fabrica === 0 ? " · todo dia" : ""}${u ? " · última " + (real ? "" : "prevista ") + fmtCurto(u) : " · sem registro"}</span></span>
      ${idadeHTML({ p, dias: u ? diffDias(S.data, u) : Infinity })}
    </div></li>`;
  }).join("") : "";
  el.innerHTML = `
    <div class="hero previa">
      <div class="hero-top">
        <button type="button" class="nav-dia" id="b-dia-ant" data-dia="-1" aria-label="Dia anterior" ${S.data <= minData() ? "disabled" : ""}>${SETA_E}</button>
        <label class="hero-data" for="f-data">
          <span class="hero-rel">Prévia · ${rel === 1 ? "amanhã" : "daqui a " + rel + " dias"} · ${SEMANA_LONGA[new Date(utc(S.data)).getUTCDay()]}</span>
          <span class="hero-dia">${Number(dd)} de ${MESES[Number(mm) - 1]}${S.data.slice(0, 4) !== hojeISO().slice(0, 4) ? " de " + S.data.slice(0, 4) : ""}${ICO_CAL}</span>
          <input type="date" id="f-data" value="${S.data}" min="${minData()}" max="${max}" aria-label="Escolher a data da coleta">
        </label>
        <button type="button" class="nav-dia" id="b-dia-prox" data-dia="1" aria-label="Próximo dia" ${S.data >= max ? "disabled" : ""}>${SETA_D}</button>
      </div>
      ${plano ? `<div class="hero-fab"><span class="hero-fab-rot">Previsto:</span><b class="hero-fab-nome">Fábrica ${plano.fab}</b></div>` : ""}
      <p class="hero-motivo">${plano ? "As fábricas se alternam a cada dia útil, contando da última coleta salva." : "Fim de semana: nenhuma coleta prevista."}</p>
    </div>
    ${nota("info", "Previsão: supõe que as coletas sugeridas até lá sejam feitas. Data futura não pode ser salva.",
      `<span class="actions"><button class="link" type="button" data-ir="${hoje}">Voltar para hoje</button>${!plano && proxUtil ? `<button class="link" type="button" data-ir="${proxUtil.data}">Ver ${semana(proxUtil.data)} ${fmtCurto(proxUtil.data)}</button>` : ""}</span>`)}
    ${plano ? `<div class="block"><div class="lista-head"><h2>Pontos previstos</h2></div><p class="hint">O selo mostra quantos dias o ponto estará sem coleta nesse dia.</p><ul class="tags">${lista}</ul></div>${semColetaForm()}` : ""}
  `;
}

function renderHoje() {
  const el = $("#v-hoje");
  if (!S.pronto) return;
  if (S.data > hojeISO()) { renderPrevia(el); return; }
  const reg = S.dias[S.data];
  if (reg && reg.semColeta) { renderSemColeta(el, reg); return; }
  const ult = ultimas(S.data);
  const sug = sugeridos(S.fab, S.data);
  const sugSet = new Set(sug);
  const diarios = filaDe(0, ult, S.data);
  const fila = filaDe(S.fab, ult, S.data);
  const conhecidos = new Set([...diarios, ...fila].map((e) => e.p.id));
  const extras = Object.keys(S.sel).filter((id) => !conhecidos.has(id)).map((id) => {
    const p = pontoInfo(id), u = ult[id] || null;
    return { p, ult: u, dias: u ? diffDias(S.data, u) : Infinity };
  });
  const topo = [...diarios, ...fila.filter((e) => sugSet.has(e.p.id)), ...extras];
  const outros = fila.filter((e) => !sugSet.has(e.p.id));
  const anterior = ultimoDia(S.data);
  const fabSug = fabricaSugerida(S.data);
  const ehHoje = S.data === hojeISO();
  const fimDeSemana = [0, 6].includes(new Date(utc(S.data)).getUTCDay());

  const hoje = hojeISO();
  const rel = diffDias(hoje, S.data);
  const relTxt = rel === 0 ? "Hoje" : rel === 1 ? "Ontem" : rel > 1 ? `Há ${rel} dias` : "Data futura";
  const [, mm, dd] = S.data.split("-");
  const motivo = S.fab !== fabSug
    ? `Você trocou de fábrica. O indicado para este dia é a Fábrica ${fabSug}.`
    : anterior ? `É a vez da Fábrica ${fabSug}: a última coleta foi na Fábrica ${anterior.fabrica}, ${semana(anterior.data)} ${fmtCurto(anterior.data)}.` : "Nenhuma coleta registrada antes desta data.";
  const lacuna = anterior ? diasUteisEntre(anterior.data, S.data) : 0;
  const nSel = Object.keys(S.sel).length;
  const nTopo = topo.length, nFeitos = topo.filter((e) => S.sel[e.p.id] || S.nc[e.p.id]).length;
  const nNc = Object.keys(S.nc).filter((id) => !S.sel[id]).length;
  S.topoIds = topo.map((e) => e.p.id);
  const notas = [];
  const acabouDeSalvar = !!(S.salvoMsg && S.salvoMsg.data === S.data);
  if (reg && !acabouDeSalvar) {
    const prox = proxDiaUtil(S.data);
    notas.push(nota("info", `Coleta deste dia já salva (Fábrica ${reg.fabrica}).`,
      `<span class="actions"><button class="link" type="button" data-resumo="${S.data}">Copiar resumo</button>${prox <= hoje && !S.dias[prox] ? `<button class="link" type="button" data-ir="${prox}">Ir para ${semana(prox)} ${fmtCurto(prox)}</button>` : ""}</span>`));
  }
  if (fimDeSemana) notas.push(nota("warn", "Data em fim de semana."));
  if (!reg && lacuna >= 2) {
    const prox = proxDiaUtil(anterior.data);
    notas.push(nota("warn", `${lacuna} dias úteis sem registro desde ${semana(anterior.data)} ${fmtCurto(anterior.data)}.`,
      prox < S.data ? `<button class="link" type="button" data-ir="${prox}">Lançar ${semana(prox)} ${fmtCurto(prox)}</button>` : ""));
  }
  if (S.soLeitura) notas.push(nota("warn", "Você está vendo este site só para leitura. As coletas não podem ser salvas daqui."));
  const salvo = [];
  if (acabouDeSalvar) {
    const prox = simularAgenda().agenda.find((a) => a.data > S.data && !a.semColeta);
    salvo.push(nota("ok", `<b>Coleta salva!</b> ${prox ? `Próxima: ${quandoTxt(prox.data)}, Fábrica ${prox.fab}.` : ""}`,
      `<span class="actions">${prox ? `<button class="link" type="button" data-ir="${prox.data}">Ver os pontos</button>` : ""}<button class="link" type="button" data-resumo="${S.data}">Copiar resumo</button></span>`));
    const foraTxt = reg ? (reg.itens || []).flatMap((it) => CAMPOS.filter((c) => fora(c, it[c])).map((c) => `${esc(it.setor)} · ${esc(it.tipo)} (${c === "ph" ? "pH" : LIM[c].nome.toLowerCase()} ${fmtNum(it[c])}${LIM[c].un ? " " + LIM[c].un : ""})`)) : [];
    if (foraTxt.length) salvo.push(nota("warn", `<b>${foraTxt.length} ${foraTxt.length === 1 ? "valor fora" : "valores fora"} do normal:</b> ${listaNomes(foraTxt)}. Avise o responsável.`));
  }
  if (S.ajuda || !lsGet("coleta-agua:ajuda-ok")) notas.unshift(`<div class="ajuda" id="ajuda">
      <h2>Como usar em 3 passos</h2>
      <ol>
        <li><span>Veja no cartão escuro qual fábrica é hoje e, abaixo, os pontos para coletar.</span></li>
        <li><span>Depois de coletar, toque no círculo do ponto. Se medir cloro, pH ou turbidez, anote nos campos que aparecem.</span></li>
        <li><span>No fim, toque em <b>Salvar coleta</b>. Se o dia não teve coleta, use "Não houve coleta neste dia?".</span></li>
      </ol>
      <button class="btn" type="button" id="b-ajuda-ok">Entendi</button>
    </div>`);
  if (S.modo === "servidor" && S.legado) notas.unshift(nota("info", `Este aparelho tem ${S.legado.dias.length} dias salvos de antes da conta.`, '<button class="link" type="button" id="b-migrar">Enviar para a minha conta</button>'));

  const C = 2 * Math.PI * 30, feito = nTopo ? nFeitos / nTopo : 0;
  el.innerHTML = `
    <div class="coleta-grid"><div class="col-a">
    ${salvo.join("")}
    <div class="hero">
      <div class="hero-top">
        <button type="button" class="nav-dia" id="b-dia-ant" data-dia="-1" aria-label="Dia anterior" ${S.data <= minData() ? "disabled" : ""}>${SETA_E}</button>
        <label class="hero-data" for="f-data">
          <span class="hero-rel">${relTxt} · ${SEMANA_LONGA[new Date(utc(S.data)).getUTCDay()]}</span>
          <span class="hero-dia">${Number(dd)} de ${MESES[Number(mm) - 1]}${S.data.slice(0, 4) !== hojeISO().slice(0, 4) ? " de " + S.data.slice(0, 4) : ""}${ICO_CAL}</span>
          <input type="date" id="f-data" value="${S.data}" min="${minData()}" max="${maxPrevia()}" aria-label="Escolher a data da coleta">
        </label>
        <button type="button" class="nav-dia" id="b-dia-prox" data-dia="1" aria-label="Próximo dia" title="${S.data >= hoje ? "Ver a previsão dos próximos dias" : "Próximo dia"}">${SETA_D}</button>
      </div>
      <div class="hero-fab"><span class="hero-fab-rot">Dia da</span><b class="hero-fab-nome">Fábrica ${S.fab}</b>${S.soLeitura ? "" : `<button type="button" class="hero-trocar" id="b-trocar-fab" aria-expanded="${!!S.trocandoFab}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${S.trocandoFab ? '<path d="M6 6l12 12M18 6L6 18"/>' : '<path d="M4 8h13l-3.5-3.5M20 16H7l3.5 3.5"/>'}</svg>${S.trocandoFab ? "Fechar" : "Trocar"}</button>`}</div>
      ${S.trocandoFab ? `<div class="seg" role="radiogroup" aria-label="Fábrica do dia">
        ${[1, 2].map((f) => `<button type="button" role="radio" id="fab-${f}" data-fab="${f}" aria-checked="${S.fab === f}">Fábrica ${f}${f === fabSug ? "<small>indicada</small>" : ""}</button>`).join("")}
      </div>` : ""}
      ${S.fab !== fabSug || !anterior ? `<p class="hero-motivo">${esc(motivo)}</p>` : ""}
      <div class="prog-anel" role="progressbar" aria-label="Pontos coletados" aria-valuemin="0" aria-valuemax="${nTopo}" aria-valuenow="${nFeitos}">
        <div class="anel-caixa"><svg class="anel" viewBox="0 0 76 76" aria-hidden="true"><circle class="anel-fundo" cx="38" cy="38" r="30"/><circle class="anel-valor" cx="38" cy="38" r="30" transform="rotate(-90 38 38)" stroke-dasharray="${(C * feito).toFixed(1)} ${C.toFixed(1)}" ${feito ? "" : 'style="stroke:none"'}/></svg><b>${Math.round(feito * 100)}%</b></div>
        <div class="anel-txt"><b>${nFeitos} de ${nTopo} ${nTopo === 1 ? "ponto coletado" : "pontos coletados"}</b><span>${nTopo && nFeitos === nTopo ? "Tudo coletado. Agora é só salvar." : nTopo - nFeitos === 1 ? "Falta 1 ponto." : "Faltam " + (nTopo - nFeitos) + " pontos."}</span></div>
      </div>
    </div>
    ${notas.join("")}
    </div><div class="col-b">
    <div class="block">
      <div class="lista-head"><h2>${ehHoje ? "Coletar hoje" : "Pontos do dia"}</h2>${!S.soLeitura && nTopo && nFeitos < nTopo ? '<button type="button" class="link" id="b-todos">Marcar todos</button>' : ""}</div>
      <p class="hint">Toque no círculo depois de coletar cada ponto.</p>
      <ul class="tags">${topo.map((e) => tagHTML(e, true)).join("")}</ul>
    </div>
    ${outros.length ? `<details class="outros" id="d-outros" ${S.outrosAberto || outros.some((e) => S.sel[e.p.id]) ? "open" : ""}>
      <summary><span>Coletou outro ponto da Fábrica ${S.fab}?<small>${outros.length} ${outros.length === 1 ? "ponto" : "pontos"}, do mais antigo ao mais recente</small></span></summary>
      <ul class="tags">${outros.map((e) => tagHTML(e, false)).join("")}</ul>
    </details>` : ""}
    ${reg ? "" : semColetaForm()}
    <div class="meta-dia">
      <label class="field" for="f-hora"><span>Horário</span><input type="time" id="f-hora" value="${esc(S.hora)}" ${S.soLeitura ? "disabled" : ""}></label>
      <label class="field" for="f-resp"><span>Quem coletou</span><input type="text" id="f-resp" value="${esc(S.resp)}" placeholder="Seu nome" autocomplete="name" maxlength="60" ${S.soLeitura ? "disabled" : ""}></label>
    </div>
    <label class="field" for="f-obs"><span>Observação do dia (opcional)</span><textarea id="f-obs" placeholder="Ex.: bebedouro do DMP em manutenção" ${S.soLeitura ? "disabled" : ""}>${esc(S.obs)}</textarea></label>
    <div class="savebar"><button class="btn primary" type="button" id="b-salvar" ${S.soLeitura || !(nSel || nNc) ? "disabled" : ""}>${nSel || nNc ? `${reg ? "Atualizar" : "Salvar"} coleta · ${nSel ? nSel + (nSel === 1 ? " ponto" : " pontos") : ""}${nSel && nNc ? " · " : ""}${nNc ? nNc + " não coletado" + (nNc === 1 ? "" : "s") : ""}` : "Marque os pontos coletados"}</button></div>
    </div></div>
  `;
}

function renderPontos() {
  const el = $("#v-pontos");
  const hoje = hojeISO();
  const ult = ultimas(hoje, true);
  const grupos = [1, 2, 0].map((f) => ({ f, itens: filaDe(f, ult, hoje) })).filter((g) => g.itens.length);
  const todos = grupos.filter((g) => g.f !== 0).flatMap((g) => g.itens);
  const pior = todos.slice().sort((a, b) => (b.dias - a.dias) || (a.i - b.i))[0];
  const atrasados = todos.filter((e) => nivelPonto(e.p, e.dias) === "bad").length;
  const { agenda, prox } = simularAgenda();
  const infoP = (id) => S.config.pontos.find((x) => x.id === id) || { id, setor: id, tipo: "", fabrica: 0 };
  const chipsDe = (a) => { const pts = a.ids.map(infoP).filter((p) => p.fabrica !== 0); return pts.map((p) => `<span class="ag-chip">${ICO[p.tipo] || ""}${esc(p.setor)}${pts.filter((q) => q.setor === p.setor).length > 1 ? " · " + esc(p.tipo.toLowerCase()) : ""}</span>`).join(""); };
  const nAg = S.agendaMais ? 7 : 3;
  const agendaHTML = agenda.length ? `<div class="card"><h2>Próximos dias</h2>
    <p class="hint">Previsão pelo rodízio em dias úteis. A caixa d'água entra todo dia.</p>
    <ul class="agenda">${agenda.slice(0, nAg).map((a) => `<li><button type="button" data-ir="${a.data}">
      <span class="ag-dia">${a.data === hoje ? "hoje" : a.data === addDias(hoje, 1) ? "amanhã" : SEMANA_LONGA[new Date(utc(a.data)).getUTCDay()]}<small>${a.data === hoje || a.data === addDias(hoje, 1) ? semana(a.data) + " " : ""}${fmtCurto(a.data)}</small></span>
      ${a.semColeta ? `<span class="ag-pts sc"><b>Sem coleta</b>${esc(a.motivo)}</span>` : `<span class="ag-pts"><b>Fábrica ${a.fab}</b><span class="ag-chips">${chipsDe(a)}</span></span>`}
      <span class="ag-seta">${SETA_D}</span>
    </button></li>`).join("")}</ul>
    ${agenda.length > 3 ? `<button type="button" class="link" id="b-agenda-mais">${S.agendaMais ? "Mostrar menos" : "Ver mais dias"}</button>` : ""}</div>` : "";
  const row = (e) => {
    const c = cicloEsperado(e.p) || 10, lv = nivelPonto(e.p, e.dias), escala = Math.max(c * 2.5, 10);
    const w = e.dias === Infinity ? 100 : Math.max(3, Math.min(100, (e.dias / escala) * 100));
    const av = avisoNC(e.p.id, e.ult, hoje);
    return `<li>
      <span class="ico">${ICO[e.p.tipo] || ICO["Torneira"]}</span>
      <span class="nm"><span class="setor">${esc(e.p.setor)}</span><span class="sub">${esc(e.p.tipo)} · a cada ~${c} ${c === 1 ? "dia" : "dias"}</span><span class="prox">próxima: <b>${quandoTxt(prox[e.p.id])}</b></span>${av ? `<span class="prox nc-sub">${esc(av.motivo)} em ${fmtCurto(av.data)}</span>` : ""}</span>
      <span class="bar" aria-hidden="true"><i class="${lv}" style="width:${w}%"></i><b style="left:${(c / escala * 100).toFixed(1)}%"></b></span>
      <span class="num ${lv}">${e.dias === Infinity ? "nunca" : e.dias + " d"}<small>${e.ult ? fmtCurto(e.ult) : "sem registro"}</small></span>
    </li>`;
  };
  el.innerHTML = `
    ${agendaHTML}
    ${pior ? `<div class="summary">
      <span class="eyebrow">Mais tempo sem coleta</span>
      <span class="big">${esc(pior.p.setor)} · ${esc(pior.p.tipo)}, ${nomeFab(pior.p.fabrica)}</span>
      <span class="hint">${pior.dias === Infinity ? "Nunca coletado." : pior.dias + " dias desde " + fmt(pior.ult) + "."} ${atrasados ? atrasados + (atrasados === 1 ? " ponto está atrasado" : " pontos estão atrasados") + " para o rodízio." : "Todos os pontos estão em dia ou perto disso."}</span>
    </div>` : '<div class="empty"><b>Nenhum ponto ativo</b><span class="hint">Cadastre os pontos de coleta em Ajustes.</span></div>'}
    <div class="legend">
      <span style="--c: var(--ok)">em dia</span>
      <span style="--c: var(--warn)">atenção</span>
      <span style="--c: var(--bad)">atrasado (mais de 2 ciclos)</span>
    </div>
    <p class="hint">O tracinho em cada barra mostra de quanto em quanto tempo o ponto costuma ser coletado.</p>
    <div class="groups">
      ${grupos.map((g) => `<div class="block"><h2>${g.f === 0 ? "Todo dia" : "Fábrica " + g.f}</h2><ul class="rows">${g.itens.map(row).join("")}</ul></div>`).join("")}
    </div>
    <p class="hint">Dias contados até hoje, ${fmt(hoje)}. A próxima coleta é uma previsão pelo rodízio em dias úteis; feriados e faltas atrasam a data.</p>
  `;
}

function valsHTML(it) {
  const partes = CAMPOS.filter((c) => it[c] !== null && it[c] !== undefined).map((c) => {
    const l = LIM[c];
    const txt = (c === "ph" ? "pH " + fmtNum(it[c]) : fmtNum(it[c]) + " " + l.un + (c === "cloro" ? " Cl" : ""));
    return `<span class="${fora(c, it[c]) ? "fora" : ""}">${esc(txt)}</span>`;
  });
  return partes.length ? `<span class="vals">${partes.join(" · ")}</span>` : "";
}
function renderHistorico() {
  const el = $("#v-historico");
  const dias = Object.values(S.dias).sort((a, b) => (a.data < b.data ? 1 : -1));
  const meses = [...new Set(dias.map((d) => d.data.slice(0, 7)))];
  if (S.csvPeriodo !== "tudo" && S.csvPeriodo !== "30" && !meses.includes(S.csvPeriodo)) S.csvPeriodo = "tudo";
  let html = `<div class="csv-row">
    <label class="field" for="csv-periodo"><span>Baixar planilha</span><select id="csv-periodo">
      <option value="tudo" ${S.csvPeriodo === "tudo" ? "selected" : ""}>Todo o histórico</option>
      <option value="30" ${S.csvPeriodo === "30" ? "selected" : ""}>Últimos 30 dias</option>
      ${meses.map((m) => `<option value="${m}" ${S.csvPeriodo === m ? "selected" : ""}>${MESES[Number(m.slice(5)) - 1]} de ${m.slice(0, 4)}</option>`).join("")}
    </select></label>
    <button class="btn" type="button" id="b-csv" ${dias.length ? "" : "disabled"}>Baixar (Excel)</button>
  </div>
  <p class="hint">${dias.length} ${dias.length === 1 ? "dia registrado" : "dias registrados"}. Toque num dia para abrir.</p>`;
  if (!dias.length) {
    html += '<div class="empty"><b>Nenhuma coleta registrada ainda</b><span class="hint">Salve a primeira coleta na aba Coleta do dia e ela aparece aqui.</span></div>';
  }
  let mes = "";
  for (const d of dias) {
    const m = d.data.slice(0, 7);
    if (m !== mes) {
      const n = dias.filter((x) => x.data.startsWith(m)).length;
      html += `${mes ? "</div></details>" : ""}<details class="mes" data-mes="${m}" ${S.mesesAbertos[m] ?? m === meses[0] ? "open" : ""}><summary class="month">${MESES[Number(m.slice(5)) - 1]} de ${m.slice(0, 4)}<small>${n} ${n === 1 ? "dia" : "dias"}</small></summary><div class="mes-dias">`;
      mes = m;
    }
    const confirmar = S.confirmando === d.data ? `<div class="confirm"><span>Excluir o registro de ${fmt(d.data)}?</span><button class="btn small danger" type="button" data-excluir-sim="${d.data}">Sim, excluir</button><button class="btn small" type="button" data-cancelar="1">Cancelar</button></div>` : "";
    const acoes = `<span class="acts">
            <button class="icon-btn" type="button" data-resumo="${d.data}" aria-label="Copiar resumo de ${fmt(d.data)}" title="Copiar resumo">${ICO_COPIA}</button>
            ${S.soLeitura ? "" : `<button class="icon-btn danger" type="button" data-excluir="${d.data}" aria-label="Excluir ${fmt(d.data)}" title="Excluir">${ICO_LIXO}</button>`}
          </span>`;
    const resumo = resumoDia(d).split("\n").slice(1).map((l) => l.replace(/^[✓✗] /, "").replace(/\.$/, "")).join(". ");
    const abrir = (chip) => `<button type="button" class="dia-abrir" data-abrir="${d.data}"><time datetime="${d.data}">${semana(d.data)} ${fmtCurto(d.data)}</time> ${chip}${resumo ? `<span class="vh">: ${esc(resumo)}.</span>` : ""}</button>`;
    if (d.semColeta) {
      html += `<article class="dia">
        <header>
          ${abrir(`<span class="chip sc">Sem coleta · ${esc(d.motivo)}</span>`)}
          ${acoes}
        </header>
        ${d.obs ? `<p class="obs">${esc(d.obs)}</p>` : ""}
        ${confirmar}
      </article>`;
      continue;
    }
    const itens = (d.itens || []).slice().sort((a, b) => (a.fabrica - b.fabrica) || ((ORDEM_TIPO[a.tipo] ?? 9) - (ORDEM_TIPO[b.tipo] ?? 9)));
    const meta = [d.hora ? "às " + d.hora : "", d.responsavel ? "por " + d.responsavel : ""].filter(Boolean).join(" ");
    html += `<article class="dia">
      <header>
        ${abrir(`<span class="chip f${d.fabrica}">Fábrica ${d.fabrica}</span>`)}
        ${acoes}
      </header>
      ${meta ? `<p class="dia-meta">${esc(meta)}</p>` : ""}
      <ul class="itens">${itens.map((it) => `<li><span class="ico">${ICO[it.tipo] || ICO["Torneira"]}</span><span>${esc(it.setor)} · ${esc(it.tipo)}</span>${valsHTML(it)}</li>`).join("")}${(d.naoColetados || []).map((x) => `<li class="nc-li"><span class="ico">${ICO_ALERTA}</span><span>${esc(x.setor)} · ${esc(x.tipo)}: não coletado (${esc(x.motivo.toLowerCase())})</span></li>`).join("") || (itens.length ? "" : '<li class="hint">Nenhum ponto coletado.</li>')}</ul>
      ${d.obs ? `<p class="obs">${esc(d.obs)}</p>` : ""}
      ${confirmar}
    </article>`;
  }
  if (mes) html += "</div></details>";
  el.innerHTML = html;
}

function renderAjustes() {
  const focado = document.activeElement && document.activeElement.id;
  $("#tema-sel").value = S.temaPref || "auto";
  if (focado !== "r-torneira") $("#r-torneira").value = S.config.regras.Torneira ?? 0;
  if (focado !== "r-bebedouro") $("#r-bebedouro").value = S.config.regras.Bebedouro ?? 0;
  ["r-torneira", "r-bebedouro", "n-fab", "n-setor", "n-tipo", "b-novo", "f-import"].forEach((id) => { $("#" + id).disabled = S.soLeitura; });
  const cc = $("#conta-card");
  cc.hidden = !S.visitante && (S.modo !== "servidor" || !SRV.conta);
  if (S.visitante) {
    $("#conta-info").innerHTML = "Você está no <b>modo visitante</b>, com dados de exemplo salvos só neste navegador. Crie uma conta para registrar as suas coletas e ver tudo em qualquer aparelho.";
    $("#conta-acoes").innerHTML = '<div class="actions"><button class="btn primary" type="button" data-criar-conta="1">Criar minha conta</button><button class="btn" type="button" data-ja-conta="1">Já tenho conta</button></div>';
  } else if (!cc.hidden) {
    $("#conta-info").innerHTML = `Conectado como <b>${esc(SRV.conta.name)}</b> (${esc(SRV.conta.email)}). Seus registros ficam salvos na conta e aparecem em qualquer aparelho em que você entrar.`;
    const n = SRV.fila.length;
    $("#conta-acoes").innerHTML = S.confirmSair && n
      ? `<div class="confirm"><span>${n} ${n === 1 ? "alteração ainda não foi enviada" : "alterações ainda não foram enviadas"} e ${n === 1 ? "vai" : "vão"} se perder. Sair mesmo assim?</span><button class="btn small danger" type="button" id="b-sair-forcar">Sair mesmo assim</button><button class="btn small" type="button" data-cancelar="1">Cancelar</button></div>`
      : '<button class="btn" type="button" id="b-sair">Sair da conta</button>';
  }
  $("#modo-label").textContent = S.modo === "servidor"
    ? "Não é preciso fazer backup: tudo fica salvo na sua conta. O arquivo abaixo é só uma cópia extra, se você quiser guardar."
    : "Os registros ficam guardados só neste navegador. Baixe um backup de vez em quando para não perder nada.";
  const grupos = [1, 2, 0].map((f) => ({ f, pts: S.config.pontos.filter((p) => p.fabrica === f) })).filter((g) => g.pts.length);
  $("#aj-lista").innerHTML = grupos.map((g) => `<div class="block"><h3>${g.f === 0 ? "Todo dia" : "Fábrica " + g.f}</h3><ul class="cfg-list">${g.pts.map((p) => `
    <li class="${p.ativo === false ? "off" : ""}">
      <input type="checkbox" id="at-${p.id}" data-ativo="${p.id}" ${p.ativo === false ? "" : "checked"} ${S.soLeitura ? "disabled" : ""} aria-label="${esc(p.setor)} ${esc(p.tipo)} no rodízio">
      <label class="nm" for="at-${p.id}"><span class="setor">${esc(p.setor)}</span><span class="sub">${esc(p.tipo)}${p.ativo === false ? " · fora do rodízio" : ""}</span></label>
      ${S.soLeitura ? "<span></span>" : S.removendo === p.id
        ? `<span class="actions"><button class="btn small danger" type="button" data-remover-sim="${p.id}">Remover</button><button class="btn small" type="button" data-cancelar="1">Cancelar</button></span>`
        : `<button class="btn small" type="button" data-remover="${p.id}">Remover</button>`}
    </li>`).join("")}</ul></div>`).join("");
  const ic = $("#import-confirm");
  ic.innerHTML = S.importando
    ? `<div class="confirm"><span>Importar ${S.importando.dias.length} dias e ${S.importando.config.pontos.length} pontos? Dias com a mesma data serão substituídos.</span><button class="btn small" type="button" id="b-import-sim">Importar</button><button class="btn small" type="button" data-cancelar="1">Cancelar</button></div>`
    : "";
}

function trocarAba(aba) {
  S.aba = aba;
  for (const b of document.querySelectorAll(".tabs button")) { if (b.dataset.aba === aba) b.setAttribute("aria-current", "page"); else b.removeAttribute("aria-current"); }
  for (const id of ABAS) $("#v-" + id).hidden = id !== aba;
  const tabs = $(".tabs");
  if (tabs.scrollWidth > tabs.clientWidth) document.querySelector('.tabs [aria-current="page"]')?.scrollIntoView({ block: "nearest", inline: "nearest" });
  if (aba === "graficos") renderGraficos();
  try { localStorage.setItem("coleta-agua:aba", aba); } catch {}
}

/* ---------- Tema ---------- */
const ICO_LUA = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>';
const ICO_SOL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6L6 6M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4L6 18M18 6l1.4-1.4"/></svg>';
const TEMA_KEY = "coleta-agua:tema";
function temaEscuro() {
  const t = document.documentElement.getAttribute("data-theme");
  if (t === "dark" || t === "light") return t === "dark";
  return !!(window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches);
}
function botaoTema() {
  const b = $("#b-tema"); if (!b) return;
  const escuro = temaEscuro();
  b.innerHTML = escuro ? ICO_SOL : ICO_LUA;
  b.setAttribute("aria-label", escuro ? "Usar tema claro" : "Usar tema escuro");
  b.title = escuro ? "Usar tema claro" : "Usar tema escuro";
}
function aplicarTema(pref) {
  const r = document.documentElement;
  if (pref === "claro") r.setAttribute("data-theme", "light");
  else if (pref === "escuro") r.setAttribute("data-theme", "dark");
  else if (S.temaPref === "claro" || S.temaPref === "escuro") r.removeAttribute("data-theme");
  S.temaPref = pref;
  try { localStorage.setItem(TEMA_KEY, pref); } catch {}
  botaoTema();
  if ($("#tema-sel")) $("#tema-sel").value = pref;
}
function iniciarTema() {
  let pref = "auto";
  try { const v = localStorage.getItem(TEMA_KEY); if (v === "claro" || v === "escuro" || v === "auto") pref = v; } catch {}
  S.temaPref = "auto";
  if (pref !== "auto") aplicarTema(pref); else botaoTema();
  if (window.matchMedia) { try { matchMedia("(prefers-color-scheme: dark)").addEventListener("change", botaoTema); } catch {} }
  try { new MutationObserver(botaoTema).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] }); } catch {}
}

/* ---------- Gráficos ---------- */
const G = { periodo: "30", ponto: "", param: "cloro", tips: [], charts: {} };
const PARAM = [
  { c: "cloro", titulo: "Cloro livre", un: "mg/L" },
  { c: "ph", titulo: "pH", un: "" },
  { c: "turbidez", titulo: "Turbidez", un: "uT" }
];
const ICO_ALERTA = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l9.5 17h-19z"/><path d="M12 10v4.5"/><circle cx="12" cy="17.3" r=".6" fill="currentColor"/></svg>';
function isoUtc(t) { const d = new Date(t); return d.getUTCFullYear() + "-" + pad(d.getUTCMonth() + 1) + "-" + pad(d.getUTCDate()); }
function addDias(s, n) { return isoUtc(utc(s) + n * 86400000); }
function passoBom(span, n) { const s0 = span / n; const mag = Math.pow(10, Math.floor(Math.log10(s0))); const e = s0 / mag; return (e >= 7.5 ? 10 : e >= 3.5 ? 5 : e >= 1.5 ? 2 : 1) * mag; }
function fmtEixo(v) { return String(+v.toFixed(2)).replace(".", ","); }
function nomeLocal(f) { return f === 0 ? "Caixa d'água (todo dia)" : "Fábrica " + f; }
function periodoG() {
  const fim = hojeISO();
  const datas = Object.keys(S.dias).sort();
  let ini = G.periodo === "tudo" ? (datas[0] || addDias(fim, -29)) : addDias(fim, -(Number(G.periodo) - 1));
  if (ini >= fim) ini = addDias(fim, -1);
  return { ini, fim };
}
function chavesHTML(fabs) {
  return '<div class="keys">' + [0, 1, 2].filter((f) => fabs.has(f)).map((f) => `<span><i class="k f${f}"></i>${nomeLocal(f)}</span>`).join("") + "</div>";
}
function layoutSpark(el) {
  const inner = Math.max(240, Math.floor(el.clientWidth) - 30);
  const lw = Math.round(Math.min(170, Math.max(92, inner * 0.33)));
  return { inner, lw, sw: Math.max(90, inner - lw - 12 - 16) };
}
function dominioParam(c, vs) {
  const lim = LIM[c];
  if (c === "ph") return { lo: Math.min(Math.min(...vs), lim.min) - 0.5, hi: Math.max(Math.max(...vs), lim.max) + 0.5 };
  return { lo: 0, hi: Math.max(Math.max(...vs) * 1.15, c === "cloro" ? 0.5 : 1) };
}
function diaLongo(s) {
  const [, m, d] = s.split("-");
  const t = SEMANA_LONGA[new Date(utc(s)).getUTCDay()] + ", " + Number(d) + " de " + MESES[Number(m) - 1];
  return t.charAt(0).toUpperCase() + t.slice(1);
}
function serieRitmo(datas, dom) {
  const out = [];
  let j = -1;
  for (let t = utc(dom.ini); t <= utc(dom.fim); t += 86400000) {
    const d = isoUtc(t);
    while (j + 1 < datas.length && datas[j + 1] <= d) j++;
    out.push({ data: d, v: j >= 0 ? diffDias(d, datas[j]) : null, coleta: j >= 0 && datas[j] === d });
  }
  return out;
}
function rotular(xs, larg, linhas) {
  const pos = xs.map(() => -1), usados = Array.from({ length: linhas }, () => []);
  for (let k = xs.length - 1; k >= 0; k--) {
    for (let l = 0; l < linhas; l++) {
      if (usados[l].every((u) => Math.abs(u - xs[k]) >= larg + 4)) { usados[l].push(xs[k]); pos[k] = l; break; }
    }
  }
  return pos;
}
function curva(seg) {
  if (seg.length < 2) return "";
  const n = seg.length, m = [], t = [];
  for (let i = 0; i < n - 1; i++) { const dx = seg[i + 1][0] - seg[i][0]; m[i] = dx ? (seg[i + 1][1] - seg[i][1]) / dx : 0; }
  t[0] = m[0]; t[n - 1] = m[n - 2];
  for (let i = 1; i < n - 1; i++) t[i] = m[i - 1] * m[i] <= 0 ? 0 : (m[i - 1] + m[i]) / 2;
  for (let i = 0; i < n - 1; i++) {
    if (!m[i]) { t[i] = t[i + 1] = 0; continue; }
    const a = t[i] / m[i], b = t[i + 1] / m[i], h = a * a + b * b;
    if (h > 9) { const k = 3 / Math.sqrt(h); t[i] = k * a * m[i]; t[i + 1] = k * b * m[i]; }
  }
  let d = `M${seg[0][0]},${seg[0][1]}`;
  for (let i = 0; i < n - 1; i++) {
    const [x0, y0] = seg[i], [x1, y1] = seg[i + 1], h = (x1 - x0) / 3;
    d += ` C${(x0 + h).toFixed(1)},${(y0 + t[i] * h).toFixed(1)} ${(x1 - h).toFixed(1)},${(y1 - t[i + 1] * h).toFixed(1)} ${x1},${y1}`;
  }
  return d;
}
function caminhos(pts, base, fab, suave) {
  let g = "", seg = [];
  const fecha = () => {
    if (seg.length > 1) {
      const lin = suave ? curva(seg) : "M" + seg.map((q) => q.join(",")).join(" L");
      g += `<path class="sp-area" fill="url(#ga-f${fab})" d="${lin} L${seg[seg.length - 1][0]},${base} L${seg[0][0]},${base} Z"/><path class="sp-line f${fab}" d="${lin}"/>`;
    }
    seg = [];
  };
  for (const q of pts) { if (q === null) fecha(); else seg.push(q); }
  fecha();
  return g;
}
function rotuloX(x, w) { return Math.max(15, Math.min(w - 15, x)).toFixed(1); }
function sparkRitmo(serie, fab, sw, ymax, tipDe) {
  const base = 30, top = 3, px = 4, H = 43, n = serie.length;
  const x = (i) => +(px + (n > 1 ? i / (n - 1) : 0.5) * (sw - 2 * px)).toFixed(1);
  const y = (v) => +(base - (v / ymax) * (base - top)).toFixed(1);
  let g = `<line class="sp-base" x1="0" x2="${sw}" y1="${base}" y2="${base}"/>`;
  g += caminhos(serie.map((q, i) => (q.v === null ? null : [x(i), y(q.v)])), base, fab);
  const cols = serie.map((q, i) => (q.coleta ? i : -1)).filter((i) => i >= 0);
  const pos = rotular(cols.map((i) => x(i)), 30, 1);
  cols.forEach((i, k) => {
    g += `<circle class="sp-dot f${fab}" cx="${x(i)}" cy="${base}" r="3.5"/>`;
    if (pos[k] === 0) g += `<text class="sp-dt" x="${rotuloX(x(i), sw)}" y="${H - 2}" text-anchor="middle">${fmtCurto(serie[i].data)}</text>`;
  });
  cols.forEach((i) => { g += `<circle class="hit" cx="${x(i)}" cy="${base}" r="11" data-tip="${tipDe(serie[i])}"/>`; });
  return `<svg class="spark" width="${sw}" height="${H}" viewBox="0 0 ${sw} ${H}" aria-hidden="true">${g}</svg>`;
}
function sparkRes(ord, dom, fab, c, sw, faixa) {
  const base = 30, top = 3, px = 5, H = 43, lim = LIM[c];
  const t0 = utc(dom.ini), t1 = utc(dom.fim);
  const x = (s) => +(px + ((utc(s) - t0) / (t1 - t0)) * (sw - 2 * px)).toFixed(1);
  const y = (v) => +(base - ((v - faixa.lo) / (faixa.hi - faixa.lo)) * (base - top)).toFixed(1);
  let g = "";
  for (const lv of [lim.min, lim.max]) if (lv !== null && lv > faixa.lo && lv < faixa.hi) g += `<line class="lim" x1="0" x2="${sw}" y1="${y(lv)}" y2="${y(lv)}"/>`;
  g += `<line class="sp-base" x1="0" x2="${sw}" y1="${base}" y2="${base}"/>`;
  g += caminhos(ord.map((a) => [x(a.data), y(a.v)]), base, fab, true);
  const pos = rotular(ord.map((a) => x(a.data)), 30, 1);
  ord.forEach((a, k) => {
    g += `<circle class="sp-dot ${a.fora ? "fora" : "f" + fab}" cx="${x(a.data)}" cy="${y(a.v)}" r="3.5"/>`;
    if (pos[k] === 0) g += `<text class="sp-dt" x="${rotuloX(x(a.data), sw)}" y="${H - 2}" text-anchor="middle">${fmtCurto(a.data)}</text>`;
  });
  ord.forEach((a) => { g += `<circle class="hit" cx="${x(a.data)}" cy="${y(a.v)}" r="11" data-tip="${a.tip}"/>`; });
  return `<svg class="spark" width="${sw}" height="${H}" viewBox="0 0 ${sw} ${H}" aria-hidden="true">${g}</svg>`;
}
function grande(cfg) {
  const { id, W, pts, dom, fab, faixa } = cfg;
  const H = cfg.h || 230, ml = 36, mr = 14, mt = 14, mb = 46, iw = W - ml - mr, ih = H - mt - mb, base = mt + ih;
  let lo = cfg.lo ?? 0, hi = cfg.hi;
  const step = passoBom(hi - lo, 4);
  lo = Math.floor(lo / step) * step; hi = Math.ceil(hi / step) * step;
  const t0 = utc(dom.ini), t1 = utc(dom.fim);
  const x = (s) => +(ml + ((utc(s) - t0) / (t1 - t0)) * iw).toFixed(1);
  const y = (v) => +(mt + (1 - (v - lo) / (hi - lo)) * ih).toFixed(1);
  let g = "";
  for (let i = 0, v = lo; v <= hi + step / 1000; i++, v = lo + i * step) {
    const yy = y(v);
    if (i > 0) g += `<line class="ax-g" x1="${ml}" x2="${ml + iw}" y1="${yy}" y2="${yy}"/>`;
    g += `<text class="ax-t" x="${ml - 6}" y="${yy}" text-anchor="end" dominant-baseline="middle">${fmtEixo(v)}</text>`;
  }
  g += `<line class="ax-b" x1="${ml}" x2="${ml + iw}" y1="${base}" y2="${base}"/>`;
  if (faixa) for (const [lv, nome] of [[faixa.min, "mín."], [faixa.max, "máx."]]) {
    if (lv === null || lv === undefined || lv <= lo || lv >= hi) continue;
    g += `<line class="lim" x1="${ml}" x2="${ml + iw}" y1="${y(lv)}" y2="${y(lv)}"/><text class="lim-t" x="${ml + iw}" y="${y(lv) - 4}" text-anchor="end">${nome} ${fmtEixo(lv)}</text>`;
  }
  const marcas = pts.filter((q) => q.marca);
  for (const q of marcas) g += `<line class="mk f${fab}" x1="${x(q.data)}" x2="${x(q.data)}" y1="${mt}" y2="${base}"/>`;
  g += caminhos(pts.map((q) => (q.v === null ? null : [x(q.data), y(q.v)])), base, fab, !!faixa);
  for (const q of marcas) g += `<circle class="sp-dot ${q.fora ? "fora" : "f" + fab}" cx="${x(q.data)}" cy="${y(q.v ?? lo)}" r="4.5"/>`;
  const pos = rotular(marcas.map((q) => x(q.data)), 32, 2);
  marcas.forEach((q, k) => {
    if (pos[k] < 0) return;
    g += `<text class="mk-t" x="${Math.max(ml, Math.min(ml + iw, x(q.data))).toFixed(1)}" y="${base + 18 + pos[k] * 15}" text-anchor="middle">${fmtCurto(q.data)}</text>`;
  });
  if (!marcas.length || marcas[0].data !== dom.ini) g += `<text class="ax-t" x="${ml}" y="${H - 2}" text-anchor="start">${fmtCurto(dom.ini)}</text>`;
  g += `<text class="ax-t" x="${ml + iw}" y="${H - 2}" text-anchor="end">${dom.fim === hojeISO() ? "hoje" : fmtCurto(dom.fim)}</text>`;
  g += `<line class="xh" x1="0" x2="0" y1="${mt}" y2="${base}" style="display:none"/><circle class="xh-dot f${fab}" r="5" cx="0" cy="0" style="display:none"/>`;
  G.charts[id] = { W, base, pts: pts.map((q) => ({ x: x(q.data), y: q.v === null ? null : y(q.v), tip: q.tip })) };
  return `<svg class="big" data-g="${id}" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(cfg.rotulo)}">${g}</svg>`;
}

const ICO_BALDE = SVG_A + '<path d="M5 8h14l-1.6 11.2a2 2 0 0 1-2 1.8H8.6a2 2 0 0 1-2-1.8z"/><path d="M4 8a8 3 0 0 1 16 0"/></svg>';
const ICO_GOTA = SVG_A + '<path d="M12 3c-3 4.4-6 7.6-6 11a6 6 0 0 0 12 0c0-3.4-3-6.6-6-11z"/></svg>';
const ICO_FRASCO = SVG_A + '<path d="M9 3h6M10 3v6L5 18a2 2 0 0 0 1.8 3h10.4A2 2 0 0 0 19 18l-5-9V3"/><path d="M7.5 14h9"/></svg>';
const ICO_SINO = SVG_A + '<path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2h-15z"/><path d="M10 21a2 2 0 0 0 4 0"/></svg>';
const ICO_RELOGIO = SVG_A + '<circle cx="12" cy="12" r="9"/><path d="M12 7.5V12l3 2"/></svg>';
const ICO_CALENDARIO = SVG_A + '<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>';
const ILU_VAZIO = '<svg class="al-ilu" viewBox="0 0 120 120" aria-hidden="true"><circle class="i-fundo" cx="60" cy="60" r="56"/><rect class="i-papel" x="35" y="28" width="50" height="66" rx="9"/><rect class="i-papel" x="48" y="22" width="24" height="12" rx="4"/><path class="i-linha" d="M46 46h28M46 55h18"/><path d="M60 62c-5.2 6.6-9.5 11.2-9.5 16.4a9.5 9.5 0 0 0 19 0c0-5.2-4.3-9.8-9.5-16.4z" fill="url(#g-anel)"/></svg>';
function mediaDe(lista) { return lista.length ? lista.reduce((a, b) => a + b, 0) / lista.length : null; }
function areaSerie(cfg) {
  const { id, W, series, dom, c } = cfg;
  const H = 240, ml = 36, mr = 14, mt = 16, mb = 30, iw = W - ml - mr, ih = H - mt - mb, base = mt + ih;
  const vs = series.flatMap((x) => x.pts.map((q) => q.v));
  if (!vs.length) return "";
  const fx = dominioParam(c, vs);
  let lo = fx.lo, hi = fx.hi;
  const step = passoBom(hi - lo, 4);
  lo = Math.floor(lo / step) * step; hi = Math.ceil(hi / step) * step;
  const t0 = utc(dom.ini), t1 = utc(dom.fim);
  const x = (d) => +(ml + ((utc(d) - t0) / (t1 - t0)) * iw).toFixed(1);
  const y = (v) => +(mt + (1 - (v - lo) / (hi - lo)) * ih).toFixed(1);
  let g = "";
  for (let i = 0, v = lo; v <= hi + step / 1000; i++, v = lo + i * step) {
    const yy = y(v);
    g += `<line class="${i ? "ax-g" : "ax-b"}" x1="${ml}" x2="${ml + iw}" y1="${yy}" y2="${yy}"/><text class="ax-t" x="${ml - 6}" y="${yy}" text-anchor="end" dominant-baseline="middle">${fmtEixo(v)}</text>`;
  }
  const lim = LIM[c];
  for (const [lv, nome] of [[lim.min, "mín."], [lim.max, "máx."]]) {
    if (lv === null || lv <= lo || lv >= hi) continue;
    g += `<line class="lim" x1="${ml}" x2="${ml + iw}" y1="${y(lv)}" y2="${y(lv)}"/><text class="lim-t" x="${ml + iw}" y="${y(lv) - 4}" text-anchor="end">${nome} ${fmtEixo(lv)}</text>`;
  }
  const nX = W < 420 ? 3 : W < 700 ? 5 : 7;
  for (let i = 0; i < nX; i++) {
    const d = isoUtc(Math.round((t0 + (t1 - t0) * i / (nX - 1)) / 86400000) * 86400000);
    g += `<text class="ax-t" x="${x(d)}" y="${H - 6}" text-anchor="${i === 0 ? "start" : i === nX - 1 ? "end" : "middle"}">${semana(d)} ${fmtCurto(d)}</text>`;
  }
  for (const se of series) {
    const seg = se.pts.map((q) => [x(q.data), y(q.v)]);
    if (seg.length > 1) {
      const lin = curva(seg);
      g += `<path class="sp-area" fill="url(#ga-f${se.fab})" d="${lin} L${seg[seg.length - 1][0]},${base} L${seg[0][0]},${base} Z"/><path class="area-l f${se.fab}" d="${lin}"/>`;
    }
    for (const q of se.pts) g += `<circle class="sp-dot ${q.fora ? "fora" : "f" + se.fab}" cx="${x(q.data)}" cy="${y(q.v)}" r="3.5"/>`;
  }
  const datas = [...new Set(series.flatMap((se) => se.pts.map((q) => q.data)))].sort();
  g += `<line class="xh" x1="0" x2="0" y1="${mt}" y2="${base}" style="display:none"/><circle class="xh-dot" r="0" cx="0" cy="0" style="display:none"/>`;
  G.charts[id] = { W, base, pts: datas.map((d) => ({ x: x(d), y: null, tip: cfg.tipDe(d) })) };
  return `<svg class="big" data-g="${id}" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(cfg.rotulo)}">${g}</svg>`;
}
function barrasSemana(cfg) {
  const { W, semanas, tip } = cfg;
  const H = 230, ml = 30, mr = 10, mt = 14, mb = 30, iw = W - ml - mr, ih = H - mt - mb, base = mt + ih;
  const max = Math.max(1, ...semanas.flatMap((s) => [0, 1, 2].map((f) => s.n[f])));
  const step = passoBom(max, 4), hi = Math.ceil(max / step) * step;
  const y = (v) => +(mt + (1 - v / hi) * ih).toFixed(1);
  let g = "";
  for (let i = 0, v = 0; v <= hi + step / 1000; i++, v = i * step) g += `<line class="${i ? "ax-g" : "ax-b"}" x1="${ml}" x2="${ml + iw}" y1="${y(v)}" y2="${y(v)}"/><text class="ax-t" x="${ml - 6}" y="${y(v)}" text-anchor="end" dominant-baseline="middle">${v}</text>`;
  const gw = iw / Math.max(1, semanas.length), bw = Math.max(4, Math.min(18, (gw - 14) / 3 - 2));
  semanas.forEach((s, k) => {
    const cx = ml + gw * k + gw / 2, x0 = cx - (bw * 3 + 4) / 2;
    [1, 2, 0].forEach((f, j) => {
      const v = s.n[f], bx = x0 + j * (bw + 2), by = y(v), h = base - by, r = Math.min(4, h / 2, bw / 2);
      if (v > 0) g += `<path class="barra f${f}" d="M${bx.toFixed(1)},${base} V${(by + r).toFixed(1)} Q${bx.toFixed(1)},${by} ${(bx + r).toFixed(1)},${by} H${(bx + bw - r).toFixed(1)} Q${(bx + bw).toFixed(1)},${by} ${(bx + bw).toFixed(1)},${(by + r).toFixed(1)} V${base} Z"/>`;
    });
    g += `<rect class="hit" x="${(cx - gw / 2).toFixed(1)}" y="${mt}" width="${gw.toFixed(1)}" height="${ih}" data-tip="${tip(s)}"/>`;
    g += `<text class="ax-t" x="${cx.toFixed(1)}" y="${H - 8}" text-anchor="middle">${fmtCurto(s.ini)}</text>`;
  });
  return `<svg class="big" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Coletas por semana">${g}</svg>`;
}
function encaixarAlertas() {
  const card = document.querySelector("#v-graficos .alertas-card"); if (!card) return;
  const extras = [...card.querySelectorAll(".al-extra")], wrap = card.querySelector(".al-parados-wrap");
  if (!extras.length) return;
  const linha = card.parentElement, lado = linha.firstElementChild;
  if (getComputedStyle(linha).gridTemplateColumns.trim().split(/\s+/).length < 2) { extras.slice(3).forEach((x) => { x.hidden = true; }); return; }
  linha.style.alignItems = "start";
  const alvo = lado.offsetHeight;
  while (card.offsetHeight > alvo && extras.length) extras.pop().hidden = true;
  linha.style.alignItems = "";
  wrap.hidden = !card.querySelector(".al-extra:not([hidden])");
}
function renderGraficos() {
  const el = $("#v-graficos");
  if (!S.pronto || el.hidden) return;
  const dom = periodoG();
  const info = {};
  for (const p of S.config.pontos) info[p.id] = p;
  for (const d of Object.values(S.dias)) for (const it of d.itens || []) if (!info[it.ponto]) info[it.ponto] = { id: it.ponto, setor: it.setor, tipo: it.tipo, fabrica: it.fabrica, ativo: false };
  if (G.ponto && !info[G.ponto]) G.ponto = "";
  const diasP = Object.values(S.dias).filter((d) => d.data >= dom.ini && d.data <= dom.fim);
  const todas = {}, noPeriodo = {};
  for (const d of Object.values(S.dias)) for (const it of d.itens || []) {
    (todas[it.ponto] = todas[it.ponto] || []).push(d.data);
    if (d.data >= dom.ini && d.data <= dom.fim) noPeriodo[it.ponto] = (noPeriodo[it.ponto] || 0) + 1;
  }
  for (const k in todas) todas[k].sort();
  const series = {};
  for (const id in info) series[id] = serieRitmo(todas[id] || [], dom);
  G.tips = []; G.charts = {};
  const tip = (o) => { G.tips.push(o); return G.tips.length - 1; };
  const L = layoutSpark(el);
  const vars = `style="--lw:${L.lw}px"`;
  const tipRitmo = (p) => (q) => tip({ valor: q.coleta ? "Coleta feita" : q.v === null ? "Sem coleta registrada" : q.v + (q.v === 1 ? " dia sem coleta" : " dias sem coleta"), titulo: p.setor + " · " + p.tipo, sub: diaLongo(q.data), extra: "", serie: p.fabrica });

  const amostras = [], linhas = [];
  for (const d of diasP.slice().sort((a, b) => (a.data < b.data ? 1 : -1))) for (const it of d.itens || []) {
    let tem = false;
    for (const pr of PARAM) {
      const v = num(it[pr.c]); if (v === null) continue;
      tem = true;
      const fo = fora(pr.c, v);
      amostras.push({ c: pr.c, data: d.data, ponto: it.ponto, setor: it.setor, tipo: it.tipo, fab: it.fabrica, v, fora: fo,
        tip: tip({ valor: pr.titulo + ": " + fmtNum(v) + (pr.un ? " " + pr.un : ""), titulo: it.setor + " · " + it.tipo, sub: diaLongo(d.data), extra: fo ? "fora da faixa" : "", serie: it.fabrica }) });
    }
    if (tem && (!G.ponto || it.ponto === G.ponto)) linhas.push({ d, it });
  }

  const opts = [0, 1, 2].map((f) => {
    const ps = Object.values(info).filter((p) => p.fabrica === f);
    return ps.length ? `<optgroup label="${nomeLocal(f)}">${ps.map((p) => `<option value="${p.id}" ${G.ponto === p.id ? "selected" : ""}>${esc(p.setor + " · " + p.tipo)}${p.ativo === false ? " (fora do rodízio)" : ""}</option>`).join("")}</optgroup>` : "";
  }).join("");
  let html = `<div class="filtros">
    <label class="field" for="g-periodo"><span>Período</span><select id="g-periodo">
      <option value="30" ${G.periodo === "30" ? "selected" : ""}>30 dias</option>
      <option value="90" ${G.periodo === "90" ? "selected" : ""}>90 dias</option>
      <option value="tudo" ${G.periodo === "tudo" ? "selected" : ""}>Tudo</option>
    </select></label>
    <label class="field" for="g-ponto"><span>Ponto</span><select id="g-ponto"><option value="">Todos os pontos</option>${opts}</select></label>
  </div>
  <p class="hint">De ${fmt(dom.ini)} a ${fmt(dom.fim)}: ${diasP.filter((d) => !d.semColeta).length} ${diasP.filter((d) => !d.semColeta).length === 1 ? "dia" : "dias"} com coleta.${G.ponto ? "" : " Toque num ponto para ver o gráfico dele em detalhe."}</p>`;
  {
    const larg = Math.floor(el.clientWidth), desk = window.matchMedia("(min-width: 900px)").matches;
    const nRes = amostras.length, nForaRes = amostras.filter((a) => a.fora).length;
    const itensP = diasP.filter((d) => !d.semColeta).flatMap((d) => (d.itens || []).map((it) => ({ d: d.data, it })));
    const med = (c) => mediaDe(amostras.filter((a) => a.c === c).map((a) => a.v));
    const mCl = med("cloro"), mPh = med("ph");
    html += `<div class="kpis">
      <div class="kpi"><span class="kpi-ico">${ICO_BALDE}</span><div><small>Coletas no período</small><b>${itensP.length}</b><span class="kpi-sub">em ${diasP.filter((d) => !d.semColeta).length} dias</span></div></div>
      <div class="kpi"><span class="kpi-ico">${ICO_GOTA}</span><div><small>Cloro livre médio</small><b>${mCl === null ? "–" : fmtNum(+mCl.toFixed(2))}<em>mg/L</em></b><span class="kpi-sub">normal: 0,2 a 5</span></div></div>
      <div class="kpi"><span class="kpi-ico">${ICO_FRASCO}</span><div><small>pH médio</small><b>${mPh === null ? "–" : fmtNum(+mPh.toFixed(1))}</b><span class="kpi-sub">normal: 6 a 9</span></div></div>
      <div class="kpi"><span class="kpi-ico ${nForaRes ? "bad" : "ok"}">${nForaRes ? ICO_ALERTA : ICO_OK}</span><div><small>Fora do normal</small><b>${nForaRes}</b><span class="kpi-sub">${nRes ? "de " + nRes + (nRes === 1 ? " medição" : " medições") : "nenhuma medição anotada"}</span></div></div>
    </div>`;

    const hojeD = hojeISO(), ultH = ultimas(hojeD, true);
    const fila = [1, 2].flatMap((f) => filaDe(f, ultH, hojeD));
    const niv = fila.map((e) => nivelPonto(e.p, e.dias));
    const nOk = niv.filter((v) => v === "ok").length, nAt = niv.filter((v) => v === "warn").length, nBad = niv.filter((v) => v === "bad").length;
    const pct = fila.length ? nOk / fila.length : 0, CG = 2 * Math.PI * 70;
    const anel = `<div class="chart anel-card"><div class="chart-head" style="width:100%"><h2>Pontos em dia</h2></div>
      <div class="anel-grande"><svg viewBox="0 0 170 170" aria-hidden="true"><circle class="anel-fundo" cx="85" cy="85" r="70"/><circle class="anel-valor" cx="85" cy="85" r="70" transform="rotate(-90 85 85)" stroke-dasharray="${(CG * pct).toFixed(1)} ${CG.toFixed(1)}" ${pct ? "" : 'style="stroke:none"'}/></svg><b>${Math.round(pct * 100)}%</b></div>
      <p class="hint">${nOk} de ${fila.length} pontos coletados dentro do intervalo do rodízio.<br>${nAt} em atenção · ${nBad} ${nBad === 1 ? "atrasado" : "atrasados"}</p></div>`;

    const pr = PARAM.find((x) => x.c === G.param) || PARAM[0];
    const doParam = amostras.filter((a) => a.c === pr.c);
    const porLocal = [1, 2, 0].map((f) => {
      const porDia = {};
      for (const a of doParam.filter((a) => a.fab === f)) (porDia[a.data] = porDia[a.data] || []).push(a);
      return { fab: f, pts: Object.keys(porDia).sort().map((d) => ({ data: d, v: +mediaDe(porDia[d].map((a) => a.v)).toFixed(2), fora: porDia[d].some((a) => a.fora) })) };
    }).filter((x) => x.pts.length);
    const tipDia = (d) => tip({ valor: diaLongo(d), titulo: "", sub: pr.titulo + (pr.un ? " (" + pr.un + ")" : ""), extra: "", serie: 1,
      linhas: porLocal.map((se) => { const q = se.pts.find((x) => x.data === d); return q ? { serie: se.fab, txt: fmtNum(q.v) + (q.fora ? " · fora do normal" : ""), nome: nomeLocal(se.fab) } : null; }).filter(Boolean) });
    const wArea = Math.max(240, Math.floor((desk ? (larg - 14) * 2 / 3 : larg) - 30));
    const area = `<div class="chart"><div class="chart-head"><h2>${pr.titulo} ao longo do tempo</h2><div class="seg seg-param" role="radiogroup" aria-label="O que mostrar">${PARAM.map((x) => `<button type="button" role="radio" id="g-par-${x.c}" data-param="${x.c}" aria-checked="${pr.c === x.c}">${x.titulo}</button>`).join("")}</div></div>
      ${porLocal.length ? chavesHTML(new Set(porLocal.map((x) => x.fab))) + areaSerie({ id: "area", W: wArea, series: porLocal, dom, c: pr.c, tipDe: tipDia, rotulo: pr.titulo + " por local ao longo do tempo" }) + '<p class="hint">Média do dia em cada local. Passe o dedo ou o mouse para ver os valores; as linhas tracejadas vermelhas marcam os limites.</p>' : `<div class="empty"><b>Nenhuma medição de ${pr.titulo.toLowerCase()} neste período</b><span class="hint">Anote os resultados ao marcar os pontos na aba Coleta.</span></div>`}</div>`;
    html += `<div class="dash d2">${anel}${area}</div>`;

    const semanas = [];
    for (let t = utc(dom.ini) - ((new Date(utc(dom.ini)).getUTCDay() + 6) % 7) * 86400000; t <= utc(dom.fim); t += 7 * 86400000) {
      const ini = isoUtc(t), fim = isoUtc(t + 6 * 86400000), n = { 0: 0, 1: 0, 2: 0 };
      for (const x of itensP) if (x.d >= ini && x.d <= fim) n[[0, 1, 2].includes(x.it.fabrica) ? x.it.fabrica : 0]++;
      semanas.push({ ini, fim, n });
    }
    const wBar = Math.max(240, Math.floor((desk ? (larg - 14) * 3 / 5 : larg) - 30));
    const barras = `<div class="chart"><div class="chart-head"><h2>Coletas por semana</h2></div>${chavesHTML(new Set([1, 2, 0]))}${barrasSemana({ W: wBar, semanas, tip: (s) => tip({ valor: "Semana de " + fmtCurto(s.ini) + " a " + fmtCurto(s.fim), titulo: "", sub: "coletas", extra: "", serie: 1, linhas: [1, 2, 0].map((f) => ({ serie: f, nome: nomeLocal(f), txt: String(s.n[f]) })) }) })}</div>`;

    const alertas = [];
    for (const a of amostras.filter((a) => a.fora).slice(0, 3)) {
      const pa = PARAM.find((x) => x.c === a.c) || {};
      alertas.push({ k: "bad", ico: ICO_ALERTA, t: `${pa.titulo}: ${fmtNum(a.v)}${pa.un ? " " + pa.un : ""}, fora do normal`, s: `${a.fab ? "Fábrica " + a.fab + " · " : ""}${a.setor} · ${a.tipo} · ${fmtCurto(a.data)}` });
    }
    const antes = ultimoDia(addDias(hojeD, 1)), lac = antes ? diasUteisEntre(antes.data, hojeD) : 0;
    if (lac >= 2) alertas.push({ k: "warn", ico: ICO_CALENDARIO, t: `${lac} dias úteis sem registro`, s: `Último registro em ${fmtCurto(antes.data)}`, a: `<button class="link" type="button" data-ir="${proxDiaUtil(antes.data)}">Lançar</button>` });
    if (nBad) alertas.push({ k: "warn", ico: ICO_RELOGIO, t: `${nBad} ${nBad === 1 ? "ponto atrasado" : "pontos atrasados"} no rodízio`, s: "Passaram do prazo sem coleta", a: '<button class="link" type="button" data-aba="pontos">Ver agenda</button>' });
    for (const e of fila) { const av = avisoNC(e.p.id, e.ult, hojeD); if (av) alertas.push({ k: "warn", ico: ICO_ALERTA, t: `${e.p.setor} · ${e.p.tipo}`, s: `${e.p.fabrica ? "Fábrica " + e.p.fabrica + " · " : ""}${av.motivo.toLowerCase()} desde ${fmtCurto(av.data)}` }); }
    if (!alertas.length) alertas.push({ k: "ok", ico: ICO_OK, t: "Tudo em ordem", s: nRes ? "Resultados normais e rodízio em dia." : "Rodízio em dia." });
    const temColeta = Object.values(S.dias).some((d) => !d.semColeta && (d.itens || []).length);
    const nAl = alertas.filter((x) => x.k !== "ok").length, kAl = !temColeta ? "" : alertas.some((x) => x.k === "bad") ? "bad" : nAl ? "warn" : "ok";
    let corpoAl;
    if (!temColeta) {
      corpoAl = `<div class="al-vazio">${ILU_VAZIO}<b>Nenhuma coleta registrada ainda</b><p class="hint">Lance a primeira coleta para ver aqui os resultados fora do normal e os pontos atrasados.</p><button class="btn primary" type="button" data-aba="hoje">Lançar coleta</button></div>`;
    } else {
      const prox = simularAgenda().agenda.find((x) => !x.semColeta);
      const rodape = !nRes
        ? `<div class="al-rodape">${ICO_FRASCO}<span>Anote <b>cloro, pH e turbidez</b> ao lançar as coletas para receber alertas de resultado aqui.</span></div>`
        : prox ? `<div class="al-rodape">${ICO_CALENDARIO}<span>Próxima coleta: <b>${quandoTxt(prox.data)}, Fábrica ${prox.fab}</b></span><button class="link" type="button" data-ir="${prox.data}">Ver os pontos</button></div>` : "";
      const ordemN = { bad: 0, warn: 1, ok: 2 };
      const parados = fila.map((e, i) => ({ e, nv: niv[i] })).sort((a, b) => (ordemN[a.nv] - ordemN[b.nv]) || (b.e.dias - a.e.dias)).slice(0, 8);
      const paradosHTML = parados.length ? `<div class="al-parados-wrap"><div class="al-sub">${nBad ? "Mais atrasados" : "Mais tempo sem coleta"}</div><ul class="al-parados">${parados.map(({ e, nv }) => `<li class="al-extra ${nv}"><span>${esc(e.p.setor)} · ${esc(e.p.tipo)}</span><small>Fábrica ${e.p.fabrica} · ${e.dias === Infinity ? "nunca coletado" : e.dias === 0 ? "hoje" : "há " + e.dias + (e.dias === 1 ? " dia" : " dias")}</small></li>`).join("")}</ul></div>` : "";
      corpoAl = `<ul class="alertas">${alertas.slice(0, 6).map((x) => `<li><span class="al-ico ${x.k}">${x.ico}</span><span class="al-txt"><b>${esc(x.t)}</b><small>${esc(x.s)}</small></span>${x.a || ""}</li>`).join("")}</ul>${paradosHTML}${rodape}`;
    }
    const alertasHTML = `<div class="chart alertas-card"><div class="chart-head"><h2 class="h-ico"><span class="al-ico ${kAl}">${ICO_SINO}</span>Alertas</h2>${nAl && temColeta ? `<span class="al-n ${kAl}" aria-label="${nAl} ${nAl === 1 ? "alerta" : "alertas"}">${nAl}</span>` : ""}</div>${corpoAl}</div>`;
    html += `<div class="dash d2b">${barras}${alertasHTML}</div>`;
  }

  if (G.ponto) {
    const p = info[G.ponto], se = series[G.ponto], u = (todas[G.ponto] || []).filter((d) => d <= dom.fim).pop();
    const n = noPeriodo[G.ponto] || 0, tr = tipRitmo(p);
    const vmax = Math.max(7, ...se.map((q) => q.v ?? 0));
    html += `<div class="chart det" id="det">
      <div class="chart-head"><div><h2>${esc(p.setor + " · " + p.tipo)}</h2><span class="hint">${nomeLocal(p.fabrica)} · ${n} ${n === 1 ? "coleta" : "coletas"} no período${u ? ", a última em " + fmt(u) : ""}</span></div><button type="button" class="icon-btn" data-sel="" aria-label="Fechar o gráfico do ponto" title="Fechar">${ICO_X}</button></div>
`;
    let temRes = false;
    for (const pr of PARAM) {
      const lista = amostras.filter((a) => a.ponto === G.ponto && a.c === pr.c).sort((a, b) => (a.data < b.data ? -1 : 1));
      if (!lista.length) continue;
      temRes = true;
      const fx = dominioParam(pr.c, lista.map((a) => a.v));
      html += `<h3>${pr.titulo}${pr.un ? ` <span class="un">${pr.un}</span>` : ""}</h3>` + grande({ id: "r-" + pr.c, h: 180, W: L.inner, dom, fab: p.fabrica, lo: fx.lo, hi: fx.hi, faixa: LIM[pr.c], rotulo: pr.titulo + " de " + p.setor + " " + p.tipo, pts: lista.map((a) => ({ data: a.data, v: a.v, marca: true, fora: a.fora, tip: a.tip })) });
    }
    if (!temRes) html += `<div class="note info">${ICO_INFO}<div class="note-txt"><span>Este ponto ainda não tem cloro, pH ou turbidez registrados no período. Preencha os resultados ao salvar a coleta na aba Coleta, ou em Histórico, tocando no cartão do dia.</span></div></div>`;
    html += `<h3>Dias sem coleta</h3>
      <p class="hint">A área sobe a cada dia sem coleta e volta a zero no dia em que o ponto é coletado. Cada linha vertical é uma coleta, com a data embaixo.</p>
      ${grande({ id: "ritmo", W: L.inner, dom, fab: p.fabrica, hi: vmax, rotulo: "Dias sem coleta de " + p.setor + " " + p.tipo, pts: se.map((q) => ({ data: q.data, v: q.v, marca: q.coleta, tip: tr(q) })) })}
    </div>`;
  }

  const iRitmo = html.length;
  const grupos = [1, 2, 0].map((f) => ({ f, ps: Object.values(info).filter((p) => p.fabrica === f && (p.ativo !== false || noPeriodo[p.id])) })).filter((g) => g.ps.length);
  const ymax = Math.max(7, ...grupos.flatMap((g) => g.ps.flatMap((p) => series[p.id].map((q) => q.v ?? 0))));
  html += `<details class="chart" id="d-ritmo" ${G.ritmoAberto ? "open" : ""}><summary class="chart-head"><h2>Quando cada ponto foi coletado</h2></summary><div class="chart-in">
    <p class="hint">Cada bolinha é uma coleta, com a data embaixo. A área cresce enquanto o ponto fica sem coleta.</p>${chavesHTML(new Set(grupos.map((g) => g.f)))}`;
  for (const g of grupos) {
    html += `<h3>${nomeLocal(g.f)}</h3><div class="sp-list" ${vars}>` + g.ps.map((p) => {
      const se = series[p.id], ult = se[se.length - 1].v, n = noPeriodo[p.id] || 0;
      return `<div class="sp-row${G.ponto === p.id ? " sel" : ""}" data-sel="${p.id}" role="button" tabindex="0" aria-pressed="${G.ponto === p.id}">
        <span class="sp-lbl"><i class="k f${p.fabrica}"></i><span>${esc(p.setor)}<small>${esc(p.tipo)}<span aria-hidden="true"> · ${n}×</span></small></span></span>
        <span class="sp-graf"><span class="sp-top"><b aria-hidden="true">${ult === null ? "nunca" : ult === 0 ? "hoje" : "há " + ult + " d"}</b><span class="vh">: ${n} coletas no período${ult === null ? "" : ", " + ult + " dias sem coleta"}</span></span>${sparkRitmo(se, p.fabrica, L.sw, ymax, tipRitmo(p))}</span>
      </div>`;
    }).join("") + "</div>";
  }
  html += "</div></details>";

  const iRes = html.length;
  html += '<div class="chart"><div class="chart-head"><h2>Resultados por ponto</h2><span class="un">' + esc((PARAM.find((x) => x.c === G.param) || PARAM[0]).titulo) + '</span></div>';
  if (!amostras.length) {
    html += `<div class="empty"><b>Ainda não há resultados neste período</b><span class="hint">Aqui aparecem o cloro livre (mg/L), o pH e a turbidez (uT) de cada ponto ao longo do tempo, com os limites da Portaria GM/MS 888/2021 marcados. Para preencher, marque o ponto na aba Coleta e digite os valores medidos. Para coletas já salvas, abra o Histórico e toque no cartão do dia.</span><span class="actions"><button type="button" class="btn small" data-aba="hoje">Ir para Coleta</button><button type="button" class="btn small" data-aba="historico">Abrir Histórico</button></span></div>`;
  } else {
    const pr = PARAM.find((x) => x.c === G.param) || PARAM[0];
    const lista = amostras.filter((a) => a.c === pr.c);
    const nFora = lista.filter((a) => a.fora).length;
    const porPonto = {};
    for (const a of lista) (porPonto[a.ponto] = porPonto[a.ponto] || []).push(a);
    const ids = Object.values(info).sort((a, b) => a.fabrica - b.fabrica).map((p) => p.id).filter((id) => porPonto[id]);
    html += `<div class="res-resumo"><span>${lista.length} ${lista.length === 1 ? "amostra" : "amostras"} · faixa ${LIM[pr.c].ref}${pr.un ? " " + pr.un : ""}</span>${nFora ? `<span class="alerta">${ICO_ALERTA}${nFora} fora da faixa</span>` : ""}</div>`;
    if (!lista.length) html += `<p class="hint">Sem resultados de ${pr.titulo.toLowerCase()} no período.</p>`;
    else {
      const faixa = dominioParam(pr.c, lista.map((a) => a.v));
      html += `<p class="hint">Cada bolinha é uma amostra, com a data embaixo. As linhas tracejadas vermelhas marcam os limites aceitáveis; bolinhas vermelhas estão fora deles.</p>${chavesHTML(new Set(lista.map((a) => a.fab)))}<div class="sp-list" ${vars}>` + ids.map((id) => {
        const p = info[id], ord = porPonto[id].slice().sort((a, b) => (a.data < b.data ? -1 : 1)), u = ord[ord.length - 1];
        return `<div class="sp-row${G.ponto === id ? " sel" : ""}" data-sel="${id}" role="button" tabindex="0" aria-pressed="${G.ponto === id}">
          <span class="sp-lbl"><i class="k f${p.fabrica}"></i><span>${esc(p.setor)}<small>${esc(p.tipo)}</small></span></span>
          <span class="sp-graf"><span class="sp-top${u.fora ? " fora" : ""}"><span class="vh">: último ${pr.titulo}</span><b>${fmtNum(u.v)}</b><small>${pr.un}${u.fora ? '<span aria-hidden="true"> · fora</span>' : ""}</small><span class="vh">em ${fmt(u.data)}${u.fora ? ", fora da faixa" : ""}</span></span>${sparkRes(ord, dom, p.fabrica, pr.c, L.sw, faixa)}</span>
        </div>`;
      }).join("") + "</div>";
    }
    html += `<details class="tabela"><summary>Ver tabela dos resultados (${linhas.length} ${linhas.length === 1 ? "amostra" : "amostras"})</summary><div class="tbl-wrap"><table class="res-tbl">
      <thead><tr><th>Data</th><th>Local</th><th>Ponto</th><th class="n">Cloro livre</th><th class="n">pH</th><th class="n">Turbidez</th></tr></thead><tbody>
      ${linhas.map(({ d, it }) => `<tr><td>${fmt(d.data)}</td><td>${it.fabrica === 0 ? "Todo dia" : "Fábrica " + it.fabrica}</td><td>${esc(it.setor + " · " + it.tipo)}</td>${PARAM.map((x) => { const v = num(it[x.c]); const fo = v !== null && fora(x.c, v); return `<td class="n${fo ? " fora" : ""}">${v === null ? "" : fmtNum(v) + (fo ? " (fora)" : "")}</td>`; }).join("")}</tr>`).join("")}
      </tbody></table></div></details>`;
  }
  html += "</div>";
  html = html.slice(0, iRitmo) + html.slice(iRes) + html.slice(iRitmo, iRes);
  html += '<div id="g-tip" role="tooltip" hidden></div>';
  el.innerHTML = html;
  encaixarAlertas();
  G.tipAtual = null; G.xhAtivo = null; G.largura = el.clientWidth;
}
function abrirTip(d, r) {
  const tip = $("#g-tip");
  if (!d || !tip) return;
  tip.replaceChildren();
  const sm = document.createElement("small"); sm.textContent = d.sub + (d.extra ? " · " + d.extra : "");
  const l = document.createElement("span"); l.className = "tl";
  const k = document.createElement("i"); k.className = "tip-key f" + d.serie;
  const b = document.createElement("b"); b.textContent = d.valor;
  l.append(k, b);
  const ti = document.createElement("small"); ti.textContent = d.titulo;
  if (d.linhas) {
    const cab = document.createElement("b"); cab.textContent = d.valor;
    const sub = document.createElement("small"); sub.textContent = d.sub;
    tip.append(cab, sub);
    for (const x of d.linhas) {
      const li = document.createElement("span"); li.className = "tip-linha";
      const kk = document.createElement("i"); kk.className = "tip-key f" + x.serie;
      const nome = document.createElement("span"); nome.textContent = x.nome;
      li.append(kk, document.createTextNode(x.txt + " "), nome);
      tip.append(li);
    }
  } else tip.append(sm, l, ti);
  tip.hidden = false;
  const box = $("#v-graficos").getBoundingClientRect();
  const tw = tip.offsetWidth, th = tip.offsetHeight;
  const left = Math.max(0, Math.min((r.left + r.right) / 2 - box.left - tw / 2, box.width - tw));
  let top = r.top - box.top - th - 10; if (top < 0) top = r.bottom - box.top + 10;
  tip.style.left = left + "px"; tip.style.top = top + "px";
}
function mostrarTip(alvo) {
  G.tipAtual = alvo;
  abrirTip(G.tips[Number(alvo.dataset.tip)], alvo.getBoundingClientRect());
}
function crosshair(ev) {
  const svg = ev.target.closest && ev.target.closest("#v-graficos svg[data-g]");
  if (!svg) return false;
  const c = G.charts[svg.dataset.g];
  if (!c || !c.pts.length) return false;
  const r = svg.getBoundingClientRect(), k = r.width / c.W, lx = (ev.clientX - r.left) / k;
  let best = c.pts[0];
  for (const q of c.pts) if (Math.abs(q.x - lx) < Math.abs(best.x - lx)) best = q;
  if (G.xhAtivo && G.xhAtivo !== svg) limparCrosshair();
  const xh = svg.querySelector(".xh"), xd = svg.querySelector(".xh-dot");
  xh.setAttribute("x1", best.x); xh.setAttribute("x2", best.x); xh.style.display = "";
  const yy = best.y ?? c.base;
  if (best.y === null) xd.style.display = "none"; else { xd.setAttribute("cx", best.x); xd.setAttribute("cy", best.y); xd.style.display = ""; }
  G.xhAtivo = svg; G.tipAtual = null;
  const px = r.left + best.x * k, py = r.top + yy * k;
  abrirTip(G.tips[best.tip], { left: px, right: px, top: py - 6, bottom: py + 6 });
  return true;
}
function limparCrosshair() {
  if (G.xhAtivo) for (const e of G.xhAtivo.querySelectorAll(".xh, .xh-dot")) e.style.display = "none";
  G.xhAtivo = null;
}
function esconderTip() { const t = $("#g-tip"); if (t) t.hidden = true; G.tipAtual = null; limparCrosshair(); }

/* ---------- Ações ---------- */
async function salvarSemColeta() {
  if (!S.motivo) { toast("Escolha o motivo."); return; }
  const atual = S.dias[S.data];
  if (atual && !atual.semColeta) { toast("Este dia já tem coleta salva. Para marcar sem coleta, exclua o registro no Histórico."); return; }
  const dia = { data: S.data, semColeta: true, motivo: S.motivo, fabrica: null, itens: [], obs: S.obs.trim(), atualizadoEm: new Date().toISOString() };
  const b = $("#b-semcol"); if (b) b.disabled = true;
  try {
    await salvarDia(dia);
    delete RASC[S.data + "|" + S.fab]; gravarRascunhos();
    S.dirty = false; S.semColAberto = false;
    toast(`${semana(S.data)} ${fmt(S.data)} marcado sem coleta (${S.motivo}).`);
    S.motivo = null; montarRascunho(); renderTudo(); renderHoje();
  } catch (e) { toast(msgErro(e)); if (b) b.disabled = false; }
}
async function salvarHoje() {
  if (S.data > hojeISO()) return;
  const ids = Object.keys(S.sel);
  const ncIds = Object.keys(S.nc).filter((id) => !S.sel[id]);
  if (!ids.length && !ncIds.length) { toast("Marque pelo menos um ponto coletado."); return; }
  const ruins = ids.flatMap((id) => CAMPOS.filter((c) => invalido(S.sel[id][c])).map((c) => pontoInfo(id).setor + " (" + LIM[c].nome + ")"));
  if (ruins.length) { toast("Valor inválido em " + listaNomes(ruins) + ". Use números como 0,8."); return; }
  const itens = ids.map((id) => {
    const p = pontoInfo(id), v = S.sel[id];
    return { ponto: id, setor: p.setor, tipo: p.tipo, fabrica: p.fabrica, cloro: num(v.cloro), ph: num(v.ph), turbidez: num(v.turbidez) };
  }).sort((a, b) => (a.fabrica - b.fabrica) || ((ORDEM_TIPO[a.tipo] ?? 9) - (ORDEM_TIPO[b.tipo] ?? 9)));
  const naoColetados = ncIds.map((id) => { const p = pontoInfo(id); return { ponto: id, setor: p.setor, tipo: p.tipo, fabrica: p.fabrica, motivo: S.nc[id] }; });
  const hora = /^\d{2}:\d{2}$/.test(S.hora) ? S.hora : S.data === hojeISO() ? new Date().toTimeString().slice(0, 5) : "";
  const responsavel = S.resp.trim().slice(0, 60);
  const dia = { data: S.data, fabrica: S.fab, itens, naoColetados, hora, responsavel, obs: S.obs.trim(), atualizadoEm: new Date().toISOString() };
  try { if (responsavel) localStorage.setItem("coleta-agua:resp", responsavel); } catch {}
  const b = $("#b-salvar"); if (b) b.disabled = true;
  try {
    await salvarDia(dia);
    delete RASC[S.data + "|" + S.fab]; gravarRascunhos();
    S.dirty = false; S.fabManual = null;
    const nFora = itens.reduce((n, it) => n + CAMPOS.filter((c) => fora(c, it[c])).length, 0);
    S.salvoMsg = { data: S.data };
    toast(`Coleta de ${fmt(S.data)} salva.` + (nFora ? ` ${nFora} ${nFora === 1 ? "valor fora" : "valores fora"} do normal: avise o responsável.` : ""));
    window.scrollTo(0, 0);
    montarRascunho(); renderTudo();
  } catch (e) {
    toast(msgErro(e));
    if (b) b.disabled = S.soLeitura;
  }
}

function paraCSV(periodo = "tudo") {
  const hoje = hojeISO();
  const dentro = (d) => periodo === "tudo" ? true : periodo === "30" ? d >= addDias(hoje, -29) && d <= hoje : d.slice(0, 7) === periodo;
  const linhas = [["Data", "Fábrica do dia", "Horário", "Responsável", "Setor", "Ponto", "Local", "Situação", "Cloro livre (mg/L)", "pH", "Turbidez (uT)", "Observação"]];
  const dias = Object.values(S.dias).filter((d) => dentro(d.data)).sort((a, b) => (a.data < b.data ? -1 : 1));
  for (const d of dias) {
    if (d.semColeta) { linhas.push([fmt(d.data), "", "", "", "", "", "", "Sem coleta: " + d.motivo, "", "", "", d.obs || ""]); continue; }
    const base = [fmt(d.data), "Fábrica " + d.fabrica, d.hora || "", d.responsavel || ""];
    const itens = (d.itens || []).slice().sort((a, b) => (a.fabrica - b.fabrica) || ((ORDEM_TIPO[a.tipo] ?? 9) - (ORDEM_TIPO[b.tipo] ?? 9)));
    for (const it of itens) linhas.push([...base, it.setor, it.tipo, nomeFab(it.fabrica), "Coletado", fmtNum(it.cloro), fmtNum(it.ph), fmtNum(it.turbidez), d.obs || ""]);
    for (const x of d.naoColetados || []) linhas.push([...base, x.setor, x.tipo, nomeFab(x.fabrica), "Não coletado: " + x.motivo, "", "", "", d.obs || ""]);
  }
  return "﻿" + linhas.map((l) => l.map((c) => { const s = String(c ?? ""); const s2 = /^[=+\-@]/.test(s) ? "'" + s : s; return /[;"\r\n]/.test(s2) ? '"' + s2.replace(/"/g, '""') + '"' : s2; }).join(";")).join("\r\n");
}
function resumoDia(d) {
  const l = [`Coleta de água · ${semana(d.data)} ${fmt(d.data)}`];
  if (d.semColeta) { l.push("Sem coleta: " + d.motivo.toLowerCase() + "."); if (d.obs) l.push("Obs.: " + d.obs); return l.join("\n"); }
  l[0] += " · Fábrica " + d.fabrica;
  const quem = [d.hora ? "às " + d.hora : "", d.responsavel ? "por " + d.responsavel : ""].filter(Boolean).join(" ");
  if (quem) l.push("Coletado " + quem + ".");
  const itens = (d.itens || []).slice().sort((a, b) => (a.fabrica - b.fabrica) || ((ORDEM_TIPO[a.tipo] ?? 9) - (ORDEM_TIPO[b.tipo] ?? 9)));
  for (const it of itens) {
    const v = CAMPOS.filter((c) => it[c] !== null && it[c] !== undefined).map((c) => `${c === "ph" ? "pH" : LIM[c].nome.toLowerCase()} ${fmtNum(it[c])}${LIM[c].un ? " " + LIM[c].un : ""}${fora(c, it[c]) ? " (fora da faixa)" : ""}`);
    l.push(`✓ ${it.setor} (${it.tipo.toLowerCase()})${v.length ? ": " + v.join(", ") : ""}`);
  }
  for (const x of d.naoColetados || []) l.push(`✗ ${x.setor} (${x.tipo.toLowerCase()}): não coletado, ${x.motivo.toLowerCase()}`);
  if (d.obs) l.push("Obs.: " + d.obs);
  return l.join("\n");
}
function copiarTexto(txt) {
  const falhou = () => { S.folhaVolta = document.activeElement; $("#folha-txt").value = txt; $("#folha").hidden = false; const ta = $("#folha-txt"); ta.focus(); ta.select(); };
  try {
    if (!navigator.clipboard || !navigator.clipboard.writeText) { falhou(); return; }
    navigator.clipboard.writeText(txt).then(() => toast("Resumo copiado. É só colar na conversa."), falhou);
  } catch { falhou(); }
}
function fecharFolha() {
  $("#folha").hidden = true;
  const v = S.folhaVolta; S.folhaVolta = null;
  if (v && v.isConnected) v.focus();
}
async function oferecerArquivo(nome, texto) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([texto], { type: "text/plain;charset=utf-8" }));
  a.download = nome; document.body.appendChild(a); a.click(); a.remove();
}

function validarImport(j) {
  if (!j || typeof j !== "object" || !j.config || !Array.isArray(j.config.pontos)) return null;
  const pontos = j.config.pontos.map(limparPonto).filter(Boolean);
  const lista = Array.isArray(j.dias) ? j.dias : Object.values(j.dias || {});
  const dias = lista.map(limparDia).filter(Boolean);
  return pontos.length ? { config: { pontos, regras: limparRegras(j.config.regras) }, dias } : null;
}
async function importar() {
  const imp = S.importando; if (!imp) return;
  S.importando = null; renderAjustes();
  try {
    if (S.modo === "servidor") {
      toast("Enviando o backup para a sua conta…");
      await apiReq("/dados/importar", { method: "POST", body: { config: imp.config, dias: imp.dias } });
      await sincronizarDoServidor();
      toast(`Backup importado: ${imp.dias.length} dias.`);
      return;
    }
    S.config = imp.config;
    const m = { ...S.dias }; for (const d of imp.dias) m[d.data] = d; S.dias = m;
    if (!gravarLocal()) throw { code: "local" };
    S.dirty = false; aoMudarDados();
    toast(`Backup importado: ${imp.dias.length} dias.`);
  } catch (e) { aoMudarDados(); toast(msgErro(e)); }
}

let hojeAtual = hojeISO();
function verificarVirada() {
  const h = hojeISO(); if (h === hojeAtual) return;
  const antigo = hojeAtual; hojeAtual = h;
  $("#hoje-label").textContent = semana(h) + " " + fmt(h);
  if (S.data === antigo && !S.dirty) { S.data = h; S.fabManual = null; if (S.pronto) { montarRascunho(); renderHoje(); } }
  renderTudo();
}
document.addEventListener("visibilitychange", () => {
  if (document.hidden) { clearTimeout(marcarRascunho.t); gravarRascunhos(); return; }
  verificarVirada();
  if (S.modo === "servidor" && SRV.token && S.pronto && !SRV.enviando && !SRV.fila.length) tentarSincronizar();
});
window.addEventListener("online", () => { if (S.modo === "servidor" && SRV.token) { SRV.erro = ""; enviarFila(); } });
document.getElementById("f-login").addEventListener("submit", enviarLogin);
window.addEventListener("pagehide", () => { clearTimeout(marcarRascunho.t); gravarRascunhos(); });
window.addEventListener("pageshow", verificarVirada);
setInterval(verificarVirada, 60000);

document.addEventListener("click", async (ev) => {
  const sel = ev.target.closest && ev.target.closest("#v-graficos [data-sel]");
  if (sel) {
    const id = sel.dataset.sel;
    G.ponto = !id || G.ponto === id ? "" : id;
    esconderTip(); renderGraficos();
    if (G.ponto) document.getElementById("det")?.scrollIntoView({ block: "start" });
    else document.querySelector(`#v-graficos [data-sel="${id}"]`)?.focus();
    return;
  }
  const t = ev.target.closest("button, [data-fab]");
  if (!t) {
    if (ev.target.id === "folha") fecharFolha();
    return;
  }
  if (t.dataset.aba) { trocarAba(t.dataset.aba); return; }
  if (t.dataset.passo) {
    const i = $("#" + t.dataset.passo); if (i.disabled) return;
    const antes = i.value;
    if (Number(t.dataset.d) > 0) i.stepUp(); else i.stepDown();
    if (i.value !== antes) i.dispatchEvent(new Event("change", { bubbles: true }));
    return;
  }
  if (t.id === "b-trocar-fab") { S.trocandoFab = !S.trocandoFab; renderHoje(); $("#b-trocar-fab")?.focus(); return; }
  if (t.id === "b-ajuda") { S.ajuda = true; if (S.aba !== "hoje") trocarAba("hoje"); if (S.pronto) renderHoje(); window.scrollTo(0, 0); return; }
  if (t.id === "b-ajuda-ok") { S.ajuda = false; lsSet("coleta-agua:ajuda-ok", "1"); renderHoje(); return; }
  if (t.id === "b-ver-senha") { const i = $("#l-senha"), ver = i.type === "password"; i.type = ver ? "text" : "password"; $("#l-senha2").type = i.type; t.setAttribute("aria-label", ver ? "Ocultar a senha" : "Mostrar a senha"); i.focus(); return; }
  if (t.id === "b-tema") { aplicarTema(temaEscuro() ? "claro" : "escuro"); return; }
  if (t.dataset.param) { G.param = t.dataset.param; renderGraficos(); $("#" + t.id)?.focus(); return; }
  if (t.dataset.fab) { guardarRascunho(); S.trocandoFab = false; S.fabManual = Number(t.dataset.fab); montarRascunho(); renderHoje(); $("#fab-" + S.fab)?.focus(); return; }
  if (t.id === "b-salvar") { salvarHoje(); return; }
  if (t.dataset.motivo) { S.motivo = S.motivo === t.dataset.motivo ? null : t.dataset.motivo; S.semColAberto = true; renderHoje(); document.querySelector(`[data-motivo="${t.dataset.motivo}"]`)?.focus(); return; }
  if (t.id === "b-semcol") { salvarSemColeta(); return; }
  if (t.id === "b-desfazer-semcol") {
    t.disabled = true;
    try { await excluirDia(S.data); toast(`Marcação de ${fmt(S.data)} removida.`); S.motivo = null; montarRascunho(); renderTudo(); renderHoje(); }
    catch (e) { toast(msgErro(e)); t.disabled = false; }
    return;
  }
  if (t.dataset.dia) { irParaDia(addDias(S.data, Number(t.dataset.dia))); $("#" + t.id)?.focus(); return; }
  if (t.dataset.ir) { irParaDia(t.dataset.ir); if (S.aba !== "hoje") trocarAba("hoje"); window.scrollTo(0, 0); return; }
  if (t.id === "b-todos") {
    for (const id of S.topoIds || []) if (!S.nc[id]) S.sel[id] = S.sel[id] || { cloro: "", ph: "", turbidez: "" };
    marcarRascunho(); renderHoje(); return;
  }
  if (t.id === "b-csv") { oferecerArquivo(`coleta_agua_${S.csvPeriodo === "tudo" ? "completo_" + hojeISO() : S.csvPeriodo === "30" ? "ultimos_30_dias_" + hojeISO() : S.csvPeriodo}.csv`, paraCSV(S.csvPeriodo)); return; }
  if (t.dataset.resumo) { const d = S.dias[t.dataset.resumo]; if (d) copiarTexto(resumoDia(d)); return; }
  if (t.id === "b-folha-fechar") { fecharFolha(); return; }
  if (t.id === "b-agenda-mais") { S.agendaMais = !S.agendaMais; renderPontos(); $("#b-agenda-mais")?.focus(); return; }
  if (t.dataset.ncAbrir) { S.ncAberto = t.dataset.ncAbrir; renderHoje(); document.querySelector(`[data-nc="${t.dataset.ncAbrir}"]`)?.focus(); return; }
  if (t.dataset.ncFechar) { const id = S.ncAberto; S.ncAberto = null; renderHoje(); document.querySelector(`[data-nc-abrir="${id}"]`)?.focus(); return; }
  if (t.dataset.nc) { const id = t.dataset.nc; S.nc[id] = t.dataset.ncMotivo; delete S.sel[id]; S.ncAberto = null; marcarRascunho(); renderHoje(); document.querySelector(`[data-nc-limpar="${id}"]`)?.focus(); return; }
  if (t.dataset.ncLimpar) { const id = t.dataset.ncLimpar; delete S.nc[id]; marcarRascunho(); renderHoje(); document.querySelector(`[data-nc-abrir="${id}"]`)?.focus(); return; }
  if (t.id === "b-backup") { oferecerArquivo(`coleta_agua_backup_${hojeISO()}.json`, JSON.stringify({ config: S.config, dias: Object.values(S.dias) }, null, 1)); return; }
  if (t.id === "b-import-sim") { importar(); return; }
  if (t.id === "b-acordando") { avisoAcordando(null); if (document.body.classList.contains("sem-conta")) $("#b-login").click(); else tentarSincronizar(); return; }
  if (t.id === "b-sincronizar") { tentarSincronizar(); return; }
  if (t.id === "b-visitante") { entrarVisitante(); return; }
  if (t.dataset.criarConta) { sairVisitante("criar"); $("#l-nome").focus(); return; }
  if (t.dataset.jaConta) { sairVisitante("entrar"); $("#l-email").focus(); return; }
  if (t.id === "b-esqueci") { modoLogin("esqueci"); $("#l-email").focus(); return; }
  if (t.id === "b-voltar-login") { if (S.tokenRedefinir) limparRedefinir(); modoLogin("entrar"); $("#l-email").focus(); return; }
  if (t.dataset.loginModo) { modoLogin(t.dataset.loginModo); $(t.dataset.loginModo === "criar" ? "#l-nome" : "#l-email").focus(); return; }
  if (t.id === "b-sair") { if (SRV.fila.length) { S.confirmSair = true; renderAjustes(); } else sairConta(); return; }
  if (t.id === "b-sair-forcar") { sairConta(); return; }
  if (t.id === "b-migrar") {
    const j = S.legado; if (!j) return;
    t.disabled = true;
    try {
      await apiReq("/dados/importar", { method: "POST", body: { config: j.config, dias: j.dias } });
      lsSet(LS_KEY, null); S.legado = null;
      await sincronizarDoServidor();
      toast(`${j.dias.length} dias enviados para a sua conta.`);
    } catch (e) { toast(msgErro(e)); t.disabled = false; }
    return;
  }
  if (t.dataset.cancelar) { S.confirmSair = false; S.confirmando = null; S.removendo = null; S.importando = null; renderHistorico(); renderAjustes(); return; }
  if (t.dataset.abrir) { guardarRascunho(); S.data = t.dataset.abrir; S.fabManual = null; montarRascunho(); renderHoje(); trocarAba("hoje"); window.scrollTo(0, 0); return; }
  if (t.dataset.excluir) { S.confirmando = t.dataset.excluir; renderHistorico(); return; }
  if (t.dataset.excluirSim) {
    const d = t.dataset.excluirSim; S.confirmando = null;
    try { await excluirDia(d); toast(`Coleta de ${fmt(d)} excluída.`); } catch (e) { toast(msgErro(e)); }
    renderHistorico(); return;
  }
  if (t.dataset.remover) { S.removendo = t.dataset.remover; renderAjustes(); return; }
  if (t.dataset.removerSim) {
    if (!S.pronto) return;
    const cfg = clone(S.config); cfg.pontos = cfg.pontos.filter((p) => p.id !== t.dataset.removerSim); S.removendo = null;
    try { await salvarConfig(cfg); toast("Ponto removido. O histórico dele continua salvo."); } catch (e) { toast(msgErro(e)); }
    return;
  }
});

document.addEventListener("change", async (ev) => {
  const t = ev.target;
  if (t.id === "tema-sel") { aplicarTema(t.value); return; }
  if (t.id === "csv-periodo") { S.csvPeriodo = t.value; return; }
  if (t.id === "g-periodo" || t.id === "g-ponto") {
    if (t.id === "g-periodo") G.periodo = t.value; else G.ponto = t.value;
    renderGraficos(); $("#" + t.id)?.focus(); return;
  }
  if (t.id === "f-data") { irParaDia(dataValida(t.value) ? t.value : hojeISO()); $("#f-data")?.focus(); return; }
  if (t.matches('#v-hoje input[type="checkbox"][data-ponto]')) {
    const id = t.dataset.ponto;
    if (t.checked) { S.sel[id] = S.sel[id] || { cloro: "", ph: "", turbidez: "" }; delete S.nc[id]; } else delete S.sel[id];
    marcarRascunho(); renderHoje(); $("#ck-" + id)?.focus(); return;
  }
  if (t.dataset.ativo) {
    if (!S.pronto) return;
    const cfg = clone(S.config); const p = cfg.pontos.find((x) => x.id === t.dataset.ativo); if (!p) return;
    p.ativo = t.checked;
    try { await salvarConfig(cfg); } catch (e) { toast(msgErro(e)); renderAjustes(); }
    return;
  }
  if (t.id === "r-torneira" || t.id === "r-bebedouro") {
    if (!S.pronto) return;
    const cfg = clone(S.config); const tipo = t.id === "r-torneira" ? "Torneira" : "Bebedouro";
    cfg.regras[tipo] = Math.max(0, Math.min(10, Math.round(Number(t.value) || 0)));
    try { await salvarConfig(cfg); toast("Regra do rodízio atualizada."); } catch (e) { toast(msgErro(e)); }
    return;
  }
  if (t.id === "f-import") {
    const f = t.files && t.files[0]; t.value = ""; if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      let j = null; try { j = JSON.parse(String(r.result)); } catch {}
      const imp = validarImport(j);
      if (!imp) { toast("Esse arquivo não é um backup desta página."); return; }
      S.importando = imp; renderAjustes();
    };
    r.readAsText(f);
  }
});

document.addEventListener("input", (ev) => {
  const t = ev.target;
  if (t.dataset && t.dataset.campo) {
    const v = S.sel[t.dataset.ponto]; if (!v) return;
    v[t.dataset.campo] = t.value; marcarRascunho();
    t.classList.toggle("fora", fora(t.dataset.campo, t.value) || invalido(t.value));
    return;
  }
  if (t.id === "f-obs") { S.obs = t.value; marcarRascunho(); }
  if (t.id === "f-hora") { S.hora = t.value; marcarRascunho(); }
  if (t.id === "f-resp") { S.resp = t.value; marcarRascunho(); }
});

document.getElementById("f-novo").addEventListener("submit", async (ev) => {
  ev.preventDefault();
  if (!S.pronto) { toast("Aguarde os registros carregarem."); return; }
  const setor = $("#n-setor").value.trim();
  if (!setor) { toast("Escreva o nome do setor."); $("#n-setor").focus(); return; }
  const fabrica = Number($("#n-fab").value), tipo = $("#n-tipo").value;
  const cfg = clone(S.config);
  const base = (fabrica === 0 ? "geral" : "f" + fabrica) + "-" + (slug(setor) || "ponto-" + Date.now().toString(36)) + "-" + slug(tipo);
  if (cfg.pontos.some((p) => p.id === base)) { toast("Esse ponto já existe."); return; }
  cfg.pontos.push({ id: base, fabrica, setor, tipo, ativo: true });
  try { await salvarConfig(cfg); $("#n-setor").value = ""; toast(`${setor} · ${tipo} adicionado.`); } catch (e) { toast(msgErro(e)); }
});

const LISTA_PROPRIA = !(window.CSS && CSS.supports && CSS.supports("appearance", "base-select")) && !!window.matchMedia && matchMedia("(hover: hover) and (pointer: fine)").matches;
let LISTA = null;
function fecharLista(foco) {
  if (!LISTA) return;
  const { el, sel } = LISTA; LISTA = null;
  el.remove(); sel.removeAttribute("aria-expanded");
  if (foco && sel.isConnected) sel.focus();
}
function abrirLista(sel) {
  fecharLista();
  const op = (o) => `<div class="lista-op" role="option" data-i="${o.index}" aria-selected="${o.selected}"${o.disabled ? ' aria-disabled="true"' : ""}>${esc(o.textContent)}</div>`;
  let h = "";
  for (const f of sel.children) h += f.tagName === "OPTGROUP" ? `<div class="lista-grupo" role="presentation">${esc(f.label)}</div>${[...f.children].map(op).join("")}` : op(f);
  const el = document.createElement("div");
  el.className = "lista"; el.setAttribute("role", "listbox"); el.innerHTML = h;
  document.body.appendChild(el);
  LISTA = { el, sel, i: sel.selectedIndex };
  sel.setAttribute("aria-expanded", "true");
  const r = sel.getBoundingClientRect(), vh = window.innerHeight, vw = document.documentElement.clientWidth;
  el.style.minWidth = r.width + "px";
  const abaixo = vh - r.bottom - 14, acima = r.top - 14, cima = abaixo < Math.min(el.scrollHeight, 240) && acima > abaixo;
  el.style.maxHeight = Math.min(420, Math.max(120, cima ? acima : abaixo)) + "px";
  el.style.left = Math.max(8, Math.min(r.left, vw - el.offsetWidth - 8)) + "px";
  if (cima) el.style.bottom = (vh - r.top + 6) + "px"; else el.style.top = (r.bottom + 6) + "px";
  marcarLista();
}
function marcarLista() {
  for (const o of LISTA.el.querySelectorAll(".lista-op")) o.classList.toggle("ativo", Number(o.dataset.i) === LISTA.i);
  LISTA.el.querySelector(".lista-op.ativo")?.scrollIntoView({ block: "nearest" });
}
function escolherLista(i) {
  const sel = LISTA.sel, o = sel.options[i];
  if (!o || o.disabled) return;
  fecharLista(true);
  if (sel.selectedIndex !== i) { sel.selectedIndex = i; sel.dispatchEvent(new Event("input", { bubbles: true })); sel.dispatchEvent(new Event("change", { bubbles: true })); }
}
if (LISTA_PROPRIA) {
  document.documentElement.classList.add("lista-propria");
  document.addEventListener("mousedown", (ev) => {
    if (LISTA && LISTA.el.contains(ev.target)) { ev.preventDefault(); return; }
    const sel = ev.target.closest && ev.target.closest("select");
    if (sel && ev.button === 0 && !sel.disabled && !sel.multiple) {
      ev.preventDefault();
      const mesmo = LISTA && LISTA.sel === sel;
      fecharLista();
      sel.focus();
      if (!mesmo) abrirLista(sel);
      return;
    }
    fecharLista();
  }, true);
  document.addEventListener("click", (ev) => {
    const o = LISTA && ev.target.closest && ev.target.closest(".lista-op");
    if (o && LISTA.el.contains(o)) escolherLista(Number(o.dataset.i));
  });
  document.addEventListener("mousemove", (ev) => {
    const o = LISTA && ev.target.closest && ev.target.closest(".lista-op:not([aria-disabled])");
    if (o && Number(o.dataset.i) !== LISTA.i) { LISTA.i = Number(o.dataset.i); for (const x of LISTA.el.querySelectorAll(".lista-op")) x.classList.toggle("ativo", x === o); }
  });
  document.addEventListener("keydown", (ev) => {
    if (!LISTA) {
      const sel = ev.target.closest && ev.target.closest("select");
      if (sel && !sel.disabled && !sel.multiple && (ev.key === " " || ev.key === "Enter" || ev.key === "F4" || (ev.altKey && ev.key === "ArrowDown"))) { ev.preventDefault(); abrirLista(sel); }
      return;
    }
    const ops = LISTA.sel.options;
    const mover = (d) => { let i = LISTA.i; do { i += d; } while (ops[i] && ops[i].disabled); if (ops[i]) { LISTA.i = i; marcarLista(); } };
    if (ev.key === "ArrowDown" || ev.key === "ArrowUp") { ev.preventDefault(); mover(ev.key === "ArrowDown" ? 1 : -1); }
    else if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); escolherLista(LISTA.i); }
    else if (ev.key === "Escape") { ev.preventDefault(); ev.stopPropagation(); fecharLista(true); }
    else if (ev.key === "Tab") fecharLista();
  }, true);
  window.addEventListener("resize", () => fecharLista());
  document.addEventListener("scroll", (ev) => { if (LISTA && !LISTA.el.contains(ev.target)) fecharLista(); }, true);
}
document.addEventListener("keydown", (ev) => {
  if ((ev.key === "Enter" || ev.key === " ") && ev.target.matches && ev.target.matches('#v-graficos [data-sel][role="button"]')) { ev.preventDefault(); ev.target.click(); }
  if (ev.key === "Escape" && !$("#folha").hidden) fecharFolha();
  if (ev.key === "Tab" && !$("#folha").hidden) {
    const f = [$("#folha-txt"), $("#b-folha-fechar")], i = f.indexOf(document.activeElement);
    if (ev.shiftKey ? i <= 0 : i < 0 || i === f.length - 1) { ev.preventDefault(); f[ev.shiftKey ? f.length - 1 : 0].focus(); }
  }
});
document.addEventListener("toggle", (ev) => { if (ev.target.id === "d-outros") S.outrosAberto = ev.target.open; if (ev.target.id === "d-semcol") S.semColAberto = ev.target.open; if (ev.target.id === "d-ritmo") G.ritmoAberto = ev.target.open; if (ev.target.dataset.mes) S.mesesAbertos[ev.target.dataset.mes] = ev.target.open; }, true);
document.addEventListener("click", (ev) => { if (ev.target.id === "f-data" && typeof ev.target.showPicker === "function") { try { ev.target.showPicker(); } catch {} } });
const vg = document.getElementById("v-graficos");
function alvoTip(ev) {
  const t = ev.target;
  if (!t || !t.closest) return null;
  if (t.classList && t.classList.contains("hit")) return t;
  const svg = t.closest("#v-graficos svg");
  if (svg) {
    let best = null, bd = 24 * 24;
    for (const h of svg.querySelectorAll(".hit")) {
      const r = h.getBoundingClientRect(), dx = r.left + r.width / 2 - ev.clientX, dy = r.top + r.height / 2 - ev.clientY, d = dx * dx + dy * dy;
      if (d < bd) { bd = d; best = h; }
    }
    if (best) return best;
  }
  return t.closest("#v-graficos [data-tip]");
}
vg.addEventListener("pointermove", (ev) => {
  if (ev.pointerType !== "mouse") { if (G.xhAtivo && ev.buttons) crosshair(ev); return; }
  if (crosshair(ev)) return;
  if (G.xhAtivo) esconderTip();
  const a = alvoTip(ev);
  if (a) { if (a !== G.tipAtual) mostrarTip(a); } else if (G.tipAtual) esconderTip();
});
vg.addEventListener("pointerleave", (ev) => { if (ev.pointerType === "mouse") esconderTip(); });
document.addEventListener("pointerdown", (ev) => {
  if (ev.pointerType === "mouse") return;
  G.toque = Date.now();
  if (crosshair(ev)) return;
  esconderTip();
});
vg.addEventListener("focusin", (ev) => { const a = ev.target.closest("[data-tip]"); if (a) mostrarTip(a); });
vg.addEventListener("focusout", (ev) => {
  if (Date.now() - (G.toque || 0) < 600) return;
  if (!(ev.relatedTarget && ev.relatedTarget.closest && ev.relatedTarget.closest("[data-tip]"))) esconderTip();
});
let tmrResize;
window.addEventListener("resize", () => { clearTimeout(tmrResize); tmrResize = setTimeout(() => { if (S.aba === "graficos" && vg.clientWidth !== G.largura) renderGraficos(); }, 150); });

const ENDERECO_NOVO = "https://coleta-agua.onrender.com/";
function temDadosNesteAparelho() {
  try {
    const j = JSON.parse(localStorage.getItem(LS_KEY) || "null");
    if (j && j.dias && Object.keys(j.dias).length) return true;
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith("coleta-agua:pendentes:") && (localStorage.getItem(k) || "[]") !== "[]") return true;
    }
  } catch {}
  return false;
}
if (location.hostname === "hriel123.github.io" && !temDadosNesteAparelho()) {
  location.replace(ENDERECO_NOVO + location.hash);
} else {
  iniciar();
  if (location.hostname === "hriel123.github.io") setTimeout(() => toast("O site mudou para coleta-agua.onrender.com. Envie os dados deste aparelho para a sua conta e depois use o endereço novo."), 1500);
}
