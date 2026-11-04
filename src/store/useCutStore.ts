// Estado del panel de seccionamiento. Persiste en memoria durante la sesión del navegador.
//
// Solo guarda qué cortes están completados (por su id). El progreso (cuántos de N) se
// deriva en el componente a partir del plan de cortes y este set: no se duplica el dato.

import { create } from "zustand";

interface CutState {
  /** IDs de cortes marcados como completados. */
  completed: Record<string, true>;
  /** Marca o desmarca un corte individual. */
  toggle: (cutId: string) => void;
  /** Marca todos los cortes de una placa como completados. */
  completeSheet: (cutIds: readonly string[]) => void;
  /** Desmarca todos los cortes de una placa. */
  resetSheet: (cutIds: readonly string[]) => void;
  /** Reinicia todo. */
  resetAll: () => void;
}

export const useCutStore = create<CutState>((set) => ({
  completed: {},

  toggle: (cutId) =>
    set((state) => {
      const next = { ...state.completed };
      if (next[cutId]) delete next[cutId];
      else next[cutId] = true;
      return { completed: next };
    }),

  completeSheet: (cutIds) =>
    set((state) => {
      const next = { ...state.completed };
      for (const id of cutIds) next[id] = true;
      return { completed: next };
    }),

  resetSheet: (cutIds) =>
    set((state) => {
      const next = { ...state.completed };
      for (const id of cutIds) delete next[id];
      return { completed: next };
    }),

  resetAll: () => set({ completed: {} }),
}));

// Selectores derivados: se usan en el componente para calcular progreso sin duplicar estado.

/** Cantidad de cortes completados de una lista de IDs. */
export function countCompleted(completed: Record<string, true>, cutIds: readonly string[]): number {
  let count = 0;
  for (const id of cutIds) if (completed[id]) count++;
  return count;
}

