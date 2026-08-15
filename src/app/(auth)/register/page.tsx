import { AuthImagePanel } from "@/components/shared/auth-image-panel";
import { AuthMobileBrand } from "@/components/shared/auth-mobile-brand";
import { RegisterForm } from "@/features/authentication/components/register-form";

export default function RegisterPage() {
  const slides = [
    {
      imageSrc:
        "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1200",
      imageAlt: "Miniature house model held in cupped hands over grass",
      heading: "Buy, Sale & Invest in",
      highlight: "Verified",
      headingEnd: "Properties",
    },
    {
      imageSrc:
        "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?q=80&w=1200",
      imageAlt: "Modern luxury house with a pool",
      heading: "Find Your Next",
      highlight: "Dream",
      headingEnd: "Home",
    },
    {
      imageSrc:
        "https://images.unsplash.com/photo-1460317442991-0ec209397118?q=80&w=1200",
      imageAlt: "Bright living room with large windows",
      heading: "Manage Every Step of",
      highlight: "Your",
      headingEnd: "Journey",
    },
  ];

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <AuthImagePanel slides={slides} />
      <div className="flex items-center justify-center px-6 py-8 sm:px-12 sm:py-12">
        <div className="w-full max-w-md">
          <AuthMobileBrand />
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
