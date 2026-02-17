import privyClient from '@/lib/privy/client';

interface GetAllEmailsResult {
  emails: { address: string; email: string }[];
  next_cursor: string | null;
}

const getAllEmails = async (
  cursor?: string,
  limit?: number
): Promise<GetAllEmailsResult> => {
  const page = await privyClient.users().list({ cursor, limit });

  const emails: { address: string; email: string }[] = [];
  for (const user of page.getPaginatedItems()) {
    const walletAccount = user.linked_accounts.find(
      (account) => account.type === 'wallet'
    );
    const emailAccount = user.linked_accounts.find(
      (account) => account.type === 'email'
    );

    if (
      walletAccount &&
      walletAccount.type === 'wallet' &&
      emailAccount &&
      emailAccount.type === 'email'
    ) {
      emails.push({
        address: walletAccount.address,
        email: emailAccount.address,
      });
    }
  }

  const next_cursor = page.hasNextPage() ? page.next_cursor : null;

  return { emails, next_cursor };
};

export default getAllEmails;
