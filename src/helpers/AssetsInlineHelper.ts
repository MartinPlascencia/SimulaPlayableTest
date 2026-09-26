import { Assets, AssetsManifest } from 'pixi.js';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Group, AnimationMixer, AnimationClip, TextureLoader, Texture } from 'three';

//import manifestJson from '../data/assets.json';
import manifestJson from '../data/assets';
import sound from '../utils/Sound';

// Add webpack require.context type declaration
declare const require: {
    context(path: string, deep?: boolean, filter?: RegExp): {
        (id: string): any;
        keys(): string[];
    };
};

type GameAssets = {
    bundles: Bundle[];
    models: AssetEntry[];
    fonts: AssetEntry[];
    sounds: AssetEntry[];
    textures: AssetEntry[];
}

type Bundle = {
    name: string;
    assets: AssetEntry[];
}
type AssetEntry = {
    alias: string;
    src: string;
};

export type AnimatedModel = {
    model: Group;
    animationMixer: AnimationMixer;
    animationClips: AnimationClip[];
}

export default class AssetsInlineHelper {
    private _manifest!: AssetsManifest;
    private _textureLoader: TextureLoader = new TextureLoader();
    private _modelEntries: AssetEntry[] = [];
    private _fontEntries: AssetEntry[] = [];
    private _soundEntries: AssetEntry[] = [];
    private _textureEntries: AssetEntry[] = [];
    private _models: Record<string, AnimatedModel> = {};
    private _textures: Record<string, Texture> = {};
    private _gameAssets: GameAssets = manifestJson as GameAssets;

    constructor() {
        this._createManifestFromJson();
    }

    private _createManifestFromJson(): void {
        const assetContext = require.context('../assets', true, /\.(png|jpe?g|svg|webp|glb|ttf|mp3|wav|ogg)$/i);

        this._manifest = {
            bundles: (this._gameAssets.bundles || []).map((bundle: Bundle) => ({
                name: bundle.name,
                assets: (bundle.assets || []).map((asset: AssetEntry) => ({
                    alias: asset.alias,
                    src: assetContext(`./${asset.src}`),
                })),
            })),
        };

        this._modelEntries = (this._gameAssets.models || []).map((model: AssetEntry) => ({
            alias: model.alias,
            src: assetContext(`./${model.src}`),
        }));

        this._fontEntries = (this._gameAssets.fonts || []).map((font: AssetEntry) => ({
            alias: font.alias,
            src: assetContext(`./${font.src}`),
        }));

        this._soundEntries = (this._gameAssets.sounds || []).map((sound: AssetEntry) => ({
            alias: sound.alias,
            src: assetContext(`./${sound.src}`),
        }));

        this._textureEntries = (this._gameAssets.textures || []).map((texture: AssetEntry) => ({
            alias: texture.alias,
            src: assetContext(`./${texture.src}`),
        }));
    }

    public get models(): Record<string, AnimatedModel> {
        return this._models;
    }

    public get textures(): Record<string, Texture> {
        return this._textures;
    }

    public async init(): Promise<void> {
        await Promise.all([
            this.loadFonts(),
            this.loadModels(),
            this.loadSounds()
        ]);
    }

    public async loadBundleByName(bundleName: string, progressCallback?: (progress: number) => void): Promise<void> {
        const bundle = this._manifest.bundles.find(b => b.name === bundleName);
        if (!bundle) {
            console.warn(`Bundle "${bundleName}" not found in manifest.`);
            return;
        }

        Assets.addBundle(bundle.name, bundle.assets);
        try {
            await Assets.loadBundle(bundleName, progress => {
                progressCallback?.(progress);
            });
        } catch (error) {
            console.error(`Error loading bundle: ${bundleName}`, error);
            throw error;
        }
    }

    public async loadFonts(): Promise<void> {
        await Promise.all(this._fontEntries.map(font => this._loadFont(font.alias, font.src)));
    }

    private async _loadFont(name: string, url: string): Promise<void> {
        try {
            const font = new FontFace(name, `url(${url})`);
            await font.load();
            document.fonts.add(font);
            //console.log(`Font "${name}" loaded`);
        } catch (error) {
            console.error(`Error loading font "${name}" from "${url}"`, error);
            throw error;
        }
    }

    public async loadTextures(): Promise<void> {
        await Promise.all(this._textureEntries.map(async (texture) => {
            try {
                const loadingTexture = await this._textureLoader.loadAsync(texture.src);
                this._textures[texture.alias] = loadingTexture;
                loadingTexture.flipY = false;
                loadingTexture.needsUpdate = true;
                //console.log(`Texture "${texture.alias}" loaded`);
            }
            catch (error) {
                console.error(`Error loading texture "${texture.alias}" from "${texture.src}"`, error);
                throw error;
            }
        }));
    }

    public async loadModels(onProgress?: (alias: string, loaded: number, total: number) => void): Promise<void> {
        const loader = new GLTFLoader();

        await Promise.all(this._modelEntries.map(async (model) => {
            const modelUrl = model.src;
            const alias = model.alias;

            try {
                const gltf = await new Promise<GLTF>((resolve, reject) => {
                    loader.load(modelUrl, resolve,
                        (progress) => {
                            if (onProgress) {
                                onProgress(alias, progress.loaded, progress.total ?? 1);
                            }
                        },
                        reject
                    );
                });

                //console.log(`Animations for model "${alias}":`, gltf.animations);

                this._models[alias] = {
                    model: gltf.scene,
                    animationMixer: new AnimationMixer(gltf.scene),
                    animationClips: gltf.animations
                };
            } catch (error) {
                console.error(`Error loading model "${alias}" from "${modelUrl}"`, error);
                throw error;
            }
        }));
    }

    public async loadSounds(): Promise<void> {
        await Promise.all(this._soundEntries.map(async (currentSound) => {
            try {
                await sound.loadSound(currentSound.alias, currentSound.src);
            } catch (error) {
                console.error(`Error loading sound "${currentSound.alias}" from "${currentSound.src}"`, error);
                throw error;
            }
        }));
    }
}