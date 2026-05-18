const RESTAURANT_TIMEZONE = process.env.RESTAURANT_TIMEZONE || 'Europe/Stockholm';

const parts = new Intl.DateTimeFormat('en-US', {
  timeZone: RESTAURANT_TIMEZONE,
  weekday: 'long',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false
}).formatToParts(new Date());

const hour = Number(parts.find((part) => part.type === 'hour')?.value || 0);
const minute = Number(parts.find((part) => part.type === 'minute')?.value || 0);

console.log("Hour:", hour);
console.log("Minute:", minute);
console.log("nowMinutes:", hour * 60 + minute);
