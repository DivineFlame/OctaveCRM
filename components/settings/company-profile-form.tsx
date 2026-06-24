"use client";

import { useState, type FormEvent } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";

type Props = {
  initialProfile: {
    companyProfile: string;
    websiteUrl: string;
    websiteReference: string;
  };
};

export function CompanyProfileForm({ initialProfile }: Props) {
  const [status, setStatus] = useState<string>();
  const [saving, setSaving] = useState(false);

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setStatus(undefined);
    const form = new FormData(event.currentTarget);

    const response = await fetch("/api/company-profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyProfile: form.get("companyProfile"),
        websiteUrl: form.get("websiteUrl"),
        websiteReference: form.get("websiteReference")
      })
    });
    const result = await response.json();
    setStatus(response.ok ? "AI source saved." : result.error ?? "Unable to save AI source.");
    setSaving(false);
  }

  return (
    <form className="grid gap-3" onSubmit={saveProfile}>
      <Textarea
        name="companyProfile"
        defaultValue={initialProfile.companyProfile}
        placeholder="Company profile, products, services, audience, positioning, and verified claims"
        required
      />
      <Input
        name="websiteUrl"
        type="url"
        defaultValue={initialProfile.websiteUrl}
        placeholder="https://company.example"
        required
      />
      <Textarea
        name="websiteReference"
        defaultValue={initialProfile.websiteReference}
        placeholder="Verified website content and facts the AI may reference"
        required
      />
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={saving}>
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save AI source"}
        </Button>
        {status ? <p className="text-sm text-muted-foreground" aria-live="polite">{status}</p> : null}
      </div>
      <p className="text-xs text-muted-foreground">
        Lead, campaign, email, and content agents are restricted to this profile and website reference. Client campaigns use the client profile instead.
      </p>
    </form>
  );
}
