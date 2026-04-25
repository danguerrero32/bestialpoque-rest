/* global React, SlidePanel */

function VisualizeSection({ lang }) {
  const wrapRef = React.useRef(null);
  const [progress, setProgress] = React.useState(0);
  const [revealed, setRevealed] = React.useState(new Set());

  const T = {
    es: {
      pause: "— Imagina, un día cualquiera —",
      claim: <>Es jueves por la mañana. <em>El móvil suena</em>. Tú estás en tu terrao desayunando, <em>tranquilamente</em>.</>,
      vignettes: [
      ["09:00", <>Abres el móvil. <em>Proveedores con pedidos listos, reservas gestionadas, stock al día</em>, redes con los comentarios a la foto que tu copiloto IA publicó anoche.</>],
      ["11:45", <>Llegan los proveedores a descargar sus pedidos. Te entregan la factura y el albarán. Le haces una foto y la mandas a tu <em>copiloto IA</em>, que las guarda y actualiza tu contabilidad del trimestre.</>],
      ["14:30", <>Servicio lleno. El TPV anota cada plato más rápido que nunca. <em>Nadie te molesta</em> para preguntar por cosas básicas. Tienes un sistema ágil con el personal coordinado.</>],
      ["15:10", <>Estás cocinando, los camareros entregan comandas. El sistema detecta que el stock de bases de pizza alcanzó el umbral y os avisa. Con una <em>orden de voz al copiloto IA</em> (o en el TPV), se envía un mensaje a tu proveedor para que te reabastezca. Mente despejada. Un asunto menos.</>],
      ["16:30", <>Entran vía web un par de reservas de mesa para la noche. Quedan registradas en el TPV. <em>Llegaron por Google</em>. Consultaron el menú y te adelantan lo que querrían cenar. Vas prevenido con margen de tiempo.</>],
      ["22:30", <>Varias cuentas separadas hoy. Los pedidos para llevar salieron perfectos. Cierras. La caja cuadra sola. <em>Mañana descansas</em>. El negocio depende un poco menos de ti.</>],
      ["00:00", <em>Duermes como un angelito.</em>]]
    },
    en: {
      pause: "— Picture this —",
      claim: <>It's Thursday morning. <em>The phone rings softly</em>. You're on your terrace having breakfast, <em>at ease</em>.</>,
      vignettes: [
      ["09:00", <>You check your phone. <em>Suppliers with orders ready, bookings in order, stock up to date</em>, yesterday's photo already posted on socials.</>],
      ["11:45", <>Suppliers arrive to drop off their orders. They hand you the invoice and the delivery note. You snap a photo and send it to your <em>AI copilot</em>, which files them and updates your quarterly bookkeeping.</>],
      ["14:30", <>Full service. The POS logs every dish faster than ever. <em>Nobody bothers you</em> with basic questions. The team runs on a smooth system.</>],
      ["15:10", <>You're cooking, waiters bring in orders. The system detects pizza-base stock has hit the threshold and alerts you. With a <em>voice command to the AI copilot</em> (or on the POS), a message is sent to your supplier to restock. Mind clear. One less thing.</>],
      ["16:30", <>A couple of bookings come in through the website. Logged straight into the POS. <em>They arrived via Google</em>. They checked the menu and tell you in advance what they'd like for dinner. You're prepared with time to spare.</>],
      ["22:30", <>Several split bills today. Takeaway orders went perfectly. You close. The till balances itself. <em>Tomorrow you rest</em>. The business depends a little less on you.</>],
      ["00:00", <em>You sleep like a baby.</em>]]
    }
  }[lang];

  React.useEffect(() => {
    const onScroll = () => {
      const el = wrapRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const h = window.innerHeight;
      const start = h * 0.85;
      const end = h * 0.2;
      const total = start - end + r.height;
      const p = Math.min(1, Math.max(0, (start - r.top) / total));
      setProgress(p);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); };
  }, []);

  React.useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          const i = Number(e.target.dataset.idx);
          setRevealed((prev) => { const n = new Set(prev); n.add(i); return n; });
        }
      });
    }, { threshold: 0.35, rootMargin: "0px 0px -10% 0px" });
    const cards = wrapRef.current?.querySelectorAll(".timeline-card");
    cards?.forEach((c) => obs.observe(c));
    return () => obs.disconnect();
  }, [lang]);

  return (
    <section className="viz-section" id="visualiza">
      <div className="viz-inner">
        <span style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.42em", textTransform: "uppercase", color: "var(--amber)", marginBottom: 28 }}>{T.pause}</span>
        <h2 className="viz-claim" style={{ fontSize: "32px" }}>{T.claim}</h2>
        <div className="timeline" ref={wrapRef}>
          <div className="timeline__rail">
            <div className="timeline__trail" style={{ height: `${progress * 100}%` }} />
          </div>
          {T.vignettes.map(([time, text], i) => {
            const side = i % 2 === 0 ? "left" : "right";
            const isOn = revealed.has(i);
            const isEnd = i === T.vignettes.length - 1;
            return (
              <div key={i} data-idx={i} className={`timeline-card timeline-card--${side} ${isOn ? "is-on" : ""} ${isEnd ? "timeline-card--end" : ""}`}>
                <span className="timeline-card__node" aria-hidden="true"><span className="timeline-card__node-pulse" /></span>
                <div className="timeline-card__inner">
                  <div className="timeline-card__time">{time}</div>
                  <p className="timeline-card__text">{text}</p>
                </div>
              </div>);
          })}
        </div>
      </div>
    </section>);
}

function ConsultingSection({ lang }) {
  const T = {
    es: { eyebrow: "Consultoría · Cara a cara", title: <>Cuando lo que necesitas es <em>una mirada de fuera</em>.</>, sub: "No es magia, es perspectiva.", list: [["Diagnóstico del negocio", "Una visita, un café y una libreta. Salgo con un mapa de qué frena tu negocio."], ["Estrategia de digitalización", "Qué módulos tienen sentido para ti, en qué orden, sin venderte humo."], ["Acompañamiento mensual", "Una llamada cada 15 días. Revisamos números, ajustamos lo que toque."], ["Auditoría de presencia digital", "Qué está dejando de verte el turista. Web, Google, Tripadvisor, redes."]], formats: [["Visita inicial", "2 horas en tu negocio · Bubión y alrededores", "Gratis"], ["Diagnóstico completo", "Visita + informe + plan de 90 días", "297 €"], ["Acompañamiento", "Llamada quincenal + soporte directo", "197 €/mes"]] },
    en: { eyebrow: "Consulting · Face to face", title: <>When what you need is <em>an outside look</em>.</>, sub: "It isn't magic, it's perspective.", list: [["Business diagnosis", "One visit, a coffee, a notebook. I leave with a map of what blocks your business."], ["Digitalization strategy", "Which modules make sense for you, in what order. No smoke."], ["Monthly companionship", "A call every two weeks. We review numbers, adjust what's needed."], ["Digital presence audit", "What the tourist is failing to see. Site, Google, Tripadvisor, socials."]], formats: [["First visit", "2 hours at your place · Bubión and around", "Free"], ["Full diagnosis", "Visit + report + 90-day plan", "€297"], ["Companionship", "Bi-weekly call + direct support", "€197/mo"]] }
  }[lang];
  return (<SlidePanel id="consultoria" corner="06 / 10"><div className="panel-eyebrow">{T.eyebrow}</div><h2 className="panel-title">{T.title}</h2><p className="panel-subtitle">{T.sub}</p><div className="consult-layout"><ol className="consult-list">{T.list.map(([t,b],i)=><li key={i}><span className="consult-list__num">0{i+1}</span><span className="consult-list__title">{t}</span><span className="consult-list__body">{b}</span></li>)}</ol><div className="consult-formats">{T.formats.map(([title,sub,price],i)=><div className="consult-format" key={i}><div><div className="consult-format__title">{title}</div><div className="consult-format__sub">{sub}</div></div><div className="consult-format__price">{price}</div></div>)}</div></div></SlidePanel>);
}

function TestimonialsSection({ lang }) {
  const T = {
    es: { eyebrow: "Testimonios · Voces del valle", title: <>Quien ya lo está <em>viviendo</em>.</>, sub: "El piloto lleva pocos meses, pero algunas cosas ya se notan.", items: [["Antes pasábamos cuatro tardes al mes con el papeleo. Ahora son veinte minutos.","Marta","Los Trotamundos · Pampaneira","MT"],["Llevábamos meses sin tocar el Instagram. En dos semanas ya teníamos la rutina.","Javier","Bar serrano · Bubión","JV"],["Lo que más me ha gustado es que Dan se sienta contigo. Lo monta delante de ti.","Lucía","Panadería · Capileira","LC"],["Pasamos del cuaderno al stock en tiempo real. Ya no se nos pierde un kilo de queso.","Andrés","Restaurante familiar · Pitres","AN"]] },
    en: { eyebrow: "Testimonials · Voices of the valley", title: <>People already <em>living it</em>.</>, sub: "The pilot is only a few months in, but some things are already showing.", items: [["We used to spend four afternoons a month on paperwork. Now it's twenty minutes.","Marta","Los Trotamundos · Pampaneira","MT"],["We hadn't touched Instagram in months. In two weeks we had the routine.","Javier","Mountain bar · Bubión","JV"],["What I liked most is that Dan sits down with you. He builds it in front of you.","Lucía","Bakery · Capileira","LC"],["We went from the notebook to real-time stock. We don't lose a kilo of cheese anymore.","Andrés","Family restaurant · Pitres","AN"]] }
  }[lang];
  return (<SlidePanel id="testimonios" corner="07 / 10"><div className="panel-eyebrow">{T.eyebrow}</div><h2 className="panel-title">{T.title}</h2><p className="panel-subtitle">{T.sub}</p><div className="testimonials-grid">{T.items.map(([quote,name,role,initials],i)=><div className="testimonial" key={i}><p className="testimonial__quote">{quote}</p><div className="testimonial__attribution"><div className="testimonial__avatar">{initials}</div><div><div className="testimonial__name">{name}</div><div className="testimonial__role">{role}</div></div></div></div>)}</div></SlidePanel>);
}

function FaqSection({ lang }) {
  const [open, setOpen] = React.useState(0);
  const T = {
    es: { eyebrow: "FAQ · Lo que la gente pregunta", title: <>Las dudas <em>razonables</em>.</>, items: [["¿Tengo que aprender a usar nuevas herramientas?","Lo justo. Te enseño lo que necesitas para tu día a día."],["¿Y si mi negocio es muy pequeño?","Mejor. Cuanto más pequeño, más se nota la mejora."],["¿Qué pasa con la facturación que ya tengo?","Se integra. Conectamos con tu gestor sin romper lo que funciona."],["¿Hay permanencia?","No. Pago por trabajo entregado, no por estar atado."],["¿Qué pasa si me equivoco eligiendo módulos?","Por eso existe la consultoría. Hacemos un diagnóstico primero."],["¿Trabajas fuera del valle del Poqueira?","Por ahora me centro aquí. Quiero hacerlo bien con los vecinos."]] },
    en: { eyebrow: "FAQ · What people ask", title: <>The <em>reasonable</em> doubts.</>, items: [["Do I have to learn new tools?","Just enough. I teach you what you need for the day-to-day."],["What if my business is very small?","Even better. The smaller, the more the improvement shows."],["What about my current invoicing?","It integrates. We connect without breaking what works."],["Is there a lock-in?","No. You pay for delivered work, not for being tied down."],["What if I pick the wrong modules?","That's why consulting exists. We do a diagnosis first."],["Do you work outside the Poqueira valley?","For now I'm focused here. I want to do it right with the neighbors."]] }
  }[lang];
  return (<SlidePanel id="faq" corner="09 / 10"><div className="panel-eyebrow">{T.eyebrow}</div><h2 className="panel-title">{T.title}</h2><div className="faq-list">{T.items.map(([q,a],i)=><div key={i} className={`faq-item ${open===i?"is-open":""}`}><button className="faq-q" onClick={()=>setOpen(open===i?-1:i)}><span>{q}</span><span className="faq-q__mark">+</span></button><div className="faq-a"><div className="faq-a__inner">{a}</div></div></div>)}</div></SlidePanel>);
}

Object.assign(window, { VisualizeSection, ConsultingSection, TestimonialsSection, FaqSection });