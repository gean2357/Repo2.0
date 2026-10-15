// Discord Clone UI Coordinator & Modals Manager
class DiscordApp {
  constructor() {
    this.initElements();
    this.setupListeners();
    this.renderAll();
  }

  initElements() {
    // Navigation & sidebars
    this.serverListContainer = document.getElementById('serverListContainer');
    this.channelListContainer = document.getElementById('channelListContainer');
    this.membersListContainer = document.getElementById('membersListContainer');
    this.serverNameHeading = document.getElementById('currentServerName');
    this.channelNameHeading = document.getElementById('currentChannelName');
    this.channelTopicHeading = document.getElementById('currentChannelTopic');
    this.channelTypeIcon = document.getElementById('channelTypeIcon');
    this.userStatusIndicator = document.getElementById('myStatusIndicator');
    this.myAvatarImg = document.getElementById('myAvatarImg');
    this.myUsername = document.getElementById('myUsername');
    this.myDiscriminator = document.getElementById('myDiscriminator');

    // Modals
    this.userSettingsModal = document.getElementById('userSettingsModal');
    this.btnOpenUserSettings = document.getElementById('btnOpenUserSettings');
    this.btnCloseUserSettings = document.getElementById('btnCloseUserSettings');

    this.createServerModal = document.getElementById('createServerModal');
    this.btnOpenCreateServer = document.getElementById('btnOpenCreateServer');
    this.btnCloseCreateServer = document.getElementById('btnCloseCreateServer');
    this.btnSubmitCreateServer = document.getElementById('btnSubmitCreateServer');

    this.createChannelModal = document.getElementById('createChannelModal');
    this.btnOpenCreateChannel = document.getElementById('btnOpenCreateChannel');
    this.btnCloseCreateChannel = document.getElementById('btnCloseCreateChannel');
    this.btnSubmitCreateChannel = document.getElementById('btnSubmitCreateChannel');

    this.memberProfileModal = document.getElementById('memberProfileModal');
    this.closeMemberProfileModal = document.getElementById('closeMemberProfileModal');

    // Server dropdown
    this.serverHeaderDropdown = document.getElementById('serverHeaderDropdown');
    this.serverDropdownMenu = document.getElementById('serverDropdownMenu');

    // Toggle member list
    this.btnToggleMembers = document.getElementById('btnToggleMembers');
    this.membersSidebar = document.getElementById('membersSidebar');
  }

  setupListeners() {
    // Open/Close User Settings
    if (this.btnOpenUserSettings) {
      this.btnOpenUserSettings.addEventListener('click', () => this.openUserSettings());
    }
    if (this.btnCloseUserSettings) {
      this.btnCloseUserSettings.addEventListener('click', () => this.closeUserSettings());
    }

    // Open/Close Create Server
    if (this.btnOpenCreateServer) {
      this.btnOpenCreateServer.addEventListener('click', () => this.openCreateServer());
    }
    if (this.btnCloseCreateServer) {
      this.btnCloseCreateServer.addEventListener('click', () => this.closeCreateServer());
    }
    if (this.btnSubmitCreateServer) {
      this.btnSubmitCreateServer.addEventListener('click', () => this.handleCreateServer());
    }

    // Open/Close Create Channel
    if (this.btnOpenCreateChannel) {
      this.btnOpenCreateChannel.addEventListener('click', () => this.openCreateChannel());
    }
    if (this.btnCloseCreateChannel) {
      this.btnCloseCreateChannel.addEventListener('click', () => this.closeCreateChannel());
    }
    if (this.btnSubmitCreateChannel) {
      this.btnSubmitCreateChannel.addEventListener('click', () => this.handleCreateChannel());
    }

    // Server Dropdown
    if (this.serverHeaderDropdown && this.serverDropdownMenu) {
      this.serverHeaderDropdown.addEventListener('click', (e) => {
        e.stopPropagation();
        this.serverDropdownMenu.classList.toggle('hidden');
      });
      document.addEventListener('click', () => {
        this.serverDropdownMenu.classList.add('hidden');
      });
    }

    // Toggle Member List
    if (this.btnToggleMembers && this.membersSidebar) {
      this.btnToggleMembers.addEventListener('click', () => {
        this.membersSidebar.classList.toggle('hidden');
      });
    }

    // Settings tabs switcher
    document.querySelectorAll('.settings-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-tab');
        document.querySelectorAll('.settings-tab-btn').forEach(b => {
          b.classList.remove('bg-[#35373c]', 'text-white');
          b.classList.add('text-[#b5bac1]');
        });
        btn.classList.add('bg-[#35373c]', 'text-white');
        btn.classList.remove('text-[#b5bac1]');

        document.querySelectorAll('.settings-tab-pane').forEach(pane => {
          pane.classList.add('hidden');
        });
        const activePane = document.getElementById(`tab-${target}`);
        if (activePane) activePane.classList.remove('hidden');
      });
    });

    // Save profile settings
    const btnSaveProfile = document.getElementById('btnSaveProfile');
    if (btnSaveProfile) {
      btnSaveProfile.addEventListener('click', () => this.handleSaveProfile());
    }

    // Close member profile
    if (this.closeMemberProfileModal) {
      this.closeMemberProfileModal.addEventListener('click', () => {
        this.memberProfileModal.classList.add('hidden');
      });
    }

    // Keyboard shortcut ESC to close modals
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeUserSettings();
        if (this.createServerModal) this.createServerModal.classList.add('hidden');
        if (this.createChannelModal) this.createChannelModal.classList.add('hidden');
        if (this.memberProfileModal) this.memberProfileModal.classList.add('hidden');
        if (window.discordStream) window.discordStream.hideGoLiveDialog();
      }
    });

    // Listen for store updates
    window.addEventListener('discord_user_updated', () => this.updateUserProfile());
  }

  renderAll() {
    this.renderServers();
    this.renderChannels();
    this.renderMembers();
    this.updateUserProfile();
    if (window.discordChat) {
      window.discordChat.renderMessages();
    }
  }

  renderServers() {
    if (!this.serverListContainer) return;

    let html = `
      <!-- Discord Home / Direct Messages Icon -->
      <div class="relative group flex items-center justify-center mb-2 server-item ${window.discordStore.currentServerId === 'home' ? 'active' : ''}">
        <div class="server-pill"></div>
        <button onclick="window.discordApp.switchServer('home')" data-tooltip="Mensagens Diretas" class="server-icon w-12 h-12 flex items-center justify-center bg-[#313338] text-white hover:bg-[#5865f2] transition-all">
          <svg class="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19.54 0c1.356 0 2.46 1.104 2.46 2.472v21.528l-2.58-2.28-1.452-1.344-1.536-1.428.636 2.22h-13.6c-1.356 0-2.46-1.104-2.46-2.472v-16.224c0-1.368 1.104-2.472 2.46-2.472h18.532zm-4.704 13.992c1.788 0 3.24-1.44 3.24-3.216 0-1.788-1.452-3.228-3.24-3.228s-3.24 1.44-3.24 3.228c0 1.776 1.452 3.216 3.24 3.216zm-5.676 0c1.788 0 3.24-1.44 3.24-3.216 0-1.788-1.452-3.228-3.24-3.228s-3.24 1.44-3.24 3.228c0 1.776 1.452 3.216 3.24 3.216z"/>
          </svg>
        </button>
      </div>

      <!-- Divider -->
      <div class="w-8 h-[2px] bg-[#35363c] rounded mx-auto mb-2"></div>
    `;

    // Servers list
    window.discordStore.servers.forEach(server => {
      const isActive = window.discordStore.currentServerId === server.id;

      html += `
        <div class="relative group flex items-center justify-center mb-2 server-item ${isActive ? 'active' : ''}">
          <div class="server-pill"></div>
          <button onclick="window.discordApp.switchServer('${server.id}')" data-tooltip="${server.name}" class="server-icon w-12 h-12 flex items-center justify-center font-bold text-white transition-all overflow-hidden ${isActive ? 'bg-[#5865f2] rounded-2xl' : 'bg-[#313338] rounded-full hover:bg-[#5865f2] hover:rounded-2xl'}">
            ${server.iconImg ? `<img src="${server.iconImg}" class="w-full h-full object-cover" alt="${server.name}" />` : `<span>${server.iconText}</span>`}
          </button>
          ${server.badge > 0 ? `<div class="absolute -bottom-1 -right-1 bg-red-500 text-white text-[11px] font-bold rounded-full h-5 min-w-[20px] px-1 flex items-center justify-center border-2 border-[#1e1f22]">${server.badge}</div>` : ''}
        </div>
      `;
    });

    // Add server (+) button
    html += `
      <div class="relative group flex items-center justify-center mb-2">
        <button onclick="window.discordApp.openCreateServer()" data-tooltip="Adicionar um Servidor" class="w-12 h-12 rounded-full bg-[#313338] text-[#23a55a] hover:bg-[#23a55a] hover:text-white hover:rounded-2xl flex items-center justify-center transition-all">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
        </button>
      </div>
      <!-- Explore Public Servers button -->
      <div class="relative group flex items-center justify-center mb-2">
        <button data-tooltip="Explorar Servidores Públicos" class="w-12 h-12 rounded-full bg-[#313338] text-[#23a55a] hover:bg-[#23a55a] hover:text-white hover:rounded-2xl flex items-center justify-center transition-all">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/></svg>
        </button>
      </div>
    `;

    this.serverListContainer.innerHTML = html;
  }

  renderChannels() {
    if (!this.channelListContainer) return;

    const server = window.discordStore.getCurrentServer();
    if (this.serverNameHeading) {
      this.serverNameHeading.textContent = server.name;
    }

    let html = '';

    server.categories.forEach(cat => {
      html += `
        <div class="mt-4 first:mt-1">
          <div class="flex items-center justify-between px-3 mb-1 text-xs font-bold uppercase tracking-wider text-[#949ba4] hover:text-white cursor-pointer select-none">
            <div class="flex items-center space-x-1">
              <svg class="w-3 h-3 transform rotate-90" fill="currentColor" viewBox="0 0 24 24"><path d="M9.29 15.88L13.17 12 9.29 8.12a.996.996 0 111.41-1.41l4.59 4.59c.39.39.39 1.02 0 1.41L10.7 17.3a.996.996 0 01-1.41-1.42z"/></svg>
              <span>${cat.name}</span>
            </div>
            <button onclick="window.discordApp.openCreateChannelForCategory('${cat.id}')" title="Criar Canal" class="text-[#949ba4] hover:text-white">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            </button>
          </div>

          <div class="space-y-0.5 px-2">
      `;

      cat.channels.forEach(chan => {
        const isCurrent = window.discordStore.currentChannelId === chan.id;
        const isVoiceConnected = window.discordStore.currentVoiceChannelId === chan.id;

        if (chan.type === 'voice') {
          html += `
            <div>
              <div onclick="window.discordApp.handleChannelClick('${chan.id}', 'voice')" data-channel-id="${chan.id}" class="channel-voice-item flex items-center px-2 py-1.5 rounded cursor-pointer transition ${isVoiceConnected ? 'bg-[#35373c] text-white font-medium' : 'text-[#949ba4] hover:bg-[#35373c]/50 hover:text-[#dbdee1]'}">
                <svg class="w-5 h-5 mr-1.5 flex-shrink-0 text-[#949ba4]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3a9 9 0 00-9 9v7c0 1.66 1.34 3 3 3h3v-8H5v-2c0-3.87 3.13-7 7-7s7 3.13 7 7v2h-4v8h3c1.66 0 3-1.34 3-3v-7a9 9 0 00-9-9z"/>
                </svg>
                <span class="truncate text-sm">${chan.name}</span>
                ${chan.limit ? `<span class="ml-auto text-xs text-[#949ba4]">0/${chan.limit}</span>` : ''}
              </div>
              <!-- Voice Connected Users Sublist -->
              <div class="voice-users-list pl-6 space-y-0.5" data-voice-list="${chan.id}"></div>
            </div>
          `;
        } else {
          html += `
            <div onclick="window.discordApp.handleChannelClick('${chan.id}', 'text')" class="flex items-center px-2 py-1.5 rounded cursor-pointer transition ${isCurrent ? 'bg-[#35373c] text-white font-medium' : 'text-[#949ba4] hover:bg-[#35373c]/50 hover:text-[#dbdee1]'}">
              <svg class="w-5 h-5 mr-1.5 flex-shrink-0 text-[#949ba4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"/>
              </svg>
              <span class="truncate text-sm">${chan.name}</span>
            </div>
          `;
        }
      });

      html += `
          </div>
        </div>
      `;
    });

    this.channelListContainer.innerHTML = html;
    this.updateActiveChannelHeader();
  }

  renderMembers() {
    if (!this.membersListContainer) return;

    const server = window.discordStore.getCurrentServer();
    const members = server.members || [];

    // Group members
    const admins = members.filter(m => m.role === 'Admin' || m.role === 'Dono');
    const mods = members.filter(m => m.role === 'Moderador');
    const bots = members.filter(m => m.isBot);
    const regular = members.filter(m => !m.isBot && m.role !== 'Admin' && m.role !== 'Dono' && m.role !== 'Moderador' && m.status !== 'offline');
    const offline = members.filter(m => m.status === 'offline');

    let html = '';

    const renderGroup = (title, list) => {
      if (list.length === 0) return '';
      let grpHtml = `<div class="px-4 pt-4 pb-1 text-xs font-bold uppercase tracking-wider text-[#949ba4]">${title} — ${list.length}</div>`;
      list.forEach(m => {
        const statusColor = m.status === 'online' ? 'bg-[#23a55a]' : m.status === 'idle' ? 'bg-[#f0b232]' : m.status === 'dnd' ? 'bg-[#f23f43]' : 'bg-[#80848e]';

        grpHtml += `
          <div onclick="window.discordApp.openMemberProfile('${m.id}')" class="flex items-center px-4 py-1.5 mx-2 rounded hover:bg-[#35373c]/60 cursor-pointer group transition">
            <div class="relative mr-3 flex-shrink-0">
              <img src="${m.avatar}" class="w-8 h-8 rounded-full object-cover" alt="${m.username}" />
              <div class="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[#2b2d31] ${statusColor}"></div>
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex items-center space-x-1">
                <span class="text-sm font-medium truncate ${m.roleColor ? '' : 'text-[#dbdee1]'}" style="color: ${m.roleColor || '#dbdee1'}">${m.username}</span>
                ${m.isBot ? '<span class="bg-[#5865f2] text-white text-[9px] font-bold px-1 rounded uppercase">BOT</span>' : ''}
              </div>
              ${m.customStatus ? `<div class="text-xs text-[#949ba4] truncate">${m.customStatus}</div>` : ''}
              ${m.activity ? `<div class="text-[11px] text-[#949ba4] truncate flex items-center space-x-1"><span>🎮</span> <span>${m.activity}</span></div>` : ''}
            </div>
          </div>
        `;
      });
      return grpHtml;
    };

    html += renderGroup('DONOS & ADMINS', admins);
    html += renderGroup('MODERADORES', mods);
    html += renderGroup('BOTS', bots);
    html += renderGroup('MEMBROS ONLINE', regular);
    html += renderGroup('OFFLINE', offline);

    this.membersListContainer.innerHTML = html;
  }

  handleChannelClick(channelId, type) {
    if (type === 'voice') {
      // Connect to voice
      window.discordVoice.joinVoiceChannel(channelId);
    }

    window.discordStore.currentChannelId = channelId;
    this.renderChannels();
    if (window.discordChat) {
      window.discordChat.renderMessages();
    }
  }

  switchServer(serverId) {
    window.discordStore.currentServerId = serverId;
    const server = window.discordStore.getCurrentServer();
    if (server.categories[0]?.channels[0]) {
      window.discordStore.currentChannelId = server.categories[0].channels[0].id;
    }
    this.renderAll();
  }

  updateActiveChannelHeader() {
    const channel = window.discordStore.getCurrentChannel();
    if (!channel) return;

    if (this.channelNameHeading) {
      this.channelNameHeading.textContent = channel.name;
    }
    if (this.channelTopicHeading) {
      this.channelTopicHeading.textContent = channel.topic || '';
    }

    const inputPlaceholder = document.getElementById('chatInput');
    if (inputPlaceholder) {
      inputPlaceholder.placeholder = `Conversar em #${channel.name}`;
    }
  }

  updateUserProfile() {
    const u = window.discordStore.user;
    if (this.myAvatarImg) this.myAvatarImg.src = u.avatar;
    if (this.myUsername) this.myUsername.textContent = u.username;
    if (this.myDiscriminator) this.myDiscriminator.textContent = `#${u.discriminator}`;

    if (this.userStatusIndicator) {
      this.userStatusIndicator.className = 'absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[#232428] ' +
        (u.status === 'online' ? 'bg-[#23a55a]' : u.status === 'idle' ? 'bg-[#f0b232]' : u.status === 'dnd' ? 'bg-[#f23f43]' : 'bg-[#80848e]');
    }
  }

  openUserSettings() {
    if (this.userSettingsModal) {
      const u = window.discordStore.user;
      document.getElementById('inputSettingUsername').value = u.username;
      document.getElementById('inputSettingDiscriminator').value = u.discriminator;
      document.getElementById('inputSettingCustomStatus').value = u.customStatus || '';
      document.getElementById('inputSettingAvatar').value = u.avatar;

      this.userSettingsModal.classList.remove('hidden');
      this.userSettingsModal.classList.add('flex');
    }
  }

  closeUserSettings() {
    if (this.userSettingsModal) {
      this.userSettingsModal.classList.add('hidden');
      this.userSettingsModal.classList.remove('flex');
    }
  }

  handleSaveProfile() {
    const username = document.getElementById('inputSettingUsername').value.trim();
    const discriminator = document.getElementById('inputSettingDiscriminator').value.trim();
    const customStatus = document.getElementById('inputSettingCustomStatus').value.trim();
    const avatar = document.getElementById('inputSettingAvatar').value.trim();

    window.discordStore.updateUser({
      username: username || 'User',
      discriminator: discriminator || '0001',
      customStatus: customStatus,
      avatar: avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&h=120&q=80'
    });

    this.closeUserSettings();
    this.renderAll();
  }

  openCreateServer() {
    if (this.createServerModal) {
      this.createServerModal.classList.remove('hidden');
      this.createServerModal.classList.add('flex');
    }
  }

  closeCreateServer() {
    if (this.createServerModal) {
      this.createServerModal.classList.add('hidden');
      this.createServerModal.classList.remove('flex');
    }
  }

  openCreateChannel(catId = null) {
    if (catId) this.selectedCatId = catId;
    if (this.createChannelModal) {
      this.createChannelModal.classList.remove('hidden');
      this.createChannelModal.classList.add('flex');
    }
  }

  closeCreateChannel() {
    if (this.createChannelModal) {
      this.createChannelModal.classList.add('hidden');
      this.createChannelModal.classList.remove('flex');
    }
  }

  handleCreateServer() {
    const nameInput = document.getElementById('newServerName');
    const name = nameInput ? nameInput.value.trim() : '';
    if (!name) return;

    const newSrv = window.discordStore.addServer(name);
    nameInput.value = '';
    this.closeCreateServer();
    this.switchServer(newSrv.id);
  }

  openCreateChannelForCategory(catId) {
    this.openCreateChannel(catId);
  }

  handleCreateChannel() {
    const nameInput = document.getElementById('newChannelName');
    const typeSelect = document.querySelector('input[name="newChannelType"]:checked');
    const name = nameInput ? nameInput.value.trim() : '';
    const type = typeSelect ? typeSelect.value : 'text';

    if (!name) return;

    window.discordStore.addChannel(
      window.discordStore.currentServerId,
      this.selectedCatId,
      name,
      type
    );

    nameInput.value = '';
    this.createChannelModal.classList.add('hidden');
    this.renderChannels();
  }

  openMemberProfile(memberId) {
    const server = window.discordStore.getCurrentServer();
    const member = server.members.find(m => m.id === memberId);
    if (!member) return;

    const modal = this.memberProfileModal;
    if (!modal) return;

    document.getElementById('profileModalAvatar').src = member.avatar;
    document.getElementById('profileModalName').textContent = member.username;
    document.getElementById('profileModalTag').textContent = `#${member.discriminator}`;
    document.getElementById('profileModalAbout').textContent = member.customStatus || 'Sem status definido.';
    
    const badgesContainer = document.getElementById('profileModalBadges');
    if (badgesContainer) {
      badgesContainer.innerHTML = (member.badges || []).map(b => `<span class="bg-[#1e1f22] text-[#f2f3f5] px-2 py-0.5 rounded text-xs">${b}</span>`).join('');
    }

    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.discordApp = new DiscordApp();
});
