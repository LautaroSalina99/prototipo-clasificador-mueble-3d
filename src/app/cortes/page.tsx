import { CuttingPanel } from "@/components/CuttingPanel";
import { buildCuttingPlan } from "@/data/cutting";
import { listBaseFurniture } from "@/lib/lookup";

// /cortes — panel de seccionamiento de placas.
// Página estática: el plan de cortes se arma en build a partir de los muebles registrados.
// La interactividad (checkboxes) vive en CuttingPanel (client component).

export default function CortesPage() {
  const plans = listBaseFurniture().map(buildCuttingPlan);

  return <CuttingPanel plans={plans} />;
}

