"use client";

import {
  Timestamp,
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { FirebaseError } from "firebase/app";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import Brand from "@/components/Brand";
import {
  getFirebaseAuth,
  getFirebaseClientConfigurationError,
  getFirebaseFirestore,
} from "@/lib/firebase-client";
import styles from "./crm.module.css";

type LeadStatus =
  | "novo"
  | "em_contato"
  | "proposta"
  | "convertido"
  | "arquivado";

type CrmLead = {
  id: string;
  name: string;
  email: string;
  phone: string;
  objective: "imovel" | "veiculos" | "servicos" | null;
  amountType: "credit" | "installment" | null;
  amount: number | null;
  source: "simulador" | "contato";
  status: LeadStatus;
  createdAt: string | null;
};

const statusLabels: Record<LeadStatus, string> = {
  novo: "Novo",
  em_contato: "Em contato",
  proposta: "Proposta",
  convertido: "Convertido",
  arquivado: "Arquivado",
};

const objectiveLabels = {
  imovel: "Imóveis",
  veiculos: "Veículos",
  servicos: "Serviços",
} as const;

const money = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);

function getFirestoreErrorMessage(error: unknown, action: string) {
  if (error instanceof FirebaseError && error.code === "permission-denied") {
    return `O Firestore negou ${action}. No Firebase Console, publique as regras de firestore.rules e confirme que você entrou com teste@damasceno.com.`;
  }

  return error instanceof Error
    ? error.message
    : `Não foi possível ${action}.`;
}

function declaredSummary(lead: CrmLead) {
  if (!lead.objective || !lead.amountType || lead.amount === null) {
    return "Não informou modalidade ou valor na simulação.";
  }

  const amountLabel =
    lead.amountType === "credit"
      ? `crédito declarado de ${money(lead.amount)}`
      : `parcela declarada de ${money(lead.amount)} por mês`;

  return `Declarou interesse em ${objectiveLabels[lead.objective].toLowerCase()} e ${amountLabel}.`;
}

function mapLead(document: QueryDocumentSnapshot<DocumentData>): CrmLead {
  const data = document.data();
  return {
    id: document.id,
    name: data.name,
    email: data.email,
    phone: data.phone,
    objective: data.objective,
    amountType: data.amountType,
    amount: data.amount,
    source: data.source,
    status: data.status,
    createdAt:
      data.createdAt instanceof Timestamp
        ? data.createdAt.toDate().toISOString()
        : null,
  };
}

export default function CrmPage() {
  const [user, setUser] = useState<User | null>(null);
  const [configError] = useState(() => getFirebaseClientConfigurationError());
  const [authReady, setAuthReady] = useState(() => Boolean(configError));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [leads, setLeads] = useState<CrmLead[]>([]);
  const [search, setSearch] = useState("");
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [error, setError] = useState("");
  const [busyLeadId, setBusyLeadId] = useState("");
  const [newLeadNoticeCount, setNewLeadNoticeCount] = useState(0);

  const loadLeads = useCallback(async () => {
    setLoadingLeads(true);
    setError("");

    try {
      const snapshot = await getDocs(
        query(
          collection(getFirebaseFirestore(), "leads"),
          orderBy("createdAt", "desc"),
          limit(200),
        ),
      );
      setLeads(snapshot.docs.map(mapLead));
    } catch (loadError) {
      setError(getFirestoreErrorMessage(loadError, "carregar os cadastros"));
    } finally {
      setLoadingLeads(false);
    }
  }, []);

  useEffect(() => {
    if (configError) return;

    let stopListeningForLeads: (() => void) | undefined;
    const stopListeningForAuth = onAuthStateChanged(
      getFirebaseAuth(),
      (currentUser) => {
        stopListeningForLeads?.();
        stopListeningForLeads = undefined;
      setUser(currentUser);
      setAuthReady(true);
      if (currentUser) {
          setLoadingLeads(true);
          let isInitialSnapshot = true;
          stopListeningForLeads = onSnapshot(
            query(
              collection(getFirebaseFirestore(), "leads"),
              orderBy("createdAt", "desc"),
              limit(200),
            ),
            (snapshot) => {
              if (!isInitialSnapshot) {
                const addedLeads = snapshot
                  .docChanges()
                  .filter((change) => change.type === "added").length;
                if (addedLeads > 0) {
                  setNewLeadNoticeCount((count) => count + addedLeads);
                }
              }
              isInitialSnapshot = false;
              setLeads(snapshot.docs.map(mapLead));
              setLoadingLeads(false);
              setError("");
            },
            (snapshotError) => {
              setError(
                getFirestoreErrorMessage(
                  snapshotError,
                  "receber atualizações dos cadastros",
                ),
              );
              setLoadingLeads(false);
            },
          );
      } else {
        setLeads([]);
        setLoadingLeads(false);
        setError("");
        setNewLeadNoticeCount(0);
      }
      },
    );

    return () => {
      stopListeningForAuth();
      stopListeningForLeads?.();
    };
  }, [configError, loadLeads]);

  const filteredLeads = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();
    if (!searchTerm) return leads;

    return leads.filter((lead) =>
      [lead.name, lead.email, lead.phone].some((value) =>
        value.toLowerCase().includes(searchTerm),
      ),
    );
  }, [leads, search]);

  const updateStatus = async (lead: CrmLead, status: LeadStatus) => {
    if (!user) return;
    setBusyLeadId(lead.id);
    setError("");

    try {
      await updateDoc(doc(getFirebaseFirestore(), "leads", lead.id), {
        status,
        updatedAt: serverTimestamp(),
      });

      setLeads((currentLeads) =>
        currentLeads.map((currentLead) =>
          currentLead.id === lead.id ? { ...currentLead, status } : currentLead,
        ),
      );
    } catch (updateError) {
      setError(getFirestoreErrorMessage(updateError, "atualizar a etapa"));
    } finally {
      setBusyLeadId("");
    }
  };

  const submitLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (configError) return;
    setLoginError("");

    try {
      await signInWithEmailAndPassword(
        getFirebaseAuth(),
        email.trim(),
        password,
      );
      setPassword("");
    } catch {
      setLoginError(
        "Não foi possível entrar. Verifique o e-mail e a senha cadastrados no Firebase.",
      );
    }
  };

  const logout = async () => {
    await signOut(getFirebaseAuth());
  };

  if (!authReady) {
    return (
      <main className={styles.page}>
        <p className={styles.loading}>Carregando o CRM...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className={styles.page}>
        <section className={styles.loginCard}>
          <Link className={styles.backLink} href="/">
            <Brand />
          </Link>
          <span className={styles.kicker}> Área restrita</span>
          <h1>Acesse seus cadastros</h1>
          <p>Entre com o e-mail e a senha cadastrados no Firebase.</p>
          {configError && (
            <p className={styles.error} role="alert">
              {configError}
            </p>
          )}
          {loginError && (
            <p className={styles.error} role="alert">
              {loginError}
            </p>
          )}
          <form onSubmit={submitLogin}>
            <label>
              E-mail
              <input
                autoComplete="username"
                onChange={(event) => setEmail(event.target.value)}
                required
                type="email"
                value={email}
              />
            </label>
            <label>
              Senha
              <input
                autoComplete="current-password"
                onChange={(event) => setPassword(event.target.value)}
                required
                type="password"
                value={password}
              />
            </label>
            <button disabled={Boolean(configError)} type="submit">
              Entrar no CRM
            </button>
          </form>
        </section>
      </main>
    );
  }

  const newLeads = leads.filter((lead) => lead.status === "novo").length;
  const activeLeads = leads.filter(
    (lead) => lead.status === "em_contato" || lead.status === "proposta",
  ).length;
  const convertedLeads = leads.filter(
    (lead) => lead.status === "convertido",
  ).length;

  return (
    <main className={styles.page}>
      <div className={styles.dashboard}>
        <header className={styles.header}>
          <div>
            <Link className={styles.backLink} href="/">
              <Brand />
            </Link>
            <p className={styles.kicker}>Atendimento e cadastros</p>
            <h1>Atendimento</h1>
            <p className={styles.subhead}>
              Cadastros recebidos pelos formulários do site. A lista exibe até os
              200 mais recentes.
            </p>
          </div>
          <button className={styles.logout} onClick={logout} type="button">
            Sair
          </button>
        </header>

        <section aria-label="Resumo de etapas" className={styles.metrics}>
          <article>
            <span>Total carregado</span>
            <strong>{leads.length}</strong>
          </article>
          <article>
            <span>Novos</span>
            <strong>{newLeads}</strong>
          </article>
          <article>
            <span>Em andamento</span>
            <strong>{activeLeads}</strong>
          </article>
          <article>
            <span>Convertidos</span>
            <strong>{convertedLeads}</strong>
          </article>
        </section>

        <section className={styles.listSection}>
          {newLeadNoticeCount > 0 && (
            <div aria-live="polite" className={styles.newLeadNotice} role="status">
              <span>
                {newLeadNoticeCount === 1
                  ? "Novo cadastro recebido."
                  : `${newLeadNoticeCount} novos cadastros recebidos.`}
              </span>
              <button
                aria-label="Dispensar aviso de novos cadastros"
                onClick={() => setNewLeadNoticeCount(0)}
                type="button"
              >
                Dispensar
              </button>
            </div>
          )}
          <div className={styles.listHeader}>
            <div>
              <h2>Cadastros</h2>
              <p>Atualize a etapa do atendimento conforme a conversa evolui.</p>
            </div>
            <div className={styles.tools}>
              <input
                aria-label="Buscar cadastros"
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar nome, e-mail ou telefone"
                type="search"
                value={search}
              />
              <button
                disabled={loadingLeads}
                onClick={() => void loadLeads()}
                type="button"
              >
                {loadingLeads ? "Atualizando..." : "Atualizar"}
              </button>
            </div>
          </div>

          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}
          {loadingLeads && leads.length === 0 && (
            <p className={styles.empty}>Carregando cadastros...</p>
          )}
          {!loadingLeads && filteredLeads.length === 0 && (
            <p className={styles.empty}>
              {search
                ? "Nenhum cadastro corresponde à busca."
                : "Ainda não há cadastros recebidos."}
            </p>
          )}

          <div className={styles.leadList}>
            {filteredLeads.map((lead) => (
              <article className={styles.leadCard} key={lead.id}>
                <header className={styles.leadHeader}>
                  <div className={styles.leadHeading}>
                    <h3>{lead.name}</h3>
                    <span className={styles.source}>
                      {lead.source === "simulador" ? "Simulação" : "Contato"}
                    </span>
                  </div>
                  <time className={styles.leadDate}>
                    {lead.createdAt
                      ? new Intl.DateTimeFormat("pt-BR", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        }).format(new Date(lead.createdAt))
                      : "Data não disponível"}
                  </time>
                </header>

                <div className={styles.leadBody}>
                  <section aria-label="Dados de contato" className={styles.contactDetails}>
                    <h4>Contato</h4>
                    <a href={`mailto:${lead.email}`}>
                      <span>E-mail</span>
                      <strong>{lead.email}</strong>
                    </a>
                    <a href={`tel:${lead.phone}`}>
                      <span>WhatsApp / telefone</span>
                      <strong>{lead.phone}</strong>
                    </a>
                  </section>

                  <section className={styles.profile}>
                    <h4>Interesse declarado</h4>
                    <p>{declaredSummary(lead)}</p>
                    <small>
                      Resumo operacional; não é avaliação de crédito ou de
                      capacidade financeira.
                    </small>
                  </section>
                </div>

                <footer className={styles.leadFooter}>
                  <span className={styles.statusLabel}>Etapa do atendimento</span>
                  <label className={styles.statusControl}>
                    <span className={styles.visuallyHidden}>Etapa de {lead.name}</span>
                    <select
                      disabled={busyLeadId === lead.id}
                      onChange={(event) =>
                        void updateStatus(lead, event.target.value as LeadStatus)
                      }
                      value={lead.status}
                    >
                      {Object.entries(statusLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>
                </footer>
              </article>
            ))}
          </div>
        </section>

        <p className={styles.privacyNote}>
          Dados de contato são exibidos somente para usuários autorizados. O CRM
          não faz consultas externas nem tenta identificar pessoas por seus
          dados de contato.
        </p>
      </div>
    </main>
  );
}
