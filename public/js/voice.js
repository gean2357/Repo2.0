// Discord Voice Connection & Audio Analyzer Module
class DiscordVoiceManager {
  constructor() {
    this.currentChannelId = null;
    this.micStream = null;
    this.audioContext = null;
    this.analyser = null;
    this.isMuted = false;
    this.isDeafened = false;
    this.isSpeaking = false;
    this.isCameraActive = false;
    this.cameraStream = null;

    this.initElements();
    this.setupListeners();
  }

  initElements() {
    this.voiceBar = document.getElementById('voiceConnectionBar');
    this.voiceChannelTitle = document.getElementById('voiceConnectedChannelTitle');
    this.voicePingElem = document.getElementById('voicePingIndicator');
    this.btnDisconnectVoice = document.getElementById('btnDisconnectVoice');
    this.btnToggleMic = document.getElementById('btnToggleMic');
    this.btnToggleDeafen = document.getElementById('btnToggleDeafen');
    this.btnToggleCamera = document.getElementById('btnToggleCamera');
    this.voiceUsersContainer = document.getElementById('voiceUsersContainer');
  }

  setupListeners() {
    if (this.btnDisconnectVoice) {
      this.btnDisconnectVoice.addEventListener('click', () => this.leaveVoiceChannel());
    }

    if (this.btnToggleMic) {
      this.btnToggleMic.addEventListener('click', () => this.toggleMute());
    }

    if (this.btnToggleDeafen) {
      this.btnToggleDeafen.addEventListener('click', () => this.toggleDeafen());
    }

    if (this.btnToggleCamera) {
      this.btnToggleCamera.addEventListener('click', () => this.toggleCamera());
    }
  }

  async joinVoiceChannel(channelId) {
    if (this.currentChannelId === channelId) return;

    // If already in another voice channel, leave first
    if (this.currentChannelId) {
      this.leaveVoiceChannel(false);
    }

    this.currentChannelId = channelId;
    window.discordStore.currentVoiceChannelId = channelId;

    // Find channel info
    const server = window.discordStore.getCurrentServer();
    let chanObj = null;
    for (const cat of server.categories) {
      const found = cat.channels.find(c => c.id === channelId);
      if (found) {
        chanObj = found;
        break;
      }
    }

    const chanName = chanObj ? chanObj.name : 'Sala de Voz';

    // Play Discord join sound
    if (window.discordAudio) {
      window.discordAudio.playJoin();
    }

    // Show voice connection bar
    if (this.voiceBar) {
      this.voiceBar.classList.remove('hidden');
      this.voiceBar.classList.add('flex');
    }
    if (this.voiceChannelTitle) {
      this.voiceChannelTitle.textContent = `${chanName} / ${server.name}`;
    }

    // Ping simulation
    if (this.voicePingElem) {
      this.voicePingElem.textContent = `${Math.floor(Math.random() * 15) + 18} ms`;
    }

    // Highlight active voice channel in sidebar
    document.querySelectorAll('.channel-voice-item').forEach(el => {
      if (el.getAttribute('data-channel-id') === channelId) {
        el.classList.add('bg-[#35373c]', 'text-[#f2f3f5]');
      } else {
        el.classList.remove('bg-[#35373c]', 'text-[#f2f3f5]');
      }
    });

    // Start voice input capture & audio analysis
    await this.startMicrophone();

    // Render voice participants
    this.renderVoiceParticipants();

    // Broadcast voice join
    window.discordStore.sendWs({
      type: 'voice_join',
      channelId: channelId,
      user: window.discordStore.user
    });

    console.log(`Conectado ao canal de voz: ${chanName}`);
  }

  leaveVoiceChannel(playSound = true) {
    if (!this.currentChannelId) return;

    if (playSound && window.discordAudio) {
      window.discordAudio.playLeave();
    }

    // If streaming, stop stream
    if (window.discordStream && window.discordStream.isStreaming) {
      window.discordStream.stopScreenShare();
    }

    // Stop camera
    if (this.cameraStream) {
      this.cameraStream.getTracks().forEach(t => t.stop());
      this.cameraStream = null;
      this.isCameraActive = false;
    }

    // Stop microphone
    this.stopMicrophone();

    const oldChannelId = this.currentChannelId;
    this.currentChannelId = null;
    window.discordStore.currentVoiceChannelId = null;

    // Hide voice connection bar
    if (this.voiceBar) {
      this.voiceBar.classList.add('hidden');
      this.voiceBar.classList.remove('flex');
    }

    // Reset voice channel active styling
    document.querySelectorAll('.channel-voice-item').forEach(el => {
      el.classList.remove('bg-[#35373c]', 'text-[#f2f3f5]');
    });

    this.renderVoiceParticipants();

    // Broadcast voice leave
    window.discordStore.sendWs({
      type: 'voice_leave',
      channelId: oldChannelId,
      user: window.discordStore.user
    });

    console.log('Desconectado do canal de voz');
  }

  async startMicrophone() {
    try {
      this.micStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      // Voice Activity Detection with Web Audio API
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.audioContext = new AudioCtx();
        const source = this.audioContext.createMediaStreamSource(this.micStream);
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 256;
        source.connect(this.analyser);

        this.startVoiceActivityDetection();
      }
    } catch (err) {
      console.warn('Microfone não acessível ou permissão negada:', err.message);
    }
  }

  stopMicrophone() {
    if (this.micStream) {
      this.micStream.getTracks().forEach(t => t.stop());
      this.micStream = null;
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      try {
        this.audioContext.close();
      } catch (e) {}
      this.audioContext = null;
    }
    this.setSpeaking(false);
  }

  startVoiceActivityDetection() {
    if (!this.analyser) return;

    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const checkAudio = () => {
      if (!this.micStream || !this.currentChannelId) return;

      if (this.isMuted) {
        this.setSpeaking(false);
        requestAnimationFrame(checkAudio);
        return;
      }

      this.analyser.getByteFrequencyData(dataArray);
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      const average = sum / bufferLength;

      // Threshold for voice activity
      const isNowSpeaking = average > 18;
      if (isNowSpeaking !== this.isSpeaking) {
        this.setSpeaking(isNowSpeaking);
      }

      requestAnimationFrame(checkAudio);
    };

    checkAudio();
  }

  setSpeaking(speaking) {
    this.isSpeaking = speaking;
    const myAvatars = document.querySelectorAll('.my-avatar-img, .voice-user-me');
    myAvatars.forEach(el => {
      if (speaking) {
        el.classList.add('speaking-active');
      } else {
        el.classList.remove('speaking-active');
      }
    });

    window.discordStore.sendWs({
      type: 'speaking_state',
      speaking: speaking,
      user: window.discordStore.user
    });
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.micStream) {
      this.micStream.getAudioTracks().forEach(t => {
        t.enabled = !this.isMuted;
      });
    }

    if (this.isMuted) {
      window.discordAudio.playMute();
    } else {
      window.discordAudio.playUnmute();
    }

    this.updateAudioIcons();
  }

  toggleDeafen() {
    this.isDeafened = !this.isDeafened;
    if (this.isDeafened) {
      this.isMuted = true;
      if (this.micStream) {
        this.micStream.getAudioTracks().forEach(t => t.enabled = false);
      }
      window.discordAudio.playMute();
    } else {
      window.discordAudio.playUnmute();
    }

    this.updateAudioIcons();
  }

  updateAudioIcons() {
    const micBtn = document.getElementById('btnToggleMic');
    const deafenBtn = document.getElementById('btnToggleDeafen');

    if (micBtn) {
      if (this.isMuted) {
        micBtn.classList.add('text-red-500');
        micBtn.classList.remove('text-[#b5bac1]');
        micBtn.innerHTML = `
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17c0-.06.02-.11.02-.17V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.18l5.98 5.99zM4.27 3L3 4.27l6.01 6.01V11c0 1.66 1.33 3 2.99 3 .22 0 .44-.03.65-.08l1.66 1.66c-.71.33-1.5.52-2.31.52-2.76 0-5.3-2.1-5.3-5.1H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c.91-.13 1.77-.45 2.54-.9L19.73 21 21 19.73 4.27 3z"/>
          </svg>
        `;
      } else {
        micBtn.classList.remove('text-red-500');
        micBtn.classList.add('text-[#b5bac1]');
        micBtn.innerHTML = `
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5-3c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
          </svg>
        `;
      }
    }

    if (deafenBtn) {
      if (this.isDeafened) {
        deafenBtn.classList.add('text-red-500');
        deafenBtn.classList.remove('text-[#b5bac1]');
        deafenBtn.innerHTML = `
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 4c3.87 0 7 3.13 7 7 0 .78-.13 1.53-.36 2.23l1.51 1.51C20.67 13.56 21 12.32 21 11c0-4.97-4.03-9-9-9-1.32 0-2.56.33-3.74.85l1.51 1.51c.7-.23 1.45-.36 2.23-.36zM3.27 2.27L2 3.55l3.11 3.11C3.82 8.04 3 9.93 3 12v7c0 1.66 1.34 3 3 3h3v-8H5v-2c0-1.57.57-3.01 1.52-4.13L18.45 20H15v2h3c.48 0 .93-.12 1.34-.32l2.11 2.11 1.28-1.27L3.27 2.27zM7 16H5v-2h2v2zm12 0h-2v-4.17l2 2V16z"/>
          </svg>
        `;
      } else {
        deafenBtn.classList.remove('text-red-500');
        deafenBtn.classList.add('text-[#b5bac1]');
        deafenBtn.innerHTML = `
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 3a9 9 0 00-9 9v7c0 1.66 1.34 3 3 3h3v-8H5v-2c0-3.87 3.13-7 7-7s7 3.13 7 7v2h-4v8h3c1.66 0 3-1.34 3-3v-7a9 9 0 00-9-9z"/>
          </svg>
        `;
      }
    }
  }

  async toggleCamera() {
    this.isCameraActive = !this.isCameraActive;
    if (this.isCameraActive) {
      try {
        this.cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
        console.log('Câmera ativada');
      } catch (e) {
        console.warn('Erro ao abrir câmera:', e);
        this.isCameraActive = false;
      }
    } else {
      if (this.cameraStream) {
        this.cameraStream.getTracks().forEach(t => t.stop());
        this.cameraStream = null;
      }
    }
  }

  renderVoiceParticipants() {
    // Show connected users under voice channel in sidebar
    document.querySelectorAll('.voice-users-list').forEach(el => el.innerHTML = '');

    if (!this.currentChannelId) return;

    const listEl = document.querySelector(`[data-voice-list="${this.currentChannelId}"]`);
    if (listEl) {
      const user = window.discordStore.user;
      const isStreaming = window.discordStream && window.discordStream.isStreaming;

      listEl.innerHTML = `
        <div class="flex items-center space-x-2 py-1 px-2 rounded hover:bg-[#35373c] cursor-pointer text-sm font-medium text-[#dbdee1]">
          <div class="relative">
            <img src="${user.avatar}" class="w-6 h-6 rounded-full voice-user-me ${this.isSpeaking ? 'speaking-active' : ''}" alt="${user.username}" />
          </div>
          <span class="truncate flex-1">${user.username}</span>
          ${isStreaming ? '<span class="px-1 text-[9px] font-bold uppercase rounded bg-[#f23f43] text-white">AO VIVO</span>' : ''}
          ${this.isMuted ? '<svg class="w-3.5 h-3.5 text-red-500" fill="currentColor" viewBox="0 0 24 24"><path d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17c0-.06.02-.11.02-.17V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.18l5.98 5.99zM4.27 3L3 4.27l6.01 6.01V11c0 1.66 1.33 3 2.99 3 .22 0 .44-.03.65-.08l1.66 1.66c-.71.33-1.5.52-2.31.52-2.76 0-5.3-2.1-5.3-5.1H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c.91-.13 1.77-.45 2.54-.9L19.73 21 21 19.73 4.27 3z"/></svg>' : ''}
        </div>
      `;
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.discordVoice = new DiscordVoiceManager();
});
