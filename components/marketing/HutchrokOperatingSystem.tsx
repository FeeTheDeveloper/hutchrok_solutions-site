"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { OS_STAGES } from "./osManifest";

/**
 * "The Hutchrok Operating System" — scroll-driven motion feature.
 *
 * A sticky video stage on the right swaps through the eight 3D brand clips while
 * the service copy scrolls past on the left. Each clip is the animated form of its
 * own still render, so the poster and the first video frame are identical and the
 * swap never flashes.
 *
 * Behaviour notes that matter in review:
 *  - Clips are silent by design. They carry ambient audio only and are rendered
 *    muted, so this never autoplays sound at a visitor.
 *  - Under prefers-reduced-motion the videos are not mounted at all; the stills
 *    carry the section. That is a real fallback, not a paused video.
 *  - Only the active clip plays. The rest stay paused to keep decode cost flat
 *    whether there are eight stages or twenty.
 */
export default function HutchrokOperatingSystem() {
  const [active, setActive] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(true); // assume reduced until proven otherwise
  const stageRefs = useRef<(HTMLElement | null)[]>([]);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReducedMotion(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    const nodes = stageRefs.current.filter(Boolean) as HTMLElement[];
    if (!nodes.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        // Pick the entry closest to the middle of the viewport rather than the
        // first intersecting one, so fast scrolling lands on the right stage.
        const visible = entries.filter((e) => e.isIntersecting);
        if (!visible.length) return;
        const best = visible.reduce((a, b) =>
          b.intersectionRatio > a.intersectionRatio ? b : a,
        );
        const idx = nodes.indexOf(best.target as HTMLElement);
        if (idx !== -1) setActive(idx);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] },
    );

    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (reducedMotion) return;
    videoRefs.current.forEach((v, i) => {
      if (!v) return;
      if (i === active) {
        v.currentTime = 0;
        void v.play().catch(() => {
          /* autoplay refused; poster still shows the correct frame */
        });
      } else {
        v.pause();
      }
    });
  }, [active, reducedMotion]);

  const setStageRef = useCallback(
    (i: number) => (el: HTMLElement | null) => {
      stageRefs.current[i] = el;
    },
    [],
  );

  return (
    <section
      aria-labelledby="hutchrok-os-title"
      className="relative bg-[#F7F7F7] py-24 text-[#132E58]"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#BA922D]">
            Veteran-focused business enablement
          </p>
          <h2
            id="hutchrok-os-title"
            className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl"
          >
            The Hutchrok Operating System
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-slate-600">
            Eight stages that take a company from filed to contract-ready. Start
            any service with us and, if you served, your veteran filing is
            covered.
          </p>
        </header>

        <div className="mt-20 lg:grid lg:grid-cols-12 lg:gap-16">
          {/* Sticky motion stage */}
          <div className="hidden lg:col-span-6 lg:block">
            <div className="sticky top-24">
              <div className="relative aspect-video overflow-hidden rounded-2xl bg-[#F2EDE2] shadow-[0_24px_70px_-30px_rgba(19,46,88,0.45)]">
                {OS_STAGES.map((s, i) =>
                  reducedMotion ? (
                    <img
                      key={s.id}
                      src={s.poster}
                      alt=""
                      aria-hidden="true"
                      className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
                        i === active ? "opacity-100" : "opacity-0"
                      }`}
                    />
                  ) : (
                    <video
                      key={s.id}
                      ref={(el) => {
                        videoRefs.current[i] = el;
                      }}
                      src={s.video}
                      poster={s.poster}
                      muted
                      playsInline
                      loop
                      preload={i === 0 ? "auto" : "metadata"}
                      aria-hidden="true"
                      tabIndex={-1}
                      className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
                        i === active ? "opacity-100" : "opacity-0"
                      }`}
                    />
                  ),
                )}
              </div>

              {/* Stage progress */}
              <ol className="mt-6 flex gap-2" aria-hidden="true">
                {OS_STAGES.map((s, i) => (
                  <li
                    key={s.id}
                    className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                      i === active ? "bg-[#BA922D]" : "bg-[#132E58]/15"
                    }`}
                  />
                ))}
              </ol>
            </div>
          </div>

          {/* Scrolling copy */}
          <div className="lg:col-span-6">
            <ol className="space-y-16 lg:space-y-40">
              {OS_STAGES.map((s, i) => (
                <li key={s.id}>
                  <article
                    ref={setStageRef(i)}
                    aria-current={i === active ? "step" : undefined}
                  >
                    {/* Mobile carries its own inline media; the sticky stage is desktop-only. */}
                    <div className="mb-6 overflow-hidden rounded-xl bg-[#F2EDE2] lg:hidden">
                      <img
                        src={s.poster}
                        alt=""
                        aria-hidden="true"
                        loading="lazy"
                        className="aspect-video w-full object-cover"
                      />
                    </div>

                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#BA922D]">
                      {String(i + 1).padStart(2, "0")} · {s.stage}
                    </p>
                    <h3 className="mt-3 text-2xl font-bold sm:text-3xl">
                      {s.heading}
                    </h3>
                    <p className="mt-4 text-lg leading-relaxed text-slate-600">
                      {s.body}
                    </p>
                    <a
                      href={s.href}
                      className="mt-6 inline-flex items-center gap-2 font-semibold text-[#132E58] underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#BA922D]"
                    >
                      {s.heading}
                      <span aria-hidden="true">&rarr;</span>
                    </a>
                  </article>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
