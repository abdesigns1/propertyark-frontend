import { AboutNavbar } from "@/components/about/about-navbar";
import { BackgroundVideo } from "@/components/shared/background-video";

const ABOUT_VIDEO_URL =
  "https://res.cloudinary.com/wkwqmkrl/video/upload/v1791141626/PropertyArk_Full_Film_Titled_v04.mp4";

const ABOUT_VIDEO_POSTER =
  "https://res.cloudinary.com/wkwqmkrl/video/upload/so_0,f_jpg,q_auto/v1791141626/PropertyArk_Full_Film_Titled_v04.jpg";

export function AboutHero() {
  return (
    <section className="w-full overflow-hidden bg-background">
      <AboutNavbar />

      <div className="relative aspect-video w-full overflow-hidden bg-navbar lg:aspect-auto lg:h-[60svh]">
        <BackgroundVideo
          src={ABOUT_VIDEO_URL}
          poster={ABOUT_VIDEO_POSTER}
        />
      </div>

      <div className="bg-background">
        <div className="mx-auto max-w-7xl px-6 py-7 sm:py-9 lg:px-8">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            About Us
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Discover the story, vision, and people behind PropertyArk—building
            trust, connecting opportunities, and making real estate simpler
            across Nigeria and beyond.
          </p>
        </div>
      </div>
    </section>
  );
}
