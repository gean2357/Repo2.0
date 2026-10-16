// Discord Permissions Catalog (Official Discord Permission Flags)
const DISCORD_PERMISSIONS = [
  { id: 'ADMINISTRATOR', name: 'Administrador', desc: 'Concede todas as permissões e ignora restrições de canal. Perigoso!', category: 'Geral', dangerous: true },
  { id: 'MANAGE_SERVER', name: 'Gerenciar Servidor', desc: 'Permite alterar o nome do servidor, ícone e configurações.', category: 'Geral' },
  { id: 'MANAGE_ROLES', name: 'Gerenciar Cargos', desc: 'Permite criar, editar e excluir cargos abaixo deste cargo.', category: 'Geral' },
  { id: 'MANAGE_CHANNELS', name: 'Gerenciar Canais', desc: 'Permite criar, editar ou excluir canais de texto e voz.', category: 'Geral' },
  { id: 'KICK_MEMBERS', name: 'Expulsar Membros', desc: 'Permite remover membros do servidor.', category: 'Moderação' },
  { id: 'BAN_MEMBERS', name: 'Banir Membros', desc: 'Permite banir permanentemente membros do servidor.', category: 'Moderação' },
  { id: 'MODERATE_MEMBERS', name: 'Colocar de Castigo (Timeout)', desc: 'Permite silenciar membros temporariamente por 60s até 1 semana.', category: 'Moderação' },
  { id: 'SEND_MESSAGES', name: 'Enviar Mensagens', desc: 'Permite que os membros enviem mensagens nos canais de texto.', category: 'Chat' },
  { id: 'ATTACH_FILES', name: 'Anexar Arquivos', desc: 'Permite fazer upload de imagens e arquivos nas mensagens.', category: 'Chat' },
  { id: 'CONNECT_VOICE', name: 'Conectar à Voz', desc: 'Permite que os membros ouçam e entrem em canais de voz.', category: 'Voz' },
  { id: 'SPEAK_VOICE', name: 'Falar na Voz', desc: 'Permite que os membros falem no microfone nos canais de voz.', category: 'Voz' },
  { id: 'STREAM_LIVE', name: 'Transmitir Tela (Go Live)', desc: 'Permite que os membros compartilhem tela em canais de voz.', category: 'Voz' }
];

const DEFAULT_ROLES = [
  {
    id: 'role-admin',
    name: 'Administrador',
    color: '#f23f43',
    hoist: true,
    position: 1,
    permissions: [
      'ADMINISTRATOR',
      'MANAGE_SERVER',
      'MANAGE_ROLES',
      'MANAGE_CHANNELS',
      'KICK_MEMBERS',
      'BAN_MEMBERS',
      'MODERATE_MEMBERS',
      'SEND_MESSAGES',
      'ATTACH_FILES',
      'CONNECT_VOICE',
      'SPEAK_VOICE',
      'STREAM_LIVE'
    ]
  },
  {
    id: 'role-mod',
    name: 'Moderador',
    color: '#23a55a',
    hoist: true,
    position: 2,
    permissions: [
      'MANAGE_CHANNELS',
      'KICK_MEMBERS',
      'BAN_MEMBERS',
      'MODERATE_MEMBERS',
      'SEND_MESSAGES',
      'ATTACH_FILES',
      'CONNECT_VOICE',
      'SPEAK_VOICE',
      'STREAM_LIVE'
    ]
  },
  {
    id: 'role-vip',
    name: 'VIP Dev',
    color: '#f0b232',
    hoist: true,
    position: 3,
    permissions: [
      'SEND_MESSAGES',
      'ATTACH_FILES',
      'CONNECT_VOICE',
      'SPEAK_VOICE',
      'STREAM_LIVE'
    ]
  },
  {
    id: 'role-everyone',
    name: '@everyone',
    color: '#949ba4',
    hoist: false,
    position: 99,
    permissions: [
      'SEND_MESSAGES',
      'ATTACH_FILES',
      'CONNECT_VOICE',
      'SPEAK_VOICE',
      'STREAM_LIVE'
    ]
  }
];

const DEFAULT_USER = {
  id: 'me',
  username: 'DevMaster',
  discriminator: '1337',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&h=120&q=80',
  status: 'online', // online, idle, dnd, offline
  customStatus: 'Construindo o Discord Clone 🚀',
  activity: 'Visual Studio Code',
  activityType: 'Playing',
  decoration: 'cyberpunk', // none, cyberpunk, fire, magic, sakura, pixel, gold, cat, galaxy
  bannerColor: '#5865F2',
  bio: 'Desenvolvedor Full Stack apaixonado por tecnologia e inovação.',
  pronouns: 'ele/dele',
  roles: ['role-admin'],
  timeoutUntil: null,
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
    roles: DEFAULT_ROLES,
    bans: [
      {
        userId: 'user-banned-1',
        username: 'SpamBot_X',
        discriminator: '9999',
        avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=120&h=120&q=80',
        reason: 'Envio de links maliciosos e spam',
        bannedAt: '12/10/2026',
        bannedBy: 'Alex River'
      }
    ],
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
    this.databaseUsers = this.load('discord_database_users', []);
    this.serverInvites = this.load('discord_server_invites', []);

    // Normalize servers so they always have roles, bans, and member roles
    this.normalizeServers();

    const userServers = this.getUserServers();
    if (userServers.length > 0) {
      this.currentServerId = userServers[0].id;
      this.currentChannelId = userServers[0].categories[0]?.channels[0]?.id || 'chan-geral';
    } else {
      this.currentServerId = 'home';
      this.currentChannelId = 'amigos';
    }
    
    // Voice / Stream state
    this.currentVoiceChannelId = null;
    this.currentStream = null;
    this.voiceParticipants = new Map(); // channelId -> Array of userIds/objects

    // Real-time synchronization
    this.initSync();

    // Listen to Firebase auth changes to sync servers
    window.addEventListener('discord_firebase_auth_state', () => {
      this.syncLocalServersToCloud();
      if (window.discordApp) {
        window.discordApp.renderServers();
        window.discordApp.renderChannels();
      }
    });
  }

  upsertServerFromCloud(cloudServer) {
    if (!cloudServer || !cloudServer.id) return;

    const srvData = JSON.parse(JSON.stringify(cloudServer));
    delete srvData.updatedAt;

    const idx = this.servers.findIndex(s => s.id === srvData.id);
    if (idx >= 0) {
      this.servers[idx] = Object.assign({}, this.servers[idx], srvData);
    } else {
      this.servers.push(srvData);
    }

    this.normalizeServers();
    this.save('discord_servers', this.servers);

    if (window.discordApp) {
      window.discordApp.renderServers();
      window.discordApp.renderChannels();
      window.discordApp.renderMembers();
    }
    window.dispatchEvent(new CustomEvent('discord_servers_updated', { detail: srvData }));
  }

  removeServerFromCloud(serverId) {
    this.servers = this.servers.filter(s => s.id !== serverId);
    this.save('discord_servers', this.servers);
    if (this.currentServerId === serverId) {
      this.currentServerId = 'home';
    }
    if (window.discordApp) {
      window.discordApp.renderServers();
      window.discordApp.renderChannels();
    }
  }

  syncLocalServersToCloud() {
    if (!window.firebaseService || !window.firebaseService.isConfigured) return;
    const myId = this.user ? this.user.id : null;
    if (!myId) return;

    this.servers.forEach(s => {
      const isMyServer = s.ownerId === myId || (s.members && s.members.some(m => m.id === myId && (m.role === 'Dono' || m.role === 'Admin')));
      if (isMyServer && !['server-1', 'server-2', 'server-3'].includes(s.id)) {
        window.firebaseService.saveServer(s);
      }
    });
  }

  persistServer(server) {
    this.save('discord_servers', this.servers);
    if (window.firebaseService && window.firebaseService.isConfigured && server && server.id) {
      window.firebaseService.saveServer(server);
    }
  }

  getUserServers() {
    const user = this.user;
    if (!user) return [];

    const testServerIds = ['server-1', 'server-2', 'server-3'];

    // O dono original / primeiro admin do sistema (DevMaster / user-admin)
    const isSuperAdmin = user.id === 'user-admin' || user.id === 'me' || 
      (user.username && (user.username.toLowerCase() === 'devmaster' || user.username.toLowerCase() === 'alex river'));

    if (isSuperAdmin) {
      return this.servers;
    }

    // Para usuários normais:
    // Só vê servidores que ele mesmo criou (ownerId === user.id)
    // OU servidores que ele foi convidado e aceitou (está em members)
    return this.servers.filter(s => {
      // Se for servidor de teste padrão, somente mostra se o usuário for membro explícito
      if (testServerIds.includes(s.id)) {
        if (!s.members) return false;
        return s.members.some(m => m.id === user.id || (m.username && user.username && m.username.toLowerCase() === user.username.toLowerCase()));
      }

      // Se for o dono do servidor criado
      const myUid = user.uid || user.id;
      const myUsername = (user.username || '').toLowerCase();
      const isOwner = (s.ownerId && (s.ownerId === user.id || s.ownerId === myUid)) ||
                      (s.ownerUsername && myUsername && s.ownerUsername.toLowerCase() === myUsername) ||
                      (s.members && s.members.some(m => (m.role === 'Dono') && ((m.id && (m.id === user.id || m.id === myUid)) || (m.username && myUsername && m.username.toLowerCase() === myUsername))));
      if (isOwner) {
        return true;
      }

      // Se foi convidado e aceitou (está na lista de membros)
      if (s.members && s.members.some(m => (m.id && (m.id === user.id || m.id === myUid)) || (m.username && myUsername && m.username.toLowerCase() === myUsername))) {
        return true;
      }

      return false;
    });
  }

  addServerInvite(invite) {
    if (!invite || !invite.id) return;
    if (!this.serverInvites) this.serverInvites = [];
    if (!this.serverInvites.some(i => i.id === invite.id || (i.serverId === invite.serverId && i.targetUserId === invite.targetUserId))) {
      this.serverInvites.push(invite);
      this.save('discord_server_invites', this.serverInvites);
      window.dispatchEvent(new CustomEvent('discord_server_invites_updated', { detail: invite }));
    }
  }

  removeServerInvite(inviteId) {
    this.serverInvites = (this.serverInvites || []).filter(i => i.id !== inviteId && i.firestoreDocId !== inviteId);
    this.save('discord_server_invites', this.serverInvites);
    window.dispatchEvent(new CustomEvent('discord_server_invites_updated'));
  }

  acceptServerInvite(inviteId) {
    const inv = (this.serverInvites || []).find(i => i.id === inviteId || i.firestoreDocId === inviteId);
    if (!inv) return null;

    let srv = this.servers.find(s => s.id === inv.serverId);
    if (!srv) {
      // Se o servidor não existe localmente no cliente (ex: criado por outro usuário em outro navegador),
      // recria o servidor a partir do objeto serverData enviado no convite!
      if (inv.serverData) {
        srv = JSON.parse(JSON.stringify(inv.serverData));
      } else {
        srv = {
          id: inv.serverId,
          name: inv.serverName || 'Servidor',
          iconText: inv.serverIconText || (inv.serverName ? inv.serverName.substring(0, 2).toUpperCase() : 'CD'),
          iconBg: inv.serverBg || '#5865F2',
          iconImg: inv.serverIcon || '',
          unread: false,
          badge: 0,
          ownerId: inv.fromId || '',
          roles: JSON.parse(JSON.stringify(DEFAULT_ROLES)),
          bans: [],
          categories: [
            {
              id: 'cat-text-' + inv.serverId,
              name: 'CANAIS DE TEXTO',
              channels: [
                { id: 'chan-' + inv.serverId + '-geral', name: 'geral', type: 'text', topic: 'Canal de boas-vindas' }
              ]
            },
            {
              id: 'cat-voice-' + inv.serverId,
              name: 'CANAIS DE VOZ',
              channels: [
                { id: 'chan-' + inv.serverId + '-voz', name: 'Voz Geral', type: 'voice', limit: null }
              ]
            }
          ],
          members: []
        };
      }
      this.servers.push(srv);
    }

    if (!srv.members) srv.members = [];
    const alreadyMember = srv.members.some(m => m.id === this.user.id || (m.username && this.user.username && m.username.toLowerCase() === this.user.username.toLowerCase()));
    if (!alreadyMember) {
      srv.members.push({
        id: this.user.id,
        username: this.user.username,
        discriminator: this.user.discriminator || '0001',
        role: 'Membro',
        roleColor: '#949ba4',
        status: 'online',
        customStatus: this.user.customStatus || 'Novo membro',
        avatar: this.user.avatar,
        roles: ['role-everyone'],
        badges: ['Membro']
      });
    }

    this.save('discord_servers', this.servers);
    this.persistServer(srv);
    this.removeServerInvite(inviteId);

    // If invite came from Firestore, delete it so it won't trigger again
    if (inv.firestoreDocId && window.firebaseService && window.firebaseService.db) {
      try {
        window.firebaseService.db.collection('server_invites').doc(inv.firestoreDocId).delete().catch(() => {});
      } catch (e) {}
    }

    // Notifica outros peers
    this.sendWs({
      type: 'server_member_joined',
      serverId: inv.serverId,
      member: this.user
    });

    return srv;
  }

  declineServerInvite(inviteId) {
    this.removeServerInvite(inviteId);
  }

  getServerInvites() {
    return this.serverInvites || [];
  }

  normalizeServers() {
    if (!this.user.roles || this.user.roles.length === 0) {
      this.user.roles = ['role-everyone'];
    }
    if (this.user.timeoutUntil === undefined) this.user.timeoutUntil = null;
    if (!this.user.friends || !Array.isArray(this.user.friends)) {
      this.user.friends = [];
    }

    this.servers.forEach(server => {
      if (!server.roles || server.roles.length === 0) {
        server.roles = JSON.parse(JSON.stringify(DEFAULT_ROLES));
      }
      if (!server.bans) {
        server.bans = [];
      }
      (server.members || []).forEach(m => {
        if (!m.roles || m.roles.length === 0) {
          m.roles = m.role === 'Admin' || m.role === 'Dono' ? ['role-admin'] : m.role === 'Moderador' ? ['role-mod'] : ['role-everyone'];
        }
        if (m.timeoutUntil === undefined) {
          m.timeoutUntil = null;
        }
      });
    });
    this.save('discord_servers', this.servers);
  }

  syncDatabaseUsers(users) {
    if (!Array.isArray(users)) return;
    this.databaseUsers = users;
    this.save('discord_database_users', this.databaseUsers);
    window.dispatchEvent(new CustomEvent('discord_database_users_updated', { detail: users }));
  }

  setVoiceParticipant(channelId, user, clientId) {
    if (!channelId || !user) return;
    this.removeVoiceParticipant(null, user.id, clientId);

    if (!this.voiceParticipants.has(channelId)) {
      this.voiceParticipants.set(channelId, []);
    }
    const list = this.voiceParticipants.get(channelId);
    if (!list.some(u => u.id === user.id || (clientId && u.clientId === clientId))) {
      list.push({
        id: user.id || clientId,
        clientId: clientId,
        username: user.username || 'Usuário',
        avatar: user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.username || 'user')}`,
        isSpeaking: false,
        isMuted: user.isMuted || false,
        isStreaming: user.isStreaming || false
      });
    }
  }

  removeVoiceParticipant(channelId, userId, clientId) {
    this.voiceParticipants.forEach((list, chId) => {
      if (!channelId || channelId === chId) {
        const filtered = list.filter(u => {
          if (userId && u.id === userId) return false;
          if (clientId && u.clientId === clientId) return false;
          return true;
        });
        this.voiceParticipants.set(chId, filtered);
      }
    });
  }

  getVoiceParticipants(channelId) {
    return this.voiceParticipants.get(channelId) || [];
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
        if (data.userId !== this.user.id) {
          this.applyReaction(data.messageId, data.emoji, data.userId, false);
          window.dispatchEvent(new CustomEvent('discord_reaction_updated', { detail: data }));
        }
        break;

      case 'server_created':
        if (data.server && !this.servers.some(s => s.id === data.server.id)) {
          this.servers.push(data.server);
          this.save('discord_servers', this.servers);
          if (window.discordApp) {
            window.discordApp.renderServers();
          }
        }
        break;

      case 'init':
        this.clientId = data.clientId;
        console.log('Meu Client ID:', this.clientId);
        if (Array.isArray(data.voiceParticipants)) {
          data.voiceParticipants.forEach(vp => {
            this.setVoiceParticipant(vp.channelId, vp.user, vp.clientId);
          });
          window.dispatchEvent(new CustomEvent('discord_voice_updated'));
          if (window.discordVoice) window.discordVoice.renderVoiceParticipants();
        }
        if (Array.isArray(data.activeStreams)) {
          data.activeStreams.forEach(stream => {
            window.dispatchEvent(new CustomEvent('discord_remote_stream_started', { detail: { stream } }));
          });
        }
        break;

      case 'webrtc_request_watch':
        window.dispatchEvent(new CustomEvent('discord_webrtc_request_watch', { detail: data }));
        break;

      case 'webrtc_offer':
        window.dispatchEvent(new CustomEvent('discord_webrtc_offer', { detail: data }));
        break;

      case 'webrtc_answer':
        window.dispatchEvent(new CustomEvent('discord_webrtc_answer', { detail: data }));
        break;

      case 'webrtc_ice_candidate':
        window.dispatchEvent(new CustomEvent('discord_webrtc_ice_candidate', { detail: data }));
        break;

      case 'webrtc_voice_offer':
        window.dispatchEvent(new CustomEvent('discord_webrtc_voice_offer', { detail: data }));
        break;

      case 'webrtc_voice_answer':
        window.dispatchEvent(new CustomEvent('discord_webrtc_voice_answer', { detail: data }));
        break;

      case 'webrtc_voice_ice_candidate':
        window.dispatchEvent(new CustomEvent('discord_webrtc_voice_ice_candidate', { detail: data }));
        break;

      case 'voice_update':
        if (data.channelId && data.user) {
          this.setVoiceParticipant(data.channelId, data.user, data.userId);
        }
        window.dispatchEvent(new CustomEvent('discord_voice_updated', { detail: data }));
        if (window.discordVoice) window.discordVoice.renderVoiceParticipants();
        break;

      case 'voice_leave':
        this.removeVoiceParticipant(data.channelId, data.user ? data.user.id : null, data.userId);
        window.dispatchEvent(new CustomEvent('discord_voice_updated', { detail: data }));
        if (window.discordVoice) window.discordVoice.renderVoiceParticipants();
        break;

      case 'user_disconnect':
        this.removeVoiceParticipant(null, null, data.userId);
        window.dispatchEvent(new CustomEvent('discord_voice_updated', { detail: data }));
        if (window.discordVoice) window.discordVoice.renderVoiceParticipants();
        break;

      case 'stream_started':
        if (data.stream) {
          this.voiceParticipants.forEach(list => {
            const found = list.find(u => (data.stream.user && u.id === data.stream.user.id) || u.clientId === data.stream.streamId);
            if (found) found.isStreaming = true;
          });
        }
        window.dispatchEvent(new CustomEvent('discord_remote_stream_started', { detail: data }));
        if (window.discordVoice) window.discordVoice.renderVoiceParticipants();
        break;

      case 'stream_stopped':
        this.voiceParticipants.forEach(list => {
          const found = list.find(u => u.clientId === data.userId);
          if (found) found.isStreaming = false;
        });
        window.dispatchEvent(new CustomEvent('discord_remote_stream_stopped', { detail: data }));
        if (window.discordVoice) window.discordVoice.renderVoiceParticipants();
        break;

      case 'speaking_state':
        this.voiceParticipants.forEach(list => {
          const found = list.find(u => (data.user && u.id === data.user.id) || u.clientId === data.userId);
          if (found) found.isSpeaking = data.speaking;
        });
        window.dispatchEvent(new CustomEvent('discord_speaking_state', { detail: data }));
        if (window.discordVoice) window.discordVoice.updateSpeakingIndicators(data);
        break;

      case 'server_roles_updated':
        const srv = this.servers.find(s => s.id === data.serverId);
        if (srv) {
          srv.roles = data.roles;
          this.persistServer(srv);
          window.dispatchEvent(new CustomEvent('discord_roles_updated', { detail: data }));
        }
        break;

      case 'member_roles_updated':
        const srvM = this.servers.find(s => s.id === data.serverId);
        if (srvM) {
          const mb = (srvM.members || []).find(m => m.id === data.memberId);
          if (mb) mb.roles = data.roles;
          this.persistServer(srvM);
          window.dispatchEvent(new CustomEvent('discord_member_updated', { detail: data }));
        }
        break;

      case 'member_timeout':
        const srvT = this.servers.find(s => s.id === data.serverId);
        if (srvT) {
          const myId = this.user ? this.user.id : null;
          const isTargetMe = data.memberId === 'me' || data.memberId === myId || (this.user?.username && data.memberId.toLowerCase() === this.user.username.toLowerCase());
          const mb = (srvT.members || []).find(m => m.id === data.memberId || (isTargetMe && m.id === myId));
          if (mb) {
            mb.timeoutUntil = data.timeoutUntil;
            mb.timeoutReason = data.reason;
          }
          if (isTargetMe && this.user) {
            this.user.timeoutUntil = data.timeoutUntil;
            this.user.timeoutReason = data.reason;
            this.save('discord_user', this.user);
          }
          this.persistServer(srvT);
          window.dispatchEvent(new CustomEvent('discord_member_timeout', { detail: data }));
        }
        break;

      case 'member_timeout_removed':
        const srvTR = this.servers.find(s => s.id === data.serverId);
        if (srvTR) {
          const myId = this.user ? this.user.id : null;
          const isTargetMe = data.memberId === 'me' || data.memberId === myId || (this.user?.username && data.memberId.toLowerCase() === this.user.username.toLowerCase());
          const mb = (srvTR.members || []).find(m => m.id === data.memberId || (isTargetMe && m.id === myId));
          if (mb) {
            mb.timeoutUntil = null;
            mb.timeoutReason = null;
          }
          if (isTargetMe && this.user) {
            this.user.timeoutUntil = null;
            this.user.timeoutReason = null;
            this.save('discord_user', this.user);
          }
          this.persistServer(srvTR);
          window.dispatchEvent(new CustomEvent('discord_member_timeout', { detail: data }));
        }
        break;

      case 'member_kicked':
        const srvK = this.servers.find(s => s.id === data.serverId);
        if (srvK) {
          srvK.members = (srvK.members || []).filter(m => m.id !== data.memberId);
          this.persistServer(srvK);
          window.dispatchEvent(new CustomEvent('discord_member_kicked', { detail: data }));
        }
        break;

      case 'member_banned':
        const srvB = this.servers.find(s => s.id === data.serverId);
        if (srvB) {
          if (!srvB.bans) srvB.bans = [];
          if (data.banEntry) srvB.bans.push(data.banEntry);
          srvB.members = (srvB.members || []).filter(m => m.id !== data.memberId);
          this.persistServer(srvB);
          window.dispatchEvent(new CustomEvent('discord_member_banned', { detail: data }));
        }
        break;

      case 'member_unbanned':
        const srvU = this.servers.find(s => s.id === data.serverId);
        if (srvU && srvU.bans) {
          srvU.bans = srvU.bans.filter(b => b.userId !== data.userId);
          this.persistServer(srvU);
          window.dispatchEvent(new CustomEvent('discord_member_unbanned', { detail: data }));
        }
        break;

      case 'friend_request_sent':
        if (data.request) {
          const req = data.request;
          const isForMe = (req.toUserId && req.toUserId === this.user.id) ||
                          (req.toUsername && req.toUsername.toLowerCase() === (this.user.username || '').toLowerCase()) ||
                          (req.toUsername_lower && req.toUsername_lower === (this.user.username || '').toLowerCase());
          if (isForMe && req.fromId !== this.user.id) {
            const requests = JSON.parse(localStorage.getItem('discord_friend_requests') || '[]');
            if (!requests.some(r => r.id === req.id)) {
              requests.push(req);
              localStorage.setItem('discord_friend_requests', JSON.stringify(requests));
            }
            window.dispatchEvent(new CustomEvent('discord_friend_request_received', { detail: req }));
            if (window.discordAudio) window.discordAudio.playNotification();
          }
        }
        break;

      case 'friend_request_accepted':
        if (data.fromId === this.user.id || data.toId === this.user.id) {
          const newFriendId = data.fromId === this.user.id ? data.toId : data.fromId;
          if (!this.user.friends) this.user.friends = [];
          if (!this.user.friends.includes(newFriendId)) {
            this.user.friends.push(newFriendId);
            this.save('discord_user', this.user);
          }
          window.dispatchEvent(new CustomEvent('discord_friend_request_accepted', { detail: data }));
          if (window.discordAudio) window.discordAudio.playJoin();
        }
        break;

      case 'server_invite_sent':
        if (data.invite) {
          const inv = data.invite;
          const myId = this.user.id;
          const myName = (this.user.username || '').toLowerCase();
          const isForMe = !inv.targetUserId || inv.targetUserId === myId || (inv.targetUserId && inv.targetUserId.toLowerCase() === myName) || inv.targetUserId === 'all';
          if (isForMe && inv.fromId !== myId) {
            this.addServerInvite(inv);
            window.dispatchEvent(new CustomEvent('discord_server_invite_received', { detail: inv }));
            if (window.discordAudio) window.discordAudio.playNotification();
          }
        }
        break;

      case 'server_member_joined':
        if (data.serverId && data.member) {
          const srvJoined = this.servers.find(s => s.id === data.serverId);
          if (srvJoined) {
            if (!srvJoined.members) srvJoined.members = [];
            if (!srvJoined.members.some(m => m.id === data.member.id)) {
              srvJoined.members.push({
                ...data.member,
                role: 'Membro',
                roles: ['role-everyone']
              });
              this.persistServer(srvJoined);
              window.dispatchEvent(new CustomEvent('discord_member_joined', { detail: data }));
              if (window.discordApp) {
                window.discordApp.renderMembers();
                window.discordApp.renderServers();
              }
            }
          }
        }
        break;

      case 'new_dm_message':
        if (data.dmId && data.message) {
          if (!this.messages[data.dmId]) {
            this.messages[data.dmId] = [];
          }
          if (!this.messages[data.dmId].some(m => m.id === data.message.id)) {
            this.messages[data.dmId].push(data.message);
            this.save('discord_messages', this.messages);
            window.dispatchEvent(new CustomEvent('discord_message_received', { detail: { channelId: data.dmId, message: data.message } }));
            if (window.discordAudio && data.message.userId !== this.user.id) {
              window.discordAudio.playNotification();
            }
          }
        }
        break;
    }
  }

  getFriendsList() {
    const friendIds = this.user.friends || [];
    const allMembers = [];

    // 1. From database users
    (this.databaseUsers || []).forEach(u => {
      if (!allMembers.some(x => x.id === u.id)) allMembers.push(u);
    });

    // 2. From server members
    this.servers.forEach(s => {
      (s.members || []).forEach(m => {
        if (!allMembers.some(x => x.id === m.id)) allMembers.push(m);
      });
    });

    // 3. From local accounts catalog
    try {
      const localAccounts = JSON.parse(localStorage.getItem('discord_local_accounts') || '{}');
      Object.values(localAccounts).forEach(acc => {
        if (acc.user && !allMembers.some(x => x.id === acc.user.id)) {
          allMembers.push(acc.user);
        }
      });
    } catch (e) {}

    const result = [];
    friendIds.forEach(id => {
      const found = allMembers.find(m => m.id === id);
      if (found) {
        result.push(found);
      } else {
        result.push({
          id: id,
          username: id.replace('user-', '').replace('_', ' '),
          discriminator: '0000',
          avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${id}`,
          status: 'online',
          customStatus: 'Amigo do Discord',
          badges: []
        });
      }
    });
    return result;
  }

  getInviteCandidates() {
    const myId = this.user ? this.user.id : null;
    const candidates = [];

    // 1. All registered database users (except myself)
    (this.databaseUsers || []).forEach(u => {
      if (u.id !== myId && !candidates.some(c => c.id === u.id)) {
        candidates.push({
          id: u.id,
          username: u.username || 'Usuário',
          discriminator: u.discriminator || '0001',
          avatar: u.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(u.username || u.id)}`,
          status: u.status || 'online',
          isFriend: (this.user.friends || []).includes(u.id),
          isDatabaseUser: true
        });
      }
    });

    // 2. Friends who might not be in databaseUsers list yet
    const friends = this.getFriendsList();
    friends.forEach(f => {
      if (f.id !== myId && !candidates.some(c => c.id === f.id)) {
        candidates.push({
          id: f.id,
          username: f.username,
          discriminator: f.discriminator || '0001',
          avatar: f.avatar,
          status: f.status || 'online',
          isFriend: true
        });
      }
    });

    return candidates;
  }

  removeFriend(friendId) {
    if (!this.user.friends) return false;
    this.user.friends = this.user.friends.filter(id => id !== friendId);
    this.save('discord_user', this.user);
    window.dispatchEvent(new CustomEvent('discord_user_updated', { detail: this.user }));
    return true;
  }

  getCurrentServer() {
    if (this.currentServerId === 'home') {
      const friends = this.getFriendsList();
      const dmChannels = [
        { id: 'amigos', name: 'Amigos', type: 'friends', topic: 'Lista de Amigos e Solicitações' },
        { id: 'dm-clyde', name: 'Clyde BOT', type: 'text', topic: 'Conversa privada com o assistente Clyde', avatar: 'https://assets-global.website-files.com/6257adef93867e50d84d30e2/636e0a6a49cf127bf92de1e2_icon_clyde_blurple_RGB.png', status: 'online' }
      ];

      friends.forEach(f => {
        dmChannels.push({
          id: `dm-${f.id}`,
          name: f.username,
          type: 'text',
          topic: `Conversa privada com ${f.username}`,
          avatar: f.avatar,
          status: f.status || 'offline',
          friendId: f.id
        });
      });

      return {
        id: 'home',
        name: 'Mensagens Diretas',
        categories: [
          {
            id: 'cat-dms',
            name: 'MENSAGENS DIRETAS',
            channels: dmChannels
          }
        ],
        members: this.servers[0].members
      };
    }
    const userServers = this.getUserServers();
    const found = userServers.find(s => s.id === this.currentServerId);
    if (found) return found;
    if (userServers.length > 0) return userServers[0];
    this.currentServerId = 'home';
    return this.getCurrentServer();
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

    // Save in Firebase Cloud Firestore if configured
    const isDm = channelId.startsWith('dm');
    if (isDm && window.firebaseService && window.firebaseService.isConfigured) {
      try {
        window.firebaseService.sendDirectMessage(channelId, content, attachment);
      } catch (e) {}
    } else if (!isDm && window.firebaseService && window.firebaseService.isConfigured) {
      try {
        const srv = this.getCurrentServer();
        window.firebaseService.sendChannelMessage(srv ? srv.id : 'server', channelId, newMsg);
      } catch (e) {}
    }

    // Broadcast message to peers
    this.sendWs({
      type: isDm ? 'new_dm_message' : 'chat_message',
      channelId: channelId,
      dmId: channelId,
      message: newMsg
    });

    return newMsg;
  }

  addReaction(messageId, emoji) {
    this.applyReaction(messageId, emoji, this.user.id, true);
    window.dispatchEvent(new CustomEvent('discord_reaction_updated', { detail: { messageId, emoji, userId: this.user.id } }));
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

  setStatus(newStatus) {
    console.log('Alterando status para:', newStatus);
    this.updateUser({ status: newStatus });
  }

  setDecoration(newDecoration) {
    console.log('Alterando moldura para:', newDecoration);
    this.updateUser({ decoration: newDecoration });
  }

  addServer(name, iconImg = '') {
    const srvId = 'server-' + Date.now();
    const newServer = {
      id: srvId,
      name: name,
      iconText: name.substring(0, 2).toUpperCase(),
      iconBg: '#5865f2',
      iconImg: iconImg,
      unread: false,
      badge: 0,
      ownerId: this.user.id,
      ownerUsername: this.user.username,
      roles: JSON.parse(JSON.stringify(DEFAULT_ROLES)),
      bans: [],
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
          discriminator: this.user.discriminator || '0001',
          role: 'Dono',
          roleColor: '#f23f43',
          status: this.user.status || 'online',
          avatar: this.user.avatar,
          roles: ['role-admin'],
          badges: ['👑 Dono']
        }
      ]
    };

    this.servers.push(newServer);
    this.persistServer(newServer);

    // Broadcast server creation so connected clients receive the server
    this.sendWs({
      type: 'server_created',
      server: newServer
    });

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
    this.persistServer(server);
    return newChan;
  }

  // =========================================================
  // ROLES, PERMISSIONS & MODERATION (KICK, BAN, TIMEOUT)
  // =========================================================
  getMemberRoles(serverId, memberId) {
    const server = this.servers.find(s => s.id === serverId);
    if (!server) return [];

    const myId = this.user ? this.user.id : null;
    const isMe = memberId === 'me' || (myId && memberId === myId) || (this.user?.username && memberId && memberId.toLowerCase() === this.user.username.toLowerCase());
    const effectiveId = isMe ? (myId || 'me') : memberId;

    let memberRoleIds = [];
    const isOwner = (server.ownerId && (server.ownerId === effectiveId || (isMe && server.ownerId === myId))) ||
                    (!server.ownerId && isMe && (this.user?.isOwner || (this.user?.roles || []).includes('role-admin')));

    if (isOwner) {
      memberRoleIds = ['role-admin'];
    } else {
      const member = (server.members || []).find(m => m.id === effectiveId || (m.username && this.user?.username && isMe && m.username.toLowerCase() === this.user.username.toLowerCase()));
      if (member && member.roles && member.roles.length > 0) {
        memberRoleIds = member.roles;
      } else if (isMe && this.user && this.user.roles && this.user.roles.length > 0) {
        memberRoleIds = this.user.roles;
      } else {
        memberRoleIds = ['role-everyone'];
      }
    }

    const roles = (server.roles || []).filter(r => memberRoleIds.includes(r.id) || r.id === 'role-everyone');
    return roles;
  }

  hasPermission(serverId, memberId, permission) {
    const server = this.servers.find(s => s.id === serverId);
    if (!server) return false;

    const myId = this.user ? this.user.id : null;
    const isMe = memberId === 'me' || (myId && memberId === myId) || (this.user?.username && memberId && memberId.toLowerCase() === this.user.username.toLowerCase());
    const effectiveId = isMe ? (myId || 'me') : memberId;

    // 1. O criador / dono deste servidor sempre tem todas as permissões absolutas
    if (server.ownerId && (server.ownerId === effectiveId || (isMe && server.ownerId === myId))) {
      return true;
    }

    // 2. Administradores mestres (primeiro usuário ou admin do sistema no servidor padrão)
    const isSystemAdmin = this.user?.isOwner || ((this.user?.roles || []).includes('role-admin') && (server.id === 'server-1' || !server.ownerId));
    if (isMe && isSystemAdmin) {
      return true;
    }

    // 3. Checa os cargos atribuídos ao membro
    const roles = this.getMemberRoles(serverId, effectiveId);
    for (const r of roles) {
      if ((r.permissions || []).includes('ADMINISTRATOR')) return true;
      if ((r.permissions || []).includes(permission)) return true;
    }
    return false;
  }

  isMemberTimedOut(serverId, memberId) {
    const server = this.servers.find(s => s.id === serverId);
    if (!server) return false;

    const myId = this.user ? this.user.id : null;
    const isMe = memberId === 'me' || memberId === myId || (this.user?.username && memberId.toLowerCase() === this.user.username.toLowerCase());

    let timeoutUntil = null;
    if (isMe && this.user && this.user.timeoutUntil) {
      timeoutUntil = this.user.timeoutUntil;
    }

    if (!timeoutUntil && server.members) {
      const member = server.members.find(m => m.id === memberId || (isMe && (m.id === myId || (m.username && this.user?.username && m.username.toLowerCase() === this.user.username.toLowerCase()))));
      timeoutUntil = member ? member.timeoutUntil : null;
    }

    if (!timeoutUntil) return false;

    if (timeoutUntil <= Date.now()) {
      if (isMe && this.user) {
        this.user.timeoutUntil = null;
        this.user.timeoutReason = null;
        this.save('discord_user', this.user);
      }
      return false;
    }

    return true;
  }

  getMemberTimeoutRemaining(serverId, memberId) {
    const server = this.servers.find(s => s.id === serverId);
    if (!server) return 0;

    const myId = this.user ? this.user.id : null;
    const isMe = memberId === 'me' || memberId === myId || (this.user?.username && memberId.toLowerCase() === this.user.username.toLowerCase());

    let timeoutUntil = null;
    if (isMe && this.user && this.user.timeoutUntil) {
      timeoutUntil = this.user.timeoutUntil;
    }

    if (!timeoutUntil && server.members) {
      const member = server.members.find(m => m.id === memberId || (isMe && (m.id === myId || (m.username && this.user?.username && m.username.toLowerCase() === this.user.username.toLowerCase()))));
      timeoutUntil = member ? member.timeoutUntil : null;
    }

    if (!timeoutUntil || timeoutUntil <= Date.now()) return 0;
    return Math.max(0, Math.ceil((timeoutUntil - Date.now()) / 1000));
  }

  createRole(serverId, roleData) {
    const server = this.servers.find(s => s.id === serverId);
    if (!server) return null;
    if (!server.roles) server.roles = [];

    const newRole = {
      id: 'role-' + Date.now(),
      name: roleData.name || 'Novo Cargo',
      color: roleData.color || '#949ba4',
      hoist: roleData.hoist !== undefined ? roleData.hoist : true,
      position: server.roles.length + 1,
      permissions: roleData.permissions || ['SEND_MESSAGES', 'ATTACH_FILES', 'CONNECT_VOICE', 'SPEAK_VOICE', 'STREAM_LIVE']
    };

    server.roles.unshift(newRole);
    this.persistServer(server);
    this.sendWs({ type: 'server_roles_updated', serverId, roles: server.roles });
    window.dispatchEvent(new CustomEvent('discord_roles_updated', { detail: { serverId, roles: server.roles } }));
    return newRole;
  }

  updateRole(serverId, roleId, updates) {
    const server = this.servers.find(s => s.id === serverId);
    if (!server || !server.roles) return false;
    const role = server.roles.find(r => r.id === roleId);
    if (!role) return false;

    Object.assign(role, updates);
    this.persistServer(server);
    this.sendWs({ type: 'server_roles_updated', serverId, roles: server.roles });
    window.dispatchEvent(new CustomEvent('discord_roles_updated', { detail: { serverId, roles: server.roles } }));
    return true;
  }

  deleteRole(serverId, roleId) {
    const server = this.servers.find(s => s.id === serverId);
    if (!server || !server.roles) return false;
    if (roleId === 'role-everyone') return false;

    server.roles = server.roles.filter(r => r.id !== roleId);
    (server.members || []).forEach(m => {
      if (m.roles) m.roles = m.roles.filter(id => id !== roleId);
    });

    this.persistServer(server);
    this.sendWs({ type: 'server_roles_updated', serverId, roles: server.roles });
    window.dispatchEvent(new CustomEvent('discord_roles_updated', { detail: { serverId, roles: server.roles } }));
    return true;
  }

  assignRole(serverId, memberId, roleId) {
    const server = this.servers.find(s => s.id === serverId);
    if (!server) return false;

    if (memberId === this.user.id) {
      if (!this.user.roles) this.user.roles = [];
      if (!this.user.roles.includes(roleId)) this.user.roles.push(roleId);
      this.save('discord_user', this.user);
    } else {
      const member = (server.members || []).find(m => m.id === memberId);
      if (!member) return false;
      if (!member.roles) member.roles = [];
      if (!member.roles.includes(roleId)) {
        member.roles.push(roleId);
        const highestRole = (server.roles || []).find(r => member.roles.includes(r.id) && r.id !== 'role-everyone');
        if (highestRole) {
          member.role = highestRole.name;
          member.roleColor = highestRole.color;
        }
      }
    }

    this.persistServer(server);
    this.sendWs({ type: 'member_roles_updated', serverId, memberId, roles: memberId === this.user.id ? this.user.roles : (server.members.find(m => m.id === memberId)?.roles || []) });
    window.dispatchEvent(new CustomEvent('discord_member_updated', { detail: { serverId, memberId } }));
    return true;
  }

  removeRole(serverId, memberId, roleId) {
    const server = this.servers.find(s => s.id === serverId);
    if (!server) return false;

    if (memberId === this.user.id) {
      if (this.user.roles) this.user.roles = this.user.roles.filter(id => id !== roleId);
      this.save('discord_user', this.user);
    } else {
      const member = (server.members || []).find(m => m.id === memberId);
      if (!member || !member.roles) return false;
      member.roles = member.roles.filter(id => id !== roleId);
      const highestRole = (server.roles || []).find(r => member.roles.includes(r.id) && r.id !== 'role-everyone');
      if (highestRole) {
        member.role = highestRole.name;
        member.roleColor = highestRole.color;
      } else {
        member.role = 'Membro';
        member.roleColor = '#949ba4';
      }
    }

    this.persistServer(server);
    this.sendWs({ type: 'member_roles_updated', serverId, memberId, roles: memberId === this.user.id ? this.user.roles : (server.members.find(m => m.id === memberId)?.roles || []) });
    window.dispatchEvent(new CustomEvent('discord_member_updated', { detail: { serverId, memberId } }));
    return true;
  }

  timeoutMember(serverId, memberId, durationSeconds, reason = 'Violação das regras') {
    const server = this.servers.find(s => s.id === serverId);
    if (!server) return false;

    const myId = this.user ? this.user.id : null;
    const isTargetMe = memberId === 'me' || memberId === myId || (this.user?.username && memberId.toLowerCase() === this.user.username.toLowerCase());

    // Ninguém pode se colocar de castigo a si mesmo
    if (isTargetMe) return false;

    // Apenas quem possui a permissão MODERATE_MEMBERS (ou Admin/Dono) pode colocar de castigo
    if (!this.hasPermission(serverId, myId, 'MODERATE_MEMBERS')) {
      return false;
    }

    const timeoutUntil = Date.now() + (durationSeconds * 1000);

    const member = (server.members || []).find(m => m.id === memberId || (m.username && m.username.toLowerCase() === memberId.toLowerCase()));
    if (member) {
      member.timeoutUntil = timeoutUntil;
      member.timeoutReason = reason;
    }

    this.persistServer(server);
    this.sendWs({ type: 'member_timeout', serverId, memberId, timeoutUntil, reason });
    window.dispatchEvent(new CustomEvent('discord_member_timeout', { detail: { serverId, memberId, timeoutUntil, reason } }));
    return true;
  }

  removeTimeout(serverId, memberId) {
    const server = this.servers.find(s => s.id === serverId);
    if (!server) return false;

    const myId = this.user ? this.user.id : null;
    const isTargetMe = memberId === 'me' || memberId === myId || (this.user?.username && memberId.toLowerCase() === this.user.username.toLowerCase());

    // Regra crítica: Ninguém pode remover o próprio castigo!
    if (isTargetMe) {
      return false;
    }

    // Apenas moderadores, admin ou dono do servidor podem remover o castigo
    if (!this.hasPermission(serverId, myId, 'MODERATE_MEMBERS')) {
      return false;
    }

    const member = (server.members || []).find(m => m.id === memberId || (m.username && m.username.toLowerCase() === memberId.toLowerCase()));
    if (member) {
      member.timeoutUntil = null;
      member.timeoutReason = null;
    }

    this.persistServer(server);
    this.sendWs({ type: 'member_timeout_removed', serverId, memberId });
    window.dispatchEvent(new CustomEvent('discord_member_timeout', { detail: { serverId, memberId, timeoutUntil: null } }));
    return true;
  }

  kickMember(serverId, memberId, reason = 'Expulso pelo moderador') {
    const server = this.servers.find(s => s.id === serverId);
    if (!server) return false;

    server.members = (server.members || []).filter(m => m.id !== memberId);
    this.persistServer(server);

    this.sendWs({ type: 'member_kicked', serverId, memberId, reason });
    window.dispatchEvent(new CustomEvent('discord_member_kicked', { detail: { serverId, memberId, reason } }));
    return true;
  }

  banMember(serverId, memberId, reason = 'Banido pelo moderador') {
    const server = this.servers.find(s => s.id === serverId);
    if (!server) return false;

    const member = (server.members || []).find(m => m.id === memberId);
    if (!server.bans) server.bans = [];

    const banEntry = {
      userId: memberId,
      username: member ? member.username : 'Usuário',
      discriminator: member ? member.discriminator : '0000',
      avatar: member ? member.avatar : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&h=120&q=80',
      reason: reason,
      bannedAt: new Date().toLocaleDateString('pt-BR'),
      bannedBy: this.user.username
    };

    server.bans.push(banEntry);
    server.members = (server.members || []).filter(m => m.id !== memberId);
    this.persistServer(server);

    this.sendWs({ type: 'member_banned', serverId, memberId, banEntry });
    window.dispatchEvent(new CustomEvent('discord_member_banned', { detail: { serverId, memberId, banEntry } }));
    return true;
  }

  unbanMember(serverId, userId) {
    const server = this.servers.find(s => s.id === serverId);
    if (!server || !server.bans) return false;

    server.bans = server.bans.filter(b => b.userId !== userId);
    this.persistServer(server);
    this.sendWs({ type: 'member_unbanned', serverId, userId });
    window.dispatchEvent(new CustomEvent('discord_member_unbanned', { detail: { serverId, userId } }));
    return true;
  }
}

window.discordStore = new DiscordStore();
