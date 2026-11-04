// Tipos del panel de seccionamiento de placas. Sin dependencias de React ni de three.
//
// Un CutItem es una pieza FÍSICA (una instancia): si un tipo tiene cantidad 2, se generan
// dos CutItem independientes. Los CutItem se agrupan por material + espesor en CuttingSheet
// ("placa"), que es la unidad de trabajo en la seccionadora.
//
// R4 (sección de cortes) — supuesto de trabajo provisorio: listado de cortes = piezas por
// tablero, un check por pieza física por tablero. A confirmar con Casa Mueble (consultas 35–37).

/** Una pieza física individual que sale de la seccionadora. */
export interface CutItem {
  /** ID único del corte: `<qrId>#<instancia>` (ej. `olmo-c04#1`). */
  id: string;
  /** Código canónico del componente en el .dae: `0001-01-M01-C04`. */
  code: string;
  /** Último segmento del código (ej. "C04"), para listas y menús. */
  shortCode: string;
  /** Nombre legible de la pieza. */
  name: string;
  /** Medidas del listado (mm). */
  lengthMm: number;
  widthMm: number;
  thicknessMm: number;
  /** Material de la placa. */
  material: string;
  /** Índice de instancia (1-based). */
  instance: number;
  /** Cantidad total de piezas de este tipo. */
  quantity: number;
  /** qrId del tipo de pieza, para linkear a su ficha. */
  qrId: string;
}

/** Grupo de cortes que salen de un mismo tipo de placa (material + espesor). */
export interface CuttingSheet {
  /** ID de la placa: `<furnitureId>:<material>:<espesor>`. */
  id: string;
  /** Nombre del material (ej. "Blanco Nature"). */
  material: string;
  /** Espesor en mm. */
  thicknessMm: number;
  /** Etiqueta para mostrar (ej. "Blanco Nature · 18 mm"). */
  label: string;
  /** Cortes individuales de esta placa, en el orden del listado. */
  cuts: readonly CutItem[];
}

/** Un mueble con sus placas listas para la vista de seccionamiento. */
export interface FurnitureCuttingPlan {
  furnitureId: string;
  furnitureName: string;
  sheets: readonly CuttingSheet[];
  /** Total de piezas físicas en todo el mueble. */
  totalCuts: number;
}

