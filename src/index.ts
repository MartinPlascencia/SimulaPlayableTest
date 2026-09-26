import Game from './Game';
import './index.css';
import { sdk } from '@smoud/playable-sdk';

// Initialize the SDK
sdk.init((width: number, height: number) => {
  // Initialize game with container dimensions
  const game = new Game();
  game.initializeGame(width, height);

  // Set up all event listeners
  sdk.on('resize', game.resize, game);
  sdk.on('pause', game.pause, game);
  sdk.on('resume', game.resume, game);
  sdk.on('volume', game.volume, game);
  //sdk.on('finish', game.finish, game);

  // The SDK's pause/resume events only fire on document.visibilitychange
  // (tab switched/minimized). Window blur/focus catches the remaining case
  // where the browser tab stays visible but loses OS-level focus (e.g. the
  // user alt-tabs to another app, or clicks outside the game's iframe).
  // Using sdk.pause()/sdk.resume() (rather than calling game.pause directly)
  // keeps this in sync with the SDK's own state (e.g. volume muting) and
  // still emits the same 'pause'/'resume' events the game already listens to.
  window.addEventListener('blur', () => sdk.pause());
  window.addEventListener('focus', () => sdk.resume());
});

