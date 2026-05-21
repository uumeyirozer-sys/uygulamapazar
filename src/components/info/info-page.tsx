import { Container } from "@/components/ui/container";

type InfoPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  sections: Array<{
    title: string;
    content: string[];
  }>;
};

export function InfoPage({ eyebrow, title, description, sections }: InfoPageProps) {
  return (
    <>
      <section className="relative overflow-hidden bg-[#111113] text-brand-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(229,9,20,0.24),transparent_34%),radial-gradient(circle_at_88%_18%,rgba(255,255,255,0.08),transparent_28%)]" />
        <Container className="relative py-12 md:py-16">
          <p className="mb-4 inline-flex rounded-full border border-red-400/20 bg-red-500/10 px-3 py-1 text-xs font-black uppercase text-red-200">
            {eyebrow}
          </p>
          <h1 className="max-w-3xl text-4xl font-black leading-[1.05] text-brand-white sm:text-5xl">{title}</h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-neutral-300">{description}</p>
        </Container>
      </section>

      <section className="app-section bg-neutral-50">
        <Container className="grid gap-6 lg:grid-cols-[280px_1fr] lg:items-start">
          <aside className="market-card sticky top-24 p-5">
            <p className="tag-text text-brand-red">İçerik</p>
            <div className="mt-4 grid gap-2">
              {sections.map((section) => (
                <a
                  key={section.title}
                  href={`#${section.title.toLowerCase().replaceAll(" ", "-")}`}
                  className="rounded-xl bg-neutral-100 px-4 py-3 text-sm font-black text-neutral-700 transition hover:bg-red-50 hover:text-brand-red"
                >
                  {section.title}
                </a>
              ))}
            </div>
          </aside>

          <main className="grid gap-5">
            {sections.map((section) => (
              <article key={section.title} id={section.title.toLowerCase().replaceAll(" ", "-")} className="market-card p-6 md:p-7">
                <h2 className="text-2xl font-black text-brand-black">{section.title}</h2>
                <div className="mt-4 grid gap-4">
                  {section.content.map((paragraph) => (
                    <p key={paragraph} className="text-base leading-8 text-neutral-700">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </article>
            ))}
          </main>
        </Container>
      </section>
    </>
  );
}
