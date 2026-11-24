import { clips } from "@/lib/media";
import { milestonePhases } from "@/lib/milestones";
import { MascotVideo } from "../MascotVideo";

export function Journey() {
  return (
    <section
      id="journey"
      aria-labelledby="journey-title"
      className="section-spacing scroll-mt-12"
    >
      <div className="shell">
        <h2 id="journey-title" className="section-heading">
          From idea to demo day
        </h2>
        <p className="section-copy mt-4">
          Eight guided milestones take you from defining the problem to
          presenting a working project.
        </p>

        <div className="mt-7 grid gap-y-8 lg:mt-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:gap-x-media-gap">
          <figure className="mx-auto w-full max-w-xl lg:sticky lg:top-28 lg:self-start">
            <MascotVideo clip={clips.path} threshold={0.15} playThrough />
          </figure>

          <div className="space-y-7">
            {milestonePhases.map(({ title, milestones }) => (
              <div key={title}>
                <h3 className="text-lg font-semibold text-signal">{title}</h3>
                <ol role="list" className="mt-3 grid gap-3 sm:grid-cols-2">
                  {milestones.map(({ title, artifact }) => (
                    <li
                      key={title}
                      className="rounded-xl border border-rule bg-sand/60 px-4 py-3"
                    >
                      <h4 className="text-lg leading-tight font-semibold">{title}</h4>
                      <p className="mt-1 text-base text-muted">{artifact}</p>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
