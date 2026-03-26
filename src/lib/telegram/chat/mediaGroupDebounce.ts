const DEBOUNCE_DELAY_MS = 2_000;

const timers = new Map<string, ReturnType<typeof setTimeout>>();

const scheduleMediaGroupProcessing = (
  groupId: string,
  callback: () => void,
  delayMs = DEBOUNCE_DELAY_MS
): void => {
  const existing = timers.get(groupId);
  if (existing) clearTimeout(existing);
  timers.set(
    groupId,
    setTimeout(() => {
      timers.delete(groupId);
      callback();
    }, delayMs)
  );
};

export default scheduleMediaGroupProcessing;
