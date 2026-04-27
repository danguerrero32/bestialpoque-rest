/* global React, ReactDOM */

function App() {
  const [lang, setLang] = React.useState("es");

  React.useEffect(() => {
    document.body.dataset.lang = lang;
    document.documentElement.lang = lang;
  }, [lang]);

  React.useEffect(() => {
    const r = document.documentElement;
    r.style.setProperty("--tilt-max", "11deg");
    r.style.setProperty("--overlay-opacity", "0.75");
  }, []);

  const items = [
    { href: "#hero", label: { es: "Inicio", en: "Home" } },
    { href: "#modulos", label: { es: "Servicios", en: "Services" } },
    { href: "#consultoria", label: { es: "Consultoría", en: "Consulting" } },
    { href: "#testimonios", label: { es: "Testimonios", en: "Reviews" } },
    { href: "#faq", label: { es: "FAQ", en: "FAQ" } },
    { href: "#contacto", label: { es: "Contacto", en: "Contact" } },
  ];

  return (
    <>
      <ScrollVideoBackground />
      <PillNav lang={lang} setLang={setLang} items={items} />
      <HeroDouble lang={lang} />
      <VisualizeSection lang={lang} />
      <main className="content-stack">
        <PainSection lang={lang} />
        <PromiseSection lang={lang} />
        <ModulesSection lang={lang} />
        <ConsultingSection lang={lang} />
        <TestimonialsSection lang={lang} />
        <AuthorSection lang={lang} />
        <BonusSection lang={lang} />
        <PaymentSection lang={lang} />
        <FaqSection lang={lang} />
        <ContactSection lang={lang} />
      </main>
      <Footer lang={lang} setLang={setLang} />
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);