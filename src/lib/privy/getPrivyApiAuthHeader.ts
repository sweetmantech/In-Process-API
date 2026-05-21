const getPrivyApiAuthHeader = (): string => {
  const credentials = Buffer.from(
    `${process.env.PRIVY_APP_ID!}:${process.env.PRIVY_API_KEY!}`
  ).toString('base64');
  return `Basic ${credentials}`;
};

export default getPrivyApiAuthHeader;
