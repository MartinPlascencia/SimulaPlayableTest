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
                { alias: "coin", src: "sprites/coin.webp" },
                { alias: "money", src: "sprites/money.webp" },
                { alias: "final_text", src: "sprites/final_text.png" },
                { alias: "hints_background", src: "sprites/hints_background.png" },
                { alias: "logo", src: "sprites/logo.png" }
            ]
        }
    ],
    models: [
        { alias: "gorilla_animated", src: "models/monkey_animated.glb" },
        { alias: "gem", src: "models/gem.glb" },
        { alias: "bone", src: "models/bone.glb" },
        { alias: "lolipop", src: "models/lolipop.glb" },
        { alias: "slot_machine", src: "models/slotmachine.glb" },
        { alias: "arrow", src: "models/arrow.glb" },
        { alias: "coin", src: "models/coin.glb" },
        { alias: "gorilla_logo", src: "models/gorilla_logo.glb" }

    ],
    fonts: [
        { alias: "clear_sans", src: "fonts/Bebas_Neue_Cyrillic.ttf" },
    ],
    sounds: [
        { alias: "collect", src: "sounds/collect.mp3" },
        { alias: "congratulations", src: "sounds/congratulations.mp3" },
        { alias: "exchange", src: "sounds/exchange.mp3" },
        { alias: "snow_step_1", src: "sounds/snow_step_1.mp3" },
        { alias: "snow_step_2", src: "sounds/snow_step_2.mp3" },
        { alias: "gorilla_game_song", src: "sounds/gorilla_game_song.mp3" }
    ],
    textures: [
        { alias: "smoke", src: "textures/smoke.png" },
        { alias: "mini_star", src: "textures/mini_star.png" },
    ]
};
