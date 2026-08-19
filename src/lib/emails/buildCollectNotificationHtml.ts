import escapeHtml from '@/lib/escapeHtml';

export default function buildCollectNotificationHtml({
  textCollector,
  momentName,
  collectUrl,
}: {
  textCollector: string;
  momentName: string;
  collectUrl: string;
}): string {
  return `
    <p>Hi,</p>
    <p><b>${escapeHtml(textCollector)}</b> collected your moment <b>${escapeHtml(
      momentName
    )}</b>.</p>
    <p><a href="${escapeHtml(collectUrl)}">View on In Process</a></p>
  `;
}
