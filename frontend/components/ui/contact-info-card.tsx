import { Mail, Phone, UserRound } from "lucide-react";

interface ContactInfoCardProps {
  name?: string | null;
  phone?: string | null;
  email?: string | null;
  title?: string;
}

export function ContactInfoCard({
  name,
  phone,
  email,
  title = "Contact Information",
}: ContactInfoCardProps) {
  const hasContact = Boolean(name || phone || email);

  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <h2 className="font-semibold text-foreground">{title}</h2>

      {!hasContact ? (
        <p className="mt-4 text-sm text-muted-foreground">
          No contact information available.
        </p>
      ) : (
        <div className="mt-4 space-y-4">
          {name && (
            <div className="flex items-center gap-3">
              <UserRound
                size={18}
                className="shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
              <span className="break-words text-sm text-foreground">
                {name}
              </span>
            </div>
          )}

          {phone && (
            <div className="flex items-center gap-3">
              <Phone
                size={18}
                className="shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
              <a
                href={`tel:${phone}`}
                className="break-all text-sm text-foreground hover:text-primary"
              >
                {phone}
              </a>
            </div>
          )}

          {email && (
            <div className="flex items-center gap-3">
              <Mail
                size={18}
                className="shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
              <a
                href={`mailto:${email}`}
                className="break-all text-sm text-foreground hover:text-primary"
              >
                {email}
              </a>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
