// Discord Go Live (Screen Sharing & WebRTC Broadcast) Module
class DiscordStreamManager {
  constructor() {
    this.localStream = null;
    this.screenTrack = null;
    this.audioTrack = null;
    this.isStreaming = false;
    this.activeChannelId = null;
    this.streamQuality = '1080p';
    this.streamFps = 60;
    this.peerConnections = new Map(); // remote peer WebRTC connections

    this.initElements();
    this.setupListeners();
  }

  initElements() {
    this.stage = document.getElementById('goLiveStage');
    this.videoElem = document.getElementById('goLiveVideo');
    this.streamControls = document.getElementById('streamControls');
    this.streamHeader = document.getElementById('streamHeader');
    this.streamQualityBadge = document.getElementById('streamQualityBadge');
    this.btnStopStream = document.getElementById('btnStopStream');
    this.btnFullscreen = document.getElementById('btnFullscreen');
    this.btnPip = document.getElementById('btnPip');
    this.btnGoLiveModal = document.getElementById('btnGoLiveModal');
    this.goLiveModal = document.getElementById('goLiveModal');
    this.btnStartLiveAction = document.getElementById('btnStartLiveAction');
    this.closeGoLiveModal = document.getElementById('closeGoLiveModal');
  }

  setupListeners() {
    if (this.btnGoLiveModal) {
      this.btnGoLiveModal.addEventListener('click', () => this.openGoLiveDialog());
    }

    if (this.closeGoLiveModal) {
      this.closeGoLiveModal.addEventListener('click', () => this.hideGoLiveDialog());
    }

    if (this.btnStartLiveAction) {
      this.btnStartLiveAction.addEventListener('click', () => {
        this.hideGoLiveDialog();
        this.startScreenShare();
      });
    }

    if (this.btnStopStream) {
      this.btnStopStream.addEventListener('click', () => this.stopScreenShare());
    }

    if (this.btnFullscreen && this.videoElem) {
      this.btnFullscreen.addEventListener('click', () => {
        if (!document.fullscreenElement) {
          if (this.stage.requestFullscreen) {
            this.stage.requestFullscreen();
          } else if (this.videoElem.requestFullscreen) {
            this.videoElem.requestFullscreen();
          }
        } else {
          document.exitFullscreen();
        }
      });
    }

    if (this.btnPip && this.videoElem) {
      this.btnPip.addEventListener('click', async () => {
        try {
          if (document.pictureInPictureElement) {
            await document.exitPictureInPicture();
          } else if (document.pictureInPictureEnabled && this.videoElem.readyState >= 2) {
            await this.videoElem.requestPictureInPicture();
          }
        } catch (err) {
          console.warn('PiP error:', err);
        }
      });
    }

    // Remote stream events from other clients
    window.addEventListener('discord_remote_stream_started', (e) => {
      this.handleRemoteStream(e.detail);
    });

    window.addEventListener('discord_remote_stream_stopped', (e) => {
      this.handleRemoteStreamStopped(e.detail);
    });
  }

  openGoLiveDialog() {
    if (this.isStreaming) {
      this.stopScreenShare();
      return;
    }

    // Ensure user is in a voice channel first or join default
    if (!window.discordStore.currentVoiceChannelId) {
      // Automatically connect to first voice channel
      const server = window.discordStore.getCurrentServer();
      const voiceCat = server.categories.find(c => c.name.toLowerCase().includes('voz'));
      if (voiceCat && voiceCat.channels.length > 0) {
        window.discordVoice.joinVoiceChannel(voiceCat.channels[0].id);
      }
    }

    if (this.goLiveModal) {
      this.goLiveModal.classList.remove('hidden');
      this.goLiveModal.classList.add('flex');
    }
  }

  hideGoLiveDialog() {
    if (this.goLiveModal) {
      this.goLiveModal.classList.add('hidden');
      this.goLiveModal.classList.remove('flex');
    }
  }

  async startScreenShare() {
    try {
      // Read user selected settings from dialog
      const qualityEl = document.querySelector('input[name="stream_quality"]:checked');
      const fpsEl = document.querySelector('input[name="stream_fps"]:checked');
      
      this.streamQuality = qualityEl ? qualityEl.value : '1080p';
      this.streamFps = fpsEl ? parseInt(fpsEl.value, 10) : 60;

      const constraints = {
        video: {
          cursor: 'always',
          frameRate: { ideal: this.streamFps, max: 60 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 48000
        }
      };

      if (this.streamQuality === '1080p') {
        constraints.video.width = { ideal: 1920 };
        constraints.video.height = { ideal: 1080 };
      } else if (this.streamQuality === '720p') {
        constraints.video.width = { ideal: 1280 };
        constraints.video.height = { ideal: 720 };
      }

      console.log('Solicitando captura de tela para Go Live com:', constraints);

      // Invoke Browser Display Media API
      this.localStream = await navigator.mediaDevices.getDisplayMedia(constraints);
      this.screenTrack = this.localStream.getVideoTracks()[0];
      this.audioTrack = this.localStream.getAudioTracks()[0] || null;

      // Handle user stopping screen share via native browser UI bar
      this.screenTrack.onended = () => {
        console.log('Compartilhamento de tela finalizado pelo usuário no navegador');
        this.stopScreenShare();
      };

      this.isStreaming = true;
      this.activeChannelId = window.discordStore.currentVoiceChannelId;

      // Update video element
      if (this.videoElem) {
        this.videoElem.srcObject = this.localStream;
        await this.videoElem.play().catch(e => console.log('Video play catch:', e));
      }

      // Show stage
      if (this.stage) {
        this.stage.classList.remove('hidden');
        this.stage.classList.add('flex');
      }

      // Update quality badge
      if (this.streamQualityBadge) {
        this.streamQualityBadge.textContent = `${this.streamQuality} ${this.streamFps}FPS`;
      }

      // Update Go Live buttons UI in sidebar
      this.updateGoLiveButtonUI(true);

      // Play Discord signature fanfare sound
      if (window.discordAudio) {
        window.discordAudio.playGoLive();
      }

      // Update store user state
      window.discordStore.updateUser({ isStreaming: true });

      // Notify peers via WebSocket & BroadcastChannel
      window.discordStore.sendWs({
        type: 'stream_started',
        channelId: this.activeChannelId,
        quality: `${this.streamQuality} ${this.streamFps}fps`,
        user: window.discordStore.user
      });

      // Post system announcement in current chat channel
      const curChan = window.discordStore.getCurrentChannel();
      if (curChan && curChan.type === 'text') {
        window.discordStore.addMessage(
          curChan.id,
          `🔴 **${window.discordStore.user.username}** iniciou uma transmissão **Go Live**! Venha assistir na sala de voz.`,
          null
        );
      }

      console.log('✅ Go Live transmitindo com sucesso!');
    } catch (err) {
      console.error('Falha ao iniciar compartilhamento de tela:', err);
      if (err.name !== 'NotAllowedError') {
        alert('Não foi possível iniciar a transmissão de tela: ' + err.message);
      }
    }
  }

  stopScreenShare() {
    if (!this.isStreaming) return;

    if (this.screenTrack) {
      this.screenTrack.stop();
      this.screenTrack = null;
    }
    if (this.audioTrack) {
      this.audioTrack.stop();
      this.audioTrack = null;
    }
    if (this.localStream) {
      this.localStream.getTracks().forEach(t => t.stop());
      this.localStream = null;
    }

    if (this.videoElem) {
      this.videoElem.srcObject = null;
    }

    if (this.stage) {
      this.stage.classList.add('hidden');
      this.stage.classList.remove('flex');
    }

    this.isStreaming = false;
    this.updateGoLiveButtonUI(false);

    if (window.discordAudio) {
      window.discordAudio.playLeave();
    }

    window.discordStore.updateUser({ isStreaming: false });

    window.discordStore.sendWs({
      type: 'stream_stopped',
      channelId: this.activeChannelId,
      user: window.discordStore.user
    });

    console.log('Transmissão Go Live encerrada');
  }

  updateGoLiveButtonUI(streaming) {
    const btns = document.querySelectorAll('.btn-screen-share');
    btns.forEach(btn => {
      if (streaming) {
        btn.classList.add('bg-red-500', 'text-white', 'hover:bg-red-600');
        btn.classList.remove('bg-[#2b2d31]', 'hover:bg-[#35373c]');
        btn.innerHTML = `
          <svg class="w-5 h-5 mr-1 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
            <path d="M4 4h16a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm0 2v10h16V6H4zm6 13h4v2h-4v-2z"/>
          </svg>
          <span>Parar Transmissão</span>
        `;
      } else {
        btn.classList.remove('bg-red-500', 'text-white', 'hover:bg-red-600');
        btn.classList.add('bg-[#2b2d31]', 'hover:bg-[#35373c]');
        btn.innerHTML = `
          <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
          </svg>
          <span>Tela</span>
        `;
      }
    });

    // Update voice bar indicator
    const liveIndicator = document.getElementById('voiceLiveBadge');
    if (liveIndicator) {
      if (streaming) {
        liveIndicator.classList.remove('hidden');
      } else {
        liveIndicator.classList.add('hidden');
      }
    }
  }

  handleRemoteStream(detail) {
    console.log('Stream remoto detectado:', detail);
    // Show stream badge in voice channel
    const chanElem = document.querySelector(`[data-channel-id="${detail.stream?.channelId}"]`);
    if (chanElem) {
      let badge = chanElem.querySelector('.live-badge-tag');
      if (!badge) {
        badge = document.createElement('span');
        badge.className = 'live-badge-tag ml-auto px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-[#f23f43] text-white flex items-center animate-pulse-live';
        badge.textContent = 'AO VIVO';
        chanElem.appendChild(badge);
      }
    }
  }

  handleRemoteStreamStopped(detail) {
    const badges = document.querySelectorAll('.live-badge-tag');
    badges.forEach(b => b.remove());
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.discordStream = new DiscordStreamManager();
});
