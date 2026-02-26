const getSafeImageContentType = (headers: Headers): string => {
  const rawType = headers.get('content-type')?.split(';')[0].trim();
  return /^image\/[a-z0-9.+-]+$/i.test(rawType ?? '') ? rawType! : 'image/jpeg';
};

export default getSafeImageContentType;
