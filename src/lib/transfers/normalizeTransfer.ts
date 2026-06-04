import normalizeTransferMoment from './normalizeTransferMoment';

export default function normalizeTransfer(raw: any): any {
  const { recipient, collector, moment: momentField, ...rest } = raw;
  return {
    ...rest,
    collector: {
      address: recipient ?? null,
      username: collector?.artist?.username ?? null,
    },
    moment: momentField ? normalizeTransferMoment(momentField) : momentField,
  };
}
