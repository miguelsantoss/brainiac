export const chunkString = (input, length) => {
  const output = [];
  let curr = length;
  let prev = 0;

  while (input[curr]) {
    if (input[curr] === ' ') {
      output.push(input.substring(prev, curr));
      prev = curr;
      curr += length;
    }
    curr += 1;
  }

  if (output.length === 0) output.push(input);
  return output;
};

export const o = 0;
