// Genera el plan de cortes a partir de un FurnitureDef.
//
// Cada tipo de pieza se expande por su `quantity` para generar un CutItem por pieza física.
// Los cortes se agrupan por material + espesor ("placa"). Función pura, sin estado: la usa
// la página /cortes para armar la vista de seccionamiento.

import type { FurnitureDef } from "./types";
import type { CutItem, CuttingSheet, FurnitureCuttingPlan } from "./cuttingTypes";
import { shortCode as extractShort } from "@/model/ids";

/** Arma el plan de cortes de un mueble, agrupado por placa (material + espesor). */
export function buildCuttingPlan(def: FurnitureDef): FurnitureCuttingPlan {
  // Expandir cada tipo por su cantidad: un CutItem por pieza física.
  const allCuts: CutItem[] = [];

  for (const piece of def.pieceTypes) {
    for (let i = 1; i <= piece.quantity; i++) {
      allCuts.push({
        id: `${piece.qrId}#${i}`,
        code: piece.code,
        shortCode: extractShort(piece.code),
        name: piece.name,
        lengthMm: piece.lengthMm,
        widthMm: piece.widthMm,
        thicknessMm: piece.thicknessMm,
        material: piece.material,
        instance: i,
        quantity: piece.quantity,
        qrId: piece.qrId,
      });
    }
  }

  // Agrupar por material + espesor, preservando el orden del listado.
  const groups = new Map<string, CutItem[]>();

  for (const cut of allCuts) {
    const key = `${def.furniture.id}:${cut.material}:${cut.thicknessMm}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(cut);
  }

  const sheets: CuttingSheet[] = [...groups.entries()].map(([id, cuts]) => ({
    id,
    material: cuts[0].material,
    thicknessMm: cuts[0].thicknessMm,
    label: `${cuts[0].material} · ${cuts[0].thicknessMm} mm`,
    cuts,
  }));

  return {
    furnitureId: def.furniture.id,
    furnitureName: def.furniture.name,
    sheets,
    totalCuts: allCuts.length,
  };
}

