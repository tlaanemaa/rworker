const rw = require('./lib').default; // TODO: Fix this!!!

console.log(rw)
const R = rw('/usr/lib/R/bin/Rscript');
console.log(R)
const a = new R();
console.log(a);
