import Scene from "./scene.js";
import model from "./model3d.js"
const THREE = window.THREE;

const R = 1.3; //box radius
const D = 1.5; //box distance
const planeSize = 512;
const textureSize = 4096;
const textureRepeats = 17;

export default class Stage extends Scene {
    constructor(domParent) {
        super(domParent)
        this.layout = [];
        this.subscribers = [];
        this.model = model
    }


    mount() {
        const scene = this.scene;
        this.createFloor(scene)
        this.createLights(scene)

        //animation cycle tweens
        this.onAnimate(this.animateCamera())
        this.onAnimate(this.animateMouse())
    }

    createFloor(scene) {
        this.createGroundMirror(scene)
        this.createFloorBase(scene)
    }

    createGroundMirror(scene) {
        const geometry = new THREE.PlaneBufferGeometry(20, 20);
        const groundMirror = new THREE.Reflector(geometry, {
            clipBias: 0.003,
            textureWidth: this.width * window.devicePixelRatio,
            textureHeight: this.height * window.devicePixelRatio,
            color: 0x777777
        });
        groundMirror.rotateX(-Math.PI / 2);
        groundMirror.position.y = -1.5;
        groundMirror.receiveShadow = false;
        scene.add(groundMirror);
    }

    createFloorBase(scene) {
        const textureOffset = Math.floor(textureRepeats/2);
        //overlay plane
        const texture = new THREE.DynamicTexture(textureSize, textureSize)
        this.titleTexture = texture
        texture.texture.anisotropy = this.renderer.capabilities.getMaxAnisotropy()
        texture.texture.repeat.set(textureRepeats, textureRepeats)
        texture.texture.offset.set(-textureOffset, -textureOffset)

        this.repaintTitles(textureSize, planeSize, textureRepeats)
        this.updateDescriptions = () => this.repaintTitles(textureSize, planeSize, textureRepeats)
        // this.onAnimate((timer, tick) => {
        //     if (tick % 11 === 0) {
        //         model.health = tick/10;
        //         this.repaintTitles(textureSize, planeSize, textureRepeats)
        //     }
        // })

        let material = new THREE.MeshBasicMaterial({
            map	: texture.texture,
            opacity: 1.0,
            transparent: true
        })

        let plane = new THREE.Mesh( new THREE.PlaneGeometry( planeSize, planeSize ), material )
        plane.rotation.x = - Math.PI / 2.0
        plane.position.y = -1.49
        scene.add(plane);
    }

    repaintTitles(textureSize, mirrorSize, textureRepeats) {
        //TODO wire up
        console.log("Redrawing texture")
        const texture = this.titleTexture
        texture.clear()
        texture.clear('#ffffffc0')
        //
        const Rw = 1.3; //cube radius
        const Dw = 1.5; //cube distance
        const R = Rw * textureSize / mirrorSize * textureRepeats
        const D = Dw * textureSize / mirrorSize * textureRepeats
        let NLayers = this.layout.length
        texture.context.font = "bold 32px Helvetica"
        for (let i = 0; i < NLayers; i++) {
            let row = this.layout[i];
            let NBoxes = row.length;
            for (let j = 0; j < NBoxes; j++) {
                const name = row[j].name.replace("el-","");
                const w = texture.context.measureText(name).width
                //console.log("W:",i,j,name,w)
                const x = -NLayers * (R + D) / 2 + (R + D) * i + (R + D) / 2 - w/2.0;
                const y = -NBoxes * (R + D) / 2 + (R + D) * j + (R + D) / 2 + R * 1.3 / 2;
                texture.drawText(name, textureSize / 2 + x, textureSize / 2 + y, '#308094')
                // if (name.includes("Redis")) {
                //     texture.drawText('Health: '+model.health+'%', textureSize / 2 + x, textureSize / 2 + y + 24,
                //         '#555555', '18px monospace')
                // }
            }
        }
    }

    createLights(scene) {
        let light = new THREE.PointLight( 0xaaffaa, 0.8 );
        light.position.set( -70, -70, 70 );
        light.castShadow = true;
        scene.add( light );

        let light2 = new THREE.SpotLight( 0xffffff, 0.8 );
        light2.position.set(-5, 20, 50);
        scene.add( light2 );

        let light3 = new THREE.PointLight( 0xffaaaa, 0.8 );
        light3.position.set(70,-70,70);
        scene.add( light3 );

        let light4 = new THREE.AmbientLight( 0xffffff, 0.05 );
        scene.add( light4 );
    }

    createCubes(scene) {
        let NLayers = this.model.nodes.length;
        for (let i=0; i < NLayers; i++) {
            let layer = this.model.nodes[i];
            let NBoxes = layer.length;
            for (let j=0; j < NBoxes; j++) {
                this.createBox(j, i, NLayers, NBoxes, layer, scene)
            }
        }
    }

    adjustRow(i, NBoxes) {
        if (i < this.layout.length && NBoxes !== this.layout[i].length) {
            //remove extras
            while (NBoxes < this.layout[i].length) {
                this.scene.remove(this.layout[i].pop());
            }
            //rcalculate remaining
            this.layout[i].forEach((box, j) => {
                box.position.z = (-NBoxes * (R + D)) / 2 + (R + D) * j + (R + D) / 2;
            });
            this.updateDescriptions();
        }
    }

    ensureLayout(i, NBoxes) {
        const scene = this.scene;
        if (this.layout.length <= i) {
            this.layout.push([]);
        }
        while (this.layout[i].length > NBoxes) {
            scene.remove(this.layout[i].pop());
        }
    }

    createElementMaterial() {
        let bMaterial = new THREE.MeshStandardMaterial();
        bMaterial.roughness = 0.3;
        bMaterial.metalness = 0.1;
        bMaterial.color.setHSL(0.0, 0.0, 0.3);
        return bMaterial;
    }

    positionLayoutElement(el, j, i, NBoxes, NLayers) {
        //in WebGL, positive X to the right, Y to the top, Z to the back
        el.position.x = (-NLayers * (R + D)) / 2 + (R + D) * i + (R + D) / 2;
        el.position.y = -1.0;
        el.position.z = (-NBoxes * (R + D)) / 2 + (R + D) * j + (R + D) / 2;
        if (i === 0 && j === 0) {
            this.labelObject = el;
        }
    }

    renderBox(j, i, NBoxes, NLayers, name, size = R) {
        const scene = this.scene;
        this.ensureLayout(i, NBoxes);
        const bMaterial = this.createElementMaterial();

        //let box = new THREE.Mesh(new THREE.BoxGeometry(R, R / 2, size), bMaterial);
        let box = new THREE.Mesh(new RoundedBoxGeometry(R, R / 2, R, .1, 5), bMaterial);
        box.name = "el-" + name;
        this.positionLayoutElement(box, j, i, NBoxes, NLayers);
        box.castShadow = true;

        this.layout[i].push(box);
        scene.add(box);
        this.updateDescriptions();
    }

    renderCylinder(j, i, NBoxes, NLayers, name, size = R) {
        const scene = this.scene;
        this.ensureLayout(i, NBoxes);

        let bMaterial = this.createElementMaterial();
        let group = new THREE.Group();

        let cyl1 = new THREE.Mesh(
            new THREE.CylinderGeometry(size / 2, R / 2, R /5, 32),
            bMaterial
        );
        this.positionLayoutElement(cyl1, j, i, NBoxes, NLayers);
        cyl1.position.y -= R/4;
        cyl1.name="el-"+name;

        let cyl2 = new THREE.Mesh(
            new THREE.CylinderGeometry(size / 2, R / 2, R / 5, 32),
            bMaterial
        );
        this.positionLayoutElement(cyl2, j, i, NBoxes, NLayers);
        cyl2.name="el-"+name;

        group.add(cyl1);
        group.add(cyl2);
        group.material = bMaterial;
        group.name = "el-" + name;
        group.castShadow = true;

        this.layout[i].push(group);
        scene.add(group);
        this.updateDescriptions();
    }

// --- events ---



    onCanvasClick(event) {
        event.preventDefault();
        //todo unwind abstraction
        const annotation = document.querySelector('.annotation');
        if (this.selectedObject)  {
            this.onShowAnnotation(this.selectedObject, annotation)
        } else {
            const clicked = annotation.classList.contains('visible');
            if (clicked) {
                annotation.classList.remove('visible');
            }
        }
    }

    onShowAnnotation(mesh, annotation) {
        if (!mesh) return;

        const vector = this.toScreenPosition(mesh, this.camera)

        if (!annotation.classList.contains('visible')) {
            annotation.classList.add('visible');
            //annotation.style.opacity = '0.95'; //spriteBehindObject ? '0.5' : '1';
        }
        annotation.style.top = `${vector.y + 10}px`;
        annotation.style.left = `${vector.x + 20}px`;
        annotation.querySelector('h5').innerText = mesh.name.replace('el-','');
        annotation.querySelector('.info3d').innerText =
            `${mesh.position.x.toFixed(2)}, ${mesh.position.y.toFixed(2)}, ${mesh.position.z.toFixed(2)}`;
    }


}