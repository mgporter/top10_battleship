import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import battleshipOBJ from './models/battleship.obj';
import carrierGLB from './models/charles_de_gaulle_french_aircraft_carrier.glb';
import patrolBoatGLB from './models/smallwarship.glb';
import submarineGLB from './models/the_project_941__akula__typhoon_submarine.glb';
import destroyerGLB from './models/bengaluru_class_destroyer_d67.glb';
import gridGLB from './models/grid_4_x_4_navigation.glb';
import { Vector3 } from 'three';

// battleship: https://free3d.com/3d-model/wwii-ship-uk-king-george-v-class-battleship-v1--185381.html
// smallwarship: https://sketchfab.com/3d-models/warship-736cca123b3e469996489c8c6d2cd4c0
// submarine: https://sketchfab.com/3d-models/the-project-941-akula-typhoon-submarine-b7aef99dcf9f4252887a02a7afb3b75e
// carrier: https://sketchfab.com/3d-models/low-poly-aircraft-carrier-with-mini-jets-3d5047d68f064cdca0db39354b567241
// destroyer: https://sketchfab.com/3d-models/bengaluru-class-destroyer-d67-27a867360a1645208e689dd0b3538261

// Make sure the rotations, scale, and position of each model is consistent
// Position: X, Depth, Y

const normalizers = {
  // Position is with front at 0,0, with end going to the right
  battleship: {
    rotation: [-1.5708, 0, 0],
    scale: [7.4, 7.4, 7.4],
    position: [-17, -0.12, -23.2],
  },
  carrier: {
    rotation: [0, -1.5708, 0.1],
    scale: [0.0045, 0.0045, 0.0055],
    position: [-14, 0.66, -23.6],
  },
  patrolBoat: {
    rotation: [0, 1.5708, 0],
    scale: [0.08, 0.08, 0.08],
    position: [-22.2, 0.32, -25],
  },
  submarine: {
    rotation: [0, -1.5708, 0],
    scale: [0.55, 0.55, 0.55],
    position: [-19.8, 0, -24.4],
  },
  destroyer: {
    rotation: [0, 3.14159, 0],
    scale: [3, 3, 3],
    position: [-19.2, -0.22, -23.4],
  },
  grid: {
    rotation: [0, 0, 0],
    scale: [5, 5, 5],
    position: [0, 0, 1.9],
  },
};

const ships = {};

export default function Model() {
  const playerBoard = document.getElementById('playerboard');
  let playerBoardRect = playerBoard.getBoundingClientRect();
  const mainElement = document.querySelector('main');
  const mainElementRect = mainElement.getBoundingClientRect();
  const playerCanvas = document.createElement('canvas');
  playerCanvas.id = 'playercanvas';
  let renderer;
  // playerBoard.style.height = '96%';
  // const playerBoardRect = playerBoard.getBoundingClientRect();
  // playerBoard.style.width = `${playerBoardRect.height}px`;

  window.addEventListener('resize', updatePlayerBoardOnResize);

  function updatePlayerBoardOnResize() {
    // Set perspective distance
    const dpr = window.devicePixelRatio;
    mainElement.style.perspective = `${(800 * 1) / dpr}px`;
    renderer.setPixelRatio(dpr);

    playerCanvas.style.top = `${58 / dpr}px`;

    // Set canvas and renderer dimensions
    playerBoardRect = playerBoard.getBoundingClientRect();
    const playerBoardWidth = playerBoardRect.left * 2 + playerBoardRect.width;
    renderer.setSize(playerBoardWidth, window.innerHeight);
    playerCanvas.style.width = `${playerBoardWidth}px`;
    playerCanvas.style.height = `${window.innerHeight}px`;
  }

  const OBJloader = new OBJLoader();
  const GLTFloader = new GLTFLoader();

  function renderTest() {
    const scene = new THREE.Scene();
    // scene.background = new THREE.Color(0xff0000);
    let playerBoardWidth = playerBoardRect.left * 2 + playerBoardRect.width;
    const camera = new THREE.PerspectiveCamera(
      63,
      playerBoardWidth / window.innerHeight,
      0.1,
      1000
    );
    renderer = new THREE.WebGLRenderer({
      canvas: playerCanvas,
      alpha: true,
    });
    updatePlayerBoardOnResize();

    // renderer.setSize(1200, 1200);
    document.body.appendChild(renderer.domElement);
    const playerCanvasRect = playerCanvas.getBoundingClientRect();
    // const canvasWidthOffset =
    //   (playerCanvasRect.width - playerBoardRect.width) / 2;
    // playerCanvas.style.left = `${playerBoardRect.left - canvasWidthOffset}px`;

    const tempCubePositions = [
      [0, 0, 1.9],
      [-12.9, 1, -11],
      [12.9, 1, -11],
      [-12.9, 1, 14.8],
      [12.9, 1, 14.8],
    ];
    // for (let i = 0; i < 5; i++) {
    //   const geometry = new THREE.BoxGeometry(6, 6, 6);
    //   const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    //   const cube = new THREE.Mesh(geometry, material);
    //   cube.position.set(
    //     tempCubePositions[i][0],
    //     tempCubePositions[i][1],
    //     tempCubePositions[i][2]
    //   );
    //   scene.add(cube);
    // }

    const light = new THREE.AmbientLight(0x404040, 1);
    const spotLight = new THREE.DirectionalLight(0xffffff, 3);
    scene.add(light);
    scene.add(spotLight);

    // to angle camera, decrease rotation x (to -23 deg), then increase position z (to 30)
    // camera position for top down view
    // camera.position.set(0, 20, 1.9);
    // camera.rotation.set(-1.5708, 0, 0);

    // Camera position for side view
    // camera.position.set(0, 15, 19);  // old settings
    // camera.rotation.set(-0.65, 0, 0);  // old settings
    camera.position.set(0, 32.4, 48);
    camera.rotation.set(-0.610865, 0, 0);
    ships['camera'] = camera;

    function loadModel(modelFile, name, type) {
      if (type === 'obj') {
        OBJloader.load(modelFile, (obj) => {
          initializeModelOnLoad(obj, name);
        });
      } else if (type === 'glb') {
        GLTFloader.load(modelFile, (gltf) => {
          initializeModelOnLoad(gltf.scene, name);
        });
      }
    }

    function initializeModelOnLoad(model, name) {
      model.name = name;
      const normalizer = normalizers[name];
      model.scale.set(
        normalizer.scale[0],
        normalizer.scale[1],
        normalizer.scale[2]
      );
      model.rotation.set(
        normalizer.rotation[0],
        normalizer.rotation[1],
        normalizer.rotation[2]
      );
      model.position.set(
        normalizer.position[0],
        normalizer.position[1],
        normalizer.position[2]
      );
      ships[name] = model;
      scene.add(model);
    }
    // X cordinate flips the boat up and down
    // Y coordinate rotates it forward and back
    // Z coordinate changes its direction
    // 0 1.57, 3.14, 4.71, 6.28

    loadModel(carrierGLB, 'carrier', 'glb');
    loadModel(battleshipOBJ, 'battleship', 'obj');
    loadModel(patrolBoatGLB, 'patrolBoat', 'glb');
    loadModel(submarineGLB, 'submarine', 'glb');
    loadModel(destroyerGLB, 'destroyer', 'glb');
    // loadModel(gridGLB, 'grid', 'glb');

    let startdrag = false;
    let clientX = 0;
    let clientY = 0;
    let deltaX = 0;
    let deltaY = 0;
    window.addEventListener('mousedown', (e) => {
      startdrag = true;
      clientY = e.clientY;
      clientX = e.clientX;
    });

    window.addEventListener('mousemove', (e) => {
      if (!startdrag) return;
      deltaY = e.clientY - clientY;
      deltaX = e.clientX - clientX;
    });

    window.addEventListener('mouseup', (e) => {
      startdrag = false;
      clientX = 0;
      clientY = 0;
      deltaX = 0;
      deltaY = 0;
    });

    // Move left one square: -19 to 20, 5.571428 each square
    // Move up one square: 26.6 to -23.4, 5.555556 each square

    let moveAmountX = 5.571428;
    let moveAmountY = 5.555556;
    let moveObject = 'carrier';
    window.addEventListener('keydown', (e) => {
      if (e.key === 'e') {
        ships[moveObject].position.z += moveAmountY;
        console.log(
          `ships[moveObject].position.z ${ships[moveObject].position.z}`
        );
      }
      if (e.key === 'd') {
        ships[moveObject].position.z -= moveAmountY;
        console.log(
          `ships[moveObject].position.z ${ships[moveObject].position.z}`
        );
      }
      // if (e.key === 'r') {
      //   ships[moveObject].position.y += moveAmount;
      //   console.log(
      //     `ships[moveObject].position.y ${ships[moveObject].position.y}`
      //   );
      // }
      // if (e.key === 'f') {
      //   ships[moveObject].position.y -= moveAmount;
      //   console.log(
      //     `ships[moveObject].position.y ${ships[moveObject].position.y}`
      //   );
      // }
      if (e.key === 't') {
        ships[moveObject].position.x += moveAmountX;
        console.log(
          `ships[moveObject].position.x ${ships[moveObject].position.x}`
        );
      }
      if (e.key === 'g') {
        ships[moveObject].position.x -= moveAmountX;
        console.log(
          `ships[moveObject].position.x ${ships[moveObject].position.x}`
        );
      }
      if (e.key === 'w') {
        camera.rotation.x += moveAmount / 200;
        console.log(`camera.rotation.x ${camera.rotation.x}`);
      }
      if (e.key === 's') {
        camera.rotation.x -= moveAmount / 200;
        console.log(`camera.rotation.x ${camera.rotation.x}`);
      }
    });
    animate();
    function animate() {
      requestAnimationFrame(animate);
      // if (startdrag) {
      //   ships['carrier'].position.x += deltaX / 100;
      //   ships['carrier'].position.z += deltaY / 100;
      // }
      // camera.position.z += 0.05;
      // console.log(camera.position.x);
      renderer.render(scene, camera);
    }
  }

  return {
    renderTest,
  };
}
