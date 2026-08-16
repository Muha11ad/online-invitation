"use client";

import { Copy } from "lucide-react";
import { useSyncExternalStore } from "react";
import { toast } from "sonner";

import { copyToClipboard } from "@/shared/lib/clipboard";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";

import type { WeddingFormMode } from "../lib/formState";

// The slug is a client-minted UUID, immutable for the invitation's lifetime,
// so this field has nothing to validate or preview — it only surfaces the
// shareable URL and a way to copy it.
export function SlugField({ mode, slug }: SlugFieldProps): React.JSX.Element {
  // window.location.origin does not exist on the server, so it is read
  // through useSyncExternalStore: the server snapshot ("") matches the first
  // client render, and the real origin only appears once React has hydrated.
  const origin = useSyncExternalStore(subscribeToNothing, getOrigin, getServerOrigin);

  const link = origin ? `${origin}/event/${slug}` : "";

  return (
    <section className="flex flex-col gap-1.5">
      <Label htmlFor="slug">Invitation link</Label>
      <div className="flex items-center gap-2">
        <Input id="slug" className="h-8 flex-1" value={link} readOnly />
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-8"
          aria-label="Copy invitation link"
          onClick={() => void handleCopy(link)}
        >
          <Copy />
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">{getHint(mode)}</p>
    </section>
  );
}

// The origin never changes during the page's lifetime, so there is nothing
// to subscribe to — only the snapshot getters differ between server and
// client.
function subscribeToNothing(): () => void {
  return () => {};
}

function getOrigin(): string {
  return window.location.origin;
}

function getServerOrigin(): string {
  return "";
}

async function handleCopy(link: string): Promise<void> {
  const copied = await copyToClipboard(link);
  if (copied) {
    toast.success("Link copied");
  } else {
    toast.error("Couldn't copy the link");
  }
}

function getHint(mode: WeddingFormMode): string {
  if (mode === "create") {
    return "This link goes live once you create the invitation.";
  }

  return "Share this link with guests.";
}

interface SlugFieldProps {
  mode: WeddingFormMode;
  slug: string;
}
