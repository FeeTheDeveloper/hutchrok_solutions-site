import Image from "next/image";
import { ILLUSTRATIONS, type IllustrationKey } from "@/lib/illustrations";

/** Framed 3D illustration sized for the right column of a navy page hero. */
export function HeroIllustration({
  name,
  priority = false,
  className = "",
}: {
  name: IllustrationKey;
  priority?: boolean;
  className?: string;
}) {
  const img = ILLUSTRATIONS[name];
  return (
    <div
      className={`overflow-hidden rounded-3xl bg-cream ring-1 ring-gold/25 shadow-2xl shadow-black/40 ${className}`}
    >
      <Image
        src={img.src}
        width={img.width}
        height={img.height}
        alt={img.alt}
        priority={priority}
        sizes="(min-width: 1024px) 560px, (min-width: 640px) 448px, 100vw"
        className="h-auto w-full"
      />
    </div>
  );
}

/**
 * Two-column hero body: copy on the left, illustration on the right (lg+).
 * Below lg the copy stays centered and the illustration stacks underneath.
 */
export function IllustratedHero({
  name,
  priority = false,
  children,
}: {
  name: IllustrationKey;
  priority?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
      <div className="text-center lg:text-left">{children}</div>
      <HeroIllustration
        name={name}
        priority={priority}
        className="mx-auto w-full max-w-md lg:max-w-none"
      />
    </div>
  );
}
