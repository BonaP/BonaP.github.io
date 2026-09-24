(() => {

  const H = window.SUPERFOCO_HEROIS || [];

  const lista = document.querySelector("#listaHerois");
  const filtroHeroi = document.querySelector("#filtroHeroi");
  const filtroPais = document.querySelector("#filtroPais");
  const filtroEstado = document.querySelector("#filtroEstado");
  const filtroStatus = document.querySelector("#filtroStatus");
  const limparFiltros = document.querySelector("#limparFiltros");
  const quantidade = document.querySelector("#quantidadeHerois");
  const textoQuantidade = document.querySelector("#textoQuantidade");
  const semHerois = document.querySelector("#semHerois");

  const botoesOrdenacao =
    [...document.querySelectorAll(".sort-button")];

  /*
    Alfabética começa ativa por padrão.

    A ordem deste array representa a prioridade
    das ordenações quando mais de uma estiver ativa.
  */
  let ordenacoesAtivas = ["alfabetica"];


  /* =========================
     UTILIDADES
  ========================= */

  function normalizar(texto) {

    return String(texto || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  }


  function arquivoHeroi(h) {

    return h.arquivo ||
      normalizar(h.nome)
        .replace(/\s+/g, "_")
        .toUpperCase();

  }


  function iconeHeroi(h) {

    return `assets/icones/ICONE-${arquivoHeroi(h)}.png`;

  }


  /* =========================
     ORDENAÇÃO
  ========================= */

  function compararAlfabetica(a, b) {

    return a.nome.localeCompare(
      b.nome,
      "pt-BR"
    );

  }


  function compararRank(a, b) {

    /*
      Heróis sem ranking ficam no final.
      Ranking menor = posição melhor.
    */

    const rankA =
      typeof a.ranking === "number"
        ? a.ranking
        : Infinity;

    const rankB =
      typeof b.ranking === "number"
        ? b.ranking
        : Infinity;

    return rankA - rankB;

  }


  function compararPopularidade(a, b) {

    /*
      Popularidade maior aparece primeiro.
      Heróis sem popularidade ficam no final.
    */

    const popA =
      typeof a.popularidade === "number"
        ? a.popularidade
        : -Infinity;

    const popB =
      typeof b.popularidade === "number"
        ? b.popularidade
        : -Infinity;

    return popB - popA;

  }


  function ordenarHerois(a, b) {

    /*
      Se nenhum botão estiver ativo,
      usa ordem alfabética automaticamente.
    */

    const criterios =
      ordenacoesAtivas.length
        ? ordenacoesAtivas
        : ["alfabetica"];


    for (const criterio of criterios) {

      let resultado = 0;


      if (criterio === "alfabetica") {

        resultado =
          compararAlfabetica(a, b);

      }


      else if (criterio === "rank") {

        resultado =
          compararRank(a, b);

      }


      else if (criterio === "popularidade") {

        resultado =
          compararPopularidade(a, b);

      }


      /*
        Se não houve empate,
        já encontramos a ordem.
      */

      if (resultado !== 0) {

        return resultado;

      }

    }


    /*
      Se todos os critérios empatarem,
      usa alfabética como desempate final.
    */

    return compararAlfabetica(a, b);

  }


  /* =========================
     LOCALIZAÇÃO
  ========================= */

  function siglaPais(pais) {

    const paisNormalizado =
      normalizar(pais);


    if (paisNormalizado === "brasil")
      return "BR";


    if (paisNormalizado === "estados unidos")
      return "EUA";


    return pais || "—";

  }


  function localHeroi(h) {

    const pais = siglaPais(h.pais);

    let local = "";


    if (h.cidade && h.estado) {

      local =
        `${h.cidade}/${h.estado}`;

    }

    else if (h.estado) {

      local = h.estado;

    }

    else if (h.cidade) {

      local = h.cidade;

    }


    return {
      pais,
      local
    };

  }


  /* =========================
     STATUS
  ========================= */

  function classeStatus(status) {

    const s =
      normalizar(status);


    /*
      Verde
    */

    if (s === "ativo")
      return "status-active";


    /*
      Vermelho
    */

    if (
      s === "desativado" ||
      s === "desaparecido"
    )
      return "status-inactive";


    /*
      Cinza
    */

    if (
      s === "morto" ||
      s === "aposentado"
    )
      return "status-retired";


    return "status-unknown";

  }


  /* =========================
     CRIAR FILTROS
  ========================= */

  const paises = [...new Set(

    H
      .map(h => h.pais)
      .filter(Boolean)

  )].sort((a, b) =>
    a.localeCompare(b, "pt-BR")
  );


  paises.forEach(pais => {

    const option =
      document.createElement("option");

    option.value = pais;
    option.textContent = pais;

    filtroPais.appendChild(option);

  });


  const estados = [...new Set(

    H
      .map(h => h.estado)
      .filter(Boolean)

  )].sort((a, b) =>
    a.localeCompare(b, "pt-BR")
  );


  estados.forEach(estado => {

    const option =
      document.createElement("option");

    option.value = estado;
    option.textContent = estado;

    filtroEstado.appendChild(option);

  });


  /* =========================
     FILTRAGEM
  ========================= */

  function filtrar() {

    const busca =
      normalizar(filtroHeroi.value);

    const pais =
      filtroPais.value;

    const estado =
      filtroEstado.value;

    const status =
      filtroStatus.value;


    const resultado = H

      /*
        Não exibe personagens explicitamente
        marcados como pagina:false.
      */

      .filter(h =>
        h.pagina !== false
      )


      .filter(h => {

        /* PESQUISA */

        if (busca) {

          const texto = normalizar([
            h.nome,
            h.identidade,
            h.pais,
            h.estado,
            h.cidade,
            h.afiliacao,
            h.status,
            ...(h.poderes || [])
          ].join(" "));


          if (!texto.includes(busca))
            return false;

        }


        /* PAÍS */

        if (
          pais &&
          h.pais !== pais
        )
          return false;


        /* ESTADO */

        if (
          estado &&
          h.estado !== estado
        )
          return false;


        /* STATUS */

        if (
          status &&
          normalizar(h.status) !==
          normalizar(status)
        )
          return false;


        return true;

      })


      /*
        Usa os botões de ordenação.
      */

      .sort(ordenarHerois);


    renderizar(resultado);

  }


  /* =========================
     RENDERIZAÇÃO
  ========================= */

  function renderizar(herois) {

    quantidade.textContent =
      herois.length;


    textoQuantidade.textContent =
      herois.length === 1
        ? "herói encontrado"
        : "heróis encontrados";


    lista.innerHTML = "";


    if (!herois.length) {

      semHerois.hidden = false;

      return;

    }


    semHerois.hidden = true;


    herois.forEach(h => {

      const local =
        localHeroi(h);


      const row =
        document.createElement("a");


      row.className =
        "hero-row";


      row.href =
        `heroi.html?id=${encodeURIComponent(h.id)}`;


      const popularidade =
        Number(h.popularidade);


      const temPopularidade =
        h.popularidade !== null &&
        h.popularidade !== undefined &&
        h.popularidade !== "" &&
        Number.isFinite(popularidade);


      row.innerHTML = `

        <!-- HERÓI -->

        <div class="hero-name">

          <img
            class="hero-icon"
            src="${iconeHeroi(h)}"
            alt="${h.nome}"
          >

          <div class="hero-name-text">

            <strong>
              ${h.nome}
            </strong>

            ${
              h.identidade
                ? `<span>${h.identidade}</span>`
                : ""
            }

          </div>

        </div>


        <!-- RANK -->

        <div class="
          hero-rank
          ${typeof h.ranking === "number" ? "" : "no-rank"}
        ">

          ${
            typeof h.ranking === "number"
              ? `#${h.ranking}`
              : "—"
          }

        </div>


        <!-- POPULARIDADE -->

        <div class="hero-popularity">

          ${
            temPopularidade
              ? `${popularidade}%`
              : "—"
          }

          ${
            temPopularidade
              ? `
                <div class="popularity-bar">

                  <div
                    class="popularity-fill"
                    style="width:${Math.max(
                      0,
                      Math.min(
                        100,
                        popularidade
                      )
                    )}%"
                  ></div>

                </div>
              `
              : ""
          }

        </div>


        <!-- ATUAÇÃO -->

        <div class="hero-location">

          <strong>
            ${local.pais}
          </strong>

          ${
            local.local
              ? `<span>${local.local}</span>`
              : ""
          }

        </div>


        <!-- STATUS -->

        <div class="hero-status">

          <span
            class="
              status-dot
              ${classeStatus(h.status)}
            "
          ></span>

          ${h.status || "Desconhecido"}

        </div>

      `;


      lista.appendChild(row);

    });

  }


  /* =========================
     FILTROS
  ========================= */

  filtroHeroi.addEventListener(
    "input",
    filtrar
  );


  filtroPais.addEventListener(
    "change",
    filtrar
  );


  filtroEstado.addEventListener(
    "change",
    filtrar
  );


  filtroStatus.addEventListener(
    "change",
    filtrar
  );


  /* =========================
     BOTÕES DE ORDENAÇÃO
  ========================= */

  botoesOrdenacao.forEach(botao => {

    botao.addEventListener(
      "click",
      () => {

        const criterio =
          botao.dataset.sort;


        /*
          Se já está ativo,
          desativa.
        */

        if (
          ordenacoesAtivas.includes(criterio)
        ) {

          ordenacoesAtivas =
            ordenacoesAtivas.filter(
              item =>
                item !== criterio
            );


          botao.classList.remove(
            "active"
          );

        }


        /*
          Se está desligado,
          ativa e coloca no final
          da prioridade.
        */

        else {

          ordenacoesAtivas.push(
            criterio
          );


          botao.classList.add(
            "active"
          );

        }


        filtrar();

      }
    );

  });


  /* =========================
     LIMPAR FILTROS
  ========================= */

  limparFiltros.addEventListener(
    "click",
    () => {

      filtroHeroi.value = "";
      filtroPais.value = "";
      filtroEstado.value = "";
      filtroStatus.value = "";


      /*
        Restaura a ordenação padrão.
      */

      ordenacoesAtivas =
        ["alfabetica"];


      botoesOrdenacao.forEach(
        botao => {

          botao.classList.toggle(
            "active",
            botao.dataset.sort ===
              "alfabetica"
          );

        }
      );


      filtrar();

    }
  );


  /* =========================
     INICIALIZAÇÃO
  ========================= */

  filtrar();

})();