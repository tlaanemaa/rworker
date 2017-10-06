const rw = require('./lib');

console.log('\n\nRW:');
console.log(rw)
const R = rw.init('/usr/lib/R/bin/Rscript');
console.log('\n\nR:');
console.log(R)
const a = new R();
console.log('\n\na:');
console.log(a);
