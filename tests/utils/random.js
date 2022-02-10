const randomInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
  };
  
  const randomPick = (arr) => {
    const index = randomInt(0, arr.length - 1);
    return arr[index];
  };
  
  module.exports = { randomInt, randomPick };
  