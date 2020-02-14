export default class LifeCycle {

    constructor() {
        this.lifecycle = {
            tweens: [],
            paused: false,
            tick: 0,
            timer: {
                current : 0,
                last: performance.now(),
            }
        }
    }

    mount(scene) {
        throw Error("Abstract")
    }

    render() {
        throw Error("Abstract")
    }

    pause() {
        this.lifecycle.paused = true;
    }

    unpause() {
        this.lifecycle.paused = false
    }

    animate() {
        clearTimeout(this.lifecycle._timeouut);
        this.lifecycle._timeouut = setTimeout(() => {
            requestAnimationFrame( () => this.animate() );
        }, 1000 / 30 );

        const timer = this.lifecycle.timer;
        const t = performance.now();
        if (this.lifecycle.paused) {
            timer.last = t;
        } else {
            timer.current += t - timer.last;
            timer.last = t;
            this.lifecycle.tick++;
            this.lifecycle.tweens.forEach(fn => fn(timer.current, this.lifecycle.tick))
            this.render();
        }
    }

    onAnimate(fn) {
        this.lifecycle.tweens.push(fn);
    }

    stopAnimation() {
        clearTimeout(this.lifecycle._timeout);
    }
}