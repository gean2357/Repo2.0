// Discord Voice Connection & Audio Analyzer Module
const VOICE_RTC_CONFIG = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' }
  ]
};

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

    // WebRTC Real-time P2P Audio Mesh
    this.voicePeerConnections = new Map(); // remoteClientId -> RTCPeerConnection
    this.remoteAudioElements = new Map();  // remoteClientId -> HTMLAudioElement
    this.iceQueues = new Map();            // remoteClientId -> Array of candidates
    this.userVolumes = new Map();          // peerId -> volume percent (0-100)

    this.initElements();
    this.setupListeners();
    this.initVolumeMenu();
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

    // WebRTC Voice Signaling Listeners
    window.addEventListener('discord_webrtc_voice_offer', (e) => this.handleVoiceOffer(e.detail));
    window.addEventListener('discord_webrtc_voice_answer', (e) => this.handleVoiceAnswer(e.detail));
    window.addEventListener('discord_webrtc_voice_ice_candidate', (e) => this.handleVoiceIceCandidate(e.detail));

    // Desconecta peers ao sair
    window.addEventListener('discord_voice_leave', (e) => {
      if (e && e.detail && e.detail.userId) {
        this.closeVoicePeer(e.detail.userId);
      }
    });
    window.addEventListener('discord_user_disconnect', (e) => {
      if (e && e.detail && e.detail.userId) {
        this.closeVoicePeer(e.detail.userId);
      }
    });

    // Escuta sincronização em tempo real de voz entre usuários
    window.addEventListener('discord_voice_updated', (e) => {
      this.renderVoiceParticipants();
      if (this.currentChannelId && e && e.detail) {
        const detail = e.detail;
        if (detail.channelId === this.currentChannelId) {
          const peerId = detail.userId;
          if (peerId && peerId !== window.discordStore.clientId && peerId !== window.discordStore.user.id) {
            if (!this.voicePeerConnections.has(peerId)) {
              this.createVoiceOfferToPeer(peerId);
            }
          }
        }
      }
    });

    window.addEventListener('discord_speaking_state', (e) => {
      this.updateSpeakingIndicators(e.detail);
    });

    // Muta o microfone imediatamente se o usuário for colocado de castigo
    window.addEventListener('discord_member_timeout', () => {
      const server = window.discordStore.getCurrentServer();
      const myId = window.discordStore.user ? window.discordStore.user.id : 'me';
      if (server && window.discordStore.isMemberTimedOut(server.id, myId)) {
        this.isMuted = true;
        if (this.micStream) {
          this.micStream.getAudioTracks().forEach(t => t.enabled = false);
        }
        this.setSpeaking(false);
        this.updateAudioIcons();
      }
    });
  }

  async joinVoiceChannel(channelId) {
    if (this.currentChannelId === channelId) return;

    const server = window.discordStore.getCurrentServer();
    const myId = window.discordStore.user ? window.discordStore.user.id : 'me';
    if (server && !window.discordStore.hasPermission(server.id, myId, 'CONNECT_VOICE')) {
      alert('⛔ Você não tem permissão para conectar neste canal de voz.');
      return;
    }

    // If already in another voice channel, leave first
    if (this.currentChannelId) {
      this.leaveVoiceChannel(false);
    }

    this.currentChannelId = channelId;
    window.discordStore.currentVoiceChannelId = channelId;
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

    // Add local user to store voice participants
    window.discordStore.setVoiceParticipant(channelId, window.discordStore.user, window.discordStore.clientId);

    // Render voice participants
    this.renderVoiceParticipants();

    // Broadcast voice join
    window.discordStore.sendWs({
      type: 'voice_join',
      channelId: channelId,
      user: window.discordStore.user
    });

    // Inicia conexões WebRTC de áudio P2P com todos os participantes já no canal de voz
    const participants = window.discordStore.getVoiceParticipants(channelId);
    participants.forEach(p => {
      const peerId = p.clientId || p.id;
      if (peerId && peerId !== window.discordStore.clientId && peerId !== window.discordStore.user.id) {
        this.createVoiceOfferToPeer(peerId);
      }
    });

    console.log(`Conectado ao canal de voz: ${chanName}`);
  }

  leaveVoiceChannel(playSound = true) {
    if (!this.currentChannelId) return;

    if (playSound && window.discordAudio) {
      window.discordAudio.playLeave();
    }

    // Fecha todas as conexões WebRTC e remove os elementos de áudio dos amigos
    this.voicePeerConnections.forEach(pc => {
      try { pc.close(); } catch (e) {}
    });
    this.voicePeerConnections.clear();

    this.remoteAudioElements.forEach(audio => {
      try {
        audio.srcObject = null;
        audio.remove();
      } catch (e) {}
    });
    this.remoteAudioElements.clear();
    this.iceQueues.clear();

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

    // Remove local user from store
    window.discordStore.removeVoiceParticipant(oldChannelId, window.discordStore.user.id, window.discordStore.clientId);

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
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.warn('Microfone não acessível (necessário HTTPS ou liberação de Secure Context no navegador).');
      return;
    }
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

      const server = window.discordStore.getCurrentServer();
      const myId = window.discordStore.user ? window.discordStore.user.id : 'me';
      if (server && window.discordStore.isMemberTimedOut(server.id, myId)) {
        this.setSpeaking(false);
        this.isMuted = true;
        if (this.micStream) {
          this.micStream.getAudioTracks().forEach(t => t.enabled = false);
        }
        this.updateAudioIcons();
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
    const server = window.discordStore.getCurrentServer();
    const myId = window.discordStore.user ? window.discordStore.user.id : 'me';

    if (server && this.isMuted) {
      if (window.discordStore.isMemberTimedOut(server.id, myId)) {
        const remaining = window.discordStore.getMemberTimeoutRemaining(server.id, myId);
        alert(`⛔ Você está de castigo por mais ${remaining} segundos e não pode falar nos canais de voz.`);
        return;
      }
      if (!window.discordStore.hasPermission(server.id, myId, 'SPEAK_VOICE')) {
        alert('⛔ Você não tem permissão para falar nos canais de voz deste servidor.');
        return;
      }
    }

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

    // Silencia ou reativa os áudios remotos de todos os amigos na call
    this.remoteAudioElements.forEach(audio => {
      audio.muted = this.isDeafened;
    });

    this.updateAudioIcons();
  }

  // =========================================================
  // WebRTC Mesh P2P Real Audio Streaming
  // =========================================================
  createVoicePeerConnection(peerId) {
    if (this.voicePeerConnections.has(peerId)) {
      try { this.voicePeerConnections.get(peerId).close(); } catch (e) {}
    }

    const pc = new RTCPeerConnection(VOICE_RTC_CONFIG);
    this.voicePeerConnections.set(peerId, pc);

    // Adiciona faixa de áudio do microfone local à conexão P2P
    if (this.micStream) {
      this.micStream.getAudioTracks().forEach(track => {
        pc.addTrack(track, this.micStream);
      });
    }

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        window.discordStore.sendWs({
          type: 'webrtc_voice_ice_candidate',
          targetId: peerId,
          candidate: event.candidate
        });
      }
    };

    pc.ontrack = (event) => {
      console.log(`🔊 [WebRTC Voz] Áudio de voz recebido de ${peerId}!`);
      const stream = (event.streams && event.streams[0]) ? event.streams[0] : new MediaStream([event.track]);
      this.playRemoteVoiceAudio(peerId, stream);
    };

    return pc;
  }

  async createVoiceOfferToPeer(peerId) {
    try {
      const pc = this.createVoicePeerConnection(peerId);
      const offer = await pc.createOffer({ offerToReceiveAudio: true });
      await pc.setLocalDescription(offer);

      window.discordStore.sendWs({
        type: 'webrtc_voice_offer',
        targetId: peerId,
        offer: offer
      });
      console.log(`🎙️ [WebRTC Voz] Oferta de áudio enviada para ${peerId}`);
    } catch (err) {
      console.error(`Erro ao criar oferta de voz para ${peerId}:`, err);
    }
  }

  async handleVoiceOffer(detail) {
    if (!this.currentChannelId) return;
    const fromId = detail.fromId;
    console.log(`🎙️ [WebRTC Voz] Oferta de áudio recebida de ${fromId}`);

    try {
      const pc = this.createVoicePeerConnection(fromId);
      await pc.setRemoteDescription(new RTCSessionDescription(detail.offer));
      this.drainIceQueue(fromId, pc);

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      window.discordStore.sendWs({
        type: 'webrtc_voice_answer',
        targetId: fromId,
        answer: answer
      });
      console.log(`🎙️ [WebRTC Voz] Resposta de áudio enviada para ${fromId}`);
    } catch (err) {
      console.error(`Erro ao responder oferta de voz de ${fromId}:`, err);
    }
  }

  async handleVoiceAnswer(detail) {
    const fromId = detail.fromId;
    const pc = this.voicePeerConnections.get(fromId);
    if (pc && pc.signalingState !== 'closed') {
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(detail.answer));
        this.drainIceQueue(fromId, pc);
        console.log(`✅ [WebRTC Voz] Áudio P2P conectado com sucesso com ${fromId}!`);
      } catch (err) {
        console.error(`Erro ao processar resposta de áudio de ${fromId}:`, err);
      }
    }
  }

  async handleVoiceIceCandidate(detail) {
    const fromId = detail.fromId;
    const pc = this.voicePeerConnections.get(fromId);
    if (pc && pc.remoteDescription && detail.candidate) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(detail.candidate));
      } catch (err) {
        console.warn('Erro ao adicionar ICE candidate de voz:', err);
      }
    } else if (detail.candidate) {
      if (!this.iceQueues.has(fromId)) {
        this.iceQueues.set(fromId, []);
      }
      this.iceQueues.get(fromId).push(detail.candidate);
    }
  }

  drainIceQueue(peerId, pc) {
    if (this.iceQueues.has(peerId)) {
      const queue = this.iceQueues.get(peerId);
      queue.forEach(candidate => {
        try {
          pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {}
      });
      this.iceQueues.delete(peerId);
    }
  }

  playRemoteVoiceAudio(peerId, stream) {
    let audio = this.remoteAudioElements.get(peerId);
    if (!audio) {
      audio = document.createElement('audio');
      audio.autoplay = true;
      audio.playsInline = true;
      audio.id = `remote_voice_audio_${peerId}`;
      audio.style.display = 'none';
      document.body.appendChild(audio);
      this.remoteAudioElements.set(peerId, audio);
    }
    audio.srcObject = stream;
    audio.muted = this.isDeafened;

    // Define volume padrão confortável (75%) para não começar estourado
    const savedVol = this.userVolumes.has(peerId) ? this.userVolumes.get(peerId) : 75;
    audio.volume = Math.min(1.0, Math.max(0.0, savedVol / 100));

    audio.play().catch(e => {
      console.log(`Áudio de voz aguardando interação do usuário para reproduzir:`, e);
      const unlockAudio = () => {
        audio.play().catch(() => {});
        document.removeEventListener('click', unlockAudio);
      };
      document.addEventListener('click', unlockAudio, { once: true });
    });
  }

  closeVoicePeer(peerId) {
    if (this.voicePeerConnections.has(peerId)) {
      try { this.voicePeerConnections.get(peerId).close(); } catch (e) {}
      this.voicePeerConnections.delete(peerId);
    }
    if (this.remoteAudioElements.has(peerId)) {
      try {
        const audio = this.remoteAudioElements.get(peerId);
        audio.srcObject = null;
        audio.remove();
      } catch (e) {}
      this.remoteAudioElements.delete(peerId);
    }
    this.iceQueues.delete(peerId);
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
    // Show connected users under every voice channel in sidebar (exactly like Discord!)
    document.querySelectorAll('[data-voice-list]').forEach(listEl => {
      const chanId = listEl.getAttribute('data-voice-list');
      const participants = window.discordStore.getVoiceParticipants(chanId);
      const myUser = window.discordStore.user;
      const isMeHere = this.currentChannelId === chanId;

      // Make sure local user is displayed in active channel
      const allList = [...participants];
      if (isMeHere && !allList.some(p => p.id === myUser.id)) {
        allList.push({
          ...myUser,
          isSpeaking: this.isSpeaking,
          isMuted: this.isMuted,
          isStreaming: window.discordStream && window.discordStream.isStreaming
        });
      }

      if (allList.length === 0) {
        listEl.innerHTML = '';
        return;
      }

      listEl.innerHTML = allList.map(u => {
        const isMe = u.id === myUser.id;
        const isSpeaking = isMe ? this.isSpeaking : u.isSpeaking;
        const isMuted = isMe ? this.isMuted : u.isMuted;
        const isStreaming = isMe ? (window.discordStream && window.discordStream.isStreaming) : u.isStreaming;

        return `
          <div class="flex items-center space-x-2 py-1 px-2 mx-1 rounded hover:bg-[#35373c]/60 cursor-pointer text-xs font-medium text-[#dbdee1] transition group select-none"
               oncontextmenu="window.discordVoice.openUserVolumeMenu(event, '${u.clientId || u.id}', '${u.username}', '${u.avatar}')"
               onclick="if (event.detail === 2 || window.innerWidth < 768) window.discordVoice.openUserVolumeMenu(event, '${u.clientId || u.id}', '${u.username}', '${u.avatar}')">
            <div class="relative flex-shrink-0" onclick="event.stopPropagation(); window.discordVoice.openUserVolumeMenu(event, '${u.clientId || u.id}', '${u.username}', '${u.avatar}')" title="Clique ou clique com botão direito para ajustar volume">
              <img src="${u.avatar}" class="w-6 h-6 rounded-full object-cover transition-all ${isSpeaking ? 'ring-2 ring-[#23a55a]' : ''} ${isMe ? 'voice-user-me' : ''}" alt="${u.username}" />
            </div>
            <span class="truncate flex-1 ${isSpeaking ? 'text-[#23a55a] font-bold' : 'text-[#dbdee1]'}" title="${u.username}">${u.username}</span>
            ${isStreaming ? `
              <button onclick="event.stopPropagation(); window.discordStream.startWatchingRemote('${u.clientId || u.id}', '${u.username}')" class="px-1.5 py-0.5 text-[9px] font-bold uppercase rounded bg-[#f23f43] hover:bg-[#da373c] text-white flex items-center space-x-0.5 cursor-pointer shadow transition" title="Clique para assistir">
                <span>AO VIVO</span>
              </button>
            ` : ''}
            ${isMuted ? '<svg class="w-3.5 h-3.5 text-red-500" fill="currentColor" viewBox="0 0 24 24"><path d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17c0-.06.02-.11.02-.17V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.18l5.98 5.99zM4.27 3L3 4.27l6.01 6.01V11c0 1.66 1.33 3 2.99 3 .22 0 .44-.03.65-.08l1.66 1.66c-.71.33-1.5.52-2.31.52-2.76 0-5.3-2.1-5.3-5.1H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c.91-.13 1.77-.45 2.54-.9L19.73 21 21 19.73 4.27 3z"/></svg>' : ''}
          </div>
        `;
      }).join('');
    });
  }

  initVolumeMenu() {
    this.userVolumes = new Map();
    this.currentMenuPeerId = null;

    document.addEventListener('click', (e) => {
      const menu = document.getElementById('userVoiceVolumeMenu');
      if (menu && !menu.classList.contains('hidden') && !menu.contains(e.target)) {
        menu.classList.add('hidden');
      }
    });

    const slider = document.getElementById('userVolumeSlider');
    const label = document.getElementById('userVolumePercentLabel');
    if (slider) {
      slider.addEventListener('input', () => {
        if (!this.currentMenuPeerId) return;
        const val = parseInt(slider.value, 10);
        if (label) label.textContent = `${val}%`;
        this.setUserVolume(this.currentMenuPeerId, val);
      });
    }

    const btnMute = document.getElementById('btnMuteTargetUser');
    if (btnMute) {
      btnMute.addEventListener('click', () => {
        if (!this.currentMenuPeerId) return;
        const currentVal = this.userVolumes.get(this.currentMenuPeerId) || 0;
        if (currentVal > 0) {
          this.userVolumes.set(this.currentMenuPeerId + '_prev', currentVal);
          this.setUserVolume(this.currentMenuPeerId, 0);
          if (slider) slider.value = 0;
          if (label) label.textContent = '0%';
          btnMute.textContent = 'Reativar Áudio';
          btnMute.className = 'px-2.5 py-1 text-xs rounded bg-red-600/30 text-red-400 font-bold hover:bg-red-600/50 transition';
        } else {
          const prev = this.userVolumes.get(this.currentMenuPeerId + '_prev') || 75;
          this.setUserVolume(this.currentMenuPeerId, prev);
          if (slider) slider.value = prev;
          if (label) label.textContent = `${prev}%`;
          btnMute.textContent = 'Silenciar';
          btnMute.className = 'px-2.5 py-1 text-xs rounded bg-[#2b2d31] hover:bg-[#35373c] text-[#dbdee1] transition';
        }
      });
    }
  }

  setUserVolume(peerId, val) {
    this.userVolumes.set(peerId, val);
    const audio = this.remoteAudioElements.get(peerId);
    if (audio) {
      audio.volume = Math.min(1.0, Math.max(0.0, val / 100));
    }
  }

  openUserVolumeMenu(e, peerId, username, avatar) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const menu = document.getElementById('userVoiceVolumeMenu');
    if (!menu) return;

    // Se for o próprio usuário, não abre o menu de volume
    if (peerId === window.discordStore.user.id || peerId === window.discordStore.clientId || peerId === 'me') {
      return;
    }

    this.currentMenuPeerId = peerId;

    const nameEl = document.getElementById('userVolumeName');
    const avatarEl = document.getElementById('userVolumeAvatar');
    const slider = document.getElementById('userVolumeSlider');
    const label = document.getElementById('userVolumePercentLabel');
    const btnMute = document.getElementById('btnMuteTargetUser');

    if (nameEl) nameEl.textContent = username || 'Usuário';
    if (avatarEl) avatarEl.src = avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(username || 'user')}`;

    const currentVol = this.userVolumes.has(peerId) ? this.userVolumes.get(peerId) : 75;
    if (slider) slider.value = currentVol;
    if (label) label.textContent = `${currentVol}%`;

    if (btnMute) {
      if (currentVol === 0) {
        btnMute.textContent = 'Reativar Áudio';
        btnMute.className = 'px-2.5 py-1 text-xs rounded bg-red-600/30 text-red-400 font-bold hover:bg-red-600/50 transition';
      } else {
        btnMute.textContent = 'Silenciar';
        btnMute.className = 'px-2.5 py-1 text-xs rounded bg-[#2b2d31] hover:bg-[#35373c] text-[#dbdee1] transition';
      }
    }

    menu.classList.remove('hidden');
    const menuWidth = 260;
    const menuHeight = 180;
    let x = (e && e.clientX) ? e.clientX : window.innerWidth / 2 - 130;
    let y = (e && e.clientY) ? e.clientY : window.innerHeight / 2 - 90;

    if (x + menuWidth > window.innerWidth) x = window.innerWidth - menuWidth - 10;
    if (y + menuHeight > window.innerHeight) y = window.innerHeight - menuHeight - 10;
    if (x < 10) x = 10;
    if (y < 10) y = 10;

    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;
  }

  updateSpeakingIndicators(data) {
    this.renderVoiceParticipants();
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.discordVoice = new DiscordVoiceManager();
});
