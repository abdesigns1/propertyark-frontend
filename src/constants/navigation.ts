export interface NavLink {
  label: string;
  href: string;
}

export const MAIN_NAV_LINKS: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "All Properties", href: "/properties" },
  { label: "For Sale", href: "/properties?purpose=sale" },
  { label: "For Rent", href: "/properties?purpose=rent" },
  { label: "Shortlet", href: "/shortlets" },
];

export const PROFESSIONALS_LINKS: NavLink[] = [
  {
    label: "Accountant",
    href: "/professional-services?service=accountant",
  },
  { label: "Legal", href: "/professional-services?service=legal" },
  {
    label: "Mortgage Broker",
    href: "/professional-services?service=mortgage-broker",
  },
  { label: "Insurance", href: "/professional-services?service=insurance" },
];

export const CONTACT_LINK: NavLink = { label: "Contact", href: "/contact" };
