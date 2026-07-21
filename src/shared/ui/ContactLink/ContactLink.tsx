import Image from "next/image";

// TODO: replace with the actual Telegram handle
const TELEGRAM_URL = "https://t.me/";

export function ContactLink(): React.JSX.Element {
  return (
    <a
      href={TELEGRAM_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contact via Telegram"
      className="fixed bottom-7 left-7 z-[150] flex items-center gap-[6px] rounded-full bg-white/90 py-[6px] pr-3 pl-[6px] text-ink shadow-md backdrop-blur-sm transition-colors duration-200 hover:bg-white"
    >
      <Image
        src="/images/telegram_logo.png"
        alt=""
        width={1280}
        height={1280}
        sizes="20px"
        className="h-5 w-5 object-contain"
      />
      <span className="font-sans text-[11px] font-medium tracking-[0.02em] whitespace-nowrap">
        made with care
      </span>
    </a>
  );
}
