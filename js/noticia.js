(() => {
  const N = window.SUPERFOCO_NOTICIAS || [];
  const H = window.SUPERFOCO_HEROIS || [];
  const V = window.SUPERFOCO_VILOES || [];
  const G = window.SUPERFOCO_GRUPOS || [];

  const $ = id => document.getElementById(id);
  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  const noticia = N.find(n => n.id === id);

  if (!noticia) {
    $('erro').hidden = false;
    return;
  }

  const pasta = `assets/noticias/${noticia.id}/`;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const dataBR = value => {
    if (!value) return '';
    const [y,m,d] = value.split('-');
    return y && m && d ? `${d}/${m}/${y}` : value;
  };

  document.title = `${noticia.titulo} | SuperFoco`;
  $('categoria').textContent = noticia.categoria || 'Notícia';
  $('titulo').textContent = noticia.titulo || '';
  $('subtitulo').textContent = noticia.subtitulo || '';
  $('autor').textContent = noticia.autor || 'Redação SuperFoco';
  $('data').textContent = dataBR(noticia.data);

  if (noticia.capa) {
    $('capaWrap').hidden = false;
    $('capa').src = pasta + noticia.capa;
    $('capa').alt = noticia.capaLegenda || noticia.titulo || 'Imagem de capa';
    $('capaLegenda').textContent = noticia.capaLegenda || '';
    $('capaLegenda').hidden = !noticia.capaLegenda;
  }

  $('conteudo').innerHTML = (noticia.conteudo || []).map(bloco => {
    switch (bloco.tipo) {
      case 'imagem':
        return `<figure class="inline-image"><img src="${pasta + encodeURIComponent(bloco.arquivo).replace(/%2F/g,'/')}" alt="${esc(bloco.legenda || noticia.titulo)}">${bloco.legenda ? `<figcaption>${esc(bloco.legenda)}</figcaption>` : ''}</figure>`;
      case 'citacao':
        return `<blockquote class="news-quote">${esc(bloco.texto)}${bloco.fonte ? `<cite>— ${esc(bloco.fonte)}</cite>` : ''}</blockquote>`;
      case 'subtitulo':
        return `<h2 class="news-subheading">${esc(bloco.texto)}</h2>`;
      case 'texto':
      default:
        return `<p>${esc(bloco.texto)}</p>`;
    }
  }).join('');

  const relacionados = [];
  const add = (listaIds, base, tipo, url, imagem) => {
    (listaIds || []).forEach(ref => {
      const item = base.find(x => x.id === ref);
      if (!item) return;
      relacionados.push({
        nome: item.nome,
        tipo,
        href: item.pagina === false || !url ? '#' : `${url}?id=${encodeURIComponent(item.id)}`,
        imagem: imagem ? imagem(item) : ''
      });
    });
  };

  add(noticia.herois, H, 'Herói', 'heroi.html', h => `assets/icones/ICONE-${h.arquivo}.png`);
  add(noticia.grupos, G, 'Grupo', null, () => '');
  add(noticia.viloes, V, 'Vilão', 'vilao.html', v => v.arquivo ? `assets/icones/ICONE-${v.arquivo}.png` : '');

  if (relacionados.length) {
    $('relacionadosWrap').hidden = false;
    $('relacionados').innerHTML = relacionados.map(r => {
      const foto = r.imagem ? `<img src="${r.imagem}" alt="" onerror="this.style.display='none'">` : '';
      const tag = r.href === '#' ? 'div' : 'a';
      const href = r.href === '#' ? '' : ` href="${r.href}"`;
      return `<${tag}${href} class="related-item">${foto}<span><strong>${esc(r.nome)}</strong><small>${esc(r.tipo)}</small></span></${tag}>`;
    }).join('');
  }

  $('materia').hidden = false;
})();
