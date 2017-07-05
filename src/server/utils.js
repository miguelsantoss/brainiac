// eslint-disable-next-line import/prefer-default-export
export const pdfIdGenerator = () => {
  const S4 = () => (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1); // eslint-disable-line no-bitwise, max-len
  // return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
  return `p${S4()}${S4()}${S4()}${S4()}`;
};
