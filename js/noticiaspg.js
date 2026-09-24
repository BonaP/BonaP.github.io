(() => {

  const N = window.SUPERFOCO_NOTICIAS || [];

  const lista = document.querySelector("#listaNoticias");
  const filtroTexto = document.querySelector("#filtroTexto");
  const filtroAno = document.querySelector("#filtroAno");
  const filtroMes = document.querySelector("#filtroMes");
  const filtroCategoria = document.querySelector("#filtroCategoria");

  const limparFiltros = document.querySelector("#limparFiltros");

  const quantidade = document.querySelector("#quantidadeNoticias");
  const textoQuantidade = document.querySelector("#textoQuantidade");

  const semNoticias = document.querySelector("#semNoticias");


  /* =========================
     UTILIDADES
  ========================= */

  function normalizar(texto){

    return String(texto || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  }


  function dataNoticia(n){

    if (!n.data) return null;

    const partes = n.data.split("-");

    if (partes.length !== 3) return null;

    return {
      ano:Number(partes[0]),
      mes:Number(partes[1]),
      dia:Number(partes[2])
    };

  }


  function timestamp(n){

    const d = dataNoticia(n);

    if (!d) return 0;

    return new Date(
      d.ano,
      d.mes - 1,
      d.dia
    ).getTime();

  }


  function capaNoticia(n){

    if (!n.capa) return "";

    return `assets/noticias/${n.id}/${n.capa}`;

  }


  const nomesMeses = [
    "",
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro"
  ];


  /* =========================
     CRIAR FILTROS
  ========================= */

  const anos = [...new Set(
    N
      .map(dataNoticia)
      .filter(Boolean)
      .map(d => d.ano)
  )]
  .sort((a,b) => b-a);


  anos.forEach(ano => {

    const option = document.createElement("option");

    option.value = ano;
    option.textContent = ano;

    filtroAno.appendChild(option);

  });


  const categorias = [...new Set(
    N
      .map(n => n.categoria)
      .filter(Boolean)
  )]
  .sort((a,b) => a.localeCompare(b));


  categorias.forEach(categoria => {

    const option = document.createElement("option");

    option.value = categoria;
    option.textContent = categoria;

    filtroCategoria.appendChild(option);

  });


  /* =========================
     FILTRAGEM
  ========================= */

  function filtrar(){

    const busca = normalizar(filtroTexto.value);

    const ano = Number(filtroAno.value);
    const mes = Number(filtroMes.value);

    const categoria = filtroCategoria.value;


    const resultado = N

      .filter(n => {

        const d = dataNoticia(n);

        if (!d) return false;


        /* TEXTO */

        if (busca){

          const textoNoticia = normalizar([
            n.titulo,
            n.subtitulo,
            n.resumo,
            n.categoria,
            ...(n.tags || [])
          ].join(" "));

          if (!textoNoticia.includes(busca))
            return false;

        }


        /* ANO */

        if (ano && d.ano !== ano)
          return false;


        /* MÊS */

        if (mes && d.mes !== mes)
          return false;


        /* CATEGORIA */

        if (
          categoria &&
          n.categoria !== categoria
        )
          return false;


        return true;

      })

      .sort((a,b) =>
        timestamp(b) - timestamp(a)
      );


    renderizar(resultado);

  }


  /* =========================
     RENDERIZAÇÃO
  ========================= */

  function renderizar(noticias){

    quantidade.textContent = noticias.length;

    textoQuantidade.textContent =
      noticias.length === 1
        ? "notícia encontrada"
        : "notícias encontradas";


    lista.innerHTML = "";


    if (!noticias.length){

      semNoticias.hidden = false;

      return;

    }


    semNoticias.hidden = true;


    /*
      Agrupa por ANO + MÊS
    */

    const grupos = {};


    noticias.forEach(n => {

      const d = dataNoticia(n);

      const chave =
        `${d.ano}-${String(d.mes).padStart(2,"0")}`;


      if (!grupos[chave])
        grupos[chave] = [];


      grupos[chave].push(n);

    });


    Object.keys(grupos)

      .sort()
      .reverse()

      .forEach(chave => {

        const [ano, mes] =
          chave.split("-").map(Number);


        const section =
          document.createElement("section");

        section.className = "archive-month";


        section.innerHTML = `

          <div class="archive-month-title">

            <h2>
              ${nomesMeses[mes]} de ${ano}
            </h2>

          </div>

        `;


        grupos[chave].forEach(n => {

          const d = dataNoticia(n);


          const card =
            document.createElement("a");


          card.className = "archive-card";

          card.href =
            `noticia.html?id=${encodeURIComponent(n.id)}`;


          const capa = capaNoticia(n);


          card.innerHTML = `

            <div
              class="archive-image"
              ${capa
                ? `style="background-image:url('${capa}')"`
                : ""}
            ></div>


            <div class="archive-content">

              <div class="archive-meta">

                ${String(d.dia).padStart(2,"0")}
                ${nomesMeses[d.mes].slice(0,3).toUpperCase()}
                ${d.ano}

                ${n.categoria
                  ? ` • ${n.categoria}`
                  : ""}

              </div>


              <h3>
                ${n.titulo}
              </h3>


              <p>
                ${n.subtitulo || n.resumo || ""}
              </p>

            </div>

          `;


          section.appendChild(card);

        });


        lista.appendChild(section);

      });

  }


  /* =========================
     EVENTOS
  ========================= */

  filtroTexto.addEventListener(
    "input",
    filtrar
  );


  filtroAno.addEventListener(
    "change",
    filtrar
  );


  filtroMes.addEventListener(
    "change",
    filtrar
  );


  filtroCategoria.addEventListener(
    "change",
    filtrar
  );


  limparFiltros.addEventListener(
    "click",
    () => {

      filtroTexto.value = "";
      filtroAno.value = "";
      filtroMes.value = "";
      filtroCategoria.value = "";

      filtrar();

    }
  );


  /* PRIMEIRA EXIBIÇÃO */

  filtrar();

})();