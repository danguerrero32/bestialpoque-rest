/* global React, gsap, ScrollTrigger */
const { useEffect, useRef, useState } = React;

function ScrollVideoBackground() {
  const canvasRef = useRef(null);
  const framesRef = useRef([]);
  const stateRef = useRef({ frame: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => { canvas.width = window.innerWidth * dpr; canvas.height = window.innerHeight * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    resize();
    window.addEventListener('resize', resize);
    const TOTAL = 30, W = 1280, H = 720;
    const particles = [];
    for (let i = 0; i < 80; i++) particles.push({ x: Math.random(), y: Math.random(), r: Math.random() * 2 + 0.6, speed: Math.random() * 0.6 + 0.2, phase: Math.random() * Math.PI * 2, hue: 32 + Math.random() * 18 });
    const frameCanvases = [];
    for (let f = 0; f < TOTAL; f++) {
      const c = document.createElement('canvas'); c.width = W; c.height = H;
      const cx = c.getContext('2d');
      const t = f / (TOTAL - 1);
      const cy = 0.6 - t * 0.3;
      const grad = cx.createRadialGradient(W * (0.4 + t * 0.2), H * cy, 0, W * 0.5, H * 0.5, Math.max(W, H) * 0.9);
      grad.addColorStop(0, `rgba(60,36,14,${0.85 - t * 0.2})`); grad.addColorStop(0.45, 'rgba(28,18,10,1)'); grad.addColorStop(1, 'rgba(10,8,5,1)');
      cx.fillStyle = grad; cx.fillRect(0, 0, W, H);
      const glow = cx.createLinearGradient(0, 0, W, 0);
      glow.addColorStop(0, 'rgba(0,0,0,0)'); glow.addColorStop(0.5 + Math.sin(t * Math.PI * 2) * 0.1, `rgba(200,147,58,${0.05 + t * 0.04})`); glow.addColorStop(1, 'rgba(0,0,0,0)');
      cx.fillStyle = glow; cx.fillRect(0, 0, W, H);
      cx.globalCompositeOperation = 'lighter';
      particles.forEach((p) => {
        const x = (p.x + t * p.speed * 0.4) % 1 * W, y = (p.y - t * p.speed * 0.2 + 1) % 1 * H;
        const flicker = 0.5 + 0.5 * Math.sin(p.phase + t * Math.PI * 2 * p.speed), r = p.r * (3 + flicker * 5);
        const pg = cx.createRadialGradient(x, y, 0, x, y, r);
        pg.addColorStop(0, `hsla(${p.hue},70%,60%,${0.18 * flicker})`); pg.addColorStop(1, 'hsla(32,70%,60%,0)');
        cx.fillStyle = pg; cx.beginPath(); cx.arc(x, y, r, 0, Math.PI * 2); cx.fill();
      });
      cx.globalCompositeOperation = 'source-over';
      const vg = cx.createRadialGradient(W/2, H/2, Math.min(W,H)*0.3, W/2, H/2, Math.max(W,H)*0.7);
      vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.55)');
      cx.fillStyle = vg; cx.fillRect(0, 0, W, H);
      frameCanvases.push(c);
    }
    framesRef.current = frameCanvases;
    const draw = (idx) => { const i = Math.min(TOTAL-1, Math.max(0, Math.round(idx))); const img = frameCanvases[i]; if (!img) return; ctx.clearRect(0, 0, canvas.width/dpr, canvas.height/dpr); ctx.drawImage(img, 0, 0, window.innerWidth, window.innerHeight); };
    draw(0);
    const update = () => { const max = document.documentElement.scrollHeight - window.innerHeight; const p = max > 0 ? window.scrollY / max : 0; stateRef.current.frame = p * (TOTAL - 1); draw(stateRef.current.frame); };
    window.addEventListener('scroll', update, { passive: true }); update();
    return () => { window.removeEventListener('resize', resize); window.removeEventListener('scroll', update); };
  }, []);
  return (<div className="scroll-bg" aria-hidden="true"><canvas ref={canvasRef} /></div>);
}

function ScrollFloat({ children, className = '', trigger = 'top 90%', end = 'top 30%' }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const chars = el.querySelectorAll('.char'); if (!chars.length) return;
    const tl = gsap.fromTo(chars, { yPercent: 80, opacity: 0, filter: 'blur(8px)' }, { yPercent: 0, opacity: 1, filter: 'blur(0px)', ease: 'power3.out', stagger: 0.02, scrollTrigger: { trigger: el, start: trigger, end, scrub: 0.8 } });
    return () => { tl.scrollTrigger?.kill(); tl.kill(); };
  }, [children, trigger, end]);
  const wrap = (str) => [...String(str)].map((ch, i) => <span key={i} className="char" aria-hidden="true">{ch === ' ' ? ' ' : ch}</span>);
  return (<span ref={ref} className={`float-text ${className}`}>{Array.isArray(children) ? children.map((c, i) => <span key={i}>{wrap(c)}</span>) : wrap(children)}</span>);
}

function SlidePanel({ children, id, corner }) {
  const wrapRef = useRef(null); const panelRef = useRef(null);
  useEffect(() => {
    const wrap = wrapRef.current; const panel = panelRef.current; if (!wrap || !panel) return;
    const tween = gsap.fromTo(panel, { yPercent: 30, opacity: 0, scale: 0.96 }, { yPercent: 0, opacity: 1, scale: 1, ease: 'power3.out', duration: 1.2, scrollTrigger: { trigger: wrap, start: 'top 80%', toggleActions: 'play none none reverse' } });
    let raf = 0; const target = { rx: 0, ry: 0 }; const cur = { rx: 0, ry: 0 }; const TILT = 6;
    const onMove = (e) => { const rect = panel.getBoundingClientRect(); const cx = rect.left + rect.width/2; const cy = rect.top + rect.height/2; target.ry = Math.max(-1, Math.min(1, (e.clientX-cx)/(rect.width/2))) * TILT; target.rx = -Math.max(-1, Math.min(1, (e.clientY-cy)/(rect.height/2))) * TILT * 0.5; };
    const onLeave = () => { target.rx = 0; target.ry = 0; };
    const tick = () => { cur.rx += (target.rx - cur.rx) * 0.08; cur.ry += (target.ry - cur.ry) * 0.08; panel.style.transform = `perspective(1400px) rotateX(${cur.rx}deg) rotateY(${cur.ry}deg)`; raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    panel.addEventListener('mousemove', onMove); panel.addEventListener('mouseleave', onLeave);
    return () => { tween.scrollTrigger?.kill(); tween.kill(); cancelAnimationFrame(raf); panel.removeEventListener('mousemove', onMove); panel.removeEventListener('mouseleave', onLeave); };
  }, []);
  return (<div className="stack-slot" ref={wrapRef} id={id}><div className="slide-panel" ref={panelRef}>{corner && <div className="slide-panel__corner">{corner}</div>}{children}</div></div>);
}

function PillNav({ lang, setLang, items }) {
  const [active, setActive] = useState('');
  useEffect(() => {
    const onScroll = () => { let cur = ''; items.forEach(({ href }) => { if (!href.startsWith('#')) return; const el = document.querySelector(href); if (!el) return; const r = el.getBoundingClientRect(); if (r.top <= window.innerHeight * 0.4 && r.bottom >= window.innerHeight * 0.4) cur = href; }); setActive(cur); };
    window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [items]);
  const go = (e, href) => { if (!href.startsWith('#')) return; e.preventDefault(); const el = document.querySelector(href); if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 60, behavior: 'smooth' }); };
  return (
    <nav className="pill-nav" aria-label="Main">
      <a href="#hero" onClick={(e) => go(e, '#hero')} className="pill-nav__brand">
        <svg className="pill-nav__brand-icon" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M3 24 L11 12 L16 18 L21 10 L29 24 Z" fill="rgba(200,147,58,0.18)" /><circle cx="22" cy="8" r="2" fill="currentColor" stroke="none" opacity="0.7" /><path d="M3 26 L29 26" strokeLinecap="round" /></svg>
        <span style={{ display: 'inline-block' }}>FolgaoRest<span>by Keen Impact</span></span>
      </a>
      <div className="pill-nav__items">{items.map((it) => <button key={it.href} className={`pill-nav__item ${active === it.href ? 'is-active' : ''}`} onClick={(e) => go(e, it.href)}>{it.label[lang]}</button>)}</div>
      <div className="pill-nav__lang"><button onClick={() => setLang('es')} className={lang === 'es' ? 'is-active' : ''}>ES</button><button onClick={() => setLang('en')} className={lang === 'en' ? 'is-active' : ''}>EN</button></div>
    </nav>);
}

/* ============================================================
   HERO 1 (Before) — "Cuando ellos se van a casa…"
   ============================================================ */
function HeroBefore({ lang }) {
  const T = {
    es: { pre: 'Antes era así:', title: 'Cuando ellos se van a casa…', sub: 'a ti todavía te queda una montaña de trabajo y asuntos que resolver por delante.', tension: 'Hasta que un día…', cue: 'Sigue bajando' },
    en: { pre: 'It used to be like this:', title: 'When they all go home…', sub: 'you still have a mountain of work and things to sort out ahead of you.', tension: 'Until one day…', cue: 'Scroll' }
  }[lang];

  // Fade-out suave del contenido al acercarse al final (transición al Hero 2)
  const sectionRef = useRef(null);
  useEffect(() => {
    const el = sectionRef.current; if (!el) return;
    const targets = el.querySelectorAll('.hero-phase, .hero-chevron');
    const tween = gsap.to(targets, {
      opacity: 0,
      y: -20,
      ease: 'none',
      scrollTrigger: { trigger: el, start: 'bottom 90%', end: 'bottom 30%', scrub: 0.6 }
    });
    return () => { tween.scrollTrigger?.kill(); tween.kill(); };
  }, [lang]);

  const goNext = (e) => {
    e.preventDefault();
    document.querySelector('#hero-after')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section className="hero hero--before" id="hero" ref={sectionRef}>
      <div className="hero__inner">
        <div className="hero-stage hero-stage--single">
          <div className="hero-phase hero-phase--before">
            <span className="hero-phase__pre">{T.pre}</span>
            <h1 className="hero-phase__title">{T.title}</h1>
            <p className="hero-phase__sub">{T.sub}</p>
            <p className="hero-phase__title hero-phase__title--after hero-phase__tension">{T.tension}</p>
          </div>
        </div>
      </div>
      <a className="hero-chevron" href="#hero-after" onClick={goNext} aria-label={T.cue}>
        <span className="hero-chevron__label">{T.cue}</span>
        <svg className="hero-chevron__icon" viewBox="0 0 24 28" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <path d="M4 6 L12 14 L20 6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4 16 L12 24 L20 16" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </a>
    </section>
  );
}

/* ============================================================
   HERO 2 (After) — "Tú terminas antes que nadie"
   ============================================================ */
function HeroAfter({ lang }) {
  const T = {
    es: { pre: 'A partir de ahora:', title: 'Tú terminas antes que nadie', sub: <>Y te vas a tus cosas. A descansar.<br/>Tu negocio sigue funcionando, mejor que nunca.</>, add: <>Di adiós a las tareas mecánicas.<br/>Las horas libres son mucho más reales.</>, cta1: 'Quiero saber más', cta2: 'Ver el piloto' },
    en: { pre: 'From now on:', title: 'You finish before anyone else', sub: <>Rest. Relax.<br/>Your business keeps running, better than ever.</>, add: <>Say goodbye to mechanical tasks.<br/>Free hours are much more real.</>, cta1: 'Tell me more', cta2: 'See the pilot' }
  }[lang];

  const sectionRef = useRef(null);
  useEffect(() => {
    const el = sectionRef.current; if (!el) return;
    const items = Array.from(el.querySelectorAll('[data-reveal]'));
    const tweens = items.map((item) => {
      const order = parseFloat(item.dataset.reveal) || 0;
      return gsap.fromTo(
        item,
        { opacity: 0, y: 28 },
        {
          opacity: 1, y: 0, duration: 1.0, ease: 'power3.out', delay: order,
          scrollTrigger: { trigger: el, start: 'top 80%', toggleActions: 'play none none reverse' }
        }
      );
    });
    return () => tweens.forEach(t => { t.scrollTrigger?.kill(); t.kill(); });
  }, [lang]);

  const titleParts = String(T.title).split(' ');
  const titleA = titleParts.slice(0, 2).join(' ');
  const titleB = titleParts.slice(2).join(' ');

  return (
    <section className="hero hero--after" id="hero-after" ref={sectionRef}>
      <div className="hero__inner">
        <div className="hero-stage hero-stage--single">
          <div className="hero-phase hero-phase--after">
            <span className="hero-phase__pre" data-reveal="0" style={{ color: 'rgb(255,255,255)' }}>{T.pre}</span>
            <h1 className="hero-phase__title hero-phase__title--after" data-reveal="0.15">
              <span className="line" style={{ fontSize: '52px' }}>{titleA}</span>
              <span className="line line--em">{titleB}</span>
            </h1>
            <p className="hero-phase__sub" data-reveal="0.4">{T.sub}</p>
            <p className="hero-phase__add" data-reveal="0.6">{T.add}</p>
          </div>
        </div>
        <div className="hero__ctas" data-reveal="1.0">
          <a className="btn btn--primary" href="#modulos" onClick={(e) => { e.preventDefault(); document.querySelector('#modulos')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}>{T.cta1} <span className="arrow">↓</span></a>
          <a className="btn btn--ghost" href="https://lostrotamundosalpujarra.com" target="_blank" rel="noopener">{T.cta2} <span className="arrow">→</span></a>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   HERO DOUBLE — wrapper con video sticky compartido + ken burns
   ============================================================ */
/* Video de fondo FIJO para los dos heroes. position: fixed + fade-out con scroll. */
function HeroVideoFixed() {
  const wrapRef = useRef(null);
  useEffect(() => {
    const el = wrapRef.current; if (!el) return;
    let tween;
    const setup = () => {
      const heroAfter = document.querySelector('#hero-after');
      if (!heroAfter) { setTimeout(setup, 60); return; }
      tween = gsap.to(el, {
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: heroAfter,
          start: 'bottom 90%',
          end: 'bottom 10%',
          scrub: 0.4
        }
      });
    };
    setup();
    return () => { if (tween) { tween.scrollTrigger?.kill(); tween.kill(); } };
  }, []);
  return (
    <div className="hero-fixed-bg" ref={wrapRef} aria-hidden="true">
      <video className="hero-fixed-bg__video" src="assets/hero-video.mp4" autoPlay loop muted playsInline />
      <div className="hero-fixed-bg__overlay" />
    </div>
  );
}

function HeroDouble({ lang }) {
  return (
    <div className="hero-double">
      <HeroBefore lang={lang} />
      <HeroAfter lang={lang} />
    </div>
  );
}

// Alias por compatibilidad con código que pueda referirse al antiguo `Hero`
const Hero = HeroDouble;

Object.assign(window, { ScrollVideoBackground, ScrollFloat, SlidePanel, PillNav, Hero, HeroDouble, HeroBefore, HeroAfter, HeroVideoFixed });
