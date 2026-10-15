// Discord Go Live (Screen Sharing & WebRTC Broadcast) Module
const RTC_CONFIG = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' }
  ]
};

class DiscordStreamManager {
  constructor() {
    this.localStream = null;
    this.remoteStream = null;
    this.screenTrack = null;
    this.audioTrack = null;
    this.isStreaming = false;
    this.isWatchingRemote = false;
    this.activeChannelId = null;
    this.currentStreamerId = null;
    this.streamQuality = '1080p';
    this.streamFps = 60;
    this.peerConnections = new Map(); // broadcaster: viewerId -> RTCPeerConnection
    this.viewerPc = null; // viewer: RTCPeerConnection to streamer

    this.initElements();
    this.setupListeners();
    this.initPeerJs();
  }

  initElements() {
    this.stage = document.getElementById('goLiveStage');
    this.videoElem = document.getElementById('goLiveVideo');
    this.stageVideoWrapper = document.getElementById('stageVideoWrapper');
    this.streamQualityBadge = document.getElementById('streamQualityBadge');
    this.streamerName = document.getElementById('streamerName');
    this.streamerAvatarImg = document.getElementById('streamerAvatarImg');
    this.streamChannelName = document.getElementById('streamChannelName');
    this.btnStopStream = document.getElementById('btnStopStream');
    this.btnStopStreamText = document.getElementById('btnStopStreamText');
    this.btnFullscreen = document.getElementById('btnFullscreen');
    this.iconFullscreen = document.getElementById('iconFullscreen');
    this.btnTheaterMode = document.getElementById('btnTheaterMode');
    this.btnStreamAspect = document.getElementById('btnStreamAspect');
    this.btnPip = document.getElementById('btnPip');
    this.btnStreamVolume = document.getElementById('btnStreamVolume');
    this.iconStreamVolume = document.getElementById('iconStreamVolume');
    this.streamVolumeSlider = document.getElementById('streamVolumeSlider');
    this.btnToggleStreamChat = document.getElementById('btnToggleStreamChat');
    this.streamChatBtnLabel = document.getElementById('streamChatBtnLabel');
    this.btnGoLiveModal = document.getElementById('btnGoLiveModal');
    this.goLiveModal = document.getElementById('goLiveModal');
    this.btnStartLiveAction = document.getElementById('btnStartLiveAction');
    this.closeGoLiveModal = document.getElementById('closeGoLiveModal');
    this.chatMessagesContainer = document.getElementById('chatMessagesContainer');
    this.chatInputContainer = document.querySelector('main > div.p-4.pt-1');

    this.isTheater = false;
    this.isChatVisibleInTheater = true;
    this.isAspectCover = false;
    this.idleTimeout = null;
    this.isMutedVolume = false;
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
      this.btnStopStream.addEventListener('click', () => {
        if (this.isStreaming) {
          this.stopScreenShare();
        } else if (this.isWatchingRemote) {
          this.stopWatchingRemote();
        }
      });
    }

    // Fullscreen Toggle
    if (this.btnFullscreen) {
      this.btnFullscreen.addEventListener('click', () => this.toggleFullscreen());
    }

    // Document Fullscreen Change
    document.addEventListener('fullscreenchange', () => this.onFullscreenChange());
    document.addEventListener('webkitfullscreenchange', () => this.onFullscreenChange());

    // Theater Mode Toggle
    if (this.btnTheaterMode) {
      this.btnTheaterMode.addEventListener('click', () => this.toggleTheaterMode());
    }

    // Aspect Ratio Toggle (Contain vs Cover)
    if (this.btnStreamAspect && this.videoElem) {
      this.btnStreamAspect.addEventListener('click', () => {
        this.isAspectCover = !this.isAspectCover;
        if (this.isAspectCover) {
          this.videoElem.classList.add('aspect-cover');
        } else {
          this.videoElem.classList.remove('aspect-cover');
        }
      });
    }

    // Volume Slider & Mute Toggle
    if (this.streamVolumeSlider && this.videoElem) {
      this.streamVolumeSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        this.videoElem.volume = val;
        this.videoElem.muted = (val === 0);
        const dedicatedAudio = document.getElementById('goLiveDedicatedAudioPlayer');
        if (dedicatedAudio) {
          dedicatedAudio.volume = val;
          dedicatedAudio.muted = (val === 0);
        }
        this.isMutedVolume = (val === 0);
        this.updateVolumeIcon(val);
      });
    }

    if (this.btnStreamVolume && this.videoElem) {
      this.btnStreamVolume.addEventListener('click', () => {
        this.isMutedVolume = !this.isMutedVolume;
        this.videoElem.muted = this.isMutedVolume;
        const dedicatedAudio = document.getElementById('goLiveDedicatedAudioPlayer');
        if (dedicatedAudio) {
          dedicatedAudio.muted = this.isMutedVolume;
        }
        if (this.streamVolumeSlider) {
          this.streamVolumeSlider.value = this.isMutedVolume ? 0 : (this.videoElem.volume || 1);
        }
        this.updateVolumeIcon(this.isMutedVolume ? 0 : this.videoElem.volume);
      });
    }

    // Toggle Chat Visibility
    if (this.btnToggleStreamChat) {
      this.btnToggleStreamChat.addEventListener('click', () => this.toggleChatVisibility());
    }

    // Auto-hide controls when idle in fullscreen or theater
    if (this.stage) {
      this.stage.addEventListener('mousemove', () => this.resetControlsIdleTimer());
      this.stage.addEventListener('mouseenter', () => this.resetControlsIdleTimer());
      this.stage.addEventListener('mouseleave', () => {
        if (document.fullscreenElement || this.isTheater) {
          this.stage.classList.add('controls-idle');
        }
      });
    }

    // Picture-in-Picture
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

    // Keyboard Shortcuts: F (Fullscreen), T (Theater), M (Mute)
    window.addEventListener('keydown', (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
      if (!this.isStreaming && !this.isWatchingRemote) return;

      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        this.toggleFullscreen();
      } else if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        this.toggleTheaterMode();
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        if (this.btnStreamVolume) this.btnStreamVolume.click();
      }
    });

    // Remote stream announcements
    window.addEventListener('discord_remote_stream_started', (e) => {
      this.handleRemoteStream(e.detail);
    });

    window.addEventListener('discord_remote_stream_stopped', (e) => {
      this.handleRemoteStreamStopped(e.detail);
    });

    // WebRTC Signaling Events
    window.addEventListener('discord_webrtc_request_watch', (e) => {
      this.handleWatchRequest(e.detail);
    });

    window.addEventListener('discord_webrtc_offer', (e) => {
      this.handleOffer(e.detail);
    });

    window.addEventListener('discord_webrtc_answer', (e) => {
      this.handleAnswer(e.detail);
    });

    window.addEventListener('discord_webrtc_ice_candidate', (e) => {
      this.handleIceCandidate(e.detail);
    });
  }

  // PeerJS Free Cloud fallback for GitHub Pages (zero backend needed)
  initPeerJs() {
    if (typeof Peer !== 'undefined') {
      try {
        this.peer = new Peer({
          config: RTC_CONFIG
        });

        this.peer.on('open', (id) => {
          this.peerId = id;
          console.log('✅ PeerJS P2P inicializado com ID:', id);
        });

        this.peer.on('call', (call) => {
          console.log('Recebendo chamada P2P via PeerJS');
          call.answer();
          call.on('stream', (remoteStream) => {
            this.attachRemoteStream(remoteStream, 'Amigo (P2P)');
          });
        });
      } catch (err) {
        console.log('PeerJS fallback error:', err);
      }
    }
  }

  openGoLiveDialog() {
    if (this.isStreaming) {
      this.stopScreenShare();
      return;
    }

    if (!window.discordStore.currentVoiceChannelId) {
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
      const server = window.discordStore.getCurrentServer();
      const myId = window.discordStore.user ? window.discordStore.user.id : 'me';
      if (server) {
        if (window.discordStore.isMemberTimedOut(server.id, myId)) {
          const remaining = window.discordStore.getMemberTimeoutRemaining(server.id, myId);
          alert(`⛔ Você está de castigo por mais ${remaining} segundos e não pode iniciar transmissões.`);
          return;
        }
        if (!window.discordStore.hasPermission(server.id, myId, 'STREAM_LIVE')) {
          alert('⛔ Você não tem permissão para transmitir tela (Go Live) neste servidor.');
          return;
        }
      }

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
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          suppressLocalAudioPlayback: false
        },
        systemAudio: 'include',
        selfBrowserSurface: 'include'
      };

      if (this.streamQuality === '1080p') {
        constraints.video.width = { ideal: 1920 };
        constraints.video.height = { ideal: 1080 };
      } else if (this.streamQuality === '720p') {
        constraints.video.width = { ideal: 1280 };
        constraints.video.height = { ideal: 720 };
      }

      console.log('Solicitando captura de tela para Go Live com:', constraints);

      // Invoke Browser Display Media API (check Secure Context support)
      if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
        this.hideGoLiveDialog();
        this.showInsecureContextHelpModal();
        return;
      }

      this.localStream = await navigator.mediaDevices.getDisplayMedia(constraints);
      this.screenTrack = this.localStream.getVideoTracks()[0];
      this.audioTrack = this.localStream.getAudioTracks()[0] || null;

      if (!this.audioTrack) {
        console.info('Aviso: Áudio do sistema não compartilhado. Certifique-se de marcar "Compartilhar áudio" na janela do navegador para transmitir o som de jogos e vídeos.');
      } else {
        console.log('✅ Áudio do sistema capturado com sucesso:', this.audioTrack.label);
      }

      // Handle user stopping share via browser bar
      this.screenTrack.onended = () => {
        console.log('Compartilhamento de tela finalizado pelo usuário no navegador');
        this.stopScreenShare();
      };

      this.isStreaming = true;
      this.activeChannelId = window.discordStore.currentVoiceChannelId;

      // Update local preview
      if (this.videoElem) {
        this.videoElem.srcObject = this.localStream;
        this.videoElem.muted = true; // Mute local feedback to avoid audio echo
        await this.videoElem.play().catch(e => console.log('Video play catch:', e));
      }

      // Show stage
      if (this.stage) {
        this.stage.classList.remove('hidden');
        this.stage.classList.add('flex');
      }

      // Update streamer info in overlay
      if (this.streamerName) this.streamerName.textContent = window.discordStore.user.username;
      if (this.streamerAvatarImg) this.streamerAvatarImg.src = window.discordStore.user.avatar;
      const curChan = window.discordStore.getCurrentChannel();
      if (this.streamChannelName) this.streamChannelName.textContent = `• ${curChan ? curChan.name : 'Voz'}`;
      if (this.btnStopStreamText) this.btnStopStreamText.textContent = 'Parar Transmissão';

      if (this.streamQualityBadge) {
        this.streamQualityBadge.textContent = `${this.streamQuality} ${this.streamFps}FPS`;
      }

      this.updateGoLiveButtonUI(true);

      if (window.discordAudio) {
        window.discordAudio.playGoLive();
      }

      window.discordStore.updateUser({ isStreaming: true });

      // Broadcast to all connected friends
      window.discordStore.sendWs({
        type: 'stream_started',
        channelId: this.activeChannelId,
        quality: `${this.streamQuality} ${this.streamFps}fps`,
        user: window.discordStore.user,
        peerId: this.peerId || null
      });

      // Announce in chat
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

    // Close all viewer connections
    this.peerConnections.forEach((pc) => {
      try { pc.close(); } catch (e) {}
    });
    this.peerConnections.clear();

    if (this.videoElem) {
      this.videoElem.srcObject = null;
    }

    if (this.stage) {
      this.stage.classList.add('hidden');
      this.stage.classList.remove('flex', 'is-fullscreen');
    }

    if (this.isTheater) {
      this.toggleTheaterMode(false);
    }
    if (document.fullscreenElement) {
      try { document.exitFullscreen(); } catch (e) {}
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

  // =========================================================
  // WebRTC Broadcaster Logic (Streamer sending to Viewer Friend)
  // =========================================================
  async handleWatchRequest(detail) {
    if (!this.isStreaming || !this.localStream) return;
    const viewerId = detail.fromId;
    console.log(`Amigo ${viewerId} solicitou assistir à sua transmissão! Iniciando WebRTC...`);

    try {
      const pc = new RTCPeerConnection(RTC_CONFIG);
      this.peerConnections.set(viewerId, pc);

      // Add local screen tracks to the peer connection
      this.localStream.getTracks().forEach(track => {
        pc.addTrack(track, this.localStream);
      });

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          window.discordStore.sendWs({
            type: 'webrtc_ice_candidate',
            targetId: viewerId,
            candidate: event.candidate
          });
        }
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      window.discordStore.sendWs({
        type: 'webrtc_offer',
        targetId: viewerId,
        offer: offer
      });
    } catch (err) {
      console.error('Erro ao enviar oferta WebRTC para espectador:', err);
    }
    this.iceCandidatesQueue = new Map();
  }

  async handleAnswer(detail) {
    const pc = this.peerConnections.get(detail.fromId);
    if (pc && pc.signalingState !== 'closed') {
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(detail.answer));
        this.drainStreamIceQueue(detail.fromId, pc);
        console.log(`Conexão WebRTC com espectador ${detail.fromId} estabelecida com sucesso!`);
      } catch (err) {
        console.error('Erro ao processar resposta WebRTC:', err);
      }
    }
  }

  async handleIceCandidate(detail) {
    const pc = this.peerConnections.get(detail.fromId) || this.viewerPc;
    if (pc && pc.remoteDescription && detail.candidate) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(detail.candidate));
      } catch (err) {
        console.warn('Erro ao adicionar ICE Candidate:', err);
      }
    } else if (detail.candidate) {
      if (!this.iceCandidatesQueue) this.iceCandidatesQueue = new Map();
      if (!this.iceCandidatesQueue.has(detail.fromId)) {
        this.iceCandidatesQueue.set(detail.fromId, []);
      }
      this.iceCandidatesQueue.get(detail.fromId).push(detail.candidate);
    }
  }

  drainStreamIceQueue(fromId, pc) {
    if (this.iceCandidatesQueue && this.iceCandidatesQueue.has(fromId)) {
      const queue = this.iceCandidatesQueue.get(fromId);
      queue.forEach(candidate => {
        try {
          pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {}
      });
      this.iceCandidatesQueue.delete(fromId);
    }
  }

  // =========================================================
  // WebRTC Viewer Logic (Friend watching the Streamer)
  // =========================================================
  startWatchingRemote(streamerId, streamerName = 'Amigo', quality = '1080p 60FPS') {
    if (this.isStreaming) return; // cannot watch if already streaming
    console.log(`Conectando para assistir à transmissão de ${streamerName} (${streamerId})...`);

    this.isWatchingRemote = true;
    this.currentStreamerId = streamerId;
    this.remoteMediaStream = null;

    if (this.viewerPc) {
      try { this.viewerPc.close(); } catch (e) {}
    }

    this.viewerPc = new RTCPeerConnection(RTC_CONFIG);

    this.viewerPc.ontrack = (event) => {
      console.log('Recebido track de vídeo/áudio da stream remota:', event.track.kind, event.track.id);
      if (!this.remoteMediaStream) {
        this.remoteMediaStream = new MediaStream();
      }
      this.remoteMediaStream.addTrack(event.track);
      this.attachRemoteStream(this.remoteMediaStream, streamerName, quality);
    };

    this.viewerPc.onicecandidate = (event) => {
      if (event.candidate) {
        window.discordStore.sendWs({
          type: 'webrtc_ice_candidate',
          targetId: streamerId,
          candidate: event.candidate
        });
      }
    };

    // Send request to streamer
    window.discordStore.sendWs({
      type: 'webrtc_request_watch',
      targetId: streamerId
    });
  }

  async handleOffer(detail) {
    if (!this.isWatchingRemote) {
      this.isWatchingRemote = true;
      this.currentStreamerId = detail.fromId;
      this.remoteMediaStream = null;
      this.viewerPc = new RTCPeerConnection(RTC_CONFIG);
      this.viewerPc.ontrack = (event) => {
        console.log('Recebido track da stream remota (via offer):', event.track.kind, event.track.id);
        if (!this.remoteMediaStream) {
          this.remoteMediaStream = new MediaStream();
        }
        this.remoteMediaStream.addTrack(event.track);
        this.attachRemoteStream(this.remoteMediaStream, 'Amigo');
      };
      this.viewerPc.onicecandidate = (event) => {
        if (event.candidate) {
          window.discordStore.sendWs({
            type: 'webrtc_ice_candidate',
            targetId: detail.fromId,
            candidate: event.candidate
          });
        }
      };
    }

    try {
      await this.viewerPc.setRemoteDescription(new RTCSessionDescription(detail.offer));
      this.drainStreamIceQueue(detail.fromId, this.viewerPc);
      const answer = await this.viewerPc.createAnswer();
      await this.viewerPc.setLocalDescription(answer);

      window.discordStore.sendWs({
        type: 'webrtc_answer',
        targetId: detail.fromId,
        answer: answer
      });
      console.log('Resposta WebRTC enviada de volta ao streamer!');
    } catch (err) {
      console.error('Erro ao aceitar oferta WebRTC do streamer:', err);
    }
  }

  attachRemoteStream(stream, streamerName = 'Amigo', quality = '1080p 60FPS') {
    this.remoteStream = stream;
    const audioTracks = stream.getAudioTracks();
    const videoTracks = stream.getVideoTracks();
    console.log(`Stream remota anexada: ${videoTracks.length} vídeo(s), ${audioTracks.length} áudio(s)`);

    if (this.videoElem) {
      if (this.videoElem.srcObject !== stream) {
        this.videoElem.srcObject = stream;
      }
      this.videoElem.muted = false; // Permite áudio para o espectador
      this.videoElem.play().then(() => {
        this.hideUnmutePrompt();
      }).catch(e => {
        console.warn('Autoplay com áudio bloqueado na tag video:', e);
        this.videoElem.muted = true;
        this.videoElem.play().catch(err2 => console.warn('Erro ao reproduzir vídeo mudo:', err2));
        if (audioTracks.length > 0) {
          this.showUnmutePrompt();
        }
      });
    }

    // Audio player dedicado para garantir som perfeito mesmo em restrições de autoplay de vídeo
    const dedicatedAudio = document.getElementById('goLiveDedicatedAudioPlayer');
    if (dedicatedAudio && audioTracks.length > 0) {
      if (dedicatedAudio.srcObject !== stream) {
        dedicatedAudio.srcObject = stream;
      }
      dedicatedAudio.muted = false;
      dedicatedAudio.volume = this.videoElem ? (this.videoElem.volume || 1) : 1;
      dedicatedAudio.play().then(() => {
        this.hideUnmutePrompt();
      }).catch(e => {
        console.warn('Autoplay bloqueado no audio player dedicado:', e);
        this.showUnmutePrompt();
      });
    }

    if (this.stage) {
      this.stage.classList.remove('hidden');
      this.stage.classList.add('flex');
    }

    if (this.streamerName) this.streamerName.textContent = streamerName;
    if (this.streamerAvatarImg) {
      this.streamerAvatarImg.src = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&h=120&q=80';
    }
    const curChan = window.discordStore.getCurrentChannel();
    if (this.streamChannelName) this.streamChannelName.textContent = `• ${curChan ? curChan.name : 'Voz'}`;

    if (this.streamQualityBadge) {
      this.streamQualityBadge.textContent = quality;
    }
    if (this.btnStopStreamText) {
      this.btnStopStreamText.textContent = 'Sair da Transmissão';
    }
  }

  unmuteStreamAudio() {
    if (this.videoElem) {
      this.videoElem.muted = false;
      this.videoElem.volume = 1;
      this.videoElem.play().catch(() => {});
    }
    const dedicatedAudio = document.getElementById('goLiveDedicatedAudioPlayer');
    if (dedicatedAudio) {
      dedicatedAudio.muted = false;
      dedicatedAudio.volume = 1;
      dedicatedAudio.play().catch(() => {});
    }
    this.isMutedVolume = false;
    if (this.streamVolumeSlider) {
      this.streamVolumeSlider.value = 1;
    }
    this.updateVolumeIcon(1);
    this.hideUnmutePrompt();
  }

  showUnmutePrompt() {
    const btn = document.getElementById('btnStreamUnmutePrompt');
    if (btn) btn.classList.remove('hidden');
  }

  hideUnmutePrompt() {
    const btn = document.getElementById('btnStreamUnmutePrompt');
    if (btn) btn.classList.add('hidden');
  }

  stopWatchingRemote() {
    this.hideUnmutePrompt();
    if (this.viewerPc) {
      try { this.viewerPc.close(); } catch (e) {}
      this.viewerPc = null;
    }
    if (this.remoteMediaStream) {
      this.remoteMediaStream.getTracks().forEach(t => t.stop());
      this.remoteMediaStream = null;
    }
    if (this.remoteStream) {
      this.remoteStream.getTracks().forEach(t => t.stop());
      this.remoteStream = null;
    }
    if (this.videoElem) {
      this.videoElem.srcObject = null;
    }
    const dedicatedAudio = document.getElementById('goLiveDedicatedAudioPlayer');
    if (dedicatedAudio) {
      dedicatedAudio.srcObject = null;
    }
    if (this.stage) {
      this.stage.classList.add('hidden');
      this.stage.classList.remove('flex', 'is-fullscreen');
    }
    if (this.isTheater) {
      this.toggleTheaterMode(false);
    }
    if (document.fullscreenElement) {
      try { document.exitFullscreen(); } catch (e) {}
    }
    this.isWatchingRemote = false;
    this.currentStreamerId = null;
    console.log('Parou de assistir à transmissão remota');
  }

  // =========================================================
  // FULLSCREEN, THEATER & CONTROLS MANAGER
  // =========================================================
  toggleFullscreen() {
    if (!document.fullscreenElement) {
      if (this.stage && this.stage.requestFullscreen) {
        this.stage.requestFullscreen().catch(err => {
          console.warn('Fullscreen error:', err);
          if (this.videoElem && this.videoElem.requestFullscreen) {
            this.videoElem.requestFullscreen();
          }
        });
      } else if (this.videoElem && this.videoElem.requestFullscreen) {
        this.videoElem.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }

  onFullscreenChange() {
    const isFs = !!document.fullscreenElement;
    if (this.stage) {
      if (isFs) {
        this.stage.classList.add('is-fullscreen');
      } else {
        this.stage.classList.remove('is-fullscreen');
      }
    }

    if (this.iconFullscreen) {
      if (isFs) {
        // Compress/exit fullscreen icon
        this.iconFullscreen.innerHTML = `
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        `;
        if (this.btnFullscreen) this.btnFullscreen.title = 'Sair da Tela Cheia (ESC ou F)';
      } else {
        // Expand/fullscreen icon
        this.iconFullscreen.innerHTML = `
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0 0l-5-5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
        `;
        if (this.btnFullscreen) this.btnFullscreen.title = 'Tela Cheia (F)';
      }
    }
  }

  toggleTheaterMode(forceState = null) {
    if (forceState !== null) {
      this.isTheater = forceState;
    } else {
      this.isTheater = !this.isTheater;
    }

    if (this.stage) {
      if (this.isTheater) {
        this.stage.classList.add('theater-mode');
        if (this.btnTheaterMode) {
          this.btnTheaterMode.classList.add('text-[#5865f2]', 'bg-white/10');
          this.btnTheaterMode.title = 'Sair do Modo Foco (T)';
        }
        if (this.chatMessagesContainer) this.chatMessagesContainer.classList.add('hidden');
        if (this.chatInputContainer) this.chatInputContainer.classList.add('hidden');
        if (this.streamChatBtnLabel) this.streamChatBtnLabel.textContent = 'Mostrar Chat';
        this.isChatVisibleInTheater = false;
      } else {
        this.stage.classList.remove('theater-mode');
        if (this.btnTheaterMode) {
          this.btnTheaterMode.classList.remove('text-[#5865f2]', 'bg-white/10');
          this.btnTheaterMode.title = 'Modo Foco / Teatro (T)';
        }
        if (this.chatMessagesContainer) this.chatMessagesContainer.classList.remove('hidden');
        if (this.chatInputContainer) this.chatInputContainer.classList.remove('hidden');
        if (this.streamChatBtnLabel) this.streamChatBtnLabel.textContent = 'Ocultar Chat';
        this.isChatVisibleInTheater = true;
      }
    }
  }

  toggleChatVisibility() {
    this.isChatVisibleInTheater = !this.isChatVisibleInTheater;
    if (this.chatMessagesContainer) {
      this.chatMessagesContainer.classList.toggle('hidden', !this.isChatVisibleInTheater);
    }
    if (this.chatInputContainer) {
      this.chatInputContainer.classList.toggle('hidden', !this.isChatVisibleInTheater);
    }
    if (this.streamChatBtnLabel) {
      this.streamChatBtnLabel.textContent = this.isChatVisibleInTheater ? 'Ocultar Chat' : 'Mostrar Chat';
    }
    if (this.isTheater && this.isChatVisibleInTheater) {
      this.toggleTheaterMode(false);
    }
  }

  resetControlsIdleTimer() {
    if (!this.stage) return;
    this.stage.classList.remove('controls-idle');
    if (this.idleTimeout) {
      clearTimeout(this.idleTimeout);
    }
    if (document.fullscreenElement || this.isTheater) {
      this.idleTimeout = setTimeout(() => {
        if (this.stage && (document.fullscreenElement || this.isTheater)) {
          this.stage.classList.add('controls-idle');
        }
      }, 2500);
    }
  }

  updateVolumeIcon(vol) {
    if (!this.iconStreamVolume) return;
    if (vol === 0 || this.isMutedVolume) {
      this.iconStreamVolume.innerHTML = `
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
      `;
    } else {
      this.iconStreamVolume.innerHTML = `
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M11 5L6 9H2v6h4l5 4V5z"/>
      `;
    }
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
    const stream = detail.stream || detail;
    const chanElem = document.querySelector(`[data-channel-id="${stream.channelId}"]`);
    if (chanElem) {
      let badge = chanElem.querySelector('.live-badge-tag');
      if (!badge) {
        badge = document.createElement('button');
        badge.className = 'live-badge-tag ml-auto px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-[#f23f43] hover:bg-[#da373c] text-white flex items-center space-x-1 animate-pulse-live cursor-pointer shadow transition';
        badge.innerHTML = '<span>AO VIVO</span> <span class="text-[9px] bg-black/30 px-1 rounded">ASSISTIR</span>';
        badge.onclick = (e) => {
          e.stopPropagation();
          this.startWatchingRemote(stream.streamId || detail.userId, stream.user?.username || 'Amigo', stream.quality);
        };
        chanElem.appendChild(badge);
      }
    }
  }

  handleRemoteStreamStopped(detail) {
    const badges = document.querySelectorAll('.live-badge-tag');
    badges.forEach(b => b.remove());
    if (this.isWatchingRemote) {
      this.stopWatchingRemote();
    }
  }

  showInsecureContextHelpModal() {
    const modal = document.getElementById('webrtcPermissionModal');
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    } else {
      alert('🔒 O navegador bloqueou a transmissão de tela porque a conexão não é HTTPS. No Chrome, abra chrome://flags/#unsafely-treat-insecure-origin-as-secure, adicione http://26.134.212.76:3000 como Enabled e reinicie o navegador.');
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.discordStream = new DiscordStreamManager();
});
