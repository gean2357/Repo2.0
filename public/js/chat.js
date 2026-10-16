// Discord Chat, Emoji, GIF & Slash Commands Manager
class DiscordChatManager {
  constructor() {
    this.initElements();
    this.setupListeners();
    this.curAttachment = null;
    this.cloudLoadedChannels = new Set();
    this.startTimeoutMonitor();
  }

  initElements() {
    this.messagesContainer = document.getElementById('chatMessagesContainer');
    this.chatInput = document.getElementById('chatInput');
    this.btnSendMessage = document.getElementById('btnSendMessage');
    this.btnAttachFile = document.getElementById('btnAttachFile');
    this.fileInput = document.getElementById('fileAttachmentInput');
    this.attachmentPreview = document.getElementById('attachmentPreview');
    this.attachmentPreviewImg = document.getElementById('attachmentPreviewImg');
    this.btnRemoveAttachment = document.getElementById('btnRemoveAttachment');
    this.btnEmojiPicker = document.getElementById('btnEmojiPicker');
    this.emojiPopover = document.getElementById('emojiPopover');
    this.btnGifPicker = document.getElementById('btnGifPicker');
    this.gifPopover = document.getElementById('gifPopover');
    this.typingIndicator = document.getElementById('typingIndicator');
  }

  setupListeners() {
    if (this.chatInput) {
      this.chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.handleSendMessage();
        }
      });
    }

    if (this.btnSendMessage) {
      this.btnSendMessage.addEventListener('click', () => this.handleSendMessage());
    }

    // File attachment
    if (this.btnAttachFile && this.fileInput) {
      this.btnAttachFile.addEventListener('click', () => this.fileInput.click());
      this.fileInput.addEventListener('change', (e) => this.handleFileSelected(e));
    }

    if (this.btnRemoveAttachment) {
      this.btnRemoveAttachment.addEventListener('click', () => this.clearAttachment());
    }

    // Emoji Popover
    if (this.btnEmojiPicker && this.emojiPopover) {
      this.btnEmojiPicker.addEventListener('click', (e) => {
        e.stopPropagation();
        this.emojiPopover.classList.toggle('hidden');
        if (this.gifPopover) this.gifPopover.classList.add('hidden');
      });
    }

    // GIF Popover
    if (this.btnGifPicker && this.gifPopover) {
      this.btnGifPicker.addEventListener('click', (e) => {
        e.stopPropagation();
        this.gifPopover.classList.toggle('hidden');
        if (this.emojiPopover) this.emojiPopover.classList.add('hidden');
      });
    }

    // Close popovers on click outside
    document.addEventListener('click', (e) => {
      if (this.emojiPopover && !this.emojiPopover.contains(e.target) && e.target !== this.btnEmojiPicker) {
        this.emojiPopover.classList.add('hidden');
      }
      if (this.gifPopover && !this.gifPopover.contains(e.target) && e.target !== this.btnGifPicker) {
        this.gifPopover.classList.add('hidden');
      }
    });

    // Handle emoji click inside popover
    document.querySelectorAll('.emoji-select-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const emoji = btn.getAttribute('data-emoji') || btn.textContent.trim();
        this.insertEmoji(emoji);
      });
    });

    // Handle GIF click
    document.querySelectorAll('.gif-select-img').forEach(img => {
      img.addEventListener('click', () => {
        const gifUrl = img.getAttribute('src');
        this.sendGif(gifUrl);
        if (this.gifPopover) this.gifPopover.classList.add('hidden');
      });
    });

    // Sync events
    window.addEventListener('discord_message_received', () => {
      this.renderMessages();
    });

    window.addEventListener('discord_reaction_updated', () => {
      this.renderMessages();
    });
  }

  insertEmoji(emoji) {
    if (!this.chatInput) return;
    this.chatInput.value += emoji + ' ';
    this.chatInput.focus();
  }

  handleFileSelected(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      this.curAttachment = {
        name: file.name,
        type: file.type,
        data: event.target.result
      };

      if (this.attachmentPreview) {
        this.attachmentPreview.classList.remove('hidden');
        this.attachmentPreview.classList.add('flex');
        if (this.attachmentPreviewImg && file.type.startsWith('image/')) {
          this.attachmentPreviewImg.src = event.target.result;
          this.attachmentPreviewImg.classList.remove('hidden');
        }
      }
    };
    reader.readAsDataURL(file);
  }

  clearAttachment() {
    this.curAttachment = null;
    if (this.fileInput) this.fileInput.value = '';
    if (this.attachmentPreview) {
      this.attachmentPreview.classList.add('hidden');
      this.attachmentPreview.classList.remove('flex');
    }
  }

  sendGif(gifUrl) {
    const channel = window.discordStore.getCurrentChannel();
    if (!channel || channel.type !== 'text') return;

    window.discordStore.addMessage(channel.id, '', {
      name: 'gif',
      type: 'image/gif',
      data: gifUrl
    });

    this.renderMessages();
  }

  startTimeoutMonitor() {
    const checkTimeout = () => {
      if (!this.chatInput) return;
      const server = window.discordStore.getCurrentServer();
      const channel = window.discordStore.getCurrentChannel();
      if (!server) return;

      const myId = window.discordStore.user ? window.discordStore.user.id : 'me';
      const isTimedOut = window.discordStore.isMemberTimedOut(server.id, myId);
      if (isTimedOut) {
        const remaining = window.discordStore.getMemberTimeoutRemaining(server.id, myId);
        this.chatInput.disabled = true;
        this.chatInput.placeholder = `⛔ Você está de castigo (${remaining}s). Envio de mensagens bloqueado.`;
        this.chatInput.classList.add('opacity-50', 'cursor-not-allowed', 'bg-red-950/20');
        const sendBtn = document.getElementById('btnSendMessage');
        if (sendBtn) sendBtn.disabled = true;
      } else {
        if (this.chatInput.disabled) {
          this.chatInput.disabled = false;
          this.chatInput.placeholder = `Conversar em #${channel ? channel.name : 'geral'}`;
          this.chatInput.classList.remove('opacity-50', 'cursor-not-allowed', 'bg-red-950/20');
          const sendBtn = document.getElementById('btnSendMessage');
          if (sendBtn) sendBtn.disabled = false;
        }
      }
    };

    setInterval(checkTimeout, 1000);
    window.addEventListener('discord_member_timeout', checkTimeout);
  }

  handleSendMessage() {
    const text = this.chatInput ? this.chatInput.value.trim() : '';
    const attachment = this.curAttachment;

    if (!text && !attachment) return;

    const channel = window.discordStore.getCurrentChannel();
    if (!channel || channel.type !== 'text') return;

    const server = window.discordStore.getCurrentServer();
    if (server) {
      const myId = window.discordStore.user ? window.discordStore.user.id : 'me';
      if (window.discordStore.isMemberTimedOut(server.id, myId)) {
        const remaining = window.discordStore.getMemberTimeoutRemaining(server.id, myId);
        alert(`⛔ Você está de castigo por mais ${remaining} segundos e não pode enviar mensagens.`);
        return;
      }

      if (!window.discordStore.hasPermission(server.id, myId, 'SEND_MESSAGES')) {
        alert('⛔ Você não tem permissão para enviar mensagens neste servidor.');
        return;
      }

      if (attachment && !window.discordStore.hasPermission(server.id, myId, 'ATTACH_FILES')) {
        alert('⛔ Você não tem permissão para enviar anexos neste servidor.');
        return;
      }
    }

    // Check for slash commands
    if (text.startsWith('/')) {
      this.handleSlashCommand(text, channel.id);
      this.chatInput.value = '';
      this.clearAttachment();
      return;
    }

    window.discordStore.addMessage(channel.id, text, attachment);
    this.chatInput.value = '';
    this.clearAttachment();
    this.renderMessages();

    // Trigger simulated bot reply occasionally
    if (text.toLowerCase().includes('bot') || text.toLowerCase().includes('ajuda')) {
      this.simulateBotReply(channel.id, text);
    }
  }

  handleSlashCommand(cmd, channelId) {
    const parts = cmd.split(' ');
    const command = parts[0].toLowerCase();
    const arg = parts.slice(1).join(' ');

    switch (command) {
      case '/help':
        window.discordStore.addMessage(channelId, '💡 **Comandos Disponíveis:**\n• `/golive` - Abre a janela de transmissão de tela (Go Live)\n• `/shrug` - Envia ¯\\_(ツ)_/¯\n• `/tableflip` - Envia (╯°□°)╯︵ ┻━┻\n• `/clear` - Limpa as mensagens do canal\n• `/bot [pergunta]` - Pergunta algo para o assistente Clyde');
        break;

      case '/golive':
      case '/stream':
        if (window.discordStream) {
          window.discordStream.openGoLiveDialog();
        }
        break;

      case '/shrug':
        window.discordStore.addMessage(channelId, '¯\\_(ツ)_/¯');
        break;

      case '/tableflip':
      case '/flip':
        window.discordStore.addMessage(channelId, '(╯°□°)╯︵ ┻━┻');
        break;

      case '/clear':
        window.discordStore.messages[channelId] = [];
        window.discordStore.save('discord_messages', window.discordStore.messages);
        break;

      case '/bot':
        this.simulateBotReply(channelId, arg || 'Olá!');
        break;

      default:
        window.discordStore.addMessage(channelId, `⚠️ Comando desconhecido: \`${command}\`. Digite \`/help\` para ver a lista.`);
    }

    this.renderMessages();
  }

  simulateBotReply(channelId, prompt) {
    if (this.typingIndicator) {
      this.typingIndicator.classList.remove('hidden');
    }

    setTimeout(() => {
      if (this.typingIndicator) {
        this.typingIndicator.classList.add('hidden');
      }

      let reply = 'Olá! Estou aqui para ajudar você a testar o Discord Clone. Use a opção **Go Live** no canal de voz para transmitir sua tela!';
      if (prompt.toLowerCase().includes('tela') || prompt.toLowerCase().includes('live')) {
        reply = '📺 Para iniciar o **Go Live**: entre em um canal de voz à esquerda e clique no botão **"Tela"** na barra de status de voz ou no topo do canal!';
      } else if (prompt.toLowerCase().includes('node') || prompt.toLowerCase().includes('backend')) {
        reply = '🚀 O sistema roda em Node.js com WebSocket para sincronizar múltiplos navegadores, e também suporta modo standalone sem backend usando BroadcastChannel!';
      }

      const botMsg = {
        id: 'msg-' + Date.now(),
        userId: 'user-clyde',
        username: 'Clyde BOT',
        userAvatar: 'https://assets-global.website-files.com/6257adef93867e50d84d30e2/636e0a6a49cf127bf92de1e2_icon_clyde_blurple_RGB.png',
        roleColor: '#5865f2',
        isBot: true,
        timestamp: 'Hoje às ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        content: reply,
        reactions: []
      };

      if (!window.discordStore.messages[channelId]) {
        window.discordStore.messages[channelId] = [];
      }
      window.discordStore.messages[channelId].push(botMsg);
      window.discordStore.save('discord_messages', window.discordStore.messages);
      this.renderMessages();

      if (window.discordAudio) {
        window.discordAudio.playNotification();
      }
    }, 1200);
  }

  renderMessages() {
    if (!this.messagesContainer) return;

    const channel = window.discordStore.getCurrentChannel();
    if (!channel) return;

    if (channel.type === 'voice') {
      // Show voice channel stage placeholder if no screen share
      this.messagesContainer.innerHTML = `
        <div class="h-full flex flex-col items-center justify-center p-8 text-center select-none">
          <div class="w-20 h-20 rounded-full bg-[#2b2d31] flex items-center justify-center text-white mb-4 shadow-lg border border-[#3f4147]">
            <svg class="w-10 h-10 text-[#5865F2]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3a9 9 0 00-9 9v7c0 1.66 1.34 3 3 3h3v-8H5v-2c0-3.87 3.13-7 7-7s7 3.13 7 7v2h-4v8h3c1.66 0 3-1.34 3-3v-7a9 9 0 00-9-9z"/>
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-white mb-2">${channel.name}</h2>
          <p class="text-[#949ba4] max-w-md mb-6">Você está no canal de voz. Conecte seu microfone ou inicie uma transmissão Go Live para compartilhar sua tela em alta resolução com áudio!</p>
          <div class="flex items-center space-x-3">
            <button onclick="window.discordStream.openGoLiveDialog()" class="px-5 py-2.5 bg-[#23a55a] hover:bg-[#1f9250] text-white font-semibold rounded-md shadow flex items-center space-x-2 transition">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
              <span>Transmitir Tela (Go Live)</span>
            </button>
            <button onclick="window.discordVoice.joinVoiceChannel('${channel.id}')" class="px-5 py-2.5 bg-[#5865f2] hover:bg-[#4752c4] text-white font-semibold rounded-md shadow flex items-center space-x-2 transition">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
              </svg>
              <span>Conectar Voz</span>
            </button>
          </div>
        </div>
      `;
      return;
    }

    if (!this.cloudLoadedChannels.has(channel.id)) {
      this.cloudLoadedChannels.add(channel.id);
      this.loadCloudMessages(channel.id);
    }

    const messages = window.discordStore.getChannelMessages(channel.id);

    // Channel Header Banner
    let html = `
      <div class="pt-8 pb-4 px-4 border-b border-[#35373c]/40 mb-4 select-text">
        <div class="w-16 h-16 rounded-full bg-[#35373c] flex items-center justify-center text-white mb-3">
          <svg class="w-10 h-10 text-[#dbdee1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"/>
          </svg>
        </div>
        <h1 class="text-3xl font-bold text-white mb-1">Bem-vindo a #${channel.name}!</h1>
        <p class="text-[#949ba4] text-sm">${channel.topic || 'Este é o início do canal #' + channel.name + '.'}</p>
      </div>
    `;

    // Messages List
    messages.forEach(msg => {
      const formattedContent = this.formatMarkdown(msg.content);

      html += `
        <div class="message-item group relative flex px-4 py-1.5 hover:bg-[#2e3035] transition-colors select-text" data-message-id="${msg.id}">
          <!-- Hover Actions Toolbar -->
          <div class="message-actions-bar absolute right-4 -top-3.5 bg-[#313338] border border-[#232428] rounded-md shadow-lg flex items-center px-1 py-0.5 space-x-1 z-10">
            <button onclick="window.discordStore.addReaction('${msg.id}', '❤️')" class="p-1 hover:bg-[#35373c] rounded text-[#b5bac1] hover:text-white" title="Reagir ❤️">❤️</button>
            <button onclick="window.discordStore.addReaction('${msg.id}', '👍')" class="p-1 hover:bg-[#35373c] rounded text-[#b5bac1] hover:text-white" title="Reagir 👍">👍</button>
            <button onclick="window.discordStore.addReaction('${msg.id}', '🔥')" class="p-1 hover:bg-[#35373c] rounded text-[#b5bac1] hover:text-white" title="Reagir 🔥">🔥</button>
            <button onclick="window.discordChat.quickReply('${msg.username}')" class="p-1 hover:bg-[#35373c] rounded text-[#b5bac1] hover:text-white" title="Responder">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/></svg>
            </button>
          </div>

          <!-- Avatar -->
          <img src="${msg.userAvatar}" class="w-10 h-10 rounded-full mr-4 flex-shrink-0 cursor-pointer hover:opacity-90 mt-0.5" alt="${msg.username}" />

          <!-- Body -->
          <div class="flex-1 min-w-0">
            <div class="flex items-baseline space-x-2">
              <span class="font-semibold text-sm cursor-pointer hover:underline" style="color: ${msg.roleColor || '#dbdee1'}">${msg.username}</span>
              ${msg.isBot ? '<span class="bg-[#5865f2] text-white text-[10px] font-bold px-1.5 py-0.2 rounded uppercase tracking-wider">APP</span>' : ''}
              <span class="text-xs text-[#949ba4]">${msg.timestamp}</span>
            </div>

            <!-- Content -->
            ${formattedContent ? `<div class="text-[15px] leading-relaxed text-[#dbdee1] mt-0.5 whitespace-pre-wrap break-words">${formattedContent}</div>` : ''}

            <!-- Attachment image -->
            ${msg.attachment ? `
              <div class="mt-2 max-w-md rounded-lg overflow-hidden border border-[#232428] bg-[#2b2d31]">
                <img src="${msg.attachment.data}" class="max-h-80 w-auto object-cover rounded cursor-pointer" alt="attachment" onclick="window.open(this.src)" />
              </div>
            ` : ''}

            <!-- Rich Embed -->
            ${msg.embed ? `
              <div class="mt-2.5 max-w-lg rounded border-l-4 bg-[#2b2d31] p-3.5 space-y-1.5 shadow" style="border-left-color: ${msg.embed.color || '#5865f2'}">
                <div class="font-bold text-sm text-white">${msg.embed.title}</div>
                <div class="text-xs text-[#dbdee1]">${msg.embed.description}</div>
                ${msg.embed.fields ? `
                  <div class="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-[#35373c]">
                    ${msg.embed.fields.map(f => `
                      <div>
                        <div class="text-[11px] font-semibold uppercase text-[#949ba4]">${f.name}</div>
                        <div class="text-xs text-[#dbdee1] font-medium">${f.value}</div>
                      </div>
                    `).join('')}
                  </div>
                ` : ''}
              </div>
            ` : ''}

            <!-- Reactions Row -->
            ${msg.reactions && msg.reactions.length > 0 ? `
              <div class="flex flex-wrap gap-1.5 mt-1.5">
                ${msg.reactions.map(r => `
                  <button onclick="window.discordStore.addReaction('${msg.id}', '${r.emoji}')" class="flex items-center space-x-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-[#2b2d31] hover:bg-[#35373c] border ${r.users.includes(window.discordStore.user.id) ? 'border-[#5865f2] bg-[#3c4270]/30 text-[#c9cdfb]' : 'border-[#3f4147] text-[#b5bac1]'}">
                    <span>${r.emoji}</span>
                    <span>${r.count}</span>
                  </button>
                `).join('')}
              </div>
            ` : ''}
          </div>
        </div>
      `;
    });

    this.messagesContainer.innerHTML = html;
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
  }

  quickReply(username) {
    if (!this.chatInput) return;
    this.chatInput.value = `@${username} ` + this.chatInput.value;
    this.chatInput.focus();
  }

  formatMarkdown(text) {
    if (!text) return '';
    let out = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Bold **text**
    out = out.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-white">$1</strong>');
    // Italic *text*
    out = out.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');
    // Inline code `code`
    out = out.replace(/`(.*?)`/g, '<code class="bg-[#1e1f22] text-[#e0e1e5] px-1.5 py-0.5 rounded text-[13px] font-mono">$1</code>');
    // Mentions @Name
    out = out.replace(/@([a-zA-Z0-9_\-]+)/g, '<span class="mention">@$1</span>');

    return out;
  }

  async loadCloudMessages(channelId) {
    if (!channelId || channelId.startsWith('dm-') || channelId === 'amigos') return;
    if (window.firebaseService && window.firebaseService.isConfigured) {
      try {
        const cloudMsgs = await window.firebaseService.fetchChannelMessages(channelId);
        if (Array.isArray(cloudMsgs) && cloudMsgs.length > 0) {
          if (!window.discordStore.messages[channelId]) {
            window.discordStore.messages[channelId] = [];
          }
          let hasNew = false;
          cloudMsgs.forEach(cm => {
            if (!window.discordStore.messages[channelId].some(m => m.id === cm.id)) {
              window.discordStore.messages[channelId].push(cm);
              hasNew = true;
            }
          });
          if (hasNew) {
            window.discordStore.save('discord_messages', window.discordStore.messages);
            const currentChan = window.discordStore.getCurrentChannel();
            if (currentChan && currentChan.id === channelId) {
              this.renderMessages();
            }
          }
        }
      } catch (e) {
        console.warn('Erro ao carregar mensagens do canal do Firestore:', e);
      }
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.discordChat = new DiscordChatManager();
});
