import { type IllustrationKey } from "@/lib/illustrations";
import { MotionIllustration } from "@/components/motion-illustration";

/**
 * Framed 3D illustration sized for the right column of a navy page hero.
 * The frame, lighting, and all motion live in MotionIllustration so every
 * hero on the site animates the same way without page-level changes.
 */
export function HeroIllustration({
  name,
  priority = false,
  className = "",
}: {
  name: IllustrationKey;
  priority?: boolean;
  className?: string;
}) {
  return (
    <MotionIllustration name={name} priority={priority} className={className} />
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
