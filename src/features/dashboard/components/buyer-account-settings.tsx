"use client";

import { useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, House, MapPin, X } from "lucide-react";
import { toast } from "sonner";
import { FadeIn } from "@/components/motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useAuthStore } from "@/store/auth.store";

const notifications = Array.from({ length: 6 }, (_, index) => ({
  id: index + 1,
  message:
    "Please confirm your email address by clicking on the link we just emailed you. If you cannot find the email, you can request a new confirmation email or change your email address.",
  date: "March 1, 2026",
}));

function splitName(fullName: string) {
  const parts = fullName.trim().split(/\s+/);
  return { firstName: parts[0] ?? "", lastName: parts.slice(1).join(" ") };
}

export function BuyerAccountSettings() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab =
    searchParams.get("tab") === "notifications" ? "notifications" : "profile";
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const names = splitName(user?.fullName ?? "");
  const [firstName, setFirstName] = useState(names.firstName);
  const [lastName, setLastName] = useState(names.lastName);
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [location, setLocation] = useState(user?.location ?? "");
  const [bio, setBio] = useState("");
  const [investorType, setInvestorType] = useState("professional");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? "");
  const [visibleNotifications, setVisibleNotifications] =
    useState(notifications);
  const fileInput = useRef<HTMLInputElement>(null);
  const initials =
    `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || "PA";

  function choosePhoto(file?: File) {
    if (!file) return;
    if (file.size > 800 * 1024)
      return toast.error("The photo must be smaller than 800KB.");
    if (!file.type.startsWith("image/"))
      return toast.error("Please choose a JPG, GIF, or PNG image.");
    const reader = new FileReader();
    reader.onload = () => setAvatarUrl(String(reader.result));
    reader.readAsDataURL(file);
  }

  function saveProfile() {
    updateUser({
      fullName: `${firstName} ${lastName}`.trim(),
      phone,
      location,
      avatarUrl: avatarUrl || null,
    });
    toast.success("Profile changes saved on this device.", {
      description:
        "A backend profile-update endpoint is still required to save these changes to the database.",
    });
  }

  return (
    <div className="w-full pb-12">
      <FadeIn>
        <header>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Account Settings
          </h1>
          <p className="mt-1 text-sm text-muted-foreground md:text-base">
            Manage your personal information, security, and preferences.
          </p>
        </header>
      </FadeIn>

      <Tabs
        value={activeTab}
        onValueChange={(value) =>
          router.replace(
            value === "notifications"
              ? "/buyer/settings?tab=notifications"
              : "/buyer/settings",
            { scroll: false },
          )
        }
        className="mt-7 flex-col gap-8"
      >
        <TabsList
          variant="line"
          className="h-12 w-full justify-start gap-7 border-b p-0"
        >
          <TabsTrigger
            value="profile"
            className="h-12 flex-none rounded-none px-0 text-base after:bg-primary"
          >
            Profile
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="h-12 flex-none rounded-none px-0 text-base after:bg-primary"
          >
            Notifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="w-full">
          <div className="flex w-full flex-col gap-8">
            <FadeIn>
              <Card className="py-6 shadow-sm">
                <CardContent className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
                  <Avatar className="size-24 rounded-2xl" size="lg">
                    {avatarUrl && (
                      <AvatarImage
                        src={avatarUrl}
                        alt={`${firstName} ${lastName}`}
                        className="rounded-2xl"
                      />
                    )}
                    <AvatarFallback className="rounded-2xl bg-foreground text-xl font-semibold text-background">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap gap-4">
                      <Button
                        className="min-w-36"
                        onClick={() => fileInput.current?.click()}
                      >
                        Change Photo
                      </Button>
                      <Button
                        variant="outline"
                        className="min-w-28"
                        onClick={() => setAvatarUrl("")}
                      >
                        Remove
                      </Button>
                      <input
                        ref={fileInput}
                        type="file"
                        accept="image/png,image/jpeg,image/gif"
                        className="hidden"
                        onChange={(event) =>
                          choosePhoto(event.target.files?.[0])
                        }
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      JPG, GIF or PNG. Max size of 800K.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </FadeIn>

            <FadeIn>
              <Card className="py-6 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-2xl">
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <FieldGroup className="gap-7">
                    <div className="grid gap-7 md:grid-cols-2">
                      <Field>
                        <FieldLabel htmlFor="firstName">First Name</FieldLabel>
                        <Input
                          id="firstName"
                          className="h-11 bg-surface/50"
                          value={firstName}
                          onChange={(event) => setFirstName(event.target.value)}
                        />
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="lastName">Last Name</FieldLabel>
                        <Input
                          id="lastName"
                          className="h-11 bg-surface/50"
                          value={lastName}
                          onChange={(event) => setLastName(event.target.value)}
                        />
                      </Field>
                      <Field data-disabled>
                        <FieldLabel htmlFor="email">Email Address</FieldLabel>
                        <InputGroup className="h-11 bg-surface/50">
                          <InputGroupInput
                            id="email"
                            value={user?.email ?? ""}
                            disabled
                          />
                          <InputGroupAddon align="inline-end">
                            <Badge variant="secondary">
                              <CheckCircle2 data-icon="inline-start" />
                              Verified
                            </Badge>
                          </InputGroupAddon>
                        </InputGroup>
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="phone">Phone Number</FieldLabel>
                        <Input
                          id="phone"
                          className="h-11 bg-surface/50"
                          value={phone}
                          onChange={(event) => setPhone(event.target.value)}
                          placeholder="+234"
                        />
                      </Field>
                    </div>
                    <Field>
                      <FieldLabel htmlFor="bio">Bio</FieldLabel>
                      <Textarea
                        id="bio"
                        className="min-h-28 bg-surface/50"
                        value={bio}
                        onChange={(event) => setBio(event.target.value)}
                        placeholder="Tell us about yourself and your investment goals."
                      />
                      <FieldDescription>
                        Tell us a little bit about yourself and your investment
                        goals.
                      </FieldDescription>
                    </Field>
                  </FieldGroup>
                </CardContent>
              </Card>
            </FadeIn>

            <FadeIn>
              <Card className="py-6 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-2xl">
                    Professional Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <FieldGroup>
                    <div className="grid gap-7 md:grid-cols-2">
                      <Field>
                        <FieldLabel>Investor Type</FieldLabel>
                        <Select
                          value={investorType}
                          onValueChange={setInvestorType}
                        >
                          <SelectTrigger className="h-11 w-full bg-surface/50">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectItem value="professional">
                                Professional Investor
                              </SelectItem>
                              <SelectItem value="individual">
                                Individual Investor
                              </SelectItem>
                              <SelectItem value="first-time">
                                First-time Buyer
                              </SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="location">
                          Primary Location
                        </FieldLabel>
                        <InputGroup className="h-11 bg-surface/50">
                          <InputGroupAddon>
                            <MapPin />
                          </InputGroupAddon>
                          <InputGroupInput
                            id="location"
                            value={location}
                            onChange={(event) =>
                              setLocation(event.target.value)
                            }
                            placeholder="FHA, Lugbe Abuja"
                          />
                        </InputGroup>
                      </Field>
                    </div>
                  </FieldGroup>
                </CardContent>
              </Card>
            </FadeIn>

            <div className="flex justify-end gap-4">
              <Button
                variant="ghost"
                onClick={() => {
                  setFirstName(names.firstName);
                  setLastName(names.lastName);
                  setPhone(user?.phone ?? "");
                  setLocation(user?.location ?? "");
                  setAvatarUrl(user?.avatarUrl ?? "");
                }}
              >
                Cancel
              </Button>
              <Button size="lg" className="min-w-40" onClick={saveProfile}>
                Save Changes
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="w-full">
          <AnimatePresence initial={false}>
            <div className="flex w-full max-w-2xl flex-col gap-8 pt-6">
              {visibleNotifications.map((notification, index) => (
                <motion.article
                  key={notification.id}
                  exit={{ opacity: 0, x: 30, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="flex w-full items-start gap-3 sm:gap-4"
                >
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-muted">
                    <House className="size-6 fill-secondary text-secondary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className={
                        index === 0
                          ? "font-semibold leading-snug"
                          : "leading-snug text-muted-foreground"
                      }
                    >
                      {notification.message}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {notification.date}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Dismiss notification"
                    onClick={() =>
                      setVisibleNotifications((items) =>
                        items.filter((item) => item.id !== notification.id),
                      )
                    }
                  >
                    <X />
                  </Button>
                </motion.article>
              ))}
            </div>
          </AnimatePresence>
        </TabsContent>
      </Tabs>
    </div>
  );
}
