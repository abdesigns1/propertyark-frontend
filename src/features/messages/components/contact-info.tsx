import { SocialLinks } from "@/components/shared/social-links";

export function ContactInfo() {
  return (
    <div>
      <span className="inline-block rounded-full bg-secondary px-5 py-2 text-sm font-semibold text-secondary-foreground">
        Contact Info
      </span>

      <h2 className="mt-5 text-2xl font-semibold leading-tight text-foreground sm:text-3xl lg:text-6xl">
        We are always happy to assist you
      </h2>

      <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2">
        <div>
          <p className="text-sm font-semibold text-foreground">Email Address</p>
          <div className="mt-2 h-0.5 w-8 bg-secondary" />
          <a
            href="mailto:propertyark26@gmail.com"
            className="mt-3 inline-block text-sm font-medium text-foreground hover:text-primary"
          >
            propertyark26@gmail.com
          </a>
          <p className="mt-3 text-sm text-muted-foreground">
            Response hours:
            <br />
            Monday - Friday 6 am to 8 pm EST
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Phone Number</p>
          <div className="mt-2 h-0.5 w-8 bg-secondary" />
          <p className="mt-3 text-sm font-medium text-foreground">
            (808) 998-34256
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            Assistance hours:
            <br />
            Monday - Friday 9 am to 5 pm EST
          </p>
        </div>
      </div>

      <div className="mt-8">
        <SocialLinks variant="circle" />
      </div>
    </div>
  );
}
