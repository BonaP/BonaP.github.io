(async () => {

    const $ = s => document.querySelector(s);

    const id = new URLSearchParams(location.search).get("id");

    const H = window.SUPERFOCO_HEROIS || [];
    const V = window.SUPERFOCO_VILOES || [];
    const N = window.SUPERFOCO_NOTICIAS || [];

    const h = H.find(x => x.id === id);


    // ==========================================
    // HERÓI NÃO ENCONTRADO
    // ==========================================

    if (!h) {

        $("#perfil")
            .querySelectorAll(":scope>*:not(#erro)")
            .forEach(x => x.hidden = true);

        $("#erro").hidden = false;

        return;
    }


    // ==========================================
    // FUNÇÃO — DESCOBRIR FOTOS AUTOMATICAMENTE
    // ==========================================

    async function descobrirImagensHeroi(h) {

        const imagens = [];
        let numero = 1;

        while (true) {

            const caminho =
                `assets/herois/${h.arquivo}-${numero}.png`;

            const existe = await new Promise(resolve => {

                const teste = new Image();

                teste.onload = () => resolve(true);
                teste.onerror = () => resolve(false);

                teste.src = caminho;
            });

            if (!existe) break;

            imagens.push(caminho);

            numero++;
        }

        return imagens;
    }


    // ==========================================
    // INFORMAÇÕES PRINCIPAIS
    // ==========================================

    document.title = h.nome + " | SuperFoco";

    $("#nome").textContent = h.nome;

    $("#icone").src =
        `assets/icones/ICONE-${h.arquivo}.png`;


    // ==========================================
    // META
    // ==========================================

    [
        h.status,
        h.cidade,
        h.afiliacao
    ]
        .filter(Boolean)
        .forEach(v =>
            $("#meta").insertAdjacentHTML(
                "beforeend",
                `<span class="pill">${v}</span>`
            )
        );


    // ==========================================
    // RANKING
    // ==========================================

    $("#rank").textContent =
        h.ranking ? `#${h.ranking}` : "—";

    if (h.ranking && h.rankingAnterior) {

        const d =
            h.rankingAnterior - h.ranking;

        $("#variacao").textContent =
            d > 0
                ? `▲ ${d}`
                : d < 0
                    ? `▼ ${Math.abs(d)}`
                    : "—";
    }


    // ==========================================
    // GALERIA AUTOMÁTICA
    // ==========================================

    const imagens =
        await descobrirImagensHeroi(h);

    const galeria = $("#galeria");

    let indiceInicial = 0;


    // Nenhuma foto encontrada

    if (!imagens.length) {

        $("#foto").style.display = "none";

        galeria.innerHTML = "";

    } else {

        // Primeira imagem = foto principal

        $("#foto").src = imagens[0];


        // Cria todas as miniaturas

        imagens.forEach((src, indice) => {

            const im =
                document.createElement("img");

            im.src = src;

            im.alt =
                `${h.nome} - Foto ${indice + 1}`;

            im.dataset.index = indice;

            im.onclick = () => {

                $("#foto").src = src;

                galeria
                    .querySelectorAll("img")
                    .forEach(x =>
                        x.classList.remove("ativa")
                    );

                im.classList.add("ativa");
            };

            if (indice === 0) {
                im.classList.add("ativa");
            }

            galeria.append(im);
        });
    }


    // ==========================================
    // SOBRE
    // ==========================================

    $("#sobre").textContent =
        h.sobre || "Sem descrição pública.";


    // ==========================================
    // PODERES
    // ==========================================

    for (const p of h.poderes || []) {

        $("#poderes").insertAdjacentHTML(
            "beforeend",
            `<span class="tag">${p}</span>`
        );
    }


    // ==========================================
    // INFORMAÇÕES
    // ==========================================

    const atuacao =
        [h.pais, h.estado, h.cidade]
            .filter(Boolean)
            .join(" • ") || "—";

    for (const [a, b] of [

        ["Identidade", h.identidade],

        ["Status", h.status],

        ["Atuação", atuacao],

        ["Afiliação", h.afiliacao || "Nenhuma"],

        ["Primeira aparição", h.primeiraAparicao]

    ]) {

        $("#info").insertAdjacentHTML(
            "beforeend",
            `<dt>${a}</dt><dd>${b || "—"}</dd>`
        );
    }


    // ==========================================
    // ESTATÍSTICAS
    // ==========================================

    for (const [a, b] of [

        [
            "Popularidade",
            h.popularidade != null
                ? h.popularidade + "%"
                : "—"
        ],

        [
            "Melhor ranking",
            h.melhorRanking
                ? "#" + h.melhorRanking
                : "—"
        ],

        [
            "Ocorrências",
            h.stats?.ocorrencias ?? "—"
        ],

        [
            "Resgates",
            h.stats?.resgates ?? "—"
        ],

        [
            "Prisões",
            h.stats?.prisoes ?? "—"
        ],

        [
            "Danos",
            h.stats?.danos ?? "—"
        ]

    ]) {

        $("#stats").insertAdjacentHTML(
            "beforeend",
            `<div class="stat">
                <strong>${b}</strong>
                ${a}
            </div>`
        );
    }


    // ==========================================
    // INIMIGOS
    // ==========================================

    for (const x of h.inimigos || []) {

        const v =
            V.find(y => y.id === x);

        $("#inimigos").insertAdjacentHTML(
            "beforeend",

            `<div class="inimigo">
                ${
                    v
                        ? `<a href="vilao.html?id=${v.id}">
                            ${v.nome}
                           </a>`
                        : x
                }
            </div>`
        );
    }


    // ==========================================
    // HISTÓRICO
    // ==========================================

    for (const e of h.historico || []) {

        $("#historico").insertAdjacentHTML(
            "beforeend",

            `<div class="evento">
                <strong>${e.data}</strong>
                ${e.evento}
            </div>`
        );
    }


    // ==========================================
    // NOTÍCIAS
    // ==========================================

    const ns =
        N.filter(n =>
            (n.herois || []).includes(h.id)
        );

    $("#noticias").innerHTML =
        ns.length

            ? ns.map(n => `

                <div class="noticia">

                    <a href="noticia.html?id=${n.id}">
                        <strong>
                            ${n.titulo}
                        </strong>
                    </a>

                    <p>
                        ${n.resumo || n.subtitulo || ""}
                    </p>

                </div>

            `).join("")

            : "Nenhuma matéria cadastrada até o momento.";


    // ==========================================
    // COMENTÁRIOS
    // ==========================================

    for (const c of h.comentarios || []) {

        $("#comentarios").insertAdjacentHTML(
            "beforeend",

            `<div class="comentario">
                <strong>${c.usuario}</strong>
                <br>
                ${c.texto}
            </div>`
        );
    }

})();