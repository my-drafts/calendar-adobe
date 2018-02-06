
console.log([1, 2, 3].filter((el, id, ar) => console.log([el, id, ar]) || id%2));
console.log([1, 2, 3].map((el, id, ar) => [el, id, ar]));
console.log([1, 2, 3].reduce((prev, el, id, ar) => [prev[0].concat([prev, el, id, ar]), prev[1] + el], [[], 0]));
console.log([1, 2, 3].reduce((prev, el, id, ar) => console.log([prev, el, id, ar]) || prev + el, 0));
console.log([1, 2, 3].reduce((prev, el, id, ar) => console.log([prev, el, id, ar]) || prev + el));
console.log([1, 2, 3].reduce((prev, el, id, ar) => prev + el, 0));
console.log([1, 2, 3].reduce((prev, el, id, ar) => prev + el));
console.log([1, 2].concat(3, [4, 5], [[6, 7], 8]));
console.log([1, 2, 3, 4].size(7, 7));



