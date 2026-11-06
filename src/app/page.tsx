"use client";

import type { FormEvent, ReactNode } from "react";
import Image from "next/image";
import { useState } from "react";
import styles from "./page.module.css";

const heroImage =
  "https://images.unsplash.com/photo-1758523671285-9ff3f4e0ff38?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=85&w=1600";
const whatsappUrl = `https://wa.me/5532988039801?text=${encodeURIComponent(
  "Olá! Vim pelo site da Damasceno e gostaria de saber mais sobre os consórcios.",
)}`;

type IconName =
  | "arrow"
  | "car"
  | "check"
  | "chevron"
  | "home"
  | "menu"
  | "shield"
  | "spark"
  | "whatsapp"
  | "x";

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, ReactNode> = {
    arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
    car: (
      <>
        <path d="m5 17-1-2v-4l2-5h12l2 5v4l-1 2M4 12h16M6 17v2m12-2v2" />
        <path d="M7 15h.01M17 15h.01" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    chevron: <path d="m6 9 6 6 6-6" />,
    home: <path d="m3 11 9-8 9 8M5 10v10h14V10M9 20v-6h6v6" />,
    menu: <path d="M4 7h16M4 12h16M4 17h16" />,
    shield: (
      <>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
    spark: (
      <path d="m12 3-1.3 4.2a5 5 0 0 1-3.3 3.3L3 12l4.4 1.5a5 5 0 0 1 3.2 3.2L12 21l1.4-4.3a5 5 0 0 1 3.2-3.2L21 12l-4.4-1.5a5 5 0 0 1-3.3-3.3L12 3Z" />
    ),
    whatsapp: (
      <>
        <path d="M21 11.5a8.4 8.4 0 0 1-9 8.5 9 9 0 0 1-3.8-.9L3 21l1.8-5A8.5 8.5 0 1 1 21 11.5Z" />
        <path d="M8.2 8.3c.2 4 3.2 6.8 7.4 7.5" />
      </>
    ),
    x: <path d="m6 6 12 12M18 6 6 18" />,
  };

  return (
    <svg
      aria-hidden="true"
      fill="none"
      height={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
      width={size}
    >
      {paths[name]}
    </svg>
  );
}

function Brand() {
  return (
    <span className={styles.brand}>
      <span className={styles.brandMark} aria-hidden="true">
        <svg fill="none" viewBox="0 0 40 40">
          <path
            d="M11 8h8.5C27.5 8 33 12.8 33 20s-5.5 12-13.5 12H11V8Z"
            stroke="currentColor"
            strokeWidth="3.2"
          />
          <path d="M17 14v12h3c4.3 0 7-2.2 7-6s-2.7-6-7-6h-3Z" fill="currentColor" />
        </svg>
      </span>
      <span>
        <strong>Damasceno</strong>
        <small>Consórcios</small>
      </span>
    </span>
  );
}

const plans = {
  home: {
    label: "Imóveis",
    icon: "home" as IconName,
    min: 80000,
    max: 1273442,
    step: 10000,
    initial: 300000,
    installmentMin: 270,
    installmentMax: 8629,
    installmentInitial: 1500,
    installmentStep: 50,
    description: "Casa, apartamento, terreno, construção ou reforma.",
  },
  car: {
    label: "Veículos",
    icon: "car" as IconName,
    min: 40000,
    max: 232749,
    step: 5000,
    initial: 80000,
    installmentMin: 279,
    installmentMax: 2705,
    installmentInitial: 900,
    installmentStep: 50,
    description: "Carro, caminhão, embarcação, aeronave ou equipamento.",
  },
  service: {
    label: "Serviços",
    icon: "spark" as IconName,
    min: 15000,
    max: 33383,
    step: 1000,
    initial: 25000,
    installmentMin: 306,
    installmentMax: 5913,
    installmentInitial: 600,
    installmentStep: 50,
    description: "Viagens, estudos, casamento ou procedimentos.",
  },
};

type PlanKey = keyof typeof plans;
type SimulationMode = "credit" | "installment";

const money = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);

const faqs = [
  {
    question: "Consórcio tem juros?",
    answer:
      "Não. No consórcio não há juros, mas existem taxa de administração e outros encargos previstos no grupo. Tudo é apresentado na proposta antes da contratação.",
  },
  {
    question: "Como posso ser contemplado?",
    answer:
      "A contemplação acontece por sorteio mensal ou por oferta de lance. Nossa equipe ajuda você a entender as estratégias adequadas ao seu planejamento.",
  },
  {
    question: "Posso escolher qualquer imóvel ou veículo?",
    answer:
      "Após a contemplação e a análise, sua carta de crédito oferece liberdade para escolher o bem dentro da categoria contratada.",
  },
  {
    question: "É possível antecipar parcelas?",
    answer:
      "Sim. Você pode antecipar parcelas ou quitar o saldo de acordo com as regras do grupo escolhido.",
  },
];

function Simulator() {
  const [plan, setPlan] = useState<PlanKey>("home");
  const [mode, setMode] = useState<SimulationMode>("credit");
  const [value, setValue] = useState(plans.home.initial);
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const active = plans[plan];

  const selectPlan = (key: PlanKey) => {
    setPlan(key);
    setValue(mode === "credit" ? plans[key].initial : plans[key].installmentInitial);
  };

  const selectMode = (next: SimulationMode) => {
    setMode(next);
    setValue(next === "credit" ? active.initial : active.installmentInitial);
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStep(4);
  };

  return (
    <div className={styles.simulator} id="simule">
      <div className={styles.simulatorHeader}>
        <div>
          <span className={styles.eyebrow}>Simulação Ademicon</span>
          <h2>
            {step === 1 && "Escolha seu produto"}
            {step === 2 && "Informe o valor"}
            {step === 3 && "Seus dados"}
            {step === 4 && "Resumo da simulação"}
          </h2>
        </div>
        <span className={styles.partnerChip}>Ademicon</span>
      </div>

      <div className={styles.stepper}>
        {["Produto", "Valores", "Dados", "Resultado"].map((label, index) => (
          <div key={label} className={step >= index + 1 ? styles.stepActive : ""}>
            <i />
            <span>{label}</span>
          </div>
        ))}
      </div>

      {step === 1 && (
        <div>
          <p className={styles.helper}>O valor da carta ou da parcela varia conforme o produto.</p>
          <div className={styles.productList}>
            {(Object.keys(plans) as PlanKey[]).map((key) => {
              const item = plans[key];
              return (
                <button
                  className={plan === key ? styles.productSelected : styles.product}
                  key={key}
                  onClick={() => selectPlan(key)}
                  type="button"
                >
                  <span className={styles.productIcon}>
                    <Icon name={item.icon} size={19} />
                  </span>
                  <span>
                    <strong>{item.label}</strong>
                    <small>{item.description}</small>
                  </span>
                  {plan === key && <Icon name="check" size={18} />}
                </button>
              );
            })}
          </div>
          <button className={styles.primaryButton} onClick={() => setStep(2)} type="button">
            Continuar <Icon name="arrow" size={18} />
          </button>
        </div>
      )}

      {step === 2 && (
        <div>
          <p className={styles.helper}>
            Escolha o valor mensal ou o total do crédito que você precisa.
          </p>
          <div className={styles.modeTabs}>
            <button
              className={mode === "installment" ? styles.modeActive : ""}
              onClick={() => selectMode("installment")}
              type="button"
            >
              Por parcela
            </button>
            <button
              className={mode === "credit" ? styles.modeActive : ""}
              onClick={() => selectMode("credit")}
              type="button"
            >
              Por crédito
            </button>
          </div>
          <label className={styles.valueLabel} htmlFor="simulation-value">
            {mode === "credit" ? "Seu crédito" : "Sua parcela mensal"}
          </label>
          <div className={styles.valueDisplay}>
            {money(value)}
            {mode === "installment" && <small>/mês</small>}
          </div>
          <input
            className={styles.range}
            id="simulation-value"
            max={mode === "credit" ? active.max : active.installmentMax}
            min={mode === "credit" ? active.min : active.installmentMin}
            onChange={(event) => setValue(Number(event.target.value))}
            step={mode === "credit" ? active.step : active.installmentStep}
            type="range"
            value={value}
          />
          <div className={styles.rangeLabels}>
            <span>{money(mode === "credit" ? active.min : active.installmentMin)}</span>
            <span>{money(mode === "credit" ? active.max : active.installmentMax)}</span>
          </div>
          <p className={styles.notice}>
            Encontraremos a opção mais adequada entre os grupos disponíveis.
          </p>
          <div className={styles.buttonRow}>
            <button className={styles.backButton} onClick={() => setStep(1)} type="button">
              Voltar
            </button>
            <button className={styles.primaryButton} onClick={() => setStep(3)} type="button">
              Continuar <Icon name="arrow" size={18} />
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <form className={styles.simForm} onSubmit={submit}>
          <p className={styles.helper}>
            Seus dados estão protegidos e serão usados para preparar sua proposta.
          </p>
          <label>
            Nome completo
            <input
              onChange={(event) => setName(event.target.value)}
              placeholder="Seu nome"
              required
              value={name}
            />
          </label>
          <label>
            WhatsApp
            <input inputMode="tel" placeholder="(00) 00000-0000" required />
          </label>
          <label>
            E-mail
            <input inputMode="email" placeholder="voce@email.com" required type="email" />
          </label>
          <label className={styles.consent}>
            <input required type="checkbox" />
            Li e concordo com os Termos de Uso e com o contato da equipe.
          </label>
          <div className={styles.buttonRow}>
            <button className={styles.backButton} onClick={() => setStep(2)} type="button">
              Voltar
            </button>
            <button className={styles.submitButton} type="submit">
              Simular <Icon name="arrow" size={18} />
            </button>
          </div>
        </form>
      )}

      {step === 4 && (
        <div className={styles.result}>
          <span className={styles.resultIcon}>
            <Icon name="check" size={28} />
          </span>
          <h3>{name}, seu plano está pronto para análise.</h3>
          <p>
            Esta é uma estimativa inicial de {active.label.toLowerCase()} com{" "}
            {mode === "credit" ? "crédito de " : "parcela de "}
            <strong>{money(value)}</strong>. Nenhuma solicitação foi enviada.
          </p>
          <div className={styles.nextStep}>
            <span>Importante</span>
            <p>Valores, taxas e prazos dependem do grupo e devem ser confirmados antes da contratação.</p>
          </div>
          <button onClick={() => setStep(1)} type="button">
            Refazer simulação
          </button>
        </div>
      )}
    </div>
  );
}

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const nav = [
    ["Modalidades", "#modalidades"],
    ["Como funciona", "#como-funciona"],
    ["Por que a Damasceno", "#vantagens"],
    ["Dúvidas", "#duvidas"],
  ];

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <a href="#" aria-label="Damasceno Consórcios">
            <Brand />
          </a>
          <nav className={styles.desktopNav}>
            {nav.map(([label, href]) => (
              <a href={href} key={label}>
                {label}
              </a>
            ))}
          </nav>
          <a className={styles.headerCta} href="#simule">
            Simule agora <Icon name="arrow" size={17} />
          </a>
          <button
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            className={styles.menuButton}
            onClick={() => setMenuOpen(!menuOpen)}
            type="button"
          >
            <Icon name={menuOpen ? "x" : "menu"} size={26} />
          </button>
        </div>
        {menuOpen && (
          <nav className={styles.mobileNav}>
            {nav.map(([label, href]) => (
              <a href={href} key={label} onClick={() => setMenuOpen(false)}>
                {label}
              </a>
            ))}
          </nav>
        )}
      </header>

      <section className={styles.hero}>
        <Image
          alt="Casal celebrando a conquista da casa nova"
          fill
          priority
          sizes="(max-width: 960px) 100vw, 52vw"
          src={heroImage}
        />
        <div className={styles.heroOverlay} />
        <div className={styles.heroInner}>
          <div className={styles.heroCopy}>
            <span className={styles.heroBadge}>
              <Icon name="shield" size={15} /> Especialista em planos Ademicon
            </span>
            <h1>
              O plano certo muda <em>tudo.</em>
            </h1>
            <p>
              Transforme planos em patrimônio com uma estratégia Ademicon personalizada, sem juros e
              com acompanhamento em cada etapa.
            </p>
            <div className={styles.heroActions}>
              <a className={styles.coralButton} href="#simule">
                Simular meu consórcio <Icon name="arrow" size={18} />
              </a>
              <a className={styles.textLink} href="#como-funciona">
                Entenda como funciona
              </a>
            </div>
            <div className={styles.metrics}>
              <div>
                <strong>3</strong>
                <span>categorias de planos</span>
              </div>
              <div>
                <strong>0%</strong>
                <span>de juros</span>
              </div>
              <div>
                <strong>1:1</strong>
                <span>consultoria dedicada</span>
              </div>
            </div>
          </div>
          <Simulator />
        </div>
      </section>

      <section className={styles.partnerBand}>
        <span>Parceria exclusiva</span>
        <strong className={styles.ademicon}>ademicon</strong>
        <i />
        <p>Planos selecionados com atendimento consultivo e condições confirmadas na proposta.</p>
      </section>

      <section className={styles.section} id="modalidades">
        <div className={styles.container}>
          <div className={styles.sectionHead}>
            <div>
              <span className={styles.eyebrow}>Escolha seu próximo passo</span>
              <h2>Um plano para cada momento da sua vida.</h2>
            </div>
            <p>
              Conte com especialistas para encontrar a carta e o grupo que fazem sentido para sua
              realidade.
            </p>
          </div>
          <div className={styles.cards}>
            {(Object.keys(plans) as PlanKey[]).map((key, index) => {
              const item = plans[key];
              return (
                <article key={key}>
                  <span className={styles.cardIcon}>
                    <Icon name={item.icon} size={23} />
                  </span>
                  <small>0{index + 1}</small>
                  <h3>Consórcio de {item.label.toLowerCase()}</h3>
                  <p>{item.description}</p>
                  <a href="#simule">
                    Quero simular <Icon name="arrow" size={17} />
                  </a>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className={styles.stepsSection} id="como-funciona">
        <div className={`${styles.container} ${styles.stepsGrid}`}>
          <div>
            <span className={styles.eyebrow}>Simples do começo à conquista</span>
            <h2>Seu plano em movimento, sem complicação.</h2>
            <p>Você escolhe o objetivo. A gente acompanha cada etapa junto com você.</p>
            <a className={styles.navyButton} href="#contato">
              Falar com especialista <Icon name="arrow" size={17} />
            </a>
          </div>
          <div className={styles.stepCards}>
            {[
              ["01", "Simule seu plano", "Informe a categoria e o valor desejado."],
              ["02", "Encontre o grupo", "Analisamos as opções Ademicon para seu perfil."],
              ["03", "Seja contemplado", "Participe dos sorteios ou oferte seu lance."],
              ["04", "Realize seu sonho", "Use sua carta com poder de compra à vista."],
            ].map(([number, title, text]) => (
              <article key={number}>
                <span>{number}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section} id="vantagens">
        <div className={`${styles.container} ${styles.benefitsGrid}`}>
          <div className={styles.quote}>
            <span>A tranquilidade de escolher bem</span>
            <blockquote>
              “Não vendemos parcelas. Construímos o caminho até a sua conquista.”
            </blockquote>
            <div>
              <b>D</b>
              <p>
                <strong>Time Damasceno</strong>
                <small>Especialistas Ademicon</small>
              </p>
            </div>
          </div>
          <div className={styles.benefits}>
            <span className={styles.eyebrow}>Por que escolher a Damasceno</span>
            <h2>Decisões melhores começam com clareza.</h2>
            {[
              ["Curadoria de planos", "Analisamos os grupos disponíveis para o seu objetivo."],
              ["Atendimento de verdade", "Uma pessoa acompanha você durante toda a jornada."],
              ["Transparência", "Taxas, prazos e regras explicados antes de qualquer decisão."],
            ].map(([title, text]) => (
              <div className={styles.benefitItem} key={title}>
                <span>
                  <Icon name="check" size={16} />
                </span>
                <p>
                  <strong>{title}</strong>
                  <small>{text}</small>
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.faqSection} id="duvidas">
        <div className={`${styles.container} ${styles.faqGrid}`}>
          <div>
            <span className={styles.eyebrow}>Dúvidas frequentes</span>
            <h2>Antes de começar, entenda tudo.</h2>
            <p>Nosso time explica sem letras miúdas.</p>
          </div>
          <div className={styles.faqs}>
            {faqs.map((faq, index) => (
              <div key={faq.question}>
                <button
                  aria-expanded={openFaq === index}
                  onClick={() => setOpenFaq(openFaq === index ? -1 : index)}
                  type="button"
                >
                  {faq.question}
                  <Icon name="chevron" size={18} />
                </button>
                {openFaq === index && <p>{faq.answer}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.contact} id="contato">
        <div className={`${styles.container} ${styles.contactGrid}`}>
          <div>
            <span className={styles.eyebrow}>Seu plano começa aqui</span>
            <h2>Vamos tirar seu sonho do papel?</h2>
            <p>Preencha seus dados para receber uma simulação personalizada.</p>
          </div>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setSubmitAttempted(true);
            }}
          >
            <h3>Receba uma simulação completa</h3>
            <label>
              Nome completo
              <input placeholder="Como podemos chamar você?" required />
            </label>
            <div className={styles.formRow}>
              <label>
                WhatsApp
                <input placeholder="(00) 00000-0000" required />
              </label>
              <label>
                E-mail
                <input placeholder="voce@email.com" required type="email" />
              </label>
            </div>
            {submitAttempted && (
              <p className={styles.formError} role="status">
                O formulário ainda não está conectado a um canal de recebimento. Seus dados não foram enviados.
              </p>
            )}
            <button className={styles.submitButton} type="submit">
              Quero falar com um especialista <Icon name="arrow" size={18} />
            </button>
          </form>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.container}>
          <div>
            <Brand />
            <p>Consultoria especializada em soluções de consórcio Ademicon.</p>
          </div>
          <p>© 2026 Damasceno Consórcios. Todos os direitos reservados.</p>
        </div>
      </footer>

      <a
        aria-label="Falar pelo WhatsApp"
        className={styles.whatsapp}
        href={whatsappUrl}
        rel="noreferrer"
        target="_blank"
      >
        <Icon name="whatsapp" size={25} />
      </a>
    </main>
  );
}
