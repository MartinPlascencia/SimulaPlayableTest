export default {
    bundles: [
        {
            name: "load-screen",
            assets: [
                { alias: "progress_bar", src: "sprites/progress_bar.png" },
                { alias: "progress_bar_fill", src: "sprites/progress_bar_fill.png" }
            ]
        },
        {
            name: "game-screen",
            assets: [
                { alias: "joystick_base", src: "sprites/joystick_base.webp" },
                { alias: "joystick_handler", src: "sprites/joystick_handler.webp" },
                { alias: "lolipop_icon", src: "sprites/lolipop.webp" },
                { alias: "chip", src: "sprites/chip.webp" },
                { alias: "final_text", src: "sprites/final_text.png" },
                { alias: "hints_background", src: "sprites/hints_background.png" },
                { alias: "logo", src: "sprites/logo.png" },
                { alias: "download", src: "sprites/download.webp" },
                { alias: "sound_on", src: "sprites/sound_on.webp" },
                { alias: "sound_off", src: "sprites/sound_off.webp" }
            ]
        }
    ],
    models: [
        { alias: "fox_animated", src: "models/fox.glb" },
        { alias: "scrambly_coin", src: "models/scrambly_coin.glb" },
        { alias: "chest", src: "models/chest.glb" },
        { alias: "arrow", src: "models/arrow.glb" },
        { alias: "coin", src: "models/coin.glb" },
        { alias: "enemy_blob", src: "models/enemy_blob.glb" },
        { alias: "hat", src: "models/hat.glb" },
        { alias: "glasses", src: "models/glasses.glb" }

    ],
    fonts: [
        { alias: "clear_sans", src: "fonts/Bebas_Neue_Cyrillic.ttf" },
    ],
    sounds: [
        { alias: "collect", src: "sounds/collect.mp3" },
        { alias: "victory", src: "sounds/victory.mp3" },
        { alias: "exchange", src: "sounds/exchange.mp3" },
        { alias: "lose", src: "sounds/lose.mp3" },
        { alias: "snow_step_1", src: "sounds/snow_step_1.mp3" },
        { alias: "snow_step_2", src: "sounds/snow_step_2.mp3" },
        { alias: "game_sound", src: "sounds/game_music.mp3" }
    ],
    textures: [
        { alias: "smoke", src: "textures/smoke.png" },
        { alias: "mini_star", src: "textures/mini_star.png" },
    ]
};
