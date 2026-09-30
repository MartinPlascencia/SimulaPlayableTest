import { Application } from 'pixi.js';
import { sdk } from '@smoud/playable-sdk';
import * as THREE from 'three';
import AssetsInlineHelper from '../helpers/AssetsInlineHelper';
import ModelAsset from '../helpers/ModelAsset';
import GameUI from '../helpers/GameUI/GameUI';
import SplashEffect from '../helpers/SplashEffect';
import GrabAsset from '../helpers/GrabAsset';
import BoundaryManager from '../helpers/BoundaryManager';
import LevelWalls from '../helpers/LevelWalls';
import items from '../data/items';
import levelBounds from '../data/levelBounds';
import levels from '../data/levels';
import CoinsCollector from '../helpers/CoinsCollector';
import RewardChest from '../helpers/RewardChest';
import Character from '../helpers/Character';
import Arrow from '../helpers/Arrow';
import CompassArrow from '../helpers/CompassArrow';
import CoinsSender from '../helpers/CoinsSender';
import LevelManager from '../helpers/LevelManager';
import Obstacle from '../helpers/Obstacle';
import RewardManager from '../helpers/RewardManager';

import gsap from 'gsap';
import { ItemsData, LevelBoundsData, LevelConfig } from '../types/game';

import localization from '../utils/Localization';
import eventsSystem from '../utils/EventsSystem';
import sound from '../utils/Sound';
export default class MainScene {
    private _active: boolean = true;
    private _isPaused: boolean = false;
    private _assetsInlineHelper!: AssetsInlineHelper;
    private _scene: THREE.Scene;
    private _renderer: THREE.WebGLRenderer;
    private _camera: THREE.PerspectiveCamera;
    private _clock: THREE.Clock;
    private _groundModel!: THREE.Mesh;
    private _characterModel!: Character;
    private _activeModels: ModelAsset[] = [];
    private _ambientLight!: THREE.AmbientLight;
    private _directionalLight!: THREE.DirectionalLight;
    private _gameUI!: GameUI;
    private _splashParticles!: SplashEffect;
    private _smokeParticles!: SplashEffect;
    private _cameraOffset = new THREE.Vector3(0, 6, 4); // closer camera
    private _portraitOffset = new THREE.Vector3(0, 8.5, 8.5); // closer camera for portrait
    private _landscapeOffset = new THREE.Vector3(0, 7, 4); // closer camera for landscape
    private _cameraTarget = new THREE.Vector3();
    private _cameraLookAt = new THREE.Vector3();
    private _cameraFollowSpeed = 0.05;
    private _cameraFollow: boolean = false;
    private _activeCoins: GrabAsset[] = [];
    private _coinPool: GrabAsset[] = [];
    private _obstacles: Obstacle[] = [];
    private _obstaclePool: Obstacle[] = [];
    private _arrow!: Arrow;
    private _compassArrow!: CompassArrow;
    private _boundaryManager!: BoundaryManager;
    private _levelWalls!: LevelWalls;
    private _itemsData: ItemsData = items;
    private _levelBoundsData: LevelBoundsData = levelBounds;
    private _levelManager: LevelManager = new LevelManager(levels);
    private _coinsCollector!: CoinsCollector;
    private _rewardChest!: RewardChest;
    private _coinsSender!: CoinsSender;
    private _isGameOver: boolean = false;
    /** Fixed height (y) the character is placed at - must stay constant for movement/collision to work correctly. */
    private readonly _characterHeight: number = 1.8;
    private _loseScreenDelay: number = 4;
    private _loseScreenTween?: gsap.core.Tween;
    private _cameraShakeIntensity: number = 0;
    private _rewardManager!: RewardManager;

    private get _currentLevel(): LevelConfig {
        return this._levelManager.currentLevel;
    }

    constructor(app: Application, assetsInlineHelper: AssetsInlineHelper) {

        this._assetsInlineHelper = assetsInlineHelper;
        this._rewardManager = new RewardManager(assetsInlineHelper);

        this._renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this._renderer.setSize(app.screen.width, app.screen.height);
        this._renderer.setPixelRatio(Math.max(2, window.devicePixelRatio || 1));
        this._renderer.shadowMap.enabled = true;
        this._renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        document.body.appendChild(this._renderer.domElement);

        const pixiCanvas = app.canvas;
        const parent = pixiCanvas.parentElement || document.body;
        parent.insertBefore(this._renderer.domElement, pixiCanvas);
        this._renderer.domElement.style.position = "absolute";
        this._renderer.domElement.style.top = "0";
        this._renderer.domElement.style.left = "0";
        this._renderer.domElement.style.zIndex = "0";
        this._renderer.domElement.style.pointerEvents = "none";

        pixiCanvas.style.position = "absolute";
        pixiCanvas.style.top = "0";
        pixiCanvas.style.left = "0";
        pixiCanvas.style.zIndex = "1";
        pixiCanvas.style.pointerEvents = "auto";

        this._scene = new THREE.Scene();
        this._scene.background = new THREE.Color(0x0a1a3c);

        this._camera = new THREE.PerspectiveCamera(75, app.screen.width / app.screen.height, 0.1, 1000);
        this._clock = new THREE.Clock();

        this._gameUI = new GameUI(app, this._currentLevel.coinsToWin);
        this._create();
        this._addEvents();
    }

    private _addEvents(): void {
        eventsSystem.on('nextLevel', this._startNextLevel.bind(this));
        eventsSystem.on('restartLevel', this._restartCurrentLevel.bind(this));
        eventsSystem.on('install', this._onInstall.bind(this));
    }

    private _onInstall(): void {
        //sdk.install();
    }

    private _startNextLevel(): void {
        this._levelManager.goToNextLevel();
        this._clearLevel();
        this._buildLevel();
        this._gameUI.startLevel(this._currentLevel.coinsToWin, this._levelManager.currentIndex === 0);
    }

    private _restartCurrentLevel(): void {
        this._clearLevel();
        this._buildLevel();
        this._gameUI.startLevel(this._currentLevel.coinsToWin, this._levelManager.currentIndex === 0);
    }

    private _createLights(): void {
        this._ambientLight = new THREE.AmbientLight(0xffffff, 2.5);
        this._scene.add(this._ambientLight);

        this._directionalLight = new THREE.DirectionalLight(0xffffff, 5);
        this._directionalLight.position.set(5, 20, 7.5);
        this._directionalLight.castShadow = true;
        this._directionalLight.shadow.mapSize.width = 1024;
        this._directionalLight.shadow.mapSize.height = 1024;
        this._directionalLight.shadow.camera.near = 0.5;
        this._directionalLight.shadow.camera.far = 100;
        this._directionalLight.shadow.camera.left = -30;
        this._directionalLight.shadow.camera.right = 30;
        this._directionalLight.shadow.camera.top = 30;
        this._directionalLight.shadow.camera.bottom = -30;

        this._scene.add(this._directionalLight);

        this._setNightLight(0);
        this._createStars();

    }

    /** Simple starfield backdrop: a scattering of small points attached to the camera (rather than
     *  placed in world space) so it always fills the sky area behind the level regardless of the
     *  camera's follow position/angle, without needing a full skybox. Depth-tested against the scene,
     *  so it's naturally hidden behind the ground/walls/models and only shows through in gaps. */
    private _createStars(): void {
        const starCount = 250;
        const spread = 500;
        const distance = 300;

        const positions = new Float32Array(starCount * 3);
        for (let i = 0; i < starCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * spread;
            positions[i * 3 + 1] = (Math.random() - 0.5) * spread * 0.6;
            positions[i * 3 + 2] = -distance;
        }

        const starsGeometry = new THREE.BufferGeometry();
        starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const starsMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 2.5,
            sizeAttenuation: false,
            transparent: true,
            opacity: 0.85,
            depthWrite: false,
        });

        const stars = new THREE.Points(starsGeometry, starsMaterial);
        this._camera.add(stars);
    }

    private _setNightLight(duration: number = 0): void {
        gsap.to(this._ambientLight, {
            intensity: 0.5,
            duration: duration,
        });
        gsap.to(this._directionalLight, {
            intensity: 1.5,
            duration: duration,
        });
        this._scene.background = new THREE.Color(0x001e2d);
    }

    private _setDayLight(duration: number = 0): void {

        gsap.to(this._ambientLight, {
            intensity: 1.2,
            duration: duration,
        });
        gsap.to(this._directionalLight, {
            intensity: 6.5,
            duration: duration,
        });
        this._scene.background = new THREE.Color(0x0a1a3c);
    }

    private _createGround(): void {
        const { xPosition, zPosition } = this._levelBoundsData;
        const width = xPosition.max - xPosition.min;
        const depth = zPosition.max - zPosition.min;
        const centerX = (xPosition.min + xPosition.max) * 0.5;
        const centerZ = (zPosition.min + zPosition.max) * 0.5;

        const groundGeometry = new THREE.PlaneGeometry(width, depth);
        const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x7845D8 });
        this._groundModel = new THREE.Mesh(groundGeometry, groundMaterial);
        this._groundModel.rotation.x = -Math.PI / 2;
        this._groundModel.position.set(centerX, 1.2, centerZ);
        this._groundModel.receiveShadow = true;
        this._scene.add(this._groundModel);

        this._splashParticles = new SplashEffect(this._assetsInlineHelper.textures['mini_star'], 10, 1, 0.2, 0.4, true);
        this._scene.add(this._splashParticles.object3D);

        this._smokeParticles = new SplashEffect(this._assetsInlineHelper.textures['smoke'], 8, 1.2, 0.6, 1.1, false);
        this._scene.add(this._smokeParticles.object3D);
    }

    private _createCharacter(): void {
        this._characterModel = new Character(this._assetsInlineHelper.models['fox_animated'].model, 'target_character', this._assetsInlineHelper.models['fox_animated'].animationClips);
        this._characterModel.scale.set(0.01, 0.01, 0.01);
        this._characterModel.castShadow = true;
        this._characterModel.receiveShadow = true;
        this._scene.add(this._characterModel);
        this._activeModels.push(this._characterModel);

        this._coinsCollector = this._characterModel.coinsCollector;
        this._resetCharacter();
    }

    /** Repositions the existing character back to its spawn spot and resets its per-level state
     *  (idle animation, coin count). Called at the start of every level/restart instead of
     *  recreating the character model each time. */
    private _resetCharacter(): void {
        const { x, z } = this._currentLevel.startPosition;
        this._characterModel.position.set(x, this._characterHeight, z);
        this._characterModel.rotation.set(0, 0, 0);
        this._characterModel.resetToIdle();

        this._coinsCollector.coins = 0;
        this._coinsCollector.maxCoins = this._currentLevel.coinsToWin;
    }

    private _coinSpawnIndex: number = 0;

    private _addItems(): void {
        for (let i = 0; i < this._currentLevel.coinsPositions.length; i++) {
            this._addItem();
        }
    }

    private _addItem(): void {
        const coinsPositions = this._currentLevel.coinsPositions;
        if (coinsPositions.length === 0) {
            return;
        }

        const itemID = this._itemsData.itemsID[Math.floor(Math.random() * this._itemsData.itemsID.length)];
        let itemModel = this._coinPool.find(item => !item.visible);
        if (!itemModel) {
            itemModel = new GrabAsset(
                this._assetsInlineHelper.models[itemID.modelName].model,
                itemID.assetName
            );
            this._coinPool.push(itemModel);
        }

        // Cycle through the level's exact coin spots instead of randomizing,
        // so each level's layout is fully hand-designed and reproducible.
        const spawnPosition = coinsPositions[this._coinSpawnIndex % coinsPositions.length];
        this._coinSpawnIndex++;

        itemModel.position.set(spawnPosition.x, spawnPosition.y, spawnPosition.z);
        this._scene.add(itemModel);
        itemModel.activate();
        this._activeCoins.push(itemModel);
    }

    private _addObstacles(): void {
        for (const obstacleConfig of this._currentLevel.obstacles) {
            let obstacle = this._obstaclePool.find(item => !item.visible);
            if (!obstacle) {
                obstacle = new Obstacle(this._assetsInlineHelper.models['enemy_blob'].model);
                obstacle.scale.set(0.6, 0.6, 0.6);
                this._obstaclePool.push(obstacle);
            }
            const position = obstacleConfig.position;
            obstacle.position.set(position.x, position.y, position.z);
            obstacle.visible = true;
            obstacle.startLevel(obstacleConfig.movement, this._levelBoundsData);
            this._scene.add(obstacle);
            this._obstacles.push(obstacle);
        }
    }

    private _createRewardChest(): void {
        this._rewardChest = new RewardChest(new ModelAsset(this._assetsInlineHelper.models['chest'].model), 1.1, this._currentLevel.coinsToWin);
        this._rewardChest.position.set(-3, 2.5, -5.5);
        this._rewardChest.rotation.set(0, -49.8, 0);
        this._scene.add(this._rewardChest);
    }

    private _create(): void {
        this._createLights();
        this._createGround();
        this._createCharacter();
        this._buildLevel();
        this._animate();
    }

    private _buildLevel(): void {
        this._isGameOver = false;
        this._loseScreenTween?.kill();
        gsap.killTweensOf(this);
        this._cameraShakeIntensity = 0;
        //this._rewardManager.clearReward();
        sound.stopSound('lose');
        sound.stopSound('game_sound');
        sound.playSound('game_sound', true, 0.25);
        this._resetCharacter();
        this._addItems();
        this._addObstacles();
        this._createRewardChest();
        this._createCoinsSender();
        this._createArrow();
        this._createLevelWalls();
        this._createBoundaryManager();
        this.resize(window.innerWidth, window.innerHeight);
        //this._rewardManager.attachReward(this._currentLevel.reward, this._characterModel);
        this._animateScene();
        eventsSystem.emit('fadeIn');
    }

    /** Tears down the current level's objects, keeping level-independent state (ground, lights, camera, renderer,
     *  and the character - which is repositioned by _resetCharacter() in _buildLevel() rather than recreated).
     *  Coins/obstacles are returned to their pools (hidden, kept in memory) rather than destroyed, so the next
     *  level's _addItems/_addObstacles can reuse the existing instances instead of allocating new ones. */
    private _clearLevel(): void {
        this._activeCoins.forEach(coin => {
            this._scene.remove(coin);
            coin.visible = false;
        });
        this._activeCoins = [];
        this._coinSpawnIndex = 0;

        this._obstacles.forEach(obstacle => {
            this._scene.remove(obstacle);
            obstacle.visible = false;
            obstacle.stopPulse();
        });
        this._obstacles = [];

        this._scene.remove(this._rewardChest);
        this._scene.remove(this._arrow);
        this._scene.remove(this._compassArrow);
        this._scene.remove(this._levelWalls);
        this._coinsSender.dispose();
    }

    private _createCoinsSender(): void {
        this._coinsSender = new CoinsSender(this._assetsInlineHelper, this._scene);
    }

    private _createBoundaryManager(): void {
        this._boundaryManager = new BoundaryManager();

        this._addBoundaries();
        //this._boundaryManager.enableDebug(this._scene); // visualize colliders while tuning
    }

    private _createLevelWalls(): void {
        this._levelWalls = new LevelWalls(this._levelBoundsData);
        this._scene.add(this._levelWalls);
    }

    private _addBoundaries(): void {
        // Unity-style: point the collider at the 3D object and it auto-fits
        // to its bounds, instead of hand-typing center/size/rotation numbers.
        this._boundaryManager.addColliderToObject(this._rewardChest);
        this._levelWalls.registerColliders(this._boundaryManager);
    }

    private _createArrow(): void {
        this._arrow = new Arrow(this._assetsInlineHelper.models['arrow'].model, 'Arrow');
        this._arrow.scale.set(0.5, 0.5, 0.5);

        // Point the arrow at one of the level's actual coin spots (first in
        // the list) rather than hardcoded waypoints, floating a bit above it.
        const coinsPositions = this._currentLevel.coinsPositions;
        const targetCoin = coinsPositions[0];
        this._arrow.goPositions = targetCoin
            ? [new THREE.Vector3(targetCoin.x, targetCoin.y + 1, targetCoin.z)]
            : [];

        this._scene.add(this._arrow);

        this._compassArrow = new CompassArrow(this._assetsInlineHelper.models['arrow'].model, 'Arrow');
        this._compassArrow.scale.set(0.5, 0.5, 0.5);
        this._compassArrow.visible = false;
        this._scene.add(this._compassArrow);
    }

    private async _animateScene(): Promise<void> {
        this._updateCameraPosition(window.innerWidth, window.innerHeight);
        this._setDayLight(2);
        const initialPosition = this._characterModel.position.clone().add(this._cameraOffset);
        this._camera.position.set(initialPosition.x, initialPosition.y, initialPosition.z);
        await gsap.from(this._camera.position, {
            y: 30,
            duration: 2.5,
            ease: "power2.out",
            onUpdate: () => {
                this._cameraLookAt.lerp(
                    this._characterModel.position,
                    this._cameraFollowSpeed
                );
                this._camera.lookAt(this._cameraLookAt);
            }, onComplete: () => {
                this._cameraFollow = true;
                eventsSystem.emit('nextHint');
            }
        });

    }

    private _updateCameraFollow(): void {
        if (!this._characterModel || !this._cameraFollow) return;

        // Position
        this._cameraTarget
            .copy(this._characterModel.position)
            .add(this._cameraOffset);

        this._camera.position.lerp(
            this._cameraTarget,
            this._cameraFollowSpeed
        );
        /* this._camera.position.set(this._cameraTarget.x, this._cameraTarget.y, this._cameraTarget.z); */

        if (this._cameraShakeIntensity > 0.001) {
            this._camera.position.x += (Math.random() * 2 - 1) * this._cameraShakeIntensity;
            this._camera.position.y += (Math.random() * 2 - 1) * this._cameraShakeIntensity;
        }

        // Look direction
        this._cameraLookAt.lerp(
            this._characterModel.position,
            this._cameraFollowSpeed
        );

        this._camera.lookAt(this._cameraLookAt);
    }

    private update(): void {
        const delta = this._clock.getDelta();
        this._activeModels.forEach(model => {
            model.animationMixer?.update(delta);
        });
        this._splashParticles.update(this._camera.position);
        this._smokeParticles.update(this._camera.position);

        if (this._isGameOver) {
            this._updateCameraFollow();
            return;
        }

        if (this._gameUI.joystick.isMoving) {
            const prevPos = this._characterModel.position.clone();
            this._characterModel.move(this._gameUI.joystick.value.x, this._gameUI.joystick.value.y, delta);
            if (this._boundaryManager.isCollidingWithAny(this._characterModel, new THREE.Vector3(0.5, 1.5, 0.5))) {
                this._characterModel.position.copy(prevPos);
            }
            //console.log('Character Position:', this._characterModel.position);
        } else {
            this._characterModel.stop();
        }
        this._activeCoins.forEach((coin) => {
            if (coin.visible) {
                coin.rotate(delta);
                if (coin.isInGrabRange(this._characterModel) && this._coinsCollector.coins < this._coinsCollector.maxCoins) {
                    sound.playSound('collect', false, 0.7);
                    eventsSystem.emit('showTextParticles', `±1 ${localization.get('addItem')}`, this._characterModel, this._camera, this._renderer, 45);
                    this._coinsCollector.collectCoin();
                    coin.visible = false;
                    this._splashParticles.play(coin.position);
                    if (this._coinsCollector.coins === 1) {
                        this._arrow.hide();
                    }
                    if (this._coinsCollector.coins == this._rewardChest.coinsToWin) {
                        eventsSystem.emit('nextHint');
                        this._compassArrow.showAboveCharacter(this._characterModel, this._rewardChest.position, 2.5);
                    }
                }
            }
        })
        this._compassArrow.updateFollow();
        this._checkObstacles(delta);
        this._checkRewardChest(delta);
        this._updateCameraFollow();
    }

    private _checkObstacles(delta: number): void {
        for (const obstacle of this._obstacles) {
            obstacle.update(delta);
            if (obstacle.isInHitRange(this._characterModel)) {
                this._onCharacterDies();
                break;
            }
        }
    }

    private _onCharacterDies(): void {
        this._isGameOver = true;
        this._characterModel.stopWalkingSound();
        this._characterModel.playAnimation('dying_backwards', 0.2, false);
        this._smokeParticles.play(this._characterModel.position);
        this._shakeCamera();
        sound.stopSound('game_sound');
        sound.playSound('lose');
        eventsSystem.emit('damageFadeOut');
        this._loseScreenTween?.kill();
        this._loseScreenTween = gsap.delayedCall(this._loseScreenDelay, () => {
            eventsSystem.emit('showLoseScreen');
        });
    }

    private _checkRewardChest(delta: number): void {
        this._rewardChest.update(this._camera.position);
        if (this._rewardChest.isInUpgradeRange(this._characterModel) && this._coinsCollector.coins >= this._rewardChest.coinsToWin) {
            this._coinsCollector.coins = 0;
            eventsSystem.emit('nextHint');
            this._compassArrow.hide();
            sound.playSound('exchange');
            sound.playSound('victory');
            eventsSystem.emit('showTextParticles', localization.get('completed'), this._characterModel, this._camera, this._renderer);
            this._splashParticles.play(this._rewardChest.position);
            this._coinsSender.sendCoins(this._characterModel.position, this._rewardChest.position, 10, 0.5);
            this._characterModel.stop();
            gsap.delayedCall(2, () => {
                this._rewardManager.attachReward(this._currentLevel.reward, this._characterModel);
                this._rewardChest.finishGame(this._levelManager.isLastLevel, this._currentLevel.reward?.name, this._currentLevel.finalScreenMessageKey);
            });
        }
    }

    private _animate(): void {
        requestAnimationFrame(() => this._animate());

        !this._isPaused && this.update();
        this._renderer.render(this._scene, this._camera);
    }

    public pause(): void {
        if (this._isPaused) return;
        this._isPaused = true;
        gsap.globalTimeline.pause();
        sound.pauseAll();
    }

    public resume(): void {
        if (!this._isPaused) return;
        this._isPaused = false;
        gsap.globalTimeline.resume();
        sound.resumeAll();
        // Discard the elapsed real time accumulated while paused, otherwise the next
        // getDelta() call would return the whole paused duration as a single frame,
        // teleporting obstacles (and potentially killing the player instantly).
        this._clock.getDelta();
    }

    public resize(width: number, height: number): void {

        this._updateCameraPosition(width, height);
        this._renderer.setSize(width, height);
        this._gameUI.resize(width, height);
        const isPortrait = height > width;
        if (isPortrait) {
            this._cameraOffset.copy(this._portraitOffset);
        } else {
            this._cameraOffset.copy(this._landscapeOffset);
        }
        //console.log('camera offset', this._cameraOffset);
    }

    private _updateCameraPosition(width: number, height: number): void {
        this._camera.aspect = width / height;
        const minDistance = 8;
        const maxDistance = 18;

        const normalizedWidth = Math.min(Math.max((width - 400) / 1200, 0), 1);
        const distance = maxDistance - (maxDistance - minDistance) * normalizedWidth;

        this._camera.position.x = 0;
        this._camera.position.y = distance;
        this._camera.position.z = distance;
        this._camera.lookAt(0, 0, 0);
        this._camera.updateProjectionMatrix();
    }

    private _shakeCamera(duration: number = 0.5, magnitude: number = 0.1): void {
        const originalPosition = this._camera.position.clone();
        const tl = gsap.timeline();

        const shakes = Math.floor(duration / 0.02);
        for (let i = 0; i < shakes; i++) {
            tl.to(this._camera.position, {
                x: originalPosition.x + (Math.random() - 0.5) * magnitude,
                y: originalPosition.y + (Math.random() - 0.5) * magnitude,
                z: originalPosition.z + (Math.random() - 0.5) * magnitude,
                duration: 0.02,
                ease: "power1.inOut"
            });
        }

        tl.to(this._camera.position, {
            x: originalPosition.x,
            y: originalPosition.y,
            z: originalPosition.z,
            duration: 0.05,
            ease: "power1.out"
        });
    }

    public get active(): boolean {
        return this._active;
    }
}