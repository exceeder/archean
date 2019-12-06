const { merge, fromEvent, interval, range } = require('rxjs');
const { take, map, filter } = require('rxjs/operators');

const source1 = range(1, 10).pipe(
    filter(x => x % 2 === 1),
    map(x => 'a'+x)
)
const source2 = interval(10).pipe(
    map(x => 'b' + x),
    take(20)
)
const timer = interval(100).pipe(map(x => 't'+x), take(3));
const merged = merge(source1, source2, timer);

merged.subscribe(x => console.log(x));
