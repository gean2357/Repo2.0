// Discord Clone State Store & Sync Manager
const DEFAULT_USER = {
  id: 'me',
  username: 'DevMaster',
  discriminator: '1337',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&h=120&q=80',
  status: 'online', // online, idle, dnd, offline
  customStatus: 'Construindo o Discord Clone 🚀',
  activity: 'Visual Studio Code',
  activityType: 'Playing',
  isMuted: false,
  isDeafened: false,
  isStreaming: false
};

const DEFAULT_SERVERS = [
  {
    id: 'server-1',
    name: 'Comunidade Dev & Tech',
    iconText: 'CD',
    iconBg: '#5865F2',
    iconImg: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&h=120&q=80',
    unread: false,
    badge: 3,
    categories: [
      {
        id: 'cat-text',
        name: 'CANAIS DE TEXTO',
        channels: [
          { id: 'chan-geral', name: 'geral', type: 'text', topic: 'Conversas gerais sobre tecnologia, programação e novidades.' },
          { id: 'chan-projetos', name: 'projetos-e-showcase', type: 'text', topic: 'Compartilhe seus projetos e receba feedback da comunidade.' },
          { id: 'chan-memes', name: 'memes-e-midia', type: 'text', topic: 'Apenas os melhores memes dev.' },
          { id: 'chan-avisos', name: 'anúncios', type: 'announcement', topic: 'Avisos oficiais da comunidade.' }
        ]
      },
      {
        id: 'cat-voice',
        name: 'CANAIS DE VOZ & STREAM',
        channels: [
          { id: 'chan-voz-lounge', name: 'Lounge Geral', type: 'voice', limit: null },
          { id: 'chan-voz-gaming', name: 'Jogos & Go Live 🎮', type: 'voice', limit: 10 },
          { id: 'chan-voz-estudos', name: 'Pair Programming 💻', type: 'voice', limit: 5 }
        ]
      }
    ],
    members: [
      {
        id: 'user-admin',
        username: 'Alex River',
        discriminator: '0001',
        role: 'Admin',
        roleColor: '#f23f43',
        status: 'online',
        customStatus: 'Criando sistemas incríveis',
        avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&h=120&q=80',
        badges: ['👑 Dono', '🚀 Impulsionador', '💻 Desenvolvedor Ativo']
      },
      {
        id: 'user-clyde',
        username: 'Clyde BOT',
        discriminator: '0000',
        role: 'Bots',
        roleColor: '#5865f2',
        isBot: true,
        status: 'online',
        customStatus: 'Digitando /help para comandos',
        avatar: 'https://assets-global.website-files.com/6257adef93867e50d84d30e2/636e0a6a49cf127bf92de1e2_icon_clyde_blurple_RGB.png',
        badges: ['🤖 Bot Verificado']
      },
      {
        id: 'user-streamer',
        username: 'GamerGirl_Pro',
        discriminator: '2024',
        role: 'Moderador',
        roleColor: '#23a55a',
        status: 'online',
        customStatus: 'Transmitindo na Sala de Jogos! 🔴',
        activity: 'Cyberpunk 2077',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&h=120&q=80',
        badges: ['🛡️ Mod', '💎 Nitro']
      },
      {
        id: 'user-lucas',
        username: 'Lucas Node',
        discriminator: '8841',
        role: 'Membro',
        roleColor: '#b5bac1',
        status: 'idle',
        customStatus: 'Codando em TypeScript',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80',
        badges: ['⭐ Membro VIP']
      },
      {
        id: 'user-beatriz',
        username: 'Bia Designer',
        discriminator: '4192',
        role: 'Membro',
        roleColor: '#b5bac1',
        status: 'dnd',
        customStatus: 'Não perturbe - Prototipando no Figma',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80',
        badges: ['🎨 Designer']
      },
      {
        id: 'user-rodrigo',
        username: 'Rodrigo Linux',
        discriminator: '7721',
        role: 'Membro',
        roleColor: '#b5bac1',
        status: 'offline',
        customStatus: '',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&h=120&q=80',
        badges: []
      }
    ]
  },
  {
    id: 'server-2',
    name: 'Gaming & Streams Brasil',
    iconText: 'GS',
    iconBg: '#23a55a',
    iconImg: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=120&h=120&q=80',
    unread: true,
    badge: 1,
    categories: [
      {
        id: 'cat-gs-text',
        name: 'TEXTO',
        channels: [
          { id: 'chan-gs-chat', name: 'bate-papo-gamer', type: 'text', topic: 'Conversa livre sobre games!' },
          { id: 'chan-gs-clips', name: 'melhores-clipes', type: 'text', topic: 'Poste seus clipes e transmissões.' }
        ]
      },
      {
        id: 'cat-gs-voice',
        name: 'SALAS DE VOZ & TRANSMISSÃO',
        channels: [
          { id: 'chan-gs-live1', name: '🔴 Transmissão Ao Vivo 1', type: 'voice', limit: 10 },
          { id: 'chan-gs-live2', name: '🔴 Transmissão Ao Vivo 2', type: 'voice', limit: 10 }
        ]
      }
    ],
    members: []
  },
  {
    id: 'server-3',
    name: 'TypeScript & JavaScript Masters',
    iconText: 'TS',
    iconBg: '#3178c6',
    iconImg: '',
    unread: false,
    badge: 0,
    categories: [
      {
        id: 'cat-ts-text',
        name: 'DISCUSSÕES',
        channels: [
          { id: 'chan-ts-node', name: 'node-backend', type: 'text', topic: 'APIs, WebSockets e Microsserviços.' },
          { id: 'chan-ts-front', name: 'react-tailwind-css', type: 'text', topic: 'Frontends modernos e UI/UX.' }
        ]
      },
      {
        id: 'cat-ts-voice',
        name: 'VOZ',
        channels: [
          { id: 'chan-ts-code', name: 'Pair Coding Room', type: 'voice', limit: 4 }
        ]
      }
    ],
    members: []
  }
];

const DEFAULT_MESSAGES = {
  'chan-geral': [
    {
      id: 'msg-1',
      userId: 'user-admin',
      username: 'Alex River',
      userAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&h=120&q=80',
      roleColor: '#f23f43',
      isBot: false,
      timestamp: 'Hoje às 10:15',
      content: 'Bem-vindos todos ao nosso Discord Clone completo! 🎉 Construído inteiramente com HTML, CSS, TailwindCSS e Node.js.',
      reactions: [{ emoji: '🎉', count: 4, users: ['user-admin', 'user-lucas'] }, { emoji: '🚀', count: 5, users: ['user-beatriz'] }]
    },
    {
      id: 'msg-2',
      userId: 'user-clyde',
      username: 'Clyde BOT',
      userAvatar: 'https://assets-global.website-files.com/6257adef93867e50d84d30e2/636e0a6a49cf127bf92de1e2_icon_clyde_blurple_RGB.png',
      roleColor: '#5865f2',
      isBot: true,
      timestamp: 'Hoje às 10:16',
      content: '⚡ **Dica do Sistema:**\nVocê pode testar a opção **"Go Live"** para transmitir sua tela em tempo real com áudio e vídeo! Basta entrar em um canal de voz e clicar no botão **"Tela"** ou no botão verde de Go Live.',
      embed: {
        title: '📺 Recurso Go Live (Transmissão de Tela)',
        description: 'Compartilhe sua tela inteira, uma janela específica de aplicativo ou uma aba do navegador em até 1080p 60 FPS.',
        color: '#5865f2',
        fields: [
          { name: 'Áudio do Sistema', value: '✅ Suportado' },
          { name: 'Picture-in-Picture & Tela Cheia', value: '✅ Suportado' }
        ]
      },
      reactions: [{ emoji: '📺', count: 3, users: ['user-streamer'] }]
    },
    {
      id: 'msg-3',
      userId: 'user-streamer',
      username: 'GamerGirl_Pro',
      userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&h=120&q=80',
      roleColor: '#23a55a',
      isBot: false,
      timestamp: 'Hoje às 10:20',
      content: 'Acabei de testar o Go Live transmitindo minha gameplay e o layout ficou idêntico ao Discord original! Os efeitos sonoros também são sensacionais! 🎧✨',
      reactions: [{ emoji: '❤️', count: 2, users: ['user-admin'] }]
    }
  ],
  'dm-clyde': [
    {
      id: 'dm-msg-1',
      userId: 'user-clyde',
      username: 'Clyde BOT',
      userAvatar: 'https://assets-global.website-files.com/6257adef93867e50d84d30e2/636e0a6a49cf127bf92de1e2_icon_clyde_blurple_RGB.png',
      roleColor: '#5865f2',
      isBot: true,
      timestamp: 'Hoje às 11:00',
      content: 'Olá! Esta é a sua conversa privada comigo. Você pode me fazer perguntas, usar comandos como `/help`, `/shrug`, `/golive` ou compartilhar arquivos!',
      reactions: [{ emoji: '🤖', count: 1, users: ['me'] }]
    }
  ]
};

class DiscordStore {
  constructor() {
    this.user = this.load('discord_user', DEFAULT_USER);
    this.servers = this.load('discord_servers', DEFAULT_SERVERS);
    this.messages = this.load('discord_messages', DEFAULT_MESSAGES);
    this.currentServerId = this.servers[0].id;
    this.currentChannelId = this.servers[0].categories[0].channels[0].id;
    
    // Voice / Stream state
    this.currentVoiceChannelId = null;
    this.currentStream = null;
    this.voiceParticipants = new Map(); // channelId -> Array of userIds/objects

    // Real-time synchronization
    this.initSync();
  }

  load(key, fallback) {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  save(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.warn('Storage save failed:', e);
    }
  }

  initSync() {
    // 1. Cross-tab synchronization without backend using BroadcastChannel
    try {
      this.channel = new BroadcastChannel('discord_clone_channel');
      this.channel.onmessage = (event) => {
        this.handleSyncMessage(event.data);
      };
    } catch (e) {
      console.log('BroadcastChannel not supported');
    }

    // 2. WebSocket synchronization with Node.js server (if available)
    this.ws = null;
    this.connectWebSocket();
  }

  connectWebSocket() {
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}`;
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('✅ Conectado ao servidor WebSocket do Discord Clone');
        // Announce user presence
        this.sendWs({
          type: 'user_presence',
          user: this.user
        });
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleSyncMessage(data);
        } catch (err) {
          console.error('WS parse error:', err);
        }
      };

      this.ws.onclose = () => {
        // Auto retry after 5 seconds
        setTimeout(() => this.connectWebSocket(), 5000);
      };
    } catch (e) {
      console.log('Running in serverless/offline mode');
    }
  }

  sendWs(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
    if (this.channel) {
      try {
        this.channel.postMessage(data);
      } catch (e) {}
    }
  }

  handleSyncMessage(data) {
    if (!data) return;

    switch (data.type) {
      case 'chat_message':
        if (data.channelId && data.message) {
          if (!this.messages[data.channelId]) {
            this.messages[data.channelId] = [];
          }
          // Avoid duplicate messages
          if (!this.messages[data.channelId].some(m => m.id === data.message.id)) {
            this.messages[data.channelId].push(data.message);
            this.save('discord_messages', this.messages);
            window.dispatchEvent(new CustomEvent('discord_message_received', { detail: data }));
            if (window.discordAudio && data.message.userId !== this.user.id) {
              window.discordAudio.playNotification();
            }
          }
        }
        break;

      case 'reaction_add':
        this.applyReaction(data.messageId, data.emoji, data.userId, false);
        window.dispatchEvent(new CustomEvent('discord_reaction_updated', { detail: data }));
        break;

      case 'voice_update':
        window.dispatchEvent(new CustomEvent('discord_voice_updated', { detail: data }));
        break;

      case 'stream_started':
        window.dispatchEvent(new CustomEvent('discord_remote_stream_started', { detail: data }));
        break;

      case 'stream_stopped':
        window.dispatchEvent(new CustomEvent('discord_remote_stream_stopped', { detail: data }));
        break;

      case 'speaking_state':
        window.dispatchEvent(new CustomEvent('discord_speaking_state', { detail: data }));
        break;
    }
  }

  getCurrentServer() {
    if (this.currentServerId === 'home') {
      return {
        id: 'home',
        name: 'Mensagens Diretas',
        categories: [
          {
            id: 'cat-dms',
            name: 'MENSAGENS DIRETAS',
            channels: [
              { id: 'dm-clyde', name: 'Clyde BOT', type: 'text', topic: 'Conversa privada com o assistente Clyde' },
              { id: 'dm-alex', name: 'Alex River', type: 'text', topic: 'Conversa privada com Alex' },
              { id: 'dm-gamer', name: 'GamerGirl_Pro', type: 'text', topic: 'Conversa privada com GamerGirl_Pro' }
            ]
          }
        ],
        members: this.servers[0].members
      };
    }
    return this.servers.find(s => s.id === this.currentServerId) || this.servers[0];
  }

  getCurrentChannel() {
    const server = this.getCurrentServer();
    for (const cat of server.categories) {
      const chan = cat.channels.find(c => c.id === this.currentChannelId);
      if (chan) return chan;
    }
    return server.categories[0].channels[0];
  }

  getChannelMessages(channelId) {
    return this.messages[channelId] || [];
  }

  addMessage(channelId, content, attachment = null) {
    if (!content && !attachment) return null;

    const newMsg = {
      id: 'msg-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      userId: this.user.id,
      username: this.user.username,
      userAvatar: this.user.avatar,
      roleColor: '#5865f2',
      isBot: false,
      timestamp: 'Hoje às ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: content,
      attachment: attachment,
      reactions: []
    };

    if (!this.messages[channelId]) {
      this.messages[channelId] = [];
    }

    this.messages[channelId].push(newMsg);
    this.save('discord_messages', this.messages);

    // Broadcast message to peers
    this.sendWs({
      type: 'chat_message',
      channelId: channelId,
      message: newMsg
    });

    return newMsg;
  }

  addReaction(messageId, emoji) {
    this.applyReaction(messageId, emoji, this.user.id, true);
  }

  applyReaction(messageId, emoji, userId, broadcast = true) {
    let foundMsg = null;
    for (const chanId in this.messages) {
      const msg = this.messages[chanId].find(m => m.id === messageId);
      if (msg) {
        foundMsg = msg;
        break;
      }
    }
    if (!foundMsg) return;

    if (!foundMsg.reactions) foundMsg.reactions = [];

    const existingReaction = foundMsg.reactions.find(r => r.emoji === emoji);
    if (existingReaction) {
      if (existingReaction.users.includes(userId)) {
        // Toggle remove
        existingReaction.users = existingReaction.users.filter(u => u !== userId);
        existingReaction.count--;
        if (existingReaction.count <= 0) {
          foundMsg.reactions = foundMsg.reactions.filter(r => r.emoji !== emoji);
        }
      } else {
        existingReaction.users.push(userId);
        existingReaction.count++;
      }
    } else {
      foundMsg.reactions.push({
        emoji: emoji,
        count: 1,
        users: [userId]
      });
    }

    this.save('discord_messages', this.messages);

    if (broadcast) {
      this.sendWs({
        type: 'reaction_add',
        messageId: messageId,
        emoji: emoji,
        userId: userId
      });
    }
  }

  updateUser(updates) {
    this.user = { ...this.user, ...updates };
    this.save('discord_user', this.user);
    this.sendWs({
      type: 'user_update',
      user: this.user
    });
    window.dispatchEvent(new CustomEvent('discord_user_updated', { detail: this.user }));
  }

  addServer(name, iconImg = '') {
    const newServer = {
      id: 'server-' + Date.now(),
      name: name,
      iconText: name.substring(0, 2).toUpperCase(),
      iconBg: '#5865f2',
      iconImg: iconImg,
      unread: false,
      badge: 0,
      categories: [
        {
          id: 'cat-' + Date.now() + '-1',
          name: 'CANAIS DE TEXTO',
          channels: [
            { id: 'chan-' + Date.now() + '-g', name: 'geral', type: 'text', topic: 'Canal de boas-vindas' }
          ]
        },
        {
          id: 'cat-' + Date.now() + '-2',
          name: 'CANAIS DE VOZ',
          channels: [
            { id: 'chan-' + Date.now() + '-v', name: 'Voz Geral', type: 'voice', limit: null }
          ]
        }
      ],
      members: [
        {
          id: this.user.id,
          username: this.user.username,
          discriminator: this.user.discriminator,
          role: 'Dono',
          roleColor: '#f23f43',
          status: this.user.status,
          avatar: this.user.avatar,
          badges: ['👑 Dono']
        }
      ]
    };

    this.servers.push(newServer);
    this.save('discord_servers', this.servers);
    return newServer;
  }

  addChannel(serverId, categoryId, name, type = 'text') {
    const server = this.servers.find(s => s.id === serverId);
    if (!server) return null;

    let category = server.categories.find(c => c.id === categoryId);
    if (!category) category = server.categories[0];

    const cleanName = name.toLowerCase().replace(/\s+/g, '-');
    const newChan = {
      id: 'chan-' + Date.now(),
      name: cleanName,
      type: type,
      topic: type === 'text' ? `Canal de texto #${cleanName}` : 'Canal de voz'
    };

    category.channels.push(newChan);
    this.save('discord_servers', this.servers);
    return newChan;
  }
}

window.discordStore = new DiscordStore();
