import Image from "next/image";

export function VeteranOwnedBadge() {
  return (
    <section className="border-t border-border/30 bg-cream py-16 sm:py-20">
      <div className="mx-auto max-w-5xl px-6 sm:px-8 lg:px-10">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 rounded-[2rem] border border-border/50 bg-white px-6 py-8 text-center shadow-[0_20px_60px_rgba(10,22,40,0.08)] sm:px-10 sm:py-10">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold">
            Credential
          </p>
          <Image
            src="/images/vep-vob-logo.png"
            alt="Veteran-Owned Business badge verified by the Texas Veterans Commission"
            width={1124}
            height={1276}
            className="h-auto w-full max-w-[240px] sm:max-w-[300px] lg:max-w-[320px]"
            sizes="(max-width: 640px) 240px, (max-width: 1024px) 300px, 320px"
          />
          <div className="space-y-3">
            <h2 className="text-2xl font-bold tracking-tight text-navy sm:text-3xl">
              Verified Veteran-Owned Business
            </h2>
            <p className="max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
              Hutchrok Solutions is proudly verified by the Texas Veterans
              Commission as a Veteran-Owned Business.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
