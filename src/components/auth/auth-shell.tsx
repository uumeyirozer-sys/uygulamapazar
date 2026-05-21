import { AuthForm } from "@/components/auth/auth-form";
import { Container } from "@/components/ui/container";

type AuthShellProps = {
  mode: "login" | "register";
};

export function AuthShell({ mode }: AuthShellProps) {
  const isLogin = mode === "login";

  return (
    <section className="bg-neutral-50">
      <Container className="grid min-h-[calc(100vh-4.5rem)] gap-8 py-10 lg:grid-cols-[1fr_460px] lg:items-center lg:py-16">
        <div className="relative overflow-hidden rounded-2xl bg-[#111113] p-7 text-brand-white shadow-card md:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(229,9,20,0.28),transparent_34%),radial-gradient(circle_at_88%_18%,rgba(255,255,255,0.08),transparent_28%)]" />
          <div className="relative">
            <p className="mb-4 inline-flex rounded-full border border-red-400/20 bg-red-500/10 px-3 py-1 text-xs font-black uppercase text-red-200">
              UygulamaPazar.com
            </p>
            <h1 className="max-w-2xl text-4xl font-black leading-[1.05] text-brand-white sm:text-5xl">
              {isLogin ? "Marketplace hesabına güvenli giriş deneyimi." : "Satıcı profilini ve ürün vitrinini oluşturmaya başla."}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-neutral-300">
              {isLogin
                ? "Mesajlar, ilanlar ve profil yönetimi için hazırlanmış premium auth arayüzü."
                : "Dijital ürünlerini listelemek, alıcılarla konuşmak ve marketplace profilini büyütmek için modern kayıt akışı."}
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {["Premium ilan", "Güven skoru", "Mesaj akışı"].map((item) => (
                <div key={item} className="rounded-xl border border-white/10 bg-white/8 p-4">
                  <div className="mb-5 h-2 w-10 rounded-full bg-brand-red" />
                  <p className="text-sm font-black text-brand-white">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <AuthForm mode={mode} />
      </Container>
    </section>
  );
}
