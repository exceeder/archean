import THREE from "../../js3d/index.js"
import model from "./model3d.js"
return;
//todo needs large cleanup and refactoring

//--- scene settings ---
//particles
let tick = 0;
const options = {
    position: new THREE.Vector3(),
    positionRandomness: 0.01,
    velocity: new THREE.Vector3(),
    velocityRandomness: .2,
    color: 0x77ffff,
    colorRandomness: .9,
    turbulence: .001,
    lifetime: 0.9,
    size: 0.01,
    sizeRandomness: 0.3
};

const spawnerOptions = {
    spawnRate: 500,
    horizontalSpeed: 2.2,
    verticalSpeed: 0.01,
    timeScale: 1.0
};

let width, height;
let clock = new THREE.Clock();
let camera, scene, renderer, cameraTarget;
let particleSystem;
let composer, renderPass;
let group, labelObject, mouse = {x:0, y:0};
let sprite, spriteBehindObject, mesh;
let labelPos = {x:0, y:0}, oldPos = {x:1000, y:1000};
let clicked = false;

export default class Scene3d {
    constructor(domParent) {
        cameraTarget = new THREE.Vector3(0.0, 0.0, 1.5);
        this.domParent = domParent;
        if (this.domParent === null) {
            throw new Error("Invalid parent selector: "+domParent);
        }
        this.init(this.domParent);
        this.timer1 = -1;
        this.animate();
    }

    get model() {
        return model;
    }

    init(dCanvas) {
        width = dCanvas.offsetWidth || 1 ;
        height = dCanvas.offsetHeight || 1;
        let devicePixelRatio = window.devicePixelRatio || 1;

        renderer = new THREE.WebGLRenderer({antialias: true, precision: "highp", logarithmicDepthBuffer: false});
        renderer.setSize(width, height);
        //renderer.physicallyCorrectLights = true;
        renderer.sortObjects = false;
        renderer.setClearColor(0xa0a0a0, 0.5);
        renderer.setPixelRatio(devicePixelRatio);
        this.domParent.appendChild(renderer.domElement);

        camera = new THREE.PerspectiveCamera(45, width / height, 2, 32);
        camera.position.x = 0;
        camera.position.y = 10;
        camera.position.z = 0;
        camera.lookAt(cameraTarget);

        scene = new THREE.Scene();

        group = new THREE.Object3D();
        group.position.y = 1.5;
        if (!model.spheres) {
            group.position.z = -100;
        }
        scene.add( group );

        //texture
        this.createDynamicTexture(scene);

        //mirror
        this.createGroundMirror(scene);

        // cubes
        this.createCubes(scene);
        //this.createCenter(scene);

        //particles
        particleSystem = new THREE.GPUParticleSystem( {
            maxParticles: 2500
        } );
        scene.add( particleSystem );

        //lights
        this.createLights(scene);
        //spheres
        this.createSpheres(group);

        composer = new THREE.EffectComposer(renderer);

        renderPass = new THREE.RenderPass(scene, camera);
        composer.addPass(renderPass);

        //this.createSprite();

        //resize and mouse to show details
        window.addEventListener( 'resize', () => this.onWindowResize(), false );
        this.domParent.addEventListener('mousemove', (e) => this.onCanvasMouseMove(e));
        this.domParent.addEventListener('mousedown', (e) => this.onCanvasClick(e));
        //react on model changes
        this.model.on('added', (data) => {
            //todo add cubes to scene, we might need to adjust the row
        });
        this.model.on('removed',(data) => {
            const obj = scene.getObjectByName("cube-"+data.node);
            obj && scene.remove(obj);
        });
        this.model.on('parallax', () => this.onWindowResize());

    }

    createDynamicTexture(scene) {

    }

    createGroundMirror(scene) {

        let geometry = new THREE.PlaneBufferGeometry( 10, 10 );
        let groundMirror = new THREE.Reflector( geometry, {
            clipBias: 0.003,
            textureWidth: width * window.devicePixelRatio,
            textureHeight: height * window.devicePixelRatio,
            color: 0x777777
        } );
        groundMirror.rotateX( - Math.PI / 2 );
        groundMirror.position.y=-1.5;
        groundMirror.receiveShadow = false; //true;
        scene.add(groundMirror);

        //overlay plane
        let dynamicTexture	= new THREE.DynamicTexture(4096, 4096)
        dynamicTexture.context.font	= "bold 24px Helvetica";
        //dynamicTexture.texture.wrapS = THREE.RepeatWrapping;
        //dynamicTexture.texture.wrapT = THREE.RepeatWrapping;
        dynamicTexture.texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
        dynamicTexture.texture.repeat.set(21, 21);
        dynamicTexture.texture.offset.set(-10.0, -10.0);
        // update the text
        dynamicTexture.clear('#ffffffc0')
            .drawText('AppWeb', null, 2048+80, '#039be5')
            .drawText('AppHello', null, 2048-175, '#039be5')
            .drawText('Monitor', null, 2048+320, '#039be5')
            .drawText('Gateway', 2048 - 300, 2048+80, '#039be5')
            .drawText('Redis', 2048 + 200, 2048+80, '#039be5')
            .drawText('Health: 97%', 2048 + 200, 2048+100, '#555555', '12px monospace')
        let material	= new THREE.MeshBasicMaterial({
            map	: dynamicTexture.texture,
            opacity: 1.0,
            transparent: true
        })
        // material = new THREE.MeshBasicMaterial( { color: 0xffffff, opacity: 0.8, transparent: true } )
        let plane = new THREE.Mesh( new THREE.PlaneGeometry( 1000, 1000 ), material );
        plane.rotation.x = - Math.PI / 2.0;
        plane.position.y = -1.49;
        scene.add(plane);
    }

    createBackWall(scene) {
        // plane in the back
        let geometry = new THREE.PlaneGeometry( 40.0, 10.0 );
        let material = new THREE.MeshLambertMaterial( { color: 0xffffff, transparent: false, opacity: 0.3 } );
        material.flatShading = true;
        let mesh = new THREE.Mesh( geometry, material );
        mesh.position.y = 4.5;
        mesh.position.z = -5.99;
        scene.add( mesh );
    }

    createCubes(scene) {
        let NLayers = this.model.nodes.length;
        for (let i=0; i < NLayers; i++) {
            let layer = this.model.nodes[i];
            let NBoxes = layer.length;
            for (let j=0; j < NBoxes; j++) {
                this.createBox(j, i, NBoxes, NLayers, layer[j], scene)
            }
        }
    }

    createBox(u, v, uSize, vSize,  name, scene) {
        const R = 1.3;
        const D = 1.5;
        let bMaterial = new THREE.MeshStandardMaterial();
        bMaterial.roughness = 0.2;
        bMaterial.metalness = 0.3;
        bMaterial.color.setHSL(0.0, 0.0, 0.3);

        let box = new THREE.Mesh(new RoundedBoxGeometry(R, R / 2, R, .15, 3), bMaterial);
        box.name = "cube-" + name;
        box.position.x = -vSize * (R + D) / 2 + (R + D) * v + (R + D) / 2;
        box.position.y = -1.0;
        box.position.z = -uSize * (R + D) / 2 + (R + D) * u + (R + D) / 2;
        box.castShadow = true;
        if (v === 0 && u === 0) {
            labelObject = box;
        }
        scene.add(box);
        // let sprite = this.makeTextSprite(name);
        // sprite.position.x = box.position.x;
        // sprite.position.z = box.position.z;
        // sprite.position.y = 0.3;
        // scene.add(sprite);
        return box;
    }

    makeTextSprite(message, opts = {}) {
        let fontface = opts.fontface || 'sans-serif';
        let fontsize = opts.fontsize || 90;
        let canvas = document.createElement('canvas');
        let context = canvas.getContext('2d');
        //console.log(canvas.width)
        //console.log(canvas.height)
        canvas.width = 600;
        canvas.height = 300;
        context.font = fontsize + "px " + fontface;

        // get size data (height depends only on font size)
        let metrics = context.measureText(message);
        let textWidth = metrics.width;


        // text color
        context.fillStyle = 'rgba(255, 255, 255, 1.0)';
        context.fillText(message, 0, fontsize);

        // canvas contents will be used for a texture
        let texture = new THREE.Texture(canvas)
        texture.minFilter = THREE.LinearFilter;
        texture.needsUpdate = true;

        let spriteMaterial = new THREE.SpriteMaterial({
            map: texture,
            useScreenCoordinates: false
        });
        let sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(1, 0.5, 1.0);
        return sprite;
    }

    createLights(scene) {
        let light = new THREE.PointLight( 0xddffdd, 0.8 );
        light.position.set( -70, -70, 70 );
        light.castShadow = true;
        scene.add( light );

        let light2 = new THREE.PointLight( 0xddddff, 0.8 );
        light2.position.set(-70, 50, 90);
        scene.add( light2 );

        let light3 = new THREE.PointLight( 0xffdddd, 0.8 );
        light3.position.set(70,-70,70);
        scene.add( light3 );

        let light4 = new THREE.AmbientLight( 0xffffff, 0.05 );
        scene.add( light4 );
    }


    createPlane(w, h, position, rotation) {
        let material = new THREE.MeshBasicMaterial({
            color: 0x000000,
            opacity: 0.0,
            side: THREE.DoubleSide
        });
        let geometry = new THREE.PlaneGeometry(w, h);
        let mesh = new THREE.Mesh(geometry, material);
        mesh.position.x = position.x;
        mesh.position.y = position.y;
        mesh.position.z = position.z;
        mesh.rotation.x = rotation.x;
        mesh.rotation.y = rotation.y;
        mesh.rotation.z = rotation.z;
        return mesh;
    }

    createCenter(scene) {
        let geometry = new THREE.SphereBufferGeometry( 0.25, 16, 16 );
        let material = new THREE.MeshStandardMaterial();
        material.roughness = 0.5 * Math.random() + 0.25;
        material.metalness = 0;
        material.color.setRGB( 0.3, 0.5, 0.7 );
        mesh = new THREE.Mesh( geometry, material );
        mesh.position.x = mesh.position.z = 0.0;
        mesh.position.y = 0.0;
        scene.add( mesh );
    }

    createSpheres(group) {
        let geometry = new THREE.SphereBufferGeometry( 3, 48, 24 );
        for ( let i = 0; i < 5; i ++ ) {

            let material = new THREE.MeshStandardMaterial();
            material.roughness = 0.5 * Math.random() + 0.25;
            material.metalness = 0;
            material.color.setHSL( 0.0, 0.0, 0.3 );

            let mesh = new THREE.Mesh( geometry, material );
            mesh.position.x = Math.random() * 3 - 1.5;
            mesh.position.y = Math.random() * 3 - 1.5 ;
            mesh.position.z = Math.random() * 3 - 1.5;
            mesh.rotation.x = Math.random();
            mesh.rotation.y = Math.random();
            mesh.rotation.z = Math.random();

            mesh.scale.x = mesh.scale.y = mesh.scale.z = Math.random() * 0.2 + 0.05;
            group.add( mesh );
        }
    }

    createSprite() {
        const numberTexture = new THREE.CanvasTexture(
            document.querySelector("#number")
        );

        const spriteMaterial = new THREE.SpriteMaterial({
            map: numberTexture,
            alphaTest: 0.5,
            transparent: true,
            depthTest: false,
            depthWrite: false
        });

        sprite = new THREE.Sprite(spriteMaterial);
        sprite.position.set(-2.25, 0, 0);
        sprite.scale.set(.3, .3, .3);

        scene.add(sprite);
    }

    // --- utils -----

    toScreenPosition(obj, camera)
    {
        let vector = new THREE.Vector3();

        // TODO: need to update this when resize window
        const canvas = renderer.domElement;
        let widthHalf = 0.5 * canvas.offsetWidth;
        let heightHalf = 0.5* canvas.offsetHeight;

        obj.updateMatrixWorld();
        vector.setFromMatrixPosition(obj.matrixWorld);
        vector.project(camera);

        vector.x = ( vector.x * widthHalf ) + widthHalf + canvas.offsetLeft;
        vector.y = - ( vector.y * heightHalf ) + heightHalf + canvas.offsetTop;

        return {
            x: vector.x,
            y: vector.y
        };

    }


    //----- dynamic part -------
    onWindowResize() {
        let width = document.body.clientWidth || 1;
        let height = this.domParent.offsetHeight || 1;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        camera.position.x = - window.pageYOffset / 500.;
        camera.position.y = 11 + window.pageYOffset / 1000.;
        camera.lookAt(new THREE.Vector3());
        renderer.setSize( width, height );
        composer.setSize( width, height );
        //this.cssRenderer.setSize( width, height )
        this.animate();
    }

    onCanvasMouseMove(event) {
        // the following line would stop any other event handler from firing
        // (such as the mouse's TrackballControls)
        // event.preventDefault();

        mouse.x = (event.offsetX / this.domParent.offsetWidth) * 2 - 1;
        mouse.y = - (event.offsetY / this.domParent.offsetHeight) * 2 + 1;
    }

    onCanvasClick(event) {
        event.preventDefault();
        if (clicked) {
            document.querySelector('.annotation').style.display = 'none';
            clicked = false;
        } else {
            if (this.selectedObject) clicked = true;
        }
    }

    intersects() {
        if (mouse.x === 0 && mouse.y === 0) return;
        let vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
        vector.unproject(camera);
        let ray = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());

        // create an array containing all objects in the scene with which the ray intersects
        let intersects = ray.intersectObjects(scene.children, true);
        let found = false;
        if (intersects.length > 1) {
            found = intersects.find(x => x.object && x.object.name.startsWith("cube-"));
            const labelObject = found && found.object;
            if (labelObject && labelObject !== this.selectedObject) {
                if (this.selectedObject) {
                    this.selectedObject.material.color.setRGB( 0.3, 0.3, 0.3 );
                }
                this.selectedObject = labelObject;
                labelObject.material.color.setRGB( 0.3, 0.5, 0.7 );


                this.updateCirclePosition(labelObject);
            }
            /*let l3d = $('#label3d');
            if (labelObject.name === "") {
                l3d.css('visibility','hidden');
            } else {
                l3d.css('visibility','visible');
                l3d.find('.object-name').text(labelObject.name);
                labelPos = this.toScreenPosition(labelObject, camera);
                if (Math.abs(labelPos.x - oldPos.x)>3 || Math.abs(labelPos.y-oldPos.y)>3) {
                    oldPos = labelPos;
                    let dc = $(this.domParent);
                    let off = {x:labelPos.x - l3d.width() / 2, y: labelPos.y + dc.offset().top - l3d.height()/2};
                    //console.log(off);
                    l3d.offset({left: off.x, top: off.y});
                }
            }*/
        }
        if (!found && this.selectedObject)  {
            this.selectedObject.material.color.setRGB( 0.3, 0.3, 0.3 );
            this.selectedObject = null;
        }
    }

    updateCirclePosition(mesh) {
        if (!mesh) return;
        const annotation = document.querySelector('.annotation');
        if (!clicked) {
            annotation.style.display = 'nome';
            return;
        }
        const vector = this.toScreenPosition(mesh, camera)

        if (annotation.style.display === 'none') {
            annotation.style.display = 'block';
            annotation.style.opacity = '0.95'; //spriteBehindObject ? '0.5' : '1';
        }
        annotation.style.top = `${vector.y + 10}px`;
        annotation.style.left = `${vector.x + 20}px`;
        annotation.querySelector('h5').innerText = mesh.name.replace('cube-','');
        annotation.querySelector('.info3d').innerText =
            `${mesh.position.x.toFixed(2)}, ${mesh.position.y.toFixed(2)}, ${mesh.position.z.toFixed(2)}`;
    }

    updateAnnotationOpacity() {
        // const meshDistance = camera.position.distanceTo(mesh.position);
        // const spriteDistance = camera.position.distanceTo(sprite.position);
        // spriteBehindObject = spriteDistance > meshDistance;
        // sprite.material.opacity = spriteBehindObject ? 0.5 : 1;

        // Do you want a number that changes size according to its position?
        // Comment out the following line and the `::before` pseudo-element.
        //sprite.material.opacity = 0;
    }

    ways(tick, timer) {
        //position along 3 ways
        const N = 3;
        const w = Math.floor(timer) % N;
        const Z = -3.0 + w * 3.0;
        const ret = new THREE.Vector3()
        ret.x = - 1.5; //Math.sin(tick * spawnerOptions.horizontalSpeed * 2) * 2.5;
        if (Math.random() < 0.5 && w < 2) {
            options.velocity.z = Math.random() * 5.0 + 1.0
            options.velocity.x = 0.0
        } else {
            options.velocity.z = 0.0
            options.velocity.x = Math.random() * 5.0 + 1.0
        }
        //options.position.y = Math.sin( tick * spawnerOptions.verticalSpeed ) * 2.0+1.0;
        ret.y = -1.0;
        //options.position.z = Math.sin( tick * spawnerOptions.horizontalSpeed + spawnerOptions.verticalSpeed ) * 1.2;
        //options.position.z = Math.round(Math.random()) * 4.0 - 2.0;
        //options.position.z = Math.sin( tick * spawnerOptions.horizontalSpeed + spawnerOptions.verticalSpeed ) * 1.2;
        ret.z = Z;
        return ret;
    }

    render() {
        this.updateAnnotationOpacity();
        this.updateCirclePosition(this.selectedObject);
        if (this.model.spheres) {
            group.position.z = 0;
        } else {
            group.position.z = -100;
        }
        let timer = performance.now();
        if (!clicked) {

            group.rotation.x = timer * 0.0002;
            group.rotation.y = timer * 0.0001;

            camera.position.x = cameraTarget.x + 7 * Math.cos(Math.PI / 2 + Math.sin(timer * 0.0001));
            camera.position.z = cameraTarget.z + 2 + 7 * Math.sin(Math.PI / 2 + Math.sin(timer * 0.0001));
            camera.position.y = 8 + 0.5 * Math.sin(timer * 0.0001); // + timer*0.0001;
            camera.lookAt(cameraTarget);
        }
        //if (Math.floor(timer) % 10 === 0) {
            this.intersects();
       //}
        //controls.update();
        if (this.model.particles) {
            //particle system
            let delta = clock.getDelta() * spawnerOptions.timeScale;
            tick += delta;
            if (tick < 0) tick = 0;
            if (delta > 0) {
                options.position.copy(this.ways(tick, timer))

                for (let x = 0; x < spawnerOptions.spawnRate * delta; x++) {
                    // Yep, that's really it.	Spawning particles is super cheap, and once you spawn them, the rest of
                    // their lifecycle is handled entirely on the GPU, driven by a time uniform updated below
                    particleSystem.spawnParticle(options);
                }
            }
            particleSystem.update(tick);
        }

        composer.render();
        //this.cssRenderer.render(this.cssScene, camera);
    }

    animate() {
        clearTimeout(this.timer1);
        this.timer1 = setTimeout(() => {
            requestAnimationFrame( () => this.animate() );
        }, 1000 / 30 );
        //if (this.model.pageState === "page1") {
            //this.stats.begin();
            this.render();
            //this.stats.end();
        //}
    }

}

