import type { BookingRecord, BookingStatus } from "@/features/booking/booking-request";
import { buttonBase, SectionHeading } from "./ui";

const STATUS_LABEL: Record<BookingStatus, { text: string; className: string }> = {
  pending: { text: "To answer", className: "bg-amber-400/15 text-amber-300" },
  confirmed: { text: "Confirmed", className: "bg-emerald-400/15 text-emerald-300" },
  invited: { text: "Invite sent", className: "bg-sky-400/15 text-sky-300" },
  declined: { text: "Declined", className: "bg-white/10 text-white/50" },
};

const slotFormat = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Africa/Tunis",
  weekday: "short",
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

const replyLink = (record: BookingRecord) => {
  const when = `${slotFormat.format(new Date(record.slot))} (Tunis time)`;
  const subject = `Your call on ${when}`;
  const body = `Hi ${record.name},\n\nThanks for booking a call. I'm confirming ${when}.\n\n`;
  return `mailto:${record.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};

function BookingCard({ record }: { record: BookingRecord }) {
  const status = STATUS_LABEL[record.status];
  const action = (name: "confirm" | "decline" | "remove", label: string, className: string) => (
    <button type="submit" name="action" value={name} className={`${buttonBase} ${className}`}>
      {label}
    </button>
  );

  return (
    <li className="glass-card p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-display text-lg font-bold text-white">{record.name}</p>
          <p className="text-sm text-neon-soft">{slotFormat.format(new Date(record.slot))} · Tunis time</p>
        </div>
        <span className={`shrink-0 rounded-full px-3 py-1 font-mono text-xs ${status.className}`}>{status.text}</span>
      </div>
      <p className="mt-3 text-sm text-white/70">
        <a href={`mailto:${record.email}`} className="underline decoration-white/30 hover:decoration-white">
          {record.email}
        </a>
      </p>
      {record.topic && <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-white/60">{record.topic}</p>}
      <form method="post" action="/api/admin/bookings" className="mt-4 flex flex-wrap gap-2">
        <input type="hidden" name="id" value={record.id} />
        <a href={replyLink(record)} className={`${buttonBase} border border-white/15 text-white/70 hover:text-white`}>
          Reply
        </a>
        {record.status === "pending" && action("confirm", "Confirm", "bg-emerald-500 text-black hover:bg-emerald-400")}
        {record.status !== "declined" && action("decline", "Decline", "border border-amber-400/50 text-amber-300 hover:bg-amber-400/10")}
        {action("remove", "Delete", "border border-red-400/50 text-red-300 hover:bg-red-400/10")}
      </form>
    </li>
  );
}

function BookingList({ title, records, empty }: { title: string; records: BookingRecord[]; empty: string }) {
  return (
    <div className="mt-6">
      <SectionHeading title={title} count={records.length} />
      {records.length === 0 ? (
        <p className="text-sm text-white/40">{empty}</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {records.map((record) => (
            <BookingCard key={record.id} record={record} />
          ))}
        </ul>
      )}
    </div>
  );
}

export function BookingsSection({ records }: { records: BookingRecord[] | null }) {
  if (!records) {
    return (
      <section className="mt-12">
        <h2 className="font-display text-xl font-bold text-white">Call requests</h2>
        <p className="mt-4 text-red-300">Could not reach the bookings store. Refresh in a moment.</p>
      </section>
    );
  }

  const now = Date.now();
  const upcoming = records.filter((record) => Date.parse(record.slot) >= now);
  const past = records.filter((record) => Date.parse(record.slot) < now).reverse();

  return (
    <section className="mt-12">
      <h2 className="font-display text-xl font-bold text-white">Call requests</h2>
      <BookingList title="Upcoming" records={upcoming} empty="No call requests yet." />
      {past.length > 0 && <BookingList title="Past" records={past} empty="" />}
      <p className="mt-6 text-xs text-white/30">Declining a request frees its slot for other visitors.</p>
    </section>
  );
}
