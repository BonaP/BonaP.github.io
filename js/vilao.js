(async () => {

  const $ =
    s => document.querySelector(s);


  const id =
    new URLSearchParams(
      location.search
    ).get("id");


  const H =
    window.SUPERFOCO_HEROIS || [];


  const V =
    window.SUPERFOCO_VILOES || [];


  const N =
    window.SUPERFOCO_NOTICIAS || [];


  const v =
    V.find(x =>
      x.id === id
    );


  /* =========================
     NÃO ENCONTRADO
  ========================= */

  if(!v){

    $("#perfil")
      .querySelectorAll(
        ":scope>*:not(#erro)"
      )
      .forEach(x =>
        x.hidden = true
      );


    $("#erro").hidden = false;

    return;

  }


  /* =========================
     TÍTULO
  ========================= */

  document.title =
    `${v.nome} | SuperFoco`;


  $("#nome").textContent =
    v.nome;





  /* =========================
     ÍCONE
  ========================= */

  $("#icone").src =
    `assets/icones/ICONE-${v.arquivo}.png`;


  /* =========================
     META
  ========================= */

  [
    v.status,
    v.cidade,
    v.estado
  ]

  .filter(Boolean)

  .forEach(valor => {

    $("#meta")
      .insertAdjacentHTML(
        "beforeend",
        `<span class="pill">${valor}</span>`
      );

  });


  /* =========================
     AMEAÇA
  ========================= */

  $("#ameaca").textContent =
    SuperFocoViloes.calcular(v).ameaca;


  /* =========================
     DESCOBRIR IMAGENS
  ========================= */

  async function descobrirImagens(){

    const imagens = [];

    let numero = 1;


    while(true){

      const src =
        `assets/viloes/${v.arquivo}-${numero}.png`;


      const existe =
        await new Promise(resolve => {

          const img =
            new Image();


          img.onload =
            () => resolve(true);


          img.onerror =
            () => resolve(false);


          img.src = src;

        });


      if(!existe)
        break;


      imagens.push(src);

      numero++;

    }


    return imagens;

  }


  const imagens =
    await descobrirImagens();


  if(imagens.length){

    $("#foto").src =
      imagens[0];


    imagens.forEach(src => {

      const miniatura =
        document.createElement("img");


      miniatura.src =
        src;


      miniatura.onclick =
        () => {

          $("#foto").src =
            src;

        };


      $("#galeria")
        .appendChild(miniatura);

    });

  }


  /* =========================
     SOBRE
  ========================= */

  $("#sobre").textContent =
    v.sobre ||
    "Sem descrição pública.";


  /* =========================
     PODERES
  ========================= */

  (v.poderes || [])
    .forEach(poder => {

      $("#poderes")
        .insertAdjacentHTML(
          "beforeend",
          `<span class="tag">${poder}</span>`
        );

    });


  /* =========================
     INFORMAÇÕES
  ========================= */

  const atuacao = [

    v.pais,
    v.estado,
    v.cidade

  ]
  .filter(Boolean)
  .join(" • ") || "—";


  [

    [
      "Identidade",
      v.identidade
    ],

    [
      "Situação",
      v.status
    ],

    [
      "Atuação",
      atuacao
    ],

    [
      "Primeira aparição",
      v.primeiraAparicao
    ]

  ]

  .forEach(([titulo,valor]) => {

    $("#info")
      .insertAdjacentHTML(
        "beforeend",

        `
          <dt>${titulo}</dt>
          <dd>${valor || "—"}</dd>
        `
      );

  });


  /* =========================
     SITUAÇÃO
  ========================= */

  const situacao =
    $("#situacao");


  situacao.textContent =
    v.status || "DESCONHECIDO";


  const status =
    String(v.status || "")
      .toLowerCase();


  if(status === "solto"){

    situacao.classList.add(
      "solto"
    );

  }


  else if(status === "preso"){

    situacao.classList.add(
      "preso"
    );

  }


  /* =========================
     ESTATÍSTICAS
  ========================= */

  const stats = [

    [
      "Vítimas",
      v.stats?.vitimas
    ],

    [
      "Confrontos",
      v.stats?.confrontos
    ],

    [
      "Danos materiais",
      v.stats?.danos === null || v.stats?.danos === undefined || v.stats?.danos === ''
        ? null
        : Number(v.stats.danos).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    ],

    [
      "Fugas",
      v.stats?.fugas
    ]

  ];


  stats.forEach(
    ([titulo,valor]) => {

      $("#stats")
        .insertAdjacentHTML(
          "beforeend",

          `
            <div class="stat">

              <strong>
                ${valor === '' ? "—" : valor ?? "—"}
              </strong>

              ${titulo}

            </div>
          `
        );

    }
  );


  /* =========================
     HERÓIS ENFRENTADOS
  ========================= */

  SuperFocoViloes.referencias(v.inimigos || [], H).ids
    .forEach(idHeroi => {

      const h =
        H.find(x =>
          x.id === idHeroi
        );


      $("#inimigos")
        .insertAdjacentHTML(
          "beforeend",

          `
            <div class="inimigo">

              ${
                h

                ? `
                  <a
                    href="heroi.html?id=${h.id}"
                  >
                    ${h.nome}
                  </a>
                `

                : idHeroi
              }

            </div>
          `
        );

    });


  /* =========================
     HISTÓRICO
  ========================= */

  const esc = valor => String(valor ?? '').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
  $('#historico').innerHTML = SuperFocoViloes.noticias(v, N).map(n => `
    <div class="evento"><strong>${esc(n.data)}</strong>
    <a href="noticia.html?id=${encodeURIComponent(n.id)}">${esc(n.titulo)}</a>
    <p>${esc(n.subtitulo || n.resumo || '')}</p></div>`).join('') || 'Nenhuma notícia vinculada até o momento.';

  /* =========================
     COMENTÁRIOS
  ========================= */

  (v.comentarios || [])
    .forEach(c => {

      $("#comentarios")
        .insertAdjacentHTML(
          "beforeend",

          `
            <div class="comentario">

              <strong>
                ${esc(c.usuario)}
              </strong>

              ${esc(c.texto)}
              ${Number.isInteger(c.estrelas) && c.estrelas >= 0 && c.estrelas <= 5 ? `<p aria-label="${c.estrelas} estrelas">${'★'.repeat(c.estrelas)}${'☆'.repeat(5-c.estrelas)}</p>` : ''}
              ${(c.respostas || []).map(r => `<div class="resposta"><strong>${esc(r.usuario)}</strong> ${esc(r.texto)}</div>`).join('')}

            </div>
          `
        );

    });

})();
