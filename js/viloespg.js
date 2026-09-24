(() => {

  const V =
    window.SUPERFOCO_VILOES || [];


  const lista =
    document.querySelector("#listaViloes");

  const filtroVilao =
    document.querySelector("#filtroVilao");

  const filtroPais =
    document.querySelector("#filtroPais");

  const filtroEstado =
    document.querySelector("#filtroEstado");

  const filtroSituacao =
    document.querySelector("#filtroSituacao");

  const filtroAmeaca =
    document.querySelector("#filtroAmeaca");

  const limparFiltros =
    document.querySelector("#limparFiltros");

  const quantidade =
    document.querySelector("#quantidadeViloes");

  const textoQuantidade =
    document.querySelector("#textoQuantidade");

  const semViloes =
    document.querySelector("#semViloes");

  const botoesOrdenacao =
    [...document.querySelectorAll(".sort-button")];


  /*
    Ordem padrão.
  */

  let ordenacoesAtivas =
    ["alfabetica"];


  /* =========================
     UTILIDADES
  ========================= */

  function normalizar(texto){

    return String(texto || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g,"")
      .toLowerCase();

  }


  function arquivoVilao(v){

    return v.arquivo ||
      normalizar(v.nome)
        .replace(/\s+/g,"_")
        .toUpperCase();

  }


  function iconeVilao(v){

    return `assets/icones/ICONE-${arquivoVilao(v)}.png`;

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


  function localVilao(v){

    let local = "";


    if(v.cidade && v.estado){

      local =
        `${v.cidade}/${v.estado}`;

    }

    else if(v.estado){

      local =
        v.estado;

    }

    else if(v.cidade){

      local =
        v.cidade;

    }


    return {

      pais:
        siglaPais(v.pais),

      local

    };

  }


  /* =========================
     AMEAÇA
  ========================= */

  const niveisAmeaca = {

    baixa:1,

    moderada:2,

    alta:3,

    severa:4,

    extrema:5

  };


  function valorAmeaca(ameaca){

    return niveisAmeaca[
      normalizar(ameaca)
    ] || 0;

  }


  function classeAmeaca(ameaca){

    const a =
      normalizar(ameaca);


    if(a === "baixa")
      return "threat-low";


    if(a === "moderada")
      return "threat-moderate";


    if(a === "alta")
      return "threat-high";


    if(a === "severa")
      return "threat-severe";


    if(a === "extrema")
      return "threat-extreme";


    return "threat-low";

  }


  /* =========================
     SITUAÇÃO
  ========================= */

  function classeSituacao(status){

    const s =
      normalizar(status);


    if(s === "solto")
      return "status-free";


    if(s === "preso")
      return "status-arrested";


    return "status-unknown";

  }


  /* =========================
     ORDENAÇÃO
  ========================= */

  function compararAlfabetica(a,b){

    return a.nome.localeCompare(
      b.nome,
      "pt-BR"
    );

  }


  function compararAmeaca(a,b){

    /*
      Maior ameaça primeiro.
    */

    return (
      valorAmeaca(b.ameaca) -
      valorAmeaca(a.ameaca)
    );

  }


  function ordenarViloes(a,b){

    const criterios =
      ordenacoesAtivas.length

        ? ordenacoesAtivas

        : ["alfabetica"];


    for(const criterio of criterios){

      let resultado = 0;


      if(
        criterio === "alfabetica"
      ){

        resultado =
          compararAlfabetica(a,b);

      }


      else if(
        criterio === "ameaca"
      ){

        resultado =
          compararAmeaca(a,b);

      }


      if(resultado !== 0){

        return resultado;

      }

    }


    /*
      Desempate sempre alfabético.
    */

    return compararAlfabetica(a,b);

  }


  /* =========================
     CRIAR FILTROS
  ========================= */

  const paises = [

    ...new Set(

      V
        .map(v => v.pais)
        .filter(Boolean)

    )

  ].sort(
    (a,b) =>
      a.localeCompare(b,"pt-BR")
  );


  paises.forEach(pais => {

    const option =
      document.createElement("option");

    option.value =
      pais;

    option.textContent =
      pais;

    filtroPais.appendChild(option);

  });


  const estados = [

    ...new Set(

      V
        .map(v => v.estado)
        .filter(Boolean)

    )

  ].sort(
    (a,b) =>
      a.localeCompare(b,"pt-BR")
  );


  estados.forEach(estado => {

    const option =
      document.createElement("option");

    option.value =
      estado;

    option.textContent =
      estado;

    filtroEstado.appendChild(option);

  });


  /* =========================
     FILTRAGEM
  ========================= */

  function filtrar(){

    const busca =
      normalizar(
        filtroVilao.value
      );


    const pais =
      filtroPais.value;


    const estado =
      filtroEstado.value;


    const situacao =
      filtroSituacao.value;


    const ameaca =
      filtroAmeaca.value;


    const resultado = V


      /*
        Somente vilões com página pública.
      */

      .filter(v =>
        v.pagina !== false
      )


      .filter(v => {


        /* PESQUISA */

        if(busca){

          const texto =
            normalizar([

              v.nome,

              v.identidade,

              v.pais,

              v.estado,

              v.cidade,

              v.status,

              v.ameaca,

              ...(v.poderes || []),

              ...(v.crimes || [])

            ].join(" "));


          if(
            !texto.includes(busca)
          ){

            return false;

          }

        }


        /* PAÍS */

        if(
          pais &&
          v.pais !== pais
        ){

          return false;

        }


        /* ESTADO */

        if(
          estado &&
          v.estado !== estado
        ){

          return false;

        }


        /* SITUAÇÃO */

        if(
          situacao &&
          normalizar(v.status) !==
          normalizar(situacao)
        ){

          return false;

        }


        /* AMEAÇA */

        if(
          ameaca &&
          normalizar(v.ameaca) !==
          normalizar(ameaca)
        ){

          return false;

        }


        return true;

      })


      .sort(ordenarViloes);


    renderizar(resultado);

  }


  /* =========================
     RENDERIZAÇÃO
  ========================= */

  function renderizar(viloes){

    quantidade.textContent =
      viloes.length;


    textoQuantidade.textContent =

      viloes.length === 1

        ? "vilão encontrado"

        : "vilões encontrados";


    lista.innerHTML = "";


    if(!viloes.length){

      semViloes.hidden =
        false;

      return;

    }


    semViloes.hidden =
      true;


    viloes.forEach(v => {

      const local =
        localVilao(v);


      const row =
        document.createElement("a");


      row.className =
        "villain-row";


      row.href =
        `vilao.html?id=${encodeURIComponent(v.id)}`;


      row.innerHTML = `


        <!-- VILÃO -->

        <div class="villain-name">


          <img
            class="villain-icon"
            src="${iconeVilao(v)}"
            alt="${v.nome}"
          >


          <div class="villain-name-text">


            <strong>
              ${v.nome}
            </strong>


            ${
              v.identidade

                ? `<span>${v.identidade}</span>`

                : ""
            }


          </div>


        </div>


        <!-- AMEAÇA -->

        <div class="villain-threat">

          <span
            class="
              threat-badge
              ${classeAmeaca(v.ameaca)}
            "
          >

            ${v.ameaca || "DESCONHECIDA"}

          </span>

        </div>


        <!-- ATUAÇÃO -->

        <div class="villain-location">


          <strong>
            ${local.pais}
          </strong>


          ${
            local.local

              ? `<span>${local.local}</span>`

              : ""
          }


        </div>


        <!-- SITUAÇÃO -->

        <div class="villain-status">


          <span
            class="
              status-dot
              ${classeSituacao(v.status)}
            "
          ></span>


          ${v.status || "DESCONHECIDO"}


        </div>


      `;


      lista.appendChild(row);

    });

  }


  /* =========================
     EVENTOS DOS FILTROS
  ========================= */

  filtroVilao.addEventListener(
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


  filtroSituacao.addEventListener(
    "change",
    filtrar
  );


  filtroAmeaca.addEventListener(
    "change",
    filtrar
  );


  /* =========================
     ORDENAÇÃO
  ========================= */

  botoesOrdenacao.forEach(
    botao => {

      botao.addEventListener(
        "click",
        () => {

          const criterio =
            botao.dataset.sort;


          if(
            ordenacoesAtivas.includes(
              criterio
            )
          ){

            ordenacoesAtivas =
              ordenacoesAtivas.filter(
                item =>
                  item !== criterio
              );


            botao.classList.remove(
              "active"
            );

          }

          else{

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

    }
  );


  /* =========================
     LIMPAR
  ========================= */

  limparFiltros.addEventListener(
    "click",
    () => {

      filtroVilao.value = "";

      filtroPais.value = "";

      filtroEstado.value = "";

      filtroSituacao.value = "";

      filtroAmeaca.value = "";


      /*
        Volta ao padrão alfabético.
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
     INICIAR
  ========================= */

  filtrar();

})();