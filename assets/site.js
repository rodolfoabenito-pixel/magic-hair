/* Template de site para negócios locais · interações
   Menu do celular, cartela de tons, antes e depois, galeria (lightbox) e mapa.
   Sem dependências. Tudo funciona de forma básica mesmo sem JavaScript. */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- menu do celular ---------- */
  var nav = $('.nav');
  if (nav) {
    var bt = $('.nav-botao', nav);
    var fechar = function () { nav.classList.remove('aberto'); bt.setAttribute('aria-expanded', 'false'); };
    bt.addEventListener('click', function () {
      var aberto = nav.classList.toggle('aberto');
      bt.setAttribute('aria-expanded', String(aberto));
    });
    $$('a', nav).forEach(function (a) { a.addEventListener('click', fechar); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && nav.classList.contains('aberto')) { fechar(); bt.focus(); } });
  }

  /* ---------- cartela de tons (grupo de rádio acessível) ---------- */
  $$('.cartela').forEach(function (c) {
    var mechas = $$('.mecha', c);
    var leg = $('.cartela-leg', c);
    function escolher(m, foco) {
      mechas.forEach(function (x) { x.setAttribute('aria-checked', String(x === m)); x.tabIndex = x === m ? 0 : -1; });
      leg.innerHTML = '<b></b> <span></span>';
      leg.firstChild.textContent = m.dataset.codigo;
      leg.lastChild.textContent = m.dataset.nome;
      if (foco) m.focus();
    }
    mechas.forEach(function (m, i) {
      m.addEventListener('click', function () { escolher(m); });
      m.addEventListener('mouseenter', function () { escolher(m); });
      m.addEventListener('keydown', function (e) {
        var d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
        if (e.key === 'Home') d = -i; if (e.key === 'End') d = mechas.length - 1 - i;
        if (d === undefined) return;
        e.preventDefault();
        escolher(mechas[(i + d + mechas.length) % mechas.length], true);
      });
    });
  });

  /* ---------- antes e depois (mouse, toque e teclado) ---------- */
  $$('.ad').forEach(function (ad) {
    var quadro = $('.ad-quadro', ad);
    var linha = $('.ad-linha', ad);
    var pos = 50, arrastando = false;
    function aplicar(v) {
      pos = Math.max(0, Math.min(100, v));
      ad.style.setProperty('--pos', pos + '%');
      var r = Math.round(pos);
      linha.setAttribute('aria-valuenow', r);
      linha.setAttribute('aria-valuetext', r + '% antes, ' + (100 - r) + '% depois');
    }
    function deEvento(e) {
      var b = quadro.getBoundingClientRect();
      aplicar(((e.clientX - b.left) / b.width) * 100);
    }
    quadro.addEventListener('pointerdown', function (e) {
      if (e.button !== undefined && e.button !== 0) return;
      arrastando = true;
      quadro.setPointerCapture(e.pointerId);
      deEvento(e);
    });
    quadro.addEventListener('pointermove', function (e) { if (arrastando) deEvento(e); });
    var parar = function () { arrastando = false; };
    quadro.addEventListener('pointerup', parar);
    quadro.addEventListener('pointercancel', parar);
    linha.addEventListener('keydown', function (e) {
      var passo = e.shiftKey ? 10 : 2;
      var mapa = { ArrowLeft: pos - passo, ArrowDown: pos - passo, ArrowRight: pos + passo, ArrowUp: pos + passo, PageDown: pos - 10, PageUp: pos + 10, Home: 0, End: 100 };
      if (!(e.key in mapa)) return;
      e.preventDefault();
      aplicar(mapa[e.key]);
    });
  });

  /* ---------- galeria com lightbox ---------- */
  var botoes = $$('.foto-botao');
  if (botoes.length) {
    var lb = document.createElement('div');
    lb.className = 'lightbox';
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.setAttribute('aria-label', 'Foto ampliada');
    lb.innerHTML = '<figure><img alt=""><figcaption></figcaption></figure>' +
      '<button type="button" class="lb-botao lb-fechar" aria-label="Fechar">×</button>' +
      (botoes.length > 1 ? '<button type="button" class="lb-botao lb-ant" aria-label="Foto anterior">‹</button><button type="button" class="lb-botao lb-prox" aria-label="Próxima foto">›</button>' : '');
    document.body.appendChild(lb);
    var lbImg = $('img', lb), lbLeg = $('figcaption', lb), atual = 0, origem = null;
    function mostrar(i) {
      atual = (i + botoes.length) % botoes.length;
      var b = botoes[atual];
      lbImg.src = b.dataset.src;
      lbImg.alt = b.dataset.legenda;
      lbLeg.textContent = b.dataset.legenda;
    }
    function abrir(i) {
      origem = document.activeElement;
      mostrar(i);
      lb.classList.add('aberto');
      document.documentElement.style.overflow = 'hidden';
      $('.lb-fechar', lb).focus(); // o CSS deixa o lightbox visível na hora (visibility 0s)
    }
    function fecharLb() {
      if (!lb.classList.contains('aberto')) return;
      lb.classList.remove('aberto');
      document.documentElement.style.overflow = '';
      if (origem) origem.focus();
    }
    botoes.forEach(function (b, i) { b.addEventListener('click', function () { abrir(i); }); });
    lb.addEventListener('click', function (e) {
      if (e.target === lb || e.target.closest('.lb-fechar')) fecharLb();
      else if (e.target.closest('.lb-ant')) mostrar(atual - 1);
      else if (e.target.closest('.lb-prox')) mostrar(atual + 1);
    });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('aberto')) return;
      if (e.key === 'Escape') fecharLb();
      else if (e.key === 'ArrowLeft') mostrar(atual - 1);
      else if (e.key === 'ArrowRight') mostrar(atual + 1);
      else if (e.key === 'Tab') { // mantém o foco dentro do lightbox
        var focaveis = $$('button', lb), p = focaveis[0], u = focaveis[focaveis.length - 1];
        if (e.shiftKey && document.activeElement === p) { e.preventDefault(); u.focus(); }
        else if (!e.shiftKey && document.activeElement === u) { e.preventDefault(); p.focus(); }
      }
    });
    // deslizar para o lado no celular
    var x0 = null;
    lb.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (e) {
      if (x0 === null || botoes.length < 2) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 50) mostrar(atual + (dx < 0 ? 1 : -1));
      x0 = null;
    });
  }

  /* ---------- mapa: só carrega com clique (mais leve e melhor para a LGPD) ---------- */
  $$('.mapa').forEach(function (m) {
    var b = $('.mapa-carregar', m);
    if (!b) return;
    b.addEventListener('click', function () {
      var f = document.createElement('iframe');
      f.src = m.dataset.src;
      f.title = 'Mapa com a localização';
      f.loading = 'lazy';
      f.referrerPolicy = 'no-referrer-when-downgrade';
      f.setAttribute('allowfullscreen', '');
      m.innerHTML = '';
      m.appendChild(f);
      f.focus();
    });
  });
})();
