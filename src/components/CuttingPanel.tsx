"use client";

// Panel de seccionamiento de placas.
//
// Muestra los cortes agrupados por placa (material + espesor), con un check por pieza
// física para que el operario marque cada corte a medida que sale de la seccionadora.
// Mobile-first: checkboxes grandes (44 × 44 px mínimo), texto legible, scroll natural.
//
// R4 (sección de cortes) — supuesto de trabajo provisorio: listado de cortes = piezas
// por tablero, un check por pieza física por tablero. Formato a confirmar con Casa Mueble.

import { useMemo } from "react";
import Link from "next/link";
import type { CutItem, CuttingSheet, FurnitureCuttingPlan } from "@/data/cuttingTypes";
import { qrHref } from "@/lib/lookup";
import { useCutStore, countCompleted } from "@/store/useCutStore";

// ─── Barra de progreso ──────────────────────────────────────────────────────

function ProgressBar({ done, total }: { done: number; total: number }) {
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  const allDone = done === total && total > 0;
  return (
    <div className="flex items-center gap-3">
      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-200">
        <div
          className={`h-full rounded-full transition-all duration-300 ${allDone ? "bg-emerald-500" : "bg-orange-500"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={`min-w-[4.5rem] text-right text-sm font-semibold tabular-nums ${allDone ? "text-emerald-600" : "text-slate-700"}`}>
        {done} / {total}
      </span>
    </div>
  );
}

// ─── Fila de un corte individual ─────────────────────────────────────────────

function CutRow({ cut, done, onToggle }: { cut: CutItem; done: boolean; onToggle: () => void }) {
  const instanceLabel = cut.quantity > 1 ? ` (${cut.instance}/${cut.quantity})` : "";

  return (
    <li className={`flex items-center gap-3 rounded-xl p-3 transition-colors ${done ? "bg-emerald-50/60" : "bg-white"}`}>
      {/* Checkbox táctil, mínimo 44 × 44 px. */}
      <button
        type="button"
        role="checkbox"
        aria-checked={done}
        aria-label={done ? `Desmarcar ${cut.name}${instanceLabel}` : `Marcar ${cut.name}${instanceLabel} como cortada`}
        onClick={onToggle}
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border-2 text-lg font-bold transition-colors select-none ${
          done
            ? "border-emerald-500 bg-emerald-500 text-white"
            : "border-slate-300 bg-white active:border-orange-400 active:bg-orange-50"
        }`}
      >
        {done ? "✓" : ""}
      </button>

      {/* Datos de la pieza. */}
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <Link
            href={qrHref(cut.qrId)}
            className={`text-sm font-semibold ${done ? "text-emerald-700" : "text-orange-600"} hover:underline`}
          >
            {cut.shortCode}
          </Link>
          <span className={`truncate text-sm font-medium ${done ? "text-slate-400 line-through" : "text-slate-900"}`}>
            {cut.name}
            {instanceLabel}
          </span>
        </div>
        <p className={`mt-0.5 text-xs ${done ? "text-slate-400" : "text-slate-500"}`}>
          {cut.lengthMm} × {cut.widthMm} mm
        </p>
      </div>
    </li>
  );
}

// ─── Sección de una placa (material + espesor) ──────────────────────────────

function SheetSection({ sheet }: { sheet: CuttingSheet }) {
  const completed = useCutStore((s) => s.completed);
  const toggle = useCutStore((s) => s.toggle);
  const completeSheet = useCutStore((s) => s.completeSheet);
  const resetSheet = useCutStore((s) => s.resetSheet);

  const cutIds = useMemo(() => sheet.cuts.map((c) => c.id), [sheet.cuts]);
  const done = countCompleted(completed, cutIds);
  const total = sheet.cuts.length;
  const allDone = done === total;

  return (
    <details className="group rounded-xl bg-slate-50 ring-1 ring-slate-200" open>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-4 py-3 [&::-webkit-details-marker]:hidden">
        <span className="flex items-center gap-2">
          <span className={`inline-block h-3 w-3 rounded-full ${allDone ? "bg-emerald-500" : "bg-orange-400"}`} />
          <span className="text-sm font-semibold text-slate-800">{sheet.label}</span>
        </span>
        <span className="flex items-center gap-2 text-xs text-slate-500">
          {done}/{total} piezas
          <span aria-hidden className="transition-transform group-open:rotate-180">▾</span>
        </span>
      </summary>

      <div className="px-4 pb-4">
        <div className="mb-3">
          <ProgressBar done={done} total={total} />
        </div>

        {/* Acciones de placa */}
        <div className="mb-3 flex gap-2">
          <button
            type="button"
            onClick={() => completeSheet(cutIds)}
            disabled={allDone}
            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Marcar todas
          </button>
          <button
            type="button"
            onClick={() => resetSheet(cutIds)}
            disabled={done === 0}
            className="rounded-lg bg-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-300 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Reiniciar placa
          </button>
        </div>

        <ul className="flex flex-col gap-2">
          {sheet.cuts.map((cut) => (
            <CutRow
              key={cut.id}
              cut={cut}
              done={!!completed[cut.id]}
              onToggle={() => toggle(cut.id)}
            />
          ))}
        </ul>
      </div>
    </details>
  );
}

// ─── Panel principal ─────────────────────────────────────────────────────────

export function CuttingPanel({ plans }: { plans: readonly FurnitureCuttingPlan[] }) {
  const completed = useCutStore((s) => s.completed);
  const resetAll = useCutStore((s) => s.resetAll);

  // Progreso global de todos los muebles.
  const allCutIds = useMemo(() => plans.flatMap((p) => p.sheets.flatMap((s) => s.cuts.map((c) => c.id))), [plans]);
  const globalDone = countCompleted(completed, allCutIds);
  const globalTotal = allCutIds.length;

  return (
    <div className="mx-auto w-full max-w-xl p-4 pb-10 lg:p-8">
      <p className="text-xs font-semibold uppercase tracking-wide text-orange-600">Prototipo — vista previa</p>
      <h1 className="mt-1 text-2xl font-bold text-slate-900">Seccionamiento de placas</h1>
      <p className="mt-2 text-sm text-slate-600">
        Marcá cada pieza a medida que sale de la seccionadora. El progreso se guarda mientras la pestaña esté abierta.
      </p>

      {/* Progreso global */}
      <div className="mt-4 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-slate-700">Progreso general</span>
          {globalDone > 0 && (
            <button
              type="button"
              onClick={resetAll}
              className="text-xs font-medium text-red-600 hover:text-red-700 hover:underline"
            >
              Reiniciar todo
            </button>
          )}
        </div>
        <ProgressBar done={globalDone} total={globalTotal} />
        {globalDone === globalTotal && globalTotal > 0 && (
          <p className="mt-2 text-sm font-medium text-emerald-600">✓ Todas las piezas cortadas</p>
        )}
      </div>

      {/* Un bloque por mueble */}
      {plans.map((plan) => (
        <section key={plan.furnitureId} className="mt-8">
          <h2 className="text-xl font-bold text-slate-900">{plan.furnitureName}</h2>
          <p className="mt-1 text-sm text-slate-500">{plan.totalCuts} piezas físicas en {plan.sheets.length} {plan.sheets.length === 1 ? "placa" : "placas"}</p>
          <div className="mt-4 flex flex-col gap-4">
            {plan.sheets.map((sheet) => (
              <SheetSection key={sheet.id} sheet={sheet} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

