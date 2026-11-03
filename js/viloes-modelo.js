(function (root, factory) {
  const modelo = factory();
  if (typeof module === 'object' && module.exports) module.exports = modelo;
  else root.SuperFocoViloes = modelo;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const normalizar = valor => String(valor ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  const numero = valor => {
    const texto = typeof valor === 'string' ? valor.trim() : valor;
    const n = Number(typeof texto === 'string' && texto.includes(',') ? texto.replace(/\./g, '').replace(',', '.') : texto);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  };
  function calcular(v) {
    const s = v.stats || {};
    const pesos = [5, 3, 1, 0, -1, -2];
    const comentarios = (v.comentarios || []).reduce((total, c) => {
      if (c.estrelas === null || c.estrelas === undefined || c.estrelas === '') return total;
      const estrelas = Number(c.estrelas);
      return total + (Number.isInteger(estrelas) ? pesos[estrelas] ?? 0 : 0);
    }, 0);
    const pontuacao = Math.round(numero(s.vitimas) * 12 + numero(s.confrontos) * 2 + numero(s.danos) / 10000 + numero(s.fugas) * 15 + comentarios);
    const ameaca = pontuacao >= 9000 ? 'MUNDIAL' : pontuacao >= 6000 ? 'NACIONAL' : pontuacao >= 3000 ? 'ALTA' : pontuacao >= 1500 ? 'MÉDIA' : 'BAIXA';
    return { pontuacao, ameaca };
  }
  function referencias(valores = [], herois = []) {
    const ids = [], pendentes = [];
    valores.forEach(valor => {
      const exato = herois.find(h => h.id === valor);
      const candidatos = exato ? [exato] : herois.filter(h => normalizar(h.nome) === normalizar(valor));
      if (candidatos.length === 1) ids.push(candidatos[0].id);
      else pendentes.push(valor);
    });
    return { ids: [...new Set(ids)], pendentes: [...new Set(pendentes)] };
  }
  function noticias(v, todas = []) {
    return todas.filter(n => (n.viloes || []).includes(v.id)).slice().sort((a, b) => (Date.parse(b.data) || 0) - (Date.parse(a.data) || 0));
  }
  return { calcular, referencias, noticias };
});
