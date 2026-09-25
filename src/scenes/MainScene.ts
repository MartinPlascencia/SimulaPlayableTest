import { Application} from 'pixi.js';
import { sdk } from '@smoud/playable-sdk';
import * as THREE from 'three';
import AssetsInlineHelper from '../helpers/AssetsInlineHelper';
import ModelAsset from '../helpers/ModelAsset';
import GameUI from '../helpers/GameUI/GameUI';
import SplashEffect from '../helpers/SplashEffect';
import GrabAsset from '../helpers/GrabAsset';
import BoundaryManager from '../helpers/BoundaryManager';
import items from '../data/items';
import CoinsCollector from '../helpers/CoinsCollector';
import SlotMachine from '../helpers/SlotMachine';
import Character from '../helpers/Character';
import CoinsUpgrade from '../helpers/CoinsUpgrade';
import Arrow from '../helpers/Arrow';
import CoinsSender from '../helpers/CoinsSender';

import gsap from 'gsap';
import { ItemsData } from '../types/game';

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
    private _cameraOffset = new THREE.Vector3(0, 6, 4); // closer camera
    private _portraitOffset = new THREE.Vector3(0, 7, 7); // closer camera for portrait
    private _landscapeOffset = new THREE.Vector3(0, 6, 4); // closer camera for landscape
    private _cameraTarget = new THREE.Vector3();
    private _cameraLookAt = new THREE.Vector3();
    private _cameraFollowSpeed = 0.05;
    private _cameraFollow: boolean = false;
    private _firstTimeCoinsCollected: boolean = false;
    private _activeCoins: GrabAsset[] = [];
    private _arrow!: Arrow;
    private _boundaryManager!: BoundaryManager;
    private _itemsData: ItemsData = items;
    private _coinsCollector!: CoinsCollector;
    private _coinsUpgrade!: CoinsUpgrade;
    private _slotMachine!: SlotMachine;
    private _coinsSender!: CoinsSender;

    constructor(app: Application, assetsInlineHelper: AssetsInlineHelper) {

        this._assetsInlineHelper = assetsInlineHelper;

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
        this._scene.background = new THREE.Color(0x9cfff0);

        this._camera = new THREE.PerspectiveCamera(75, app.screen.width / app.screen.height, 0.1, 1000);
        this._clock = new THREE.Clock();

        this._gameUI = new GameUI(app);
        this._create();
        this._addEvents();
    }

    private _addEvents(): void {
        eventsSystem.on('gameFinished', this._gameFinished.bind(this)); 
    }

    private _gameFinished(): void {
        //this._setNightLight(3);
        //sdk.install();
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
        this._scene.background = new THREE.Color(0x9cfff0);
    }

    private _createModels(): void { 
        const groundGeometry = new THREE.PlaneGeometry(60, 60);
        const groundMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
        this._groundModel = new THREE.Mesh(groundGeometry, groundMaterial);
        this._groundModel.rotation.x = -Math.PI / 2;
        this._groundModel.position.set(0, 1, 0);
        this._groundModel.receiveShadow = true;
        this._scene.add(this._groundModel);

        this._characterModel = new Character(this._assetsInlineHelper.models['gorilla_animated'].model, 'Gorilla', this._assetsInlineHelper.models['gorilla_animated'].animationClips);
        this._characterModel.position.set(3, 2, 0);
        this._characterModel.scale.set(0.01, 0.01, 0.01);
        this._characterModel.castShadow = true;
        this._characterModel.receiveShadow = true;
        this._scene.add(this._characterModel);
        this._activeModels.push(this._characterModel);
        this._characterModel.playAnimation('idle');

        this._coinsCollector = this._characterModel.coinsCollector;

        this._splashParticles = new SplashEffect(this._assetsInlineHelper.textures['mini_star'], 10, 1, 0.2, 0.4, true);
        this._scene.add(this._splashParticles.object3D);
    }

    private _addItems(): void {
        for (let i = 0; i < this._itemsData.numberOfItems; i++) {
            this._addItem();
        }
    }

    private _addItem(): void {
        const itemID = this._itemsData.itemsID[Math.floor(Math.random() * this._itemsData.itemsID.length)];
        let itemModel = this._activeCoins.find(item => !item.visible);
        if (!itemModel) {
            itemModel = new GrabAsset(
                this._assetsInlineHelper.models[itemID.modelName].model,
                itemID.assetName
            );
            this._activeCoins.push(itemModel);
        }

        let posX = 0;
        let posZ = 0;
        let attempts = 0;
        const maxAttempts = 100; // Increased from 50 for more retries; adjust based on your spawn area size

        let placed = false;
        do {
            posX =
                this._itemsData.xPosition.min +
                Math.random() * (this._itemsData.xPosition.max - this._itemsData.xPosition.min);

            posZ =
                this._itemsData.zPosition.min +
                Math.random() * (this._itemsData.zPosition.max - this._itemsData.zPosition.min);

            attempts++;
            const proposedPosition = new THREE.Vector3(posX, this._itemsData.yPosition, posZ);
            const isNearby = this._isNearbyAnItem(proposedPosition, 0.8);

            if (!isNearby || attempts >= maxAttempts) {
                placed = true;
                //console.log(`Placing item ${i + 1} at (${posX.toFixed(2)}, ${this._itemsData.yPosition.toFixed(2)}, ${posZ.toFixed(2)}) after ${attempts} attempts.`);
                if (isNearby) {
                    console.warn(`Item placed despite overlap (max attempts reached). Consider increasing spawn area or reducing item count/range.`);
                }
            }
        } while (!placed);

        if (placed) {
            itemModel.position.set(posX, this._itemsData.yPosition, posZ);
            this._scene.add(itemModel);
            itemModel.activate();
        } else {
            console.error(`Failed to place item after ${maxAttempts} attempts. Skipping.`);
        }
    }

    private _isNearbyAnItem(position: THREE.Vector3, range: number): boolean {
        for (let i = 0; i < this._activeCoins.length; i++) {
            const item = this._activeCoins[i];
            const distance = position.distanceTo(item.position);
            if (distance <= range) {
                return true;
            }
        }
        return false;
    }

    private _createSlotMachine(): void {
        this._slotMachine = new SlotMachine(new ModelAsset(this._assetsInlineHelper.models['slot_machine'].model, 'MachineE'), 0.85); 
        this._slotMachine.position.set(-0.2, 1.5, -5.5);
        this._slotMachine.rotation.set(0, -49.8, 0);
        this._scene.add(this._slotMachine);
    }

    private _create(): void {

        this._createLights();
        this._createModels();
        this._addItems();
        this._createSlotMachine();
        this._createCoinsUpgrade();
        this._createCoinsSender();
        this._createArrow();
        this._createBoundaryManager();
        this.resize(window.innerWidth, window.innerHeight);

        this._animate();
        this._animateScene();
    }

    private _createCoinsSender(): void {
        this._coinsSender = new CoinsSender(this._assetsInlineHelper, this._scene);
    }

    private _createCoinsUpgrade(): void {
        this._coinsUpgrade = new CoinsUpgrade(new ModelAsset(this._assetsInlineHelper.models['coin'].model, 'Coin'));
        this._scene.add(this._coinsUpgrade);
        this._coinsUpgrade.position.set(7.8, 2, -2);

        this._firstTimeCoinsCollected = true;
    }


    private _createBoundaryManager(): void {
        this._boundaryManager = new BoundaryManager();

        this._addBoundaries();
        //this._boundaryManager.enableDebug(this._scene); // visualize colliders while tuning
    }

    private _addBoundaries(): void {
        // Unity-style: point the collider at the 3D object and it auto-fits
        // to its bounds, instead of hand-typing center/size/rotation numbers.
        this._boundaryManager.addColliderToObject(this._slotMachine);
    }

    private _createArrow(): void {
        this._arrow = new Arrow(this._assetsInlineHelper.models['arrow'].model, 'Arrow');
        this._arrow.scale.set(0.5, 0.5, 0.5);
        this._arrow.goPositions = [
            new THREE.Vector3(0.2, 3, 5),
            new THREE.Vector3(6, 3, -1),
        ];
        this._scene.add(this._arrow);
    }

    private async _animateScene(): Promise<void> {
        sound.playSound('gorilla_game_song', true, 0.25);
        this._updateCameraPosition(window.innerWidth, window.innerHeight);
        this._setDayLight(2);
        const initialPosition = this._characterModel.position.clone().add(this._cameraOffset);
        this._camera.position.set(initialPosition.x, initialPosition.y, initialPosition.z);
        await gsap.from(this._camera.position,{
            y:30,
            duration: 3.5,
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
                    sound.playSound('collect',false, 0.7);
                    eventsSystem.emit('showTextParticles', `±1 ${localization.get('addItem')}`, this._characterModel, this._camera, this._renderer, 45);
                    this._coinsCollector.collectCoin();
                    coin.visible = false;
                    this._splashParticles.play(coin.position);
                    if (this._arrow.visible && this._coinsCollector.coins == 5) {
                        this._arrow.goToNextPosition();
                        eventsSystem.emit('nextHint');
                    }
                    gsap.delayedCall(2, this._addItem.bind(this))
                }
            }
        })
        this._checkCoinsUpgrade(delta);
        this._checkSlotMachine(delta);
        this._updateCameraFollow();
    }

    private _checkSlotMachine(delta: number): void {
        this._slotMachine.update(this._camera.position);
        if (this._slotMachine.isInUpgradeRange(this._characterModel) && this._characterModel.money.money >= this._slotMachine.priceToPlay) {
            this._characterModel.money.subtractMoney(this._slotMachine.priceToPlay);
            eventsSystem.emit('nextHint');
            sound.playSound('exchange');
            sound.playSound('congratulations');
            eventsSystem.emit('showTextParticles', localization.get('completed'), this._characterModel, this._camera, this._renderer);
            this._splashParticles.play(this._slotMachine.position);
            this._coinsSender.sendCoins(this._characterModel.position, this._slotMachine.position,  10, 0.5);
            this._characterModel.stop();
            gsap.delayedCall(2, () => {
                this._slotMachine.finishGame();
            });
        }
    }

    private _checkCoinsUpgrade(delta: number): void {
        this._coinsUpgrade.update(this._camera.position, delta);
        if (this._coinsUpgrade.isInUpgradeRange(this._characterModel) && this._coinsCollector.coins > 0) {
            sound.playSound('exchange');
            eventsSystem.emit('showTextParticles', `±$${this._coinsCollector.coins}`, this._characterModel, this._camera, this._renderer);
            this._characterModel.money.addMoney(this._coinsCollector.coins);
            this._splashParticles.play(this._coinsUpgrade.position);
            this._coinsCollector.coins = 0;
            this._coinsSender.sendCoins(this._coinsUpgrade.position, this._characterModel.position,  5, 0.5);
            if (this._firstTimeCoinsCollected) {
                this._firstTimeCoinsCollected = false;
                this._arrow.goToNextPosition();
                eventsSystem.emit('nextHint');
            }
        }
    }

    private _animate(): void {
        requestAnimationFrame(() => this._animate());

        !this._isPaused && this.update();
        this._renderer.render(this._scene, this._camera);
    }

    public pause(): void {
        this._isPaused = true;
    }

    public resume(): void {
        this._isPaused = false;
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