import * as THREE from 'three';
import { OrbitControls } from 'OrbitControls';

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('generateMazeBtn').addEventListener('click', generateMaze);
    document.getElementById('solveMazeBtn').addEventListener('click', solveMaze);
});


function generateMaze() {
    let n = parseInt(document.getElementById('n').value);
    let m = parseInt(document.getElementById('m').value);
    let k = parseInt(document.getElementById('k').value);
    if (isNaN(n) || isNaN(m) || isNaN(k) || n <= 0 || m <= 0 || k <= 0) {
        alert('Please enter valid positive numbers for N, M, and K.');
        return;
    }
    let maze = new Array(n);
    for (let i = 0; i < n; i++) {
        maze[i] = new Array(m);
        for (let j = 0; j < m; j++) {
            maze[i][j] = new Array(k).fill(0).map(() => Math.round(Math.random()));
        }
    }
    document.getElementById('maze').value = JSON.stringify(maze);
    displayMaze(maze);
}

function displayMaze(maze) {
    let scene = new THREE.Scene();
    let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    const mazeContainer = document.getElementById('mazeContainer');
    const width = mazeContainer.clientWidth;
    const height = mazeContainer.clientHeight;


    let renderer = new THREE.WebGLRenderer();
    // Set renderer size to match the container's size
    renderer.setSize(width, height);
    mazeContainer.innerHTML = "";
    mazeContainer.appendChild(renderer.domElement);

    camera.aspect = width / height;
    camera.updateProjectionMatrix();


    window.addEventListener('resize', function () {
        const width = mazeContainer.clientWidth;
        const height = mazeContainer.clientHeight;
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    });

    // Create cubes for maze walls
    let geometry = new THREE.BoxGeometry();
    let material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });

    maze.forEach((layer, n) => {
        layer.forEach((row, m) => {
            row.forEach((cell, k) => {
                if (cell === 1) {
                    let cube = new THREE.Mesh(geometry, material);
                    cube.position.set(n - maze.length / 2, m - layer.length / 2, k - row.length / 2);
                    scene.add(cube);
                }
            });
        });
    });

    camera.position.z = 5;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = true;

    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }
    animate();
}

function solveMaze() {
    let maze = document.getElementById('maze').value;
    if (!maze) {
        alert('Please generate a maze first.');
        return;
    }
    let start = document.getElementById('start').value;
    let stop = document.getElementById('stop').value;
    document.getElementById('result').textContent = 'Solving...';
    fetch('/solve_maze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ maze: JSON.parse(maze), start: JSON.parse(start), stop: JSON.parse(stop) }),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.path.length === 0) {
                document.getElementById('result').textContent = 'Unable to solve this maze, please try again.';
            } else {
                document.getElementById('result').textContent = JSON.stringify(data.path);
            }
        })
        .catch((error) => {
            console.error('Error:', error);
            document.getElementById('result').textContent = 'Failed to solve maze. Please try again.';
        });
}