/**
 * Replaces English path bodies in ES files with Spanish translations.
 * Run: npx tsx scripts/patch-path-es-bodies.ts
 */
import fs from "fs";
import path from "path";
import matter from "gray-matter";

const PATH_ES_BODIES: Record<string, string> = {
  "doctor-visit-prep": `Las visitas al médico pueden sentirse apresuradas y abrumadoras. Esta ruta le ayuda a prepararse para sacar el máximo provecho de cada cita. Aprenda qué llevar, cómo describir síntomas, qué preguntas hacer y cómo hacer seguimiento.

:::info
Usted es el experto en su propio cuerpo. Una buena visita es una colaboración — su médico aporta conocimiento médico y usted aporta cómo se siente.
:::`,
  "managing-new-diagnosis": `Recibir un diagnóstico nuevo puede ser abrumador. Esta ruta le guía paso a paso para entender su condición, hacer preguntas útiles y construir un plan de cuidado que funcione para usted.

:::info
Un diagnóstico es un punto de partida, no un destino final. Muchas personas viven bien con condiciones crónicas siguiendo un plan personalizado.
:::`,
  "mental-wellness-basics": `La salud mental es tan importante como la física. Esta ruta cubre estrategias cotidianas, cuándo buscar ayuda profesional y cómo apoyar a quienes le importan.

:::warning
Si está en peligro inmediato o tiene pensamientos de hacerse daño, llame al 911 o a una línea de crisis.
:::`,
  "navigating-healthcare": `El sistema de salud puede ser confuso. Esta ruta explica seguros, facturas, cómo elegir proveedores y cómo abogar por usted mismo en citas y reclamos.

:::info
Lleve siempre su tarjeta de seguro, identificación y lista de medicamentos a cada visita.
:::`,
  "safer-medicine-use": `Usar medicamentos con seguridad reduce errores y efectos secundarios. Esta ruta cubre etiquetas de receta, preguntas para farmacéuticos y manejo de efectos adversos.

:::warning
Nunca comparta medicamentos recetados con otras personas, aunque los síntomas parezcan similares.
:::`,
  "staying-healthy-preventive": `La atención preventiva detecta problemas temprano cuando el tratamiento suele ser más sencillo. Esta ruta cubre chequeos, vacunas y hábitos diarios que apoyan la salud a largo plazo.

:::success
Muchas pruebas preventivas están cubiertas sin copago cuando usa proveedores en red.
:::`,
  "understanding-labs": `Los resultados de laboratorio pueden ser difíciles de interpretar. Esta ruta explica pruebas comunes, qué significan las banderas H/L y qué preguntar a su médico.

:::info
Un resultado fuera de rango no siempre significa enfermedad — su médico interpreta números en contexto.
:::`,
};

for (const [id, body] of Object.entries(PATH_ES_BODIES)) {
  const filePath = path.join(process.cwd(), "content", "paths", "es", `${id}.mdx`);
  const raw = fs.readFileSync(filePath, "utf8");
  const { data } = matter(raw);
  const yaml = Object.entries(data)
    .map(([k, v]) => {
      if (Array.isArray(v)) return `${k}:\n${v.map((x) => `  - "${x}"`).join("\n")}`;
      return `${k}: "${v}"`;
    })
    .join("\n");
  fs.writeFileSync(filePath, `---\n${yaml}\n---\n\n${body}\n`, "utf8");
  console.log(`Translated path body: es/${id}`);
}

console.log("Path ES body translation complete.");
