"use client";

import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  addDoc,
  collection,
  getFirestore,
  serverTimestamp,
} from "firebase/firestore";

export class FirebaseClientConfigurationError extends Error {}

export type NewLead = {
  name: string;
  email: string;
  phone: string;
  objective: "imovel" | "veiculos" | "servicos" | null;
  amountType: "credit" | "installment" | null;
  amount: number | null;
  source: "simulador" | "contato";
  consent: true;
};

function getFirebaseConfig() {
  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  return Object.values(config).every(Boolean) ? config : null;
}

export function getFirebaseClientConfigurationError() {
  return getFirebaseConfig()
    ? ""
    : "Configure as variáveis públicas do Firebase para habilitar o CRM.";
}

export function getFirebaseAuth() {
  return getFirebaseClient().auth;
}

export function getFirebaseFirestore() {
  return getFirebaseClient().firestore;
}

function getFirebaseClient() {
  const config = getFirebaseConfig();
  if (!config) {
    throw new FirebaseClientConfigurationError(
      getFirebaseClientConfigurationError(),
    );
  }

  const app = getApps().length ? getApp() : initializeApp(config);
  return { auth: getAuth(app), firestore: getFirestore(app) };
}

export async function saveLead(lead: NewLead) {
  const { firestore } = getFirebaseClient();
  await addDoc(collection(firestore, "leads"), {
    ...lead,
    name: lead.name.trim(),
    email: lead.email.trim().toLowerCase(),
    phone: lead.phone.replace(/\D/g, ""),
    status: "novo",
    consentAt: serverTimestamp(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}
