/* countdown-tweaks.jsx — Countdown timer + Tweaks panel for wedding invitation */

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "targetDate": "02-08-2026",
  "style": "serif"
}/*EDITMODE-END*/;

/* Parse DD-MM-YYYY into a Date object (ceremony at 15:00) */
function parseDate(ddmmyyyy) {
  const parts = (ddmmyyyy || "").split("-");
  if (parts.length !== 3) return null;
  const [dd, mm, yyyy] = parts;
  const d = new Date(`${yyyy}-${mm}-${dd}T15:00:00`);
  return isNaN(d.getTime()) ? null : d;
}

function getTimeLeft(ddmmyyyy) {
  const target = parseDate(ddmmyyyy);
  if (!target) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: false, invalid: true };

  const diff = target - new Date();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };

  const days    = Math.floor(diff / 864e5);
  const hours   = Math.floor((diff % 864e5) / 36e5);
  const minutes = Math.floor((diff % 36e5)  / 6e4);
  const seconds = Math.floor((diff % 6e4)   / 1e3);
  return { days, hours, minutes, seconds, expired: false, invalid: false };
}

function pad(n) { return String(n).padStart(2, "0"); }

function CountdownApp() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [time, setTime] = React.useState(() => getTimeLeft(t.targetDate));

  /* Tick every second */
  React.useEffect(() => {
    const id = setInterval(() => setTime(getTimeLeft(t.targetDate)), 1000);
    return () => clearInterval(id);
  }, [t.targetDate]);

  /* Recompute immediately on date change */
  React.useEffect(() => { setTime(getTimeLeft(t.targetDate)); }, [t.targetDate]);

  const units = [
    { value: pad(time.days),    label: "Days"  },
    { value: pad(time.hours),   label: "Hours" },
    { value: pad(time.minutes), label: "Min"   },
    { value: pad(time.seconds), label: "Sec"   },
  ];

  return (
    <>
      {/* ── Countdown display ── */}
      <div className="countdown-wrap">
        <div className="countdown-rule" aria-hidden="true"></div>

        {time.invalid ? (
          <p className="countdown-expired" style={{ color: "var(--label)", fontStyle: "normal", fontSize: "0.7rem", letterSpacing: "0.1em" }}>
            Enter a valid date (DD-MM-YYYY)
          </p>
        ) : time.expired ? (
          <p className="countdown-expired">Today is the day ♡</p>
        ) : (
          <div className={`countdown countdown--${t.style}`}
               role="timer" aria-live="off" aria-label="Time until the wedding">
            {units.map((u, i) => (
              <React.Fragment key={u.label}>
                <div className="countdown-unit">
                  <span className="countdown-value">{u.value}</span>
                  <span className="countdown-label">{u.label}</span>
                </div>
                {i < units.length - 1 && (
                  <span className="countdown-dot" aria-hidden="true">·</span>
                )}
              </React.Fragment>
            ))}
          </div>
        )}
      </div>

      {/* ── Tweaks panel ── */}
      <TweaksPanel>
        <TweakSection label="Countdown" />

        <TweakRow label="Date (DD-MM-YYYY)">
          <input
            type="text"
            className="tweak-date-input"
            value={t.targetDate}
            placeholder="DD-MM-YYYY"
            maxLength={10}
            onChange={(e) => setTweak("targetDate", e.target.value)}
          />
        </TweakRow>

        <TweakRadio
          label="Number style"
          value={t.style}
          options={["serif", "sans"]}
          onChange={(v) => setTweak("style", v)}
        />
      </TweaksPanel>
    </>
  );
}

ReactDOM.createRoot(document.getElementById("countdown-root")).render(<CountdownApp />);
