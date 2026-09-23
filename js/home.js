// ============================================================
// SUPERFOCO — HOME
// Compatível com SUPERFOCO_HEROIS / SUPERFOCO_VILOES / SUPERFOCO_NOTICIAS
// ============================================================

const H = window.SUPERFOCO_HEROIS || [];
const V = window.SUPERFOCO_VILOES || [];
const N = window.SUPERFOCO_NOTICIAS || [];

// ==================== NÚMEROS SUPERFOCO ====================

// Total de supers que possuem registro/página no banco
const totalSupers =
  H.filter(x => x.pagina).length +
  V.filter(x => x.pagina).length;

// Heróis atualmente ativos
const totalHeroisAtivos = H.filter(h =>
  (h.status || '').toUpperCase() === 'ATIVO'
).length;

// Vilões atualmente procurados
const totalProcurados = V.filter(v =>
  (v.status || '').toUpperCase() === 'PROCURADO'
).length;

// Ocorrências/notícias publicadas no mês atual
const agora = new Date();

const ocorrenciasMes = N.filter(n => {
  if (!n.data) return false;

  const data = new Date(`${n.data}T12:00:00`);

  return (
    data.getMonth() === agora.getMonth() &&
    data.getFullYear() === agora.getFullYear()
  );
}).length;

document.querySelector('#nSupers').textContent = totalSupers;
document.querySelector('#nHeroes').textContent = totalHeroisAtivos;
document.querySelector('#nWanted').textContent = totalProcurados;
document.querySelector('#nOccurrences').textContent = ocorrenciasMes;



// ==================================


const $ = (s) => document.querySelector(s);
const img = (u) => u ? `background-image:url('${u}')` : '';

const normalizar = (texto='') => texto
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g,'')
  .toLowerCase()
  .trim();

function arquivoHeroi(h){
  if(h.arquivo) return h.arquivo;
  return normalizar(h.nome)
    .replace(/[^a-z0-9]+/g,'_')
    .replace(/^_|_$/g,'')
    .toUpperCase();
}

function fotoHeroi(h){
  return h.imagem || `assets/herois/${arquivoHeroi(h)}-1.png`;
}

function iconeHeroi(h){
  return `assets/icones/ICONE-${arquivoHeroi(h)}.png`;
}

function variacaoHeroi(h){
  if(typeof h.variacao === 'number') return h.variacao;
  if(typeof h.ranking === 'number' && typeof h.rankingAnterior === 'number'){
    return h.rankingAnterior - h.ranking;
  }
  return 0;
}

function areaHeroi(h){
  return h.area || h.local || 'Brasil';
}

function movement(h){
  const v = variacaoHeroi(h);
  if(v > 0) return `<span class="movement up">▲ ${v}</span>`;
  if(v < 0) return `<span class="movement down">▼ ${Math.abs(v)}</span>`;
  return `<span class="movement">—</span>`;
}

// ==================== DESTAQUE / NOTÍCIAS ====================

const lead = N[0];

if(lead){
  $('#lead').style = img(lead.imagem);
  $('#lead').innerHTML = `
    <div class="story-copy">
      <span class="kicker">${lead.categoria || 'NOTÍCIA'}${lead.data ? ` • ${lead.data}` : ''}</span>
      <h1>${lead.titulo}</h1>
      <p>${lead.resumo || ''}</p>
    </div>`;
} else {
  $('#lead').innerHTML = `
    <div class="story-copy">
      <span class="kicker">SUPERFOCO</span>
      <h1>O mundo muda. A gente acompanha.</h1>
      <p>Novas matérias serão adicionadas ao arquivo da redação.</p>
    </div>`;
}

$('#secondary').innerHTML = N.slice(1,4).map(n => `
  <article class="story-card" style="${img(n.imagem)}">
    <div class="story-copy">
      <span class="kicker">${n.categoria || 'NOTÍCIA'}</span>
      <h3>${n.titulo}</h3>
    </div>
  </article>`).join('');

const tags = [...new Set(N.flatMap(n => n.tags || []))].slice(0,6);
$('#trends').innerHTML = tags.length
  ? tags.map(t => `<span class="trend">#${t.replaceAll(' ','')}</span>`).join('')
  : `<span class="trend">Aguardando novas ocorrências...</span>`;

// ==================== HERÓIS ====================

$('#rankingList').innerHTML = H.length
  ? H.slice()
      .filter(h => typeof h.ranking === 'number')
      .sort((a,b) => a.ranking-b.ranking)
      .slice(0,5)
      .map(h => `
        <li>
          <a href="heroi.html?id=${encodeURIComponent(h.id)}" style="color:inherit;text-decoration:none">${h.nome}</a>
          ${movement(h)}
        </li>`).join('')
  : `<li>Nenhum herói catalogado.</li>`;

const focus = H.slice(0,6);

$('#heroesGrid').innerHTML = focus.length
  ? focus.map(h => {
      const v = variacaoHeroi(h);
      return `
        <article class="person">
          <a class="person-link" href="heroi.html?id=${encodeURIComponent(h.id)}">
            <div class="photo" style="${img(fotoHeroi(h))}"></div>
            <div class="info">
              <span class="rank-badge">
                ${typeof h.ranking === 'number' ? `#${h.ranking}` : 'SEM RANKING'}
                ${v > 0 ? ` ▲${v}` : v < 0 ? ` ▼${Math.abs(v)}` : ''}
              </span>
              <h3>${h.nome}</h3>
              <span class="badge">${h.status || 'STATUS DESCONHECIDO'}</span>
              <span class="badge">${areaHeroi(h)}</span>
            </div>
          </a>
        </article>`;
    }).join('')
  : `<p>Nenhum herói catalogado.</p>`;

$('#rising').innerHTML = H.length
  ? H.slice()
      .sort((a,b) => variacaoHeroi(b)-variacaoHeroi(a))
      .slice(0,3)
      .map(h => `
        <a href="heroi.html?id=${encodeURIComponent(h.id)}" class="mini-person" style="color:inherit;text-decoration:none">
          <div class="mini-photo" style="${img(fotoHeroi(h))}"></div>
          <div>
            <b>${h.nome}</b>
            <small>${typeof h.ranking === 'number' ? `#${h.ranking}` : 'Sem ranking'}</small>
          </div>
          <span class="${variacaoHeroi(h) >= 0 ? 'up' : 'down'}">
            ${variacaoHeroi(h) > 0 ? `▲${variacaoHeroi(h)}` : variacaoHeroi(h) < 0 ? `▼${Math.abs(variacaoHeroi(h))}` : '—'}
          </span>
        </a>`).join('')
  : `<small>Nenhum registro.</small>`;

// ==================== VILÕES ====================

$('#wanted').innerHTML = V.length
  ? V.slice(0,3).map(v => {
      const perigo = Number.isInteger(v.perigo) ? Math.max(0,Math.min(5,v.perigo)) : null;
      return `
        <div class="mini-person">
          <div class="mini-photo" style="${img(v.imagem)}"></div>
          <div>
            <b>${v.nome}</b>
            <small>${v.status || 'Registro público'}</small>
          </div>
          <span class="danger">${perigo === null ? 'ARQUIVO' : '●'.repeat(perigo)+'○'.repeat(5-perigo)}</span>
        </div>`;
    }).join('')
  : `<small>Nenhum registro.</small>`;

// ==================== ÚLTIMAS NOTÍCIAS ====================

$('#latest').innerHTML = N.length
  ? N.slice(1).map(n => `
      <article class="news-row">
        <div class="thumb" style="${img(n.imagem)}"></div>
        <div>
          <span class="kicker">${n.categoria || 'NOTÍCIA'}${n.data ? ` • ${n.data}` : ''}</span>
          <h3>${n.titulo}</h3>
          <p>${n.resumo || ''}</p>
        </div>
      </article>`).join('')
  : `<div style="padding:18px;color:var(--muted)">Nenhuma notícia publicada ainda.</div>`;

// ==================== COMUNIDADE ====================

const comments = [
  ['@Paulista1998','Hércules salvou aquele pessoal e ainda tem gente reclamando do muro.'],
  ['@SemCapa','Toda vez que Dínamo aparece, Hércules aparece também. Só dizendo…'],
  ['@SuperFan22','Quero ver quem sobe no ranking este mês.']
];

$('#comments').innerHTML = comments
  .map(c => `<blockquote><b>${c[0]}</b>${c[1]}</blockquote>`)
  .join('');

// ==================== PESQUISA ====================

const searchForm = $('#searchForm');
const searchInput = $('#searchInput');
const search = $('#searchResults');

function todosResultados(){
  return [
    ...H.map(h => ({
      nome:h.nome,
      tipo:'Herói',
      href:`heroi.html?id=${encodeURIComponent(h.id)}`,
      icone:iconeHeroi(h),
      tags:h.tags || []
    })),
    ...V.map(v => ({
      nome:v.nome,
      tipo:'Vilão',
      href:'#',
      icone:v.imagem || '',
      tags:v.tags || []
    })),
    ...N.map(n => ({
      nome:n.titulo,
      tipo:'Notícia',
      href:'#',
      icone:n.imagem || '',
      tags:n.tags || []
    }))
  ];
}

function encontrar(termo){
  const q = normalizar(termo);
  if(!q) return [];

  return todosResultados()
    .filter(x =>
      normalizar(x.nome).includes(q) ||
      (x.tags || []).some(tag => normalizar(tag).includes(q))
    )
    .slice(0,8);
}

function renderizarPesquisa(termo){
  if(!termo.trim()){
    search.innerHTML = '';
    search.classList.add('hidden');
    return;
  }

  const results = encontrar(termo);

  if(!results.length){
    search.innerHTML = `<span class="search-empty">Nenhum resultado encontrado para “${termo}”.</span>`;
    search.classList.remove('hidden');
    return;
  }

  search.innerHTML = results.map(r => `
    <a class="search-result-item" href="${r.href}">
      ${r.icone
        ? `<img class="search-result-icon" src="${r.icone}" alt="" onerror="this.style.visibility='hidden'">`
        : `<span class="search-result-icon"></span>`}
      <span class="search-result-copy">
        <b>${r.nome}</b>
        <small>${r.tipo}</small>
      </span>
      <span class="search-result-arrow">›</span>
    </a>`).join('');

  search.classList.remove('hidden');
}

searchInput.addEventListener('input', () => renderizarPesquisa(searchInput.value));

searchForm.addEventListener('submit', e => {
  e.preventDefault();

  const termo = searchInput.value.trim();
  if(!termo) return;

  const results = encontrar(termo);

  if(results.length === 1 && results[0].href !== '#'){
    window.location.href = results[0].href;
    return;
  }

  renderizarPesquisa(termo);
});

document.addEventListener('click', e => {
  if(!e.target.closest('.search') && !e.target.closest('.search-results')){
    search.classList.add('hidden');
  }
});
