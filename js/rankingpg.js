(() => {

  const H =
    window.SUPERFOCO_HEROIS || [];


  const podio =
    document.querySelector("#podio");

  const top15 =
    document.querySelector("#top15");

  const rankingLista =
    document.querySelector("#rankingLista");

  const rankingVazio =
    document.querySelector("#rankingVazio");


  /* =========================
     UTILIDADES
  ========================= */

  function normalizar(texto){

    return String(texto || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g,"")
      .toLowerCase();

  }


  function arquivoHeroi(h){

    return h.arquivo ||
      normalizar(h.nome)
        .replace(/\s+/g,"_")
        .toUpperCase();

  }


  function iconeHeroi(h){

    return `assets/icones/ICONE-${arquivoHeroi(h)}.png`;

  }


  function fotoHeroi(h){

    return h.imagem ||
      `assets/herois/${arquivoHeroi(h)}-1.png`;

  }


  /* =========================
     LOCALIZAÇÃO
  ========================= */

  function siglaPais(pais){

    const p =
      normalizar(pais);


    if(p === "brasil")
      return "BR";


    if(p === "estados unidos")
      return "EUA";


    return pais || "—";

  }


  function localHeroi(h){

    let local = "";


    if(h.cidade && h.estado){

      local =
        `${h.cidade}/${h.estado}`;

    }

    else if(h.estado){

      local = h.estado;

    }

    else if(h.cidade){

      local = h.cidade;

    }


    return {

      pais:
        siglaPais(h.pais),

      local

    };

  }


  /* =========================
     STATUS
  ========================= */

  function classeStatus(status){

    const s =
      normalizar(status);


    if(s === "ativo")
      return "status-active";


    if(
      s === "desativado" ||
      s === "desaparecido"
    )
      return "status-inactive";


    if(
      s === "morto" ||
      s === "aposentado"
    )
      return "status-retired";


    return "status-unknown";

  }


  /* =========================
     HERÓIS CLASSIFICADOS
  ========================= */

  const classificados = H

    .filter(h =>
      h.pagina !== false
    )

    .filter(h =>
      typeof h.ranking === "number"
    )

    .slice()

    .sort((a,b) =>
      a.ranking - b.ranking
    );


  /* =========================
     PÓDIO
  ========================= */

  const heroisPodio =
    classificados.filter(h =>
      h.ranking >= 1 &&
      h.ranking <= 3
    );


  /*
    Ordem visual:
    #2 | #1 | #3
  */

  const ordemPodio = [2,1,3];


  ordemPodio.forEach(posicao => {

    const h =
      heroisPodio.find(
        heroi =>
          heroi.ranking === posicao
      );


    if(!h)
      return;


    const local =
      localHeroi(h);


    const classe =

      posicao === 1
        ? "first"

      : posicao === 2
        ? "second"

      : "third";


    const card =
      document.createElement("a");


    card.className =
      `podium-card ${classe}`;


    card.href =
      `heroi.html?id=${encodeURIComponent(h.id)}`;


    card.innerHTML = `

      <div
        class="podium-photo"
        style="
          background-image:
          url('${fotoHeroi(h)}')
        "
      ></div>


      <div class="podium-content">


        <div class="podium-position">

          #${h.ranking}

        </div>


        <div class="podium-name">

          <img
            class="podium-icon"
            src="${iconeHeroi(h)}"
            alt="${h.nome}"
          >


          <div>

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


        <div class="podium-data">


          <div>

            Popularidade

            <strong>
              ${
                typeof h.popularidade === "number"
                  ? `${h.popularidade}%`
                  : "—"
              }
            </strong>

          </div>


          <div>

            Atuação

            <strong>
              ${local.pais}
              ${
                local.local
                  ? ` • ${local.local}`
                  : ""
              }
            </strong>

          </div>


        </div>

      </div>

    `;


    podio.appendChild(card);

  });


  /* =========================
     #4 ATÉ #15
  ========================= */

  const elite =
    classificados.filter(h =>
      h.ranking >= 4 &&
      h.ranking <= 15
    );


  elite.forEach(h => {

    const card =
      document.createElement("a");


    card.className =
      "top15-card";


    card.href =
      `heroi.html?id=${encodeURIComponent(h.id)}`;


    card.innerHTML = `

      <div class="top15-position">

        #${h.ranking}

      </div>


      <img
        class="top15-icon"
        src="${iconeHeroi(h)}"
        alt="${h.nome}"
      >


      <div class="top15-info">

        <strong>
          ${h.nome}
        </strong>

        ${
          h.identidade
            ? `<span>${h.identidade}</span>`
            : ""
        }

      </div>


      <div class="top15-popularity">

        POP.

        <strong>

          ${
            typeof h.popularidade === "number"
              ? `${h.popularidade}%`
              : "—"
          }

        </strong>

      </div>

    `;


    top15.appendChild(card);

  });


  /* =========================
     #16 EM DIANTE
  ========================= */

  const restante =
    classificados.filter(h =>
      h.ranking >= 16
    );


  if(!restante.length){

    rankingVazio.hidden = false;

  }

  else{

    rankingVazio.hidden = true;


    restante.forEach(h => {

      const local =
        localHeroi(h);


      const row =
        document.createElement("a");


      row.className =
        "ranking-row";


      row.href =
        `heroi.html?id=${encodeURIComponent(h.id)}`;


      row.innerHTML = `


        <!-- POSIÇÃO -->

        <div class="ranking-position">

          #${h.ranking}

        </div>


        <!-- HERÓI -->

        <div class="ranking-hero">

          <img
            class="ranking-icon"
            src="${iconeHeroi(h)}"
            alt="${h.nome}"
          >


          <div>

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


        <!-- POPULARIDADE -->

        <div class="ranking-popularity">

          ${
            typeof h.popularidade === "number"
              ? `${h.popularidade}%`
              : "—"
          }

        </div>


        <!-- ATUAÇÃO -->

        <div class="ranking-location">

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

        <div class="ranking-status">

          <span
            class="
              ranking-status-dot
              ${classeStatus(h.status)}
            "
          ></span>

          ${h.status || "Desconhecido"}

        </div>

      `;


      rankingLista.appendChild(row);

    });

  }

})();