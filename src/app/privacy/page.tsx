"use client";

import { useAppState } from "@/components/AppProviders";
import PageHeader from "@/components/PageHeader";

export default function PrivacyPage() {
  const { locale } = useAppState();

  return (
    <main className="py-12 md:py-16">
      <div className="max-w-container mx-auto px-4 md:px-6">
        <PageHeader
          title={locale === "es" ? "Privacidad" : "Privacy"}
          description={
            locale === "es"
              ? "Cómo manejamos tu información en Health Made Clear."
              : "How we handle your information at Health Made Clear."
          }
        />

        <div className="mx-auto max-w-3xl space-y-8">
          <section>
            <h2 className="mb-3 text-headline-md text-primary">
              {locale === "es" ? "Educación, no atención médica" : "Education, not healthcare"}
            </h2>
            <p className="text-body-md text-on-surface-variant">
              {locale === "es"
                ? "Health Made Clear es un recurso educativo. No recopilamos información de salud personal sensible ni proporcionamos diagnósticos o tratamientos médicos."
                : "Health Made Clear is an educational resource. We do not collect sensitive personal health information or provide medical diagnoses or treatments."}
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-headline-md text-primary">
              {locale === "es" ? "Qué recopilamos" : "What we collect"}
            </h2>
            <p className="text-body-md text-on-surface-variant">
              {locale === "es"
                ? "Solo almacenamos datos localmente en tu dispositivo para recordar tu progreso de aprendizaje, preferencias de idioma, tema y tamaño de texto. Estos datos nunca se transmiten a nuestros servidores."
                : "We only store data locally on your device to remember your learning progress, language, theme, and text size preferences. This data is never transmitted to our servers."}
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-headline-md text-primary">
              {locale === "es" ? "Tus controles" : "Your controls"}
            </h2>
            <p className="text-body-md text-on-surface-variant">
              {locale === "es"
                ? "Puedes borrar tus datos locales en cualquier momento usando la configuración de privacidad de tu navegador. No requerimos cuentas ni información personal para usar la plataforma."
                : "You can clear your local data at any time through your browser's privacy settings. We do not require accounts or personal information to use the platform."}
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
