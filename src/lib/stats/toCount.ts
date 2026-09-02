const toCount = (value: number | string | null | undefined) =>
  Number(value ?? 0);

export default toCount;
