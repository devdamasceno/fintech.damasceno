import { NextResponse } from "next/server";

const objectives = new Set(["imovel", "veiculos-pesados", "investimento"]);
const captureStatuses = new Set(["captura_parcial", "captura_total"]);

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  if (!payload || typeof payload !== "object") {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const lead = payload as Record<string, unknown>;
  const phone =
    typeof lead.phone === "string" ? lead.phone.replace(/\D/g, "") : "";

  if (
    typeof lead.status !== "string" ||
    !captureStatuses.has(lead.status) ||
    typeof lead.name !== "string" ||
    (lead.status === "captura_total" && !lead.name.trim()) ||
    lead.name.trim().length > 120 ||
    phone.length < 10 ||
    phone.length > 11 ||
    typeof lead.objective !== "string" ||
    !objectives.has(lead.objective) ||
    typeof lead.credit !== "number" ||
    !Number.isFinite(lead.credit) ||
    lead.credit < 100_000 ||
    lead.credit > 5_000_000 ||
    typeof lead.monthlyPayment !== "number" ||
    !Number.isFinite(lead.monthlyPayment) ||
    lead.monthlyPayment < 500 ||
    lead.monthlyPayment > 50_000
  ) {
    return NextResponse.json(
      { error: "Confira os dados enviados." },
      { status: 400 },
    );
  }

  const destination = process.env.LEADS_API_URL;
  if (!destination) {
    return NextResponse.json(
      { error: "O serviço de recebimento de leads não está configurado." },
      { status: 503 },
    );
  }

  try {
    const response = await fetch(destination, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.LEADS_API_TOKEN
          ? { Authorization: `Bearer ${process.env.LEADS_API_TOKEN}` }
          : {}),
      },
      body: JSON.stringify({
        ...lead,
        name: lead.name.trim(),
        phone,
      }),
      signal: AbortSignal.timeout(8_000),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "O serviço de recebimento de leads recusou os dados." },
        { status: 502 },
      );
    }
  } catch {
    return NextResponse.json(
      { error: "Não foi possível conectar ao serviço de recebimento de leads." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true }, { status: 202 });
}
