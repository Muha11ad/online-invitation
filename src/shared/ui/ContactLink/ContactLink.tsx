import Image from "next/image";

import { cn } from "@/shared/lib/utils";

// TODO: replace with the actual Telegram handle
const TELEGRAM_URL = "https://t.me/";

export function ContactLink(params: ContactLinkParams): React.JSX.Element {
  const { className } = params;

  return (
    <a
      href={TELEGRAM_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contact via Telegram"
      className={cn(
        "inline-flex items-center gap-[2px] opacity-80 transition-opacity duration-200 hover:opacity-100",
        className,
      )}
    >
      <span className="font-sans text-[11px] font-medium tracking-[0.02em] whitespace-nowrap underline underline-offset-[3px]">
        made with care
      </span>
      <Image
        src="/images/telegram_logo.png"
        alt=""
        width={1280}
        height={1280}
        sizes="20px"
        className="h-5 w-5 object-contain"
      />
    </a>
  );
}

interface ContactLinkParams {
  className?: string;
}
