"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ILLUSTRATIONS, type IllustrationKey } from "@/lib/illustrations";

/**
 * Deterministic mote field — gold particles that drift up through the frame so
 * the illustration itself reads as alive, not just the card holding it.
 * Fixed values (no Math.random) keep server and client markup identical.
 */
const MOTES = [
  { left: "12%", dur: "9.5s", delay: "0s", dx: "18px", dy: "-240px", size: 5 },
  { left: "31%", dur: "13s", delay: "1.8s", dx: "-14px", dy: "-300px", size: 4 },
  { left: "54%", dur: "11s", delay: "3.4s", dx: "10px", dy: "-270px", size: 6 },
  { left: "72%", dur: "15s", delay: "0.9s", dx: "-20px", dy: "-320px", size: 4 },
  { left: "88%", dur: "10.5s", delay: "5.1s", dx: "12px", dy: "-250px", size: 5 },
] as const;

/** Max pointer-parallax rotation per axis, in degrees. */
const TILT_DEG = 5;

/**
 * A 3D illustration with motion: an entrance, pointer parallax tilt, a
 * per-asset idle float, an in-frame pan, a periodic gold sheen sweep, a
 * pointer-tracked specular highlight, and drifting gold motes.
 *
 * Three nested transform layers keep the maths untangled — reveal, tilt,
 * float — and every continuous animation is switched off under
 * `prefers-reduced-motion`.
 *
 * `priority` illustrations are above the fold, so their entrance runs from
 * CSS on load rather than waiting for hydration + IntersectionObserver —
 * that keeps the hero image out of the LCP critical path. Everything below
 * the fold reveals on scroll instead.
 */
export function MotionIllustration({
  name,
  priority = false,
  className = "",
  sizes = "(min-width: 1024px) 560px, (min-width: 640px) 448px, 100vw",
}: {
  name: IllustrationKey;
  priority?: boolean;
  className?: string;
  sizes?: string;
}) {
  const img = ILLUSTRATIONS[name];
  const rootRef = useRef<HTMLDivElement>(null);
  const tiltRaf = useRef(0);
  const [visible, setVisible] = useState(priority);
  const [interactive, setInteractive] = useState(false);

  // Reveal once the illustration is genuinely on screen (below-fold only).
  useEffect(() => {
    if (priority) return;

    const el = rootRef.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [priority]);

  // Pointer tilt is for mice on motion-friendly machines only.
  useEffect(() => {
    const motionOk = !window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches;
    const finePointer = window.matchMedia(
      "(hover: hover) and (pointer: fine)",
    ).matches;
    setInteractive(motionOk && finePointer);
  }, []);

  useEffect(() => () => cancelAnimationFrame(tiltRaf.current), []);

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!interactive) return;
      const el = rootRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const nx = (event.clientX - rect.left) / rect.width - 0.5;
      const ny = (event.clientY - rect.top) / rect.height - 0.5;

      cancelAnimationFrame(tiltRaf.current);
      tiltRaf.current = requestAnimationFrame(() => {
        el.style.setProperty(
          "--hk-tilt-y",
          `${(nx * TILT_DEG * 2).toFixed(2)}deg`,
        );
        el.style.setProperty(
          "--hk-tilt-x",
          `${(-ny * TILT_DEG * 2).toFixed(2)}deg`,
        );
        el.style.setProperty("--hk-px", `${(50 + nx * 60).toFixed(1)}%`);
        el.style.setProperty("--hk-py", `${(45 + ny * 55).toFixed(1)}%`);
      });
    },
    [interactive],
  );

  const handlePointerLeave = useCallback(() => {
    const el = rootRef.current;
    if (!el) return;
    cancelAnimationFrame(tiltRaf.current);
    for (const prop of ["--hk-tilt-x", "--hk-tilt-y", "--hk-px", "--hk-py"]) {
      el.style.removeProperty(prop);
    }
  }, []);

  return (
    <div
      ref={rootRef}
      data-visible={visible}
      data-motion={img.motion}
      data-entrance={priority ? "load" : "scroll"}
      className={`hk-motion ${className}`}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <div className="hk-motion-glow" aria-hidden="true" />

      <div className="hk-motion-reveal">
        <div className="hk-motion-stage">
          <div className="hk-motion-drift">
            <div className="hk-motion-frame">
              <Image
                src={img.src}
                width={img.width}
                height={img.height}
                alt={img.alt}
                priority={priority}
                sizes={sizes}
                className="hk-motion-art h-auto w-full"
              />
              <span className="hk-motion-spec" aria-hidden="true" />
              <span className="hk-motion-sheen" aria-hidden="true" />
              <span className="hk-motion-vignette" aria-hidden="true" />
              <span className="hk-motion-motes" aria-hidden="true">
                {MOTES.map((mote) => (
                  <span
                    key={mote.left}
                    className="hk-motion-mote"
                    style={
                      {
                        left: mote.left,
                        width: mote.size,
                        height: mote.size,
                        "--hk-mote-dur": mote.dur,
                        "--hk-mote-delay": mote.delay,
                        "--hk-mote-dx": mote.dx,
                        "--hk-mote-dy": mote.dy,
                      } as React.CSSProperties
                    }
                  />
                ))}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
