/* =====================================================
   Para Nicoly 🌹 — script.js
===================================================== */

(function () {
    "use strict";

    const reduzirMovimento = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;


    /* ================================================
       MODAL
    ================================================ */

    const modal = document.getElementById("loveModal");
    const btnAbrir = document.getElementById("btn-abrir");
    const btnFechar = document.getElementById("btn-fechar");
    const btnContinuar = document.getElementById("btn-continuar");

    function abrirModal() {
        modal.classList.add("active");
        modal.setAttribute("aria-hidden", "false");
        btnFechar.focus();
    }

    function fecharModal(irParaCapitulo = false) {
        modal.classList.remove("active");
        modal.setAttribute("aria-hidden", "true");

        if (irParaCapitulo) {
            document
                .getElementById("capitulo-1")
                .scrollIntoView({
                    behavior: reduzirMovimento ? "auto" : "smooth"
                });
        } else {
            btnAbrir.focus({ preventScroll: true });
        }
    }

    btnAbrir.addEventListener("click", abrirModal);
    btnFechar.addEventListener("click", () => fecharModal());
    btnContinuar.addEventListener("click", () => fecharModal(true));

    // Clicar fora da caixa fecha
    modal.addEventListener("click", (event) => {
        if (event.target === modal) fecharModal();
    });

    // Esc fecha
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && modal.classList.contains("active")) {
            fecharModal();
        }
    });


    /* ================================================
       CONTADOR
       Meses completos + o restante em dias/h/min/s.
       Se o dia não existir no mês (ex.: 31), usa o
       último dia daquele mês, sem pular para o próximo.
    ================================================ */

    const dataInicio = new Date(2026, 4, 4, 0, 0, 0); // 04/05/2026 00:00 (maio = 4)

    function somarMeses(data, quantidade) {
        const alvo = new Date(
            data.getFullYear(),
            data.getMonth() + quantidade,
            1,
            data.getHours(),
            data.getMinutes(),
            data.getSeconds()
        );

        const ultimoDia = new Date(
            alvo.getFullYear(),
            alvo.getMonth() + 1,
            0
        ).getDate();

        alvo.setDate(Math.min(data.getDate(), ultimoDia));

        return alvo;
    }

    const el = {
        meses: document.getElementById("meses"),
        dias: document.getElementById("dias"),
        horas: document.getElementById("horas"),
        minutos: document.getElementById("minutos"),
        segundos: document.getElementById("segundos")
    };

    function atualizarContador() {
        const agora = new Date();

        let meses =
            (agora.getFullYear() - dataInicio.getFullYear()) * 12 +
            (agora.getMonth() - dataInicio.getMonth());

        if (somarMeses(dataInicio, meses) > agora) meses--;
        if (meses < 0) meses = 0;

        const base = somarMeses(dataInicio, meses);
        const diff = Math.max(0, agora - base);

        const segundosTotais = Math.floor(diff / 1000);

        el.meses.textContent = meses;
        el.dias.textContent = Math.floor(segundosTotais / 86400);
        el.horas.textContent = Math.floor(segundosTotais / 3600) % 24;
        el.minutos.textContent = Math.floor(segundosTotais / 60) % 60;
        el.segundos.textContent = segundosTotais % 60;
    }

    atualizarContador();
    setInterval(atualizarContador, 1000);


    /* ================================================
       CARTA (efeito de digitação)
       Só começa quando a carta aparece na tela.
       A parte que falta fica invisível, mas reserva o
       espaço, então a página não "pula" enquanto digita.
       Clicar na carta mostra tudo de uma vez.
    ================================================ */

    const cartaEl = document.getElementById("texto-carta");
    const letterEl = document.querySelector(".letter");

    const textoCarta = cartaEl.textContent.trim();

    const digitado = document.createElement("span");
    const restante = document.createElement("span");
    restante.className = "letter-rest";
    restante.setAttribute("aria-hidden", "true");

    cartaEl.textContent = "";
    cartaEl.append(digitado, restante);

    // Leitores de tela recebem o texto completo desde o início
    cartaEl.setAttribute("aria-label", textoCarta);
    cartaEl.setAttribute("role", "text");
    digitado.setAttribute("aria-hidden", "true");

    let posicao = 0;
    let timer = null;
    let iniciou = false;

    function renderizar() {
        digitado.textContent = textoCarta.slice(0, posicao);
        restante.textContent = textoCarta.slice(posicao);
    }

    function mostrarTudo() {
        clearTimeout(timer);
        posicao = textoCarta.length;
        renderizar();
    }

    function digitar() {
        if (posicao >= textoCarta.length) return;

        posicao++;
        renderizar();

        // Pausa um pouquinho mais em quebras de linha e pontuação
        const letra = textoCarta.charAt(posicao - 1);
        const atraso = letra === "\n" ? 140 : /[.,?!]/.test(letra) ? 90 : 26;

        timer = setTimeout(digitar, atraso);
    }

    function iniciarCarta() {
        if (iniciou) return;
        iniciou = true;

        if (reduzirMovimento) {
            mostrarTudo();
        } else {
            digitar();
        }
    }

    renderizar(); // começa com tudo invisível (reservado)
    letterEl.addEventListener("click", mostrarTudo);


    /* ================================================
       ANIMAÇÕES DE ENTRADA
       Tudo que tem a classe .reveal aparece ao rolar.
    ================================================ */

    const alvosAnimados = document.querySelectorAll(".reveal");

    if ("IntersectionObserver" in window && !reduzirMovimento) {
        const observer = new IntersectionObserver(
            (entradas) => {
                entradas.forEach((entrada) => {
                    if (!entrada.isIntersecting) return;

                    entrada.target.classList.add("visible");

                    if (entrada.target.classList.contains("letter-wrapper")) {
                        setTimeout(iniciarCarta, 500);
                    }

                    observer.unobserve(entrada.target);
                });
            },
            { threshold: 0.15 }
        );

        alvosAnimados.forEach((alvo) => observer.observe(alvo));
    } else {
        // Sem suporte (ou movimento reduzido): mostra tudo direto
        alvosAnimados.forEach((alvo) => alvo.classList.add("visible"));
        iniciarCarta();
    }

})();