import fs from 'fs';

export const pdfIdGenerator = () => {
  const S4 = () =>
    (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1); // eslint-disable-line no-bitwise, max-len
  // return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
  return `p${S4()}${S4()}${S4()}${S4()}`;
};

export const readAsync = filename =>
  new Promise((resolve, reject) => {
    fs.readFile(filename, 'utf8', (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });

export const promiseReflect = promise =>
  promise
    .then(v => ({ v, status: 'resolved' }))
    .catch(e => ({ e, status: 'rejected' }));
