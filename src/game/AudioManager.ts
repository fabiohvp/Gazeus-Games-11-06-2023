import { AUDIO_ELEMENT_ID } from "./constant";

class AudioManager implements IAudioManager {
  private audio: HTMLAudioElement;
  private playingPriority = false;
  playing = false;

  constructor() {
    this.audio = document.querySelector(`#${AUDIO_ELEMENT_ID}`)!;

    if (!this.audio) {
      this.audio = document.createElement("audio");
      this.audio.id = AUDIO_ELEMENT_ID;
      document.body.appendChild(this.audio);
    }
  }

  async load(sounds: string[]) {
    const promises: Promise<void>[] = [];

    for (const sound of sounds) {
      const audio = new Audio();

      let promiseResolve: IPromiseResolve;
      const promise = new Promise<void>((resolve) => {
        promiseResolve = resolve;
      });
      const onSoundLoad = () => {
        promiseResolve();
        audio.removeEventListener("loadedmetadata", onSoundLoad);
      };
      audio.addEventListener("loadedmetadata", onSoundLoad, false);
      audio.preload = "auto";
      audio.src = sound;
      promises.push(promise);
    }
    await Promise.all(promises);
  }

  loop() {
    this.audio.loop = true;
  }

  mute(muted: boolean) {
    this.audio.muted = !muted;
  }

  play(sound: string, priority = false) {
    if (priority) {
      this.playingPriority = true;
      this.audio.addEventListener("ended", this.onPlayingPriorityEnded);
    } else {
      if (this.playingPriority) return;
    }
    this.audio.loop = false;
    this.audio.src = sound;
    this.audio.play();
    this.playing = true;
  }

  stop() {
    this.playing = false;
    this.audio.pause();
  }

  private onPlayingPriorityEnded = () => {
    this.playingPriority = false;
    this.audio.removeEventListener("ended", this.onPlayingPriorityEnded);
  };
}

export const audioManager = new AudioManager();
