export default Vue.component('badge', {
    template: `<canvas width="64" height="64"></canvas>`,
    props: ['info'],
    render() {
        //from https://manu.ninja/webgl-three-js-annotations
        const canvas = this.$el;
        const ctx = canvas.getContext('2d');
        const x = 32;
        const y = 32;
        const radius = 30;
        const startAngle = 0;
        const endAngle = Math.PI * 2;

        ctx.fillStyle = 'rgb(0, 0, 0)';
        ctx.beginPath();
        ctx.arc(x, y, radius, startAngle, endAngle);
        ctx.fill();

        ctx.strokeStyle = 'rgb(255, 255, 255)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x, y, radius, startAngle, endAngle);
        ctx.stroke();

        ctx.fillStyle = 'rgb(255, 255, 255)';
        ctx.font = '32px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(info, x, y);
}})
