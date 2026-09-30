// Order status is never stored. It is worked out from placed_at every time you ask.
// Demo timings: placed -> preparing after 1 min -> out for delivery after 3 -> delivered after 6.

const STEPS = [
  { key: "placed", label: "Order placed", note: "The restaurant has your order.", afterMinutes: 0 },
  { key: "preparing", label: "Preparing your food", note: "The kitchen is cooking it now.", afterMinutes: 1 },
  { key: "on_the_way", label: "Out for delivery", note: "Your rider is on the way.", afterMinutes: 3 },
  { key: "delivered", label: "Delivered", note: "Enjoy your meal!", afterMinutes: 6 },
];

export function orderStatus(placedAt: string | Date) {
  const minutes = (Date.now() - new Date(placedAt).getTime()) / 60000;
  let current = 0;
  STEPS.forEach((s, i) => {
    if (minutes >= s.afterMinutes) current = i;
  });
  const step = STEPS[current];
  const delivered = step.key === "delivered";
  const arriving = Math.max(1, Math.ceil(6 - minutes));
  return {
    key: step.key,
    label: step.label,
    note: delivered ? step.note : `${step.note} Arriving in about ${arriving} min.`,
    delivered,
    steps: STEPS.map((s, i) => ({ key: s.key, label: s.label, done: i <= current, current: i === current })),
  };
}
