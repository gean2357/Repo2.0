// Discord Clone UI Coordinator & Modals Manager
class DiscordApp {
  constructor() {
    this.selectedDecoration = window.discordStore.user.decoration || 'cyberpunk';
    this.selectedStatus = window.discordStore.user.status || 'online';
    this.selectedBannerColor = window.discordStore.user.bannerColor || '#5865F2';
    
    // Server settings & moderation state
    this.currentServerSettingsTab = 'overview';
    this.currentEditingRoleId = null;
    this.currentRoleColor = '#5865f2';
    this.targetModMemberId = null;
    this.selectedTimeoutDuration = 60;
    this.serverMemberFilter = '';
    this.authMode = 'login';
    this.currentFriendsTab = 'online';
    this.friendSearchFilter = '';
    this.inviteFriendSearchFilter = '';

    this.initElements();
    this.setupListeners();
    this.renderAll();
    this.checkAuthState();
    this.updateFirebaseIndicator();
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
    this.myAvatarDecoration = document.getElementById('myAvatarDecoration');
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

    // Close Quick Status menu on click outside
    document.addEventListener('click', (e) => {
      const menu = document.getElementById('userQuickStatusMenu');
      const btn = document.getElementById('btnUserQuickProfile');
      if (menu && !menu.classList.contains('hidden')) {
        if (!menu.contains(e.target) && (!btn || !btn.contains(e.target))) {
          menu.classList.add('hidden');
        }
      }
    });

    // Real-time input listeners for profile live preview
    const inputPronouns = document.getElementById('inputProfilePronouns');
    if (inputPronouns) {
      inputPronouns.addEventListener('input', (e) => {
        const el = document.getElementById('previewCardPronouns');
        if (el) el.textContent = e.target.value.trim() || 'ele/dele';
      });
    }

    const inputBio = document.getElementById('inputProfileBio');
    if (inputBio) {
      inputBio.addEventListener('input', (e) => {
        const el = document.getElementById('previewCardBio');
        if (el) el.textContent = e.target.value.trim() || 'Sem bio definida.';
      });
    }

    // Keyboard shortcut ESC to close modals
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeUserSettings();
        this.closeServerSettings();
        this.closeTimeoutModal();
        this.closeKickModal();
        this.closeBanModal();
        const quickMenu = document.getElementById('userQuickStatusMenu');
        if (quickMenu) quickMenu.classList.add('hidden');
        if (this.createServerModal) this.createServerModal.classList.add('hidden');
        if (this.createChannelModal) this.createChannelModal.classList.add('hidden');
        if (this.memberProfileModal) this.memberProfileModal.classList.add('hidden');
        const roleMenu = document.getElementById('profileRoleMenu');
        if (roleMenu) roleMenu.classList.add('hidden');
        if (window.discordStream) window.discordStream.hideGoLiveDialog();
      }
    });

    // Close member profile role dropdown on outside click
    document.addEventListener('click', (e) => {
      const menu = document.getElementById('profileRoleMenu');
      const btn = document.getElementById('btnProfileAddRole');
      if (menu && !menu.classList.contains('hidden')) {
        if (!menu.contains(e.target) && (!btn || !btn.contains(e.target))) {
          menu.classList.add('hidden');
        }
      }
    });

    // Listen for store updates
    window.addEventListener('discord_user_updated', () => this.updateUserProfile());

    // Role & Moderation realtime listeners
    window.addEventListener('discord_roles_updated', () => {
      this.renderMembers();
      this.renderChannels();
      if (this.isServerSettingsOpen()) {
        this.renderServerSettingsRoles();
        this.renderServerSettingsOverview();
      }
    });

    window.addEventListener('discord_member_updated', () => {
      this.renderMembers();
      if (this.isServerSettingsOpen()) {
        this.renderServerSettingsMembers(this.serverMemberFilter);
      }
    });

    window.addEventListener('discord_member_timeout', () => {
      this.renderMembers();
      if (this.isServerSettingsOpen()) {
        this.renderServerSettingsMembers(this.serverMemberFilter);
      }
    });

    window.addEventListener('discord_member_kicked', () => {
      this.renderMembers();
      if (this.isServerSettingsOpen()) {
        this.renderServerSettingsMembers(this.serverMemberFilter);
      }
    });

    window.addEventListener('discord_member_banned', () => {
      this.renderMembers();
      if (this.isServerSettingsOpen()) {
        this.renderServerSettingsMembers(this.serverMemberFilter);
        this.renderServerSettingsBans();
        this.renderServerSettingsOverview();
      }
    });

    window.addEventListener('discord_member_unbanned', () => {
      if (this.isServerSettingsOpen()) {
        this.renderServerSettingsBans();
        this.renderServerSettingsOverview();
      }
    });

    // Real-time server invites listener
    window.addEventListener('discord_server_invite_received', (e) => {
      this.handleServerInviteReceived(e.detail);
    });

    window.addEventListener('discord_server_invites_updated', () => {
      this.renderServers();
      this.renderServerInvites();
    });

    // Real-time friend requests listener
    window.addEventListener('discord_friend_request_received', () => {
      this.renderFriendsPending();
      this.updateFriendsBadge();
    });

    // Real-time friend request accepted
    window.addEventListener('discord_friend_request_accepted', () => {
      this.renderFriendsList();
      this.renderChannels();
    });

    // Firebase Auth state listener
    window.addEventListener('discord_firebase_auth_state', () => {
      this.updateFirebaseIndicator();
    });
  }

  renderAll() {
    this.renderServers();
    this.renderChannels();
    this.renderMembers();
    this.updateUserProfile();
    this.renderServerInvites();
    if (window.discordChat) {
      window.discordChat.renderMessages();
    }
  }

  renderServers() {
    if (!this.serverListContainer) return;

    const visibleServers = window.discordStore.getUserServers ? window.discordStore.getUserServers() : window.discordStore.servers;
    const invites = window.discordStore.getServerInvites ? window.discordStore.getServerInvites() : [];
    const pendingInvitesCount = invites.length;

    let html = `
      <!-- Discord Home / Direct Messages Icon -->
      <div class="relative group flex items-center justify-center mb-2 server-item ${window.discordStore.currentServerId === 'home' ? 'active' : ''}">
        <div class="server-pill"></div>
        <button onclick="window.discordApp.switchServer('home')" data-tooltip="Mensagens Diretas" class="server-icon w-12 h-12 flex items-center justify-center bg-[#313338] text-white hover:bg-[#5865f2] transition-all relative">
          <svg class="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19.54 0c1.356 0 2.46 1.104 2.46 2.472v21.528l-2.58-2.28-1.452-1.344-1.536-1.428.636 2.22h-13.6c-1.356 0-2.46-1.104-2.46-2.472v-16.224c0-1.368 1.104-2.472 2.46-2.472h18.532zm-4.704 13.992c1.788 0 3.24-1.44 3.24-3.216 0-1.788-1.452-3.228-3.24-3.228s-3.24 1.44-3.24 3.228c0 1.776 1.452 3.216 3.24 3.216zm-5.676 0c1.788 0 3.24-1.44 3.24-3.216 0-1.788-1.452-3.228-3.24-3.228s-3.24 1.44-3.24 3.228c0 1.776 1.452 3.216 3.24 3.216z"/>
          </svg>
          ${pendingInvitesCount > 0 ? `
            <div id="homeNotificationBadge" class="absolute -top-1 -right-1 bg-[#f23f43] text-white text-[10px] font-bold rounded-full h-5 min-w-[20px] px-1 flex items-center justify-center border-2 border-[#1e1f22] shadow animate-pulse">
              ${pendingInvitesCount}
            </div>
          ` : ''}
        </button>
      </div>

      <!-- Divider -->
      <div class="w-8 h-[2px] bg-[#35363c] rounded mx-auto mb-2"></div>
    `;

    // Servers list (Only accessible servers shown!)
    visibleServers.forEach(server => {
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

    // HOME MODE: Direct Messages & Friends Hub
    if (window.discordStore.currentServerId === 'home') {
      if (this.serverNameHeading) {
        this.serverNameHeading.textContent = 'Mensagens Diretas';
      }

      const isAmigosActive = window.discordStore.currentChannelId === 'amigos';
      const requests = JSON.parse(localStorage.getItem('discord_friend_requests') || '[]');
      const myUsername = window.discordStore.user.username.toLowerCase();
      const pendingCount = requests.filter(r => !r.toUsername || r.toUsername.toLowerCase() === myUsername).length;

      let html = `
        <!-- Home Navigation: Amigos, Nitro -->
        <div class="px-2 pt-1 pb-2 space-y-0.5 border-b border-[#1f2023]/60">
          <div onclick="window.discordApp.handleChannelClick('amigos', 'friends')" class="dm-channel-item flex items-center px-3 py-2.5 rounded-md cursor-pointer transition ${isAmigosActive ? 'active font-bold' : 'text-[#949ba4] hover:bg-[#35373c]/50 hover:text-[#dbdee1]'}">
            <svg class="w-5 h-5 mr-3 flex-shrink-0 ${isAmigosActive ? 'text-white' : 'text-[#949ba4]'}" fill="currentColor" viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
            <span class="text-sm flex-1">Amigos</span>
            ${pendingCount > 0 ? `<span class="bg-[#f23f43] text-white text-[11px] font-bold px-1.5 py-0.2 rounded-full">${pendingCount}</span>` : ''}
          </div>

          <div onclick="alert('Discord Nitro: Em breve no Discord Clone!')" class="dm-channel-item flex items-center px-3 py-2.5 rounded-md cursor-pointer transition text-[#949ba4] hover:bg-[#35373c]/50 hover:text-[#dbdee1]">
            <svg class="w-5 h-5 mr-3 flex-shrink-0 text-[#f47fff]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
            <span class="text-sm">Nitro</span>
          </div>
        </div>

        <!-- MENSAGENS DIRETAS Header -->
        <div class="mt-4 px-3 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#949ba4]">
          <span>MENSAGENS DIRETAS</span>
          <button onclick="window.discordApp.switchFriendsTab('add')" title="Criar DM" class="hover:text-white">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
          </button>
        </div>

        <!-- DM List -->
        <div class="px-2 mt-1 space-y-0.5">
      `;

      const dms = server.categories[0]?.channels?.filter(c => c.id !== 'amigos') || [];

      dms.forEach(dm => {
        const isCurrent = window.discordStore.currentChannelId === dm.id;
        html += `
          <div onclick="window.discordApp.handleChannelClick('${dm.id}', 'text')" class="dm-channel-item flex items-center px-2 py-2 rounded-md cursor-pointer transition ${isCurrent ? 'active' : 'text-[#949ba4] hover:bg-[#35373c]/50 hover:text-[#dbdee1]'}">
            <div class="avatar-wrap relative mr-3 flex-shrink-0">
              <img src="${dm.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${dm.name}`}" class="w-8 h-8 rounded-full object-cover" alt="${dm.name}" />
              <div class="status-indicator ${dm.status || 'offline'} w-2.5 h-2.5"></div>
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-sm font-semibold truncate ${isCurrent ? 'text-white' : ''}">${dm.name}</div>
              <div class="text-[11px] text-[#949ba4] truncate">${dm.topic || ''}</div>
            </div>
          </div>
        `;
      });

      html += `</div>`;
      this.channelListContainer.innerHTML = html;
      this.updateActiveChannelHeader();
      return;
    }

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
    if (window.discordVoice) {
      window.discordVoice.renderVoiceParticipants();
    }
  }

  renderMembers() {
    if (!this.membersListContainer) return;

    const server = window.discordStore.getCurrentServer();
    let members = [...(server.members || [])];
    const u = window.discordStore.user;

    // Check if current user is in members list
    const isOwner = (server.ownerId && server.ownerId === u.id) || (!server.ownerId && (u.id === 'user-admin' || u.id === 'me'));
    const myExisting = (server.members || []).find(m => m.id === u.id);

    const myRole = isOwner ? 'Dono' : (myExisting?.role || 'Membro');
    const myRoleColor = isOwner ? '#f23f43' : (myExisting?.roleColor || '#949ba4');
    const myRoles = isOwner ? ['role-admin'] : (myExisting?.roles || u.roles || ['role-everyone']);
    const myBadges = isOwner ? ['👑 Dono', '💎 Nitro', '⚡ Dev'] : (myExisting?.badges || ['Membro']);

    const myIndex = members.findIndex(m => m.id === u.id);
    const myMemberData = {
      id: u.id,
      username: u.username,
      discriminator: u.discriminator,
      role: myRole,
      roleColor: myRoleColor,
      status: u.status || 'online',
      customStatus: u.customStatus,
      activity: u.activity,
      avatar: u.avatar,
      decoration: u.decoration || 'none',
      badges: myBadges,
      roles: myRoles,
      timeoutUntil: u.timeoutUntil
    };

    if (myIndex >= 0) {
      members[myIndex] = myMemberData;
    } else {
      members.unshift(myMemberData);
    }

    // Attach highest role & color to each member
    members.forEach(m => {
      const memberRoles = window.discordStore.getMemberRoles(server.id, m.id);
      const highestRole = memberRoles.find(r => r.id !== 'role-everyone') || memberRoles[0];
      if (highestRole) {
        m.role = highestRole.name;
        m.roleColor = highestRole.color;
      }
    });

    // Group members
    const admins = members.filter(m => m.role === 'Admin' || m.role === 'Dono' || m.role === 'Administrador');
    const mods = members.filter(m => m.role === 'Moderador');
    const bots = members.filter(m => m.isBot);
    const regular = members.filter(m => !m.isBot && m.role !== 'Admin' && m.role !== 'Dono' && m.role !== 'Administrador' && m.role !== 'Moderador' && m.status !== 'offline');
    const offline = members.filter(m => m.status === 'offline');

    let html = '';

    const renderGroup = (title, list) => {
      if (list.length === 0) return '';
      let grpHtml = `<div class="px-4 pt-4 pb-1 text-xs font-bold uppercase tracking-wider text-[#949ba4]">${title} — ${list.length}</div>`;
      list.forEach(m => {
        const isTimedOut = window.discordStore.isMemberTimedOut(server.id, m.id);
        grpHtml += `
          <div onclick="window.discordApp.openMemberProfile('${m.id}')" class="flex items-center px-4 py-1.5 mx-2 rounded hover:bg-[#35373c]/60 cursor-pointer group transition">
            <div class="avatar-wrap relative mr-3 flex-shrink-0">
              ${m.decoration && m.decoration !== 'none' ? `<div class="avatar-decoration-overlay decoration-${m.decoration}"></div>` : ''}
              <img src="${m.avatar}" class="w-8 h-8 rounded-full object-cover relative z-0" alt="${m.username}" />
              <div class="status-indicator ${m.status || 'online'} w-3.5 h-3.5 border-2 border-[#2b2d31]"></div>
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex items-center space-x-1">
                <span class="text-sm font-medium truncate ${m.roleColor ? '' : 'text-[#dbdee1]'}" style="color: ${m.roleColor || '#dbdee1'}">${m.username}</span>
                ${m.isBot ? '<span class="bg-[#5865f2] text-white text-[9px] font-bold px-1 rounded uppercase">BOT</span>' : ''}
                ${isTimedOut ? '<span class="text-xs text-[#f0b232] ml-1" title="Em castigo">⏱️</span>' : ''}
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
    this.closeMobileDrawer();
    window.discordStore.currentChannelId = channelId;

    const friendsView = document.getElementById('friendsMainView');
    const chatWrapper = document.getElementById('chatSectionWrapper');
    const membersSidebar = document.getElementById('membersSidebar');

    if (window.discordStore.currentServerId === 'home') {
      if (membersSidebar) membersSidebar.classList.add('hidden');

      if (channelId === 'amigos') {
        if (friendsView) friendsView.classList.remove('hidden');
        if (chatWrapper) chatWrapper.classList.add('hidden');
        this.switchFriendsTab(this.currentFriendsTab || 'online');
      } else {
        if (friendsView) friendsView.classList.add('hidden');
        if (chatWrapper) chatWrapper.classList.remove('hidden');
        if (window.discordChat) {
          window.discordChat.renderMessages();
        }
      }
    } else {
      if (friendsView) friendsView.classList.add('hidden');
      if (chatWrapper) chatWrapper.classList.remove('hidden');
      if (membersSidebar) membersSidebar.classList.remove('hidden');

      if (type === 'voice') {
        window.discordVoice.joinVoiceChannel(channelId);
      } else if (window.discordChat) {
        window.discordChat.renderMessages();
      }
    }

    this.renderChannels();
    this.updateActiveChannelHeader();
  }

  switchServer(serverId) {
    this.closeMobileDrawer();
    window.discordStore.currentServerId = serverId;
    const server = window.discordStore.getCurrentServer();

    const friendsView = document.getElementById('friendsMainView');
    const chatWrapper = document.getElementById('chatSectionWrapper');
    const membersSidebar = document.getElementById('membersSidebar');

    if (serverId === 'home') {
      window.discordStore.currentChannelId = 'amigos';
      if (membersSidebar) membersSidebar.classList.add('hidden');
      if (friendsView) friendsView.classList.remove('hidden');
      if (chatWrapper) chatWrapper.classList.add('hidden');
      this.switchFriendsTab(this.currentFriendsTab || 'online');
    } else {
      if (membersSidebar) membersSidebar.classList.remove('hidden');
      if (friendsView) friendsView.classList.add('hidden');
      if (chatWrapper) chatWrapper.classList.remove('hidden');

      if (server.categories[0]?.channels[0]) {
        window.discordStore.currentChannelId = server.categories[0].channels[0].id;
      }
    }
    this.renderAll();
    this.updateActiveChannelHeader();
  }

  updateActiveChannelHeader() {
    const channel = window.discordStore.getCurrentChannel();
    if (!channel) return;

    const isDM = window.discordStore.currentServerId === 'home' && channel.id.startsWith('dm');

    if (this.channelNameHeading) {
      this.channelNameHeading.textContent = isDM ? `@ ${channel.name}` : channel.name;
    }
    if (this.channelTopicHeading) {
      this.channelTopicHeading.textContent = channel.topic || '';
    }

    const mobileChanEl = document.getElementById('mobileChannelNameText');
    if (mobileChanEl) {
      mobileChanEl.textContent = isDM ? `@ ${channel.name}` : channel.name;
    }

    const inputPlaceholder = document.getElementById('chatInput');
    if (inputPlaceholder) {
      inputPlaceholder.placeholder = isDM ? `Conversar com @${channel.name}` : `Conversar em #${channel.name}`;
    }
  }

  updateUserProfile() {
    const u = window.discordStore.user;
    if (this.myAvatarImg) this.myAvatarImg.src = u.avatar;
    if (this.myUsername) this.myUsername.textContent = u.username;
    
    const myDec = document.getElementById('myAvatarDecoration');
    if (myDec) {
      myDec.className = 'avatar-decoration-overlay ' + (u.decoration && u.decoration !== 'none' ? `decoration-${u.decoration}` : '');
    }

    if (this.userStatusIndicator) {
      this.userStatusIndicator.className = `status-indicator ${u.status || 'online'} w-3.5 h-3.5`;
    }

    const shortStatus = document.getElementById('myCustomStatusShort');
    if (shortStatus) {
      shortStatus.textContent = u.customStatus || (u.status === 'online' ? 'Online' : u.status === 'idle' ? 'Ausente' : u.status === 'dnd' ? 'Não perturbe' : 'Invisível');
    }

    // Quick status popover elements
    const popoverImg = document.getElementById('popoverAvatarImg');
    const popoverDec = document.getElementById('popoverAvatarDecoration');
    const popoverStatus = document.getElementById('popoverStatusIndicator');
    const popoverUser = document.getElementById('popoverUsername');
    const popoverCust = document.getElementById('popoverCustomStatus');

    if (popoverImg) popoverImg.src = u.avatar;
    if (popoverDec) popoverDec.className = 'avatar-decoration-overlay ' + (u.decoration && u.decoration !== 'none' ? `decoration-${u.decoration}` : '');
    if (popoverStatus) popoverStatus.className = `status-indicator ${u.status || 'online'} w-3.5 h-3.5`;
    if (popoverUser) popoverUser.textContent = u.username;
    if (popoverCust) popoverCust.textContent = u.customStatus || 'Sem status definido';

    // Live Settings Preview Card
    const prevBanner = document.getElementById('previewCardBanner');
    const prevAvatar = document.getElementById('previewCardAvatar');
    const prevDec = document.getElementById('previewCardDecoration');
    const prevStatus = document.getElementById('previewCardStatus');
    const prevDisplay = document.getElementById('previewCardDisplayName');
    const prevUser = document.getElementById('previewCardUsername');
    const prevPronouns = document.getElementById('previewCardPronouns');
    const prevCustom = document.getElementById('previewCardCustomStatus');
    const prevBio = document.getElementById('previewCardBio');

    if (prevBanner) prevBanner.style.backgroundColor = u.bannerColor || '#5865F2';
    if (prevAvatar) prevAvatar.src = u.avatar;
    if (prevDec) prevDec.className = 'avatar-decoration-overlay ' + (u.decoration && u.decoration !== 'none' ? `decoration-${u.decoration}` : '');
    if (prevStatus) prevStatus.className = `status-indicator ${u.status || 'online'} w-5 h-5 border-[3px]`;
    if (prevDisplay) prevDisplay.textContent = u.username;
    if (prevUser) prevUser.textContent = `${u.username.toLowerCase()}_ #${u.discriminator}`;
    if (prevPronouns) prevPronouns.textContent = u.pronouns || 'ele/dele';
    if (prevCustom) prevCustom.textContent = u.customStatus || 'Construindo o Discord Clone 🚀';
    if (prevBio) prevBio.textContent = u.bio || 'Desenvolvedor Full Stack apaixonado por tecnologia e inovação.';

    // Synchronize inputs in settings
    const inpPronouns = document.getElementById('inputProfilePronouns');
    const inpBio = document.getElementById('inputProfileBio');
    if (inpPronouns && !inpPronouns.value) inpPronouns.value = u.pronouns || '';
    if (inpBio && !inpBio.value) inpBio.value = u.bio || '';
  }

  toggleQuickStatusMenu(event) {
    if (event) event.stopPropagation();
    const menu = document.getElementById('userQuickStatusMenu');
    if (menu) {
      menu.classList.toggle('hidden');
    }
  }

  changeUserStatus(newStatus) {
    window.discordStore.setStatus(newStatus);
    const menu = document.getElementById('userQuickStatusMenu');
    if (menu) menu.classList.add('hidden');
    if (window.discordAudio) window.discordAudio.playUnmute();
    this.renderAll();
  }

  openProfileCustomizer() {
    const menu = document.getElementById('userQuickStatusMenu');
    if (menu) menu.classList.add('hidden');
    this.openUserSettings();
    const tabBtn = document.querySelector('[data-tab="profile"]');
    if (tabBtn) tabBtn.click();
  }

  selectDecoration(decId, decName) {
    this.selectedDecoration = decId;
    const label = document.getElementById('currentDecorationLabel');
    if (label) label.textContent = decName;

    const prevDec = document.getElementById('previewCardDecoration');
    if (prevDec) {
      prevDec.className = 'avatar-decoration-overlay ' + (decId !== 'none' ? `decoration-${decId}` : '');
    }

    document.querySelectorAll('.decoration-opt-btn').forEach(btn => {
      if (btn.getAttribute('data-decoration') === decId) {
        btn.classList.add('border-2', 'border-[#5865f2]');
        btn.classList.remove('border-[#3f4147]');
      } else {
        btn.classList.remove('border-2', 'border-[#5865f2]');
        btn.classList.add('border-[#3f4147]');
      }
    });
  }

  selectStatusOption(status) {
    this.selectedStatus = status;
    const prevStatus = document.getElementById('previewCardStatus');
    if (prevStatus) {
      prevStatus.className = `status-indicator ${status} w-5 h-5 border-[3px]`;
    }

    document.querySelectorAll('.status-opt-btn').forEach(btn => {
      if (btn.getAttribute('data-status') === status) {
        btn.classList.add('border-2', 'border-[#5865f2]');
        btn.classList.remove('border-[#3f4147]');
      } else {
        btn.classList.remove('border-2', 'border-[#5865f2]');
        btn.classList.add('border-[#3f4147]');
      }
    });
  }

  selectBannerColor(hex) {
    this.selectedBannerColor = hex;
    const banner = document.getElementById('previewCardBanner');
    if (banner) banner.style.backgroundColor = hex;

    document.querySelectorAll('.banner-color-btn').forEach(btn => {
      if (btn.style.backgroundColor.toLowerCase() === hex.toLowerCase()) {
        btn.classList.add('border-white');
        btn.classList.remove('border-transparent');
      } else {
        btn.classList.remove('border-white');
        btn.classList.add('border-transparent');
      }
    });
  }

  saveProfileCustomization() {
    const pronouns = document.getElementById('inputProfilePronouns')?.value.trim() || 'ele/dele';
    const bio = document.getElementById('inputProfileBio')?.value.trim() || '';

    window.discordStore.updateUser({
      decoration: this.selectedDecoration,
      status: this.selectedStatus,
      bannerColor: this.selectedBannerColor,
      pronouns: pronouns,
      bio: bio
    });

    if (window.discordAudio) window.discordAudio.playNotification();
    alert('✅ Perfil e moldura atualizados com sucesso!');
    this.renderAll();
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

  // =========================================================
  // SERVER SETTINGS MODAL MANAGEMENT
  // =========================================================
  isServerSettingsOpen() {
    const modal = document.getElementById('serverSettingsModal');
    return modal && !modal.classList.contains('hidden');
  }

  openServerSettings(tab = 'overview') {
    const server = window.discordStore.getCurrentServer();
    if (!server) return;

    const modal = document.getElementById('serverSettingsModal');
    if (!modal) return;

    const titleEl = document.getElementById('serverSettingsSidebarTitle');
    if (titleEl) titleEl.textContent = server.name;

    modal.classList.remove('hidden');
    modal.classList.add('flex');

    this.switchServerSettingsTab(tab);
  }

  closeServerSettings() {
    const modal = document.getElementById('serverSettingsModal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  }

  switchServerSettingsTab(tab) {
    this.currentServerSettingsTab = tab;

    // Update sidebar buttons
    document.querySelectorAll('.server-settings-tab-btn').forEach(btn => {
      if (btn.getAttribute('data-tab') === tab) {
        btn.classList.add('bg-[#35373c]', 'text-white');
        btn.classList.remove('text-[#949ba4]');
      } else {
        btn.classList.remove('bg-[#35373c]', 'text-white');
        btn.classList.add('text-[#949ba4]');
      }
    });

    // Hide all panes, show target pane
    document.querySelectorAll('.server-pane').forEach(p => p.classList.add('hidden'));
    const targetPane = document.getElementById(`serverPane-${tab}`);
    if (targetPane) {
      targetPane.classList.remove('hidden');
      if (tab === 'roles') {
        targetPane.classList.add('flex');
      }
    }

    if (tab === 'overview') {
      this.renderServerSettingsOverview();
    } else if (tab === 'roles') {
      this.renderServerSettingsRoles();
    } else if (tab === 'members') {
      this.renderServerSettingsMembers(this.serverMemberFilter);
    } else if (tab === 'bans') {
      this.renderServerSettingsBans();
    }
  }

  // --- TAB: OVERVIEW ---
  renderServerSettingsOverview() {
    const server = window.discordStore.getCurrentServer();
    if (!server) return;

    const nameInput = document.getElementById('serverSettingsNameInput');
    if (nameInput) nameInput.value = server.name;

    const iconInput = document.getElementById('serverSettingsIconUrl');
    if (iconInput) iconInput.value = server.iconImg || '';

    const iconPreview = document.getElementById('serverSettingsIconPreview');
    if (iconPreview) {
      if (server.iconImg) {
        iconPreview.innerHTML = `<img src="${server.iconImg}" class="w-full h-full object-cover" />`;
      } else {
        iconPreview.innerHTML = `<span>${server.iconText || server.name.substring(0, 2).toUpperCase()}</span>`;
        iconPreview.style.backgroundColor = server.iconBg || '#5865f2';
      }
    }

    // Stats
    const totalMembers = (server.members ? server.members.length : 0) + 1; // plus self
    const totalRoles = server.roles ? server.roles.length : 0;
    const totalBans = server.bans ? server.bans.length : 0;

    const statM = document.getElementById('serverStatsMembers');
    if (statM) statM.textContent = totalMembers;
    const statR = document.getElementById('serverStatsRoles');
    if (statR) statR.textContent = totalRoles;
    const statB = document.getElementById('serverStatsBans');
    if (statB) statB.textContent = totalBans;
  }

  saveServerOverview() {
    const server = window.discordStore.getCurrentServer();
    if (!server) return;

    const nameInput = document.getElementById('serverSettingsNameInput');
    const iconInput = document.getElementById('serverSettingsIconUrl');

    const newName = nameInput ? nameInput.value.trim() : '';
    const newIcon = iconInput ? iconInput.value.trim() : '';

    if (newName) server.name = newName;
    server.iconImg = newIcon;

    window.discordStore.persistServer(server);
    window.discordStore.sendWs({
      type: 'server_updated',
      server: server
    });

    if (window.discordAudio) window.discordAudio.playNotification();
    alert('✅ Configurações do servidor atualizadas!');
    this.renderAll();
    this.renderServerSettingsOverview();
  }

  deleteCurrentServer() {
    const server = window.discordStore.getCurrentServer();
    if (!server) return;

    if (window.discordStore.servers.length <= 1) {
      alert('Você não pode excluir o único servidor disponível.');
      return;
    }

    if (!confirm(`Tem certeza de que deseja excluir permanentemente o servidor "${server.name}"? Esta ação não pode ser desfeita.`)) {
      return;
    }

    window.discordStore.servers = window.discordStore.servers.filter(s => s.id !== server.id);
    window.discordStore.save('discord_servers', window.discordStore.servers);
    if (window.firebaseService && window.firebaseService.isConfigured) {
      window.firebaseService.deleteServer(server.id);
    }
    window.discordStore.sendWs({
      type: 'server_deleted',
      serverId: server.id
    });
    this.closeServerSettings();
    this.switchServer(window.discordStore.servers[0]?.id || 'home');
  }

  // --- TAB: ROLES ---
  renderServerSettingsRoles() {
    const server = window.discordStore.getCurrentServer();
    if (!server) return;

    const container = document.getElementById('rolesListContainer');
    if (!container) return;

    const roles = server.roles || [];
    if (!this.currentEditingRoleId || !roles.some(r => r.id === this.currentEditingRoleId)) {
      this.currentEditingRoleId = roles[0]?.id || null;
    }

    container.innerHTML = roles.map(role => {
      const isSelected = role.id === this.currentEditingRoleId;
      const memberCount = this.countRoleMembers(server, role.id);
      return `
        <button onclick="window.discordApp.selectRoleToEdit('${role.id}')" class="w-full text-left px-2.5 py-2 rounded flex items-center justify-between transition ${isSelected ? 'bg-[#35373c] text-white' : 'hover:bg-[#35373c]/50 text-[#949ba4] hover:text-[#dbdee1]'}">
          <div class="flex items-center space-x-2 truncate">
            <span class="w-3 h-3 rounded-full flex-shrink-0" style="background-color: ${role.color};"></span>
            <span class="truncate text-xs font-semibold">${role.name}</span>
          </div>
          <span class="text-[10px] opacity-75">${memberCount}</span>
        </button>
      `;
    }).join('');

    // Render permissions list schema
    const permContainer = document.getElementById('rolePermissionsContainer');
    if (permContainer && typeof DISCORD_PERMISSIONS !== 'undefined') {
      const categories = ['Geral', 'Moderação', 'Chat', 'Voz'];
      permContainer.innerHTML = categories.map(cat => {
        const permsInCat = DISCORD_PERMISSIONS.filter(p => p.category === cat);
        return `
          <div class="pt-2 border-t border-[#232428] first:border-0 first:pt-0">
            <div class="text-[11px] font-bold uppercase tracking-wider text-[#949ba4] mb-2">${cat}</div>
            <div class="space-y-2">
              ${permsInCat.map(p => `
                <div class="p-3 bg-[#2b2d31] rounded-lg flex items-center justify-between border border-[#232428] hover:border-[#35373c] transition">
                  <div class="pr-4">
                    <div class="font-semibold text-xs text-white flex items-center space-x-1.5">
                      <span>${p.name}</span>
                      ${p.dangerous ? '<span class="text-[9px] bg-[#f23f43] text-white px-1 py-0.5 rounded uppercase font-bold">PERIGOSO</span>' : ''}
                    </div>
                    <div class="text-[11px] text-[#949ba4] mt-0.5">${p.desc}</div>
                  </div>
                  <label class="discord-switch">
                    <input type="checkbox" class="role-permission-checkbox" data-permission-id="${p.id}">
                    <span class="discord-switch-track"><span class="discord-switch-thumb"></span></span>
                  </label>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }).join('');
    }

    if (this.currentEditingRoleId) {
      this.selectRoleToEdit(this.currentEditingRoleId);
    }
  }

  countRoleMembers(server, roleId) {
    let count = 0;
    if (roleId === 'role-everyone') return (server.members?.length || 0) + 1;
    if (window.discordStore.user.roles?.includes(roleId)) count++;
    (server.members || []).forEach(m => {
      if (m.roles?.includes(roleId)) count++;
    });
    return count;
  }

  selectRoleToEdit(roleId) {
    this.currentEditingRoleId = roleId;
    const server = window.discordStore.getCurrentServer();
    const role = (server.roles || []).find(r => r.id === roleId);
    if (!role) return;

    // Highlight in role list
    document.querySelectorAll('#rolesListContainer button').forEach(btn => {
      if (btn.getAttribute('onclick')?.includes(roleId)) {
        btn.classList.add('bg-[#35373c]', 'text-white');
        btn.classList.remove('text-[#949ba4]');
      } else {
        btn.classList.remove('bg-[#35373c]', 'text-white');
        btn.classList.add('text-[#949ba4]');
      }
    });

    const titleEl = document.getElementById('roleEditTitle');
    if (titleEl) titleEl.textContent = `Editar Cargo — ${role.name}`;

    const colorBadge = document.getElementById('roleEditColorBadge');
    if (colorBadge) colorBadge.style.backgroundColor = role.color;

    const nameInput = document.getElementById('roleEditName');
    if (nameInput) {
      nameInput.value = role.name;
      nameInput.disabled = (role.id === 'role-everyone');
    }

    const hoistCheckbox = document.getElementById('roleEditHoist');
    if (hoistCheckbox) hoistCheckbox.checked = !!role.hoist;

    const btnDelete = document.getElementById('btnDeleteRole');
    if (btnDelete) {
      if (role.id === 'role-everyone') {
        btnDelete.classList.add('hidden');
      } else {
        btnDelete.classList.remove('hidden');
      }
    }

    this.currentRoleColor = role.color;
    const colorPicker = document.getElementById('roleEditColorPicker');
    if (colorPicker && role.color.startsWith('#')) colorPicker.value = role.color;

    // Checkboxes
    const rolePerms = role.permissions || [];
    document.querySelectorAll('.role-permission-checkbox').forEach(cb => {
      const pId = cb.getAttribute('data-permission-id');
      cb.checked = rolePerms.includes(pId);
    });
  }

  selectRoleColor(hex) {
    this.currentRoleColor = hex;
    const colorBadge = document.getElementById('roleEditColorBadge');
    if (colorBadge) colorBadge.style.backgroundColor = hex;
    const colorPicker = document.getElementById('roleEditColorPicker');
    if (colorPicker && hex.startsWith('#')) colorPicker.value = hex;
  }

  createNewRole() {
    const server = window.discordStore.getCurrentServer();
    if (!server) return;

    const colors = ['#5865f2', '#23a55a', '#f0b232', '#f23f43', '#9b59b6', '#e91e63', '#1abc9c'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const newRole = window.discordStore.createRole(server.id, {
      name: 'Novo Cargo',
      color: randomColor,
      hoist: true,
      permissions: ['SEND_MESSAGES', 'ATTACH_FILES', 'CONNECT_VOICE', 'SPEAK_VOICE', 'STREAM_LIVE']
    });

    this.currentEditingRoleId = newRole.id;
    this.renderServerSettingsRoles();
  }

  saveRoleChanges() {
    const server = window.discordStore.getCurrentServer();
    if (!server || !this.currentEditingRoleId) return;

    const role = (server.roles || []).find(r => r.id === this.currentEditingRoleId);
    if (!role) return;

    const nameInput = document.getElementById('roleEditName');
    const hoistCheckbox = document.getElementById('roleEditHoist');

    const newName = nameInput ? nameInput.value.trim() : role.name;
    const newHoist = hoistCheckbox ? hoistCheckbox.checked : false;

    const newPermissions = [];
    document.querySelectorAll('.role-permission-checkbox:checked').forEach(cb => {
      const pId = cb.getAttribute('data-permission-id');
      if (pId) newPermissions.push(pId);
    });

    window.discordStore.updateRole(server.id, role.id, {
      name: role.id === 'role-everyone' ? '@everyone' : (newName || 'Cargo'),
      color: this.currentRoleColor,
      hoist: newHoist,
      permissions: newPermissions
    });

    if (window.discordAudio) window.discordAudio.playNotification();
    this.renderServerSettingsRoles();
    this.renderMembers();
  }

  deleteCurrentRole() {
    const server = window.discordStore.getCurrentServer();
    if (!server || !this.currentEditingRoleId) return;

    if (this.currentEditingRoleId === 'role-everyone') {
      alert('Você não pode excluir o cargo padrão @everyone.');
      return;
    }

    const role = (server.roles || []).find(r => r.id === this.currentEditingRoleId);
    if (!role) return;

    if (!confirm(`Deseja excluir o cargo "${role.name}"? Membros com este cargo perderão as permissões atribuídas a ele.`)) {
      return;
    }

    window.discordStore.deleteRole(server.id, role.id);
    this.currentEditingRoleId = null;
    this.renderServerSettingsRoles();
    this.renderMembers();
  }

  // --- TAB: MEMBERS ---
  filterServerMembers(val) {
    this.serverMemberFilter = (val || '').toLowerCase().trim();
    this.renderServerSettingsMembers(this.serverMemberFilter);
  }

  renderServerSettingsMembers(filterText = '') {
    const server = window.discordStore.getCurrentServer();
    if (!server) return;

    const container = document.getElementById('serverSettingsMembersContainer');
    if (!container) return;

    const subtitle = document.getElementById('serverMembersSubtitle');
    const allMembers = [];

    // Current user (me)
    const u = window.discordStore.user;
    const isOwner = (server.ownerId && server.ownerId === u.id) || (!server.ownerId && (u.id === 'user-admin' || u.id === 'me'));
    const myExisting = (server.members || []).find(m => m.id === u.id);

    allMembers.push({
      id: u.id,
      username: u.username,
      discriminator: u.discriminator,
      avatar: u.avatar,
      isOwner: isOwner,
      roles: isOwner ? ['role-admin'] : (myExisting?.roles || u.roles || ['role-everyone']),
      timeoutUntil: u.timeoutUntil
    });

    // Server members (avoid duplicating 'me')
    (server.members || []).forEach(m => {
      if (m.id !== u.id) {
        const isMOwner = (server.ownerId && server.ownerId === m.id) || (!server.ownerId && (m.id === 'user-admin' || m.id === 'me'));
        allMembers.push({
          id: m.id,
          username: m.username,
          discriminator: m.discriminator,
          avatar: m.avatar,
          isBot: m.isBot,
          isOwner: isMOwner,
          roles: isMOwner ? ['role-admin'] : (m.roles || ['role-everyone']),
          timeoutUntil: m.timeoutUntil
        });
      }
    });

    if (subtitle) {
      subtitle.textContent = `Gerencie os membros, atribua cargos e aplique moderações — ${allMembers.length} membros`;
    }

    const filtered = allMembers.filter(m => {
      if (!filterText) return true;
      return m.username.toLowerCase().includes(filterText) || m.discriminator.includes(filterText);
    });

    if (filtered.length === 0) {
      container.innerHTML = `<div class="p-8 text-center text-[#949ba4] text-xs">Nenhum membro encontrado.</div>`;
      return;
    }

    const serverRoles = server.roles || [];

    container.innerHTML = filtered.map(m => {
      const isMe = m.id === u.id;
      const isOwner = m.isOwner;
      const memberRoles = serverRoles.filter(r => (m.roles || []).includes(r.id) && r.id !== 'role-everyone');
      const isTimedOut = window.discordStore.isMemberTimedOut(server.id, m.id);
      const remainingTimeout = window.discordStore.getMemberTimeoutRemaining(server.id, m.id);

      return `
        <div class="p-3 bg-[#2b2d31] rounded-xl flex items-center justify-between border border-[#232428] hover:border-[#35373c] transition">
          <div class="flex items-center space-x-3 min-w-0">
            <img src="${m.avatar}" class="w-10 h-10 rounded-full object-cover border-2 border-[#232428]" alt="${m.username}" />
            <div class="min-w-0">
              <div class="flex items-center space-x-1.5 truncate">
                <span class="font-bold text-sm text-white">${m.username}</span>
                <span class="text-xs text-[#949ba4]">#${m.discriminator}</span>
                ${isOwner ? '<span class="text-xs" title="Dono do Servidor">👑</span>' : ''}
                ${m.isBot ? '<span class="bg-[#5865f2] text-white text-[9px] font-bold px-1 rounded uppercase">BOT</span>' : ''}
              </div>
              <!-- Assigned roles pills -->
              <div class="flex flex-wrap items-center gap-1 mt-1">
                ${memberRoles.map(r => `
                  <span class="discord-role-pill">
                    <span class="discord-role-dot" style="background-color: ${r.color};"></span>
                    <span style="color: ${r.color};">${r.name}</span>
                    ${!isMe ? `<button onclick="window.discordApp.removeMemberRole('${m.id}', '${r.id}')" class="ml-1 text-[#949ba4] hover:text-white" title="Remover Cargo">×</button>` : ''}
                  </span>
                `).join('')}

                ${!isMe ? `
                  <!-- Add role button -->
                  <div class="relative inline-block text-left member-add-role-wrap">
                    <button onclick="window.discordApp.toggleRoleDropdownForMember(event, '${m.id}')" class="px-1.5 py-0.5 rounded bg-[#1e1f22] hover:bg-[#35373c] text-[10px] text-[#dbdee1] border border-[#3f4147] transition">
                      +
                    </button>
                    <div id="roleDropdown_${m.id}" class="hidden absolute left-0 bottom-full mb-1 w-44 bg-[#111214] border border-[#232428] rounded-lg shadow-2xl p-1 z-50 text-xs">
                      ${serverRoles.filter(r => r.id !== 'role-everyone').map(r => `
                        <button onclick="window.discordApp.toggleMemberRole('${m.id}', '${r.id}')" class="w-full text-left px-2 py-1.5 rounded flex items-center space-x-2 hover:bg-[#35373c] text-[#dbdee1] transition">
                          <span class="w-2.5 h-2.5 rounded-full" style="background-color: ${r.color};"></span>
                          <span class="truncate">${r.name}</span>
                          ${(m.roles || []).includes(r.id) ? '<span class="ml-auto text-xs text-[#23a55a]">✓</span>' : ''}
                        </button>
                      `).join('')}
                    </div>
                  </div>
                ` : ''}

                ${isTimedOut ? `
                  <span class="timeout-indicator-badge">
                    <span>⏱️ Castigo (${remainingTimeout}s)</span>
                    <button onclick="window.discordApp.removeMemberTimeout('${m.id}')" class="ml-1 text-xs hover:underline text-[#f0b232]" title="Remover Castigo">×</button>
                  </span>
                ` : ''}
              </div>
            </div>
          </div>

          <!-- Moderation Actions -->
          ${!isMe && !isOwner ? `
            <div class="flex items-center space-x-1.5 flex-shrink-0">
              ${isTimedOut ? `
                <button onclick="window.discordApp.removeMemberTimeout('${m.id}')" class="px-2.5 py-1.5 bg-[#f0b232]/10 hover:bg-[#f0b232]/20 text-[#f0b232] rounded text-xs font-semibold flex items-center space-x-1 transition" title="Remover de Castigo">
                  <span>Remover Castigo</span>
                </button>
              ` : `
                <button onclick="window.discordApp.openTimeoutModal('${m.id}')" class="p-1.5 bg-[#1e1f22] hover:bg-[#35373c] text-[#f0b232] rounded-lg text-xs font-semibold flex items-center space-x-1 transition" title="Colocar de Castigo">
                  <span class="text-sm">⏱️</span>
                </button>
              `}
              <button onclick="window.discordApp.openKickModal('${m.id}')" class="p-1.5 bg-[#1e1f22] hover:bg-[#35373c] text-[#f23f43] rounded-lg text-xs font-semibold flex items-center space-x-1 transition" title="Expulsar">
                <span class="text-sm">👢</span>
              </button>
              <button onclick="window.discordApp.openBanModal('${m.id}')" class="p-1.5 bg-[#1e1f22] hover:bg-[#f23f43] text-white rounded-lg text-xs font-semibold flex items-center space-x-1 transition" title="Banir">
                <span class="text-sm">🔨</span>
              </button>
            </div>
          ` : `
            <span class="text-xs text-[#949ba4] italic">${isOwner ? 'Dono do Servidor' : 'Você'}</span>
          `}
        </div>
      `;
    }).join('');
  }

  toggleRoleDropdownForMember(e, memberId) {
    e.stopPropagation();
    document.querySelectorAll('[id^="roleDropdown_"]').forEach(el => {
      if (el.id !== `roleDropdown_${memberId}`) el.classList.add('hidden');
    });
    const dropdown = document.getElementById(`roleDropdown_${memberId}`);
    if (dropdown) dropdown.classList.toggle('hidden');
  }

  toggleMemberRole(memberId, roleId) {
    const server = window.discordStore.getCurrentServer();
    if (!server) return;

    const member = (server.members || []).find(m => m.id === memberId);
    const hasRole = member && member.roles && member.roles.includes(roleId);

    if (hasRole) {
      window.discordStore.removeRole(server.id, memberId, roleId);
    } else {
      window.discordStore.assignRole(server.id, memberId, roleId);
    }

    this.renderServerSettingsMembers(this.serverMemberFilter);
    this.renderMembers();
  }

  removeMemberRole(memberId, roleId) {
    const server = window.discordStore.getCurrentServer();
    if (!server) return;
    window.discordStore.removeRole(server.id, memberId, roleId);
    this.renderServerSettingsMembers(this.serverMemberFilter);
    this.renderMembers();
  }

  // --- TAB: BANS ---
  renderServerSettingsBans() {
    const server = window.discordStore.getCurrentServer();
    if (!server) return;

    const container = document.getElementById('serverSettingsBansContainer');
    if (!container) return;

    const subtitle = document.getElementById('serverBansSubtitle');
    const bans = server.bans || [];

    if (subtitle) {
      subtitle.textContent = `Membros banidos não podem reentrar no servidor até que seu banimento seja revogado — ${bans.length} banimentos`;
    }

    if (bans.length === 0) {
      container.innerHTML = `
        <div class="p-12 text-center text-[#949ba4] space-y-2">
          <div class="text-3xl">🕊️</div>
          <div class="font-bold text-white text-sm">Nenhum membro banido</div>
          <div class="text-xs">Não há banimentos ativos neste servidor. Membros banidos aparecerão aqui.</div>
        </div>
      `;
      return;
    }

    container.innerHTML = bans.map(ban => `
      <div class="p-4 bg-[#2b2d31] rounded-xl flex items-center justify-between border border-[#232428] hover:border-[#35373c] transition">
        <div class="flex items-center space-x-3.5 min-w-0">
          <img src="${ban.avatar}" class="w-10 h-10 rounded-full object-cover border-2 border-[#232428]" alt="${ban.username}" />
          <div class="min-w-0">
            <div class="font-bold text-sm text-white">${ban.username} <span class="text-xs text-[#949ba4] font-normal">#${ban.discriminator}</span></div>
            <div class="text-xs text-[#f23f43] mt-0.5"><span class="font-semibold">Motivo:</span> ${ban.reason || 'Sem motivo especificado'}</div>
            <div class="text-[11px] text-[#949ba4] mt-0.5">Banido por ${ban.bannedBy || 'Admin'} em ${ban.bannedAt || 'recente'}</div>
          </div>
        </div>
        <button onclick="window.discordApp.unbanUser('${ban.userId}')" class="px-4 py-2 bg-[#1e1f22] hover:bg-[#23a55a] text-[#dbdee1] hover:text-white rounded-lg text-xs font-semibold transition">
          Revogar Banimento
        </button>
      </div>
    `).join('');
  }

  unbanUser(userId) {
    const server = window.discordStore.getCurrentServer();
    if (!server) return;

    if (confirm('Deseja realmente revogar o banimento deste usuário? Ele poderá retornar ao servidor.')) {
      window.discordStore.unbanMember(server.id, userId);
      this.renderServerSettingsBans();
      this.renderServerSettingsOverview();
      if (window.discordAudio) window.discordAudio.playNotification();
    }
  }

  // =========================================================
  // MODERATION ACTIONS & MODALS (TIMEOUT, KICK, BAN)
  // =========================================================
  openTimeoutModal(memberId) {
    const server = window.discordStore.getCurrentServer();
    if (!server) return;
    const myId = window.discordStore.user ? window.discordStore.user.id : null;
    if (memberId === 'me' || memberId === myId) {
      alert('⛔ Você não pode colocar a si mesmo de castigo.');
      return;
    }
    if (!window.discordStore.hasPermission(server.id, myId, 'MODERATE_MEMBERS')) {
      alert('⛔ Você não tem permissão para moderar membros neste servidor.');
      return;
    }

    const member = (server.members || []).find(m => m.id === memberId);
    if (!member) return;

    this.targetModMemberId = memberId;
    this.selectedTimeoutDuration = 60;

    const modal = document.getElementById('timeoutModal');
    if (!modal) return;

    document.getElementById('timeoutModalAvatar').src = member.avatar;
    document.getElementById('timeoutModalTitle').textContent = `Colocar ${member.username} de Castigo`;
    document.getElementById('timeoutModalReason').value = '';

    // Reset button states
    document.querySelectorAll('.timeout-dur-btn').forEach((btn, idx) => {
      if (idx === 0) {
        btn.classList.add('border-[#5865f2]', 'text-white');
        btn.classList.remove('border-transparent', 'text-[#dbdee1]');
      } else {
        btn.classList.remove('border-[#5865f2]', 'text-white');
        btn.classList.add('border-transparent', 'text-[#dbdee1]');
      }
    });

    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }

  closeTimeoutModal() {
    const modal = document.getElementById('timeoutModal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  }

  selectTimeoutDuration(seconds, btnEl) {
    this.selectedTimeoutDuration = seconds;
    document.querySelectorAll('.timeout-dur-btn').forEach(btn => {
      btn.classList.remove('border-[#5865f2]', 'text-white');
      btn.classList.add('border-transparent', 'text-[#dbdee1]');
    });
    if (btnEl) {
      btnEl.classList.add('border-[#5865f2]', 'text-white');
      btnEl.classList.remove('border-transparent', 'text-[#dbdee1]');
    }
  }

  confirmTimeout() {
    if (!this.targetModMemberId) return;
    const server = window.discordStore.getCurrentServer();
    if (!server) return;
    const myId = window.discordStore.user ? window.discordStore.user.id : null;
    if (this.targetModMemberId === 'me' || this.targetModMemberId === myId) {
      alert('⛔ Você não pode se colocar de castigo.');
      return;
    }
    if (!window.discordStore.hasPermission(server.id, myId, 'MODERATE_MEMBERS')) {
      alert('⛔ Você não tem permissão para moderar membros neste servidor.');
      return;
    }

    const reasonInput = document.getElementById('timeoutModalReason');
    const reason = reasonInput ? reasonInput.value.trim() : 'Violação das regras';

    window.discordStore.timeoutMember(server.id, this.targetModMemberId, this.selectedTimeoutDuration, reason);
    this.closeTimeoutModal();
    if (this.isServerSettingsOpen()) {
      this.renderServerSettingsMembers(this.serverMemberFilter);
    }
    this.renderMembers();
    if (window.discordAudio) window.discordAudio.playNotification();
  }

  removeMemberTimeout(memberId) {
    const server = window.discordStore.getCurrentServer();
    if (!server) return;

    const myId = window.discordStore.user ? window.discordStore.user.id : null;
    const isTargetMe = memberId === 'me' || memberId === myId || (window.discordStore.user?.username && memberId.toLowerCase() === window.discordStore.user.username.toLowerCase());
    if (isTargetMe) {
      alert('⛔ Você não pode remover o seu próprio castigo!');
      return;
    }

    if (!window.discordStore.hasPermission(server.id, myId, 'MODERATE_MEMBERS')) {
      alert('⛔ Você não tem permissão para remover castigos neste servidor.');
      return;
    }

    const success = window.discordStore.removeTimeout(server.id, memberId);
    if (!success) return;

    if (this.isServerSettingsOpen()) {
      this.renderServerSettingsMembers(this.serverMemberFilter);
    }
    this.renderMembers();
    if (this.memberProfileModal && !this.memberProfileModal.classList.contains('hidden')) {
      const alertEl = document.getElementById('profileModalTimeoutAlert');
      if (alertEl) alertEl.classList.add('hidden');
    }
  }

  openKickModal(memberId) {
    const server = window.discordStore.getCurrentServer();
    const member = (server.members || []).find(m => m.id === memberId);
    if (!member) return;

    this.targetModMemberId = memberId;
    const modal = document.getElementById('kickModal');
    if (!modal) return;

    document.getElementById('kickModalTitle').textContent = `Expulsar '${member.username}'`;
    document.getElementById('kickModalReason').value = '';

    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }

  closeKickModal() {
    const modal = document.getElementById('kickModal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  }

  confirmKick() {
    if (!this.targetModMemberId) return;
    const server = window.discordStore.getCurrentServer();
    const reasonInput = document.getElementById('kickModalReason');
    const reason = reasonInput ? reasonInput.value.trim() : 'Expulso pelo moderador';

    window.discordStore.kickMember(server.id, this.targetModMemberId, reason);
    this.closeKickModal();
    if (this.memberProfileModal) this.memberProfileModal.classList.add('hidden');
    if (this.isServerSettingsOpen()) {
      this.renderServerSettingsMembers(this.serverMemberFilter);
    }
    this.renderMembers();
    if (window.discordAudio) window.discordAudio.playNotification();
  }

  openBanModal(memberId) {
    const server = window.discordStore.getCurrentServer();
    const member = (server.members || []).find(m => m.id === memberId);
    if (!member) return;

    this.targetModMemberId = memberId;
    const modal = document.getElementById('banModal');
    if (!modal) return;

    document.getElementById('banModalTitle').textContent = `Banir '${member.username}' do Servidor`;
    document.getElementById('banModalReason').value = '';

    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }

  closeBanModal() {
    const modal = document.getElementById('banModal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  }

  confirmBan() {
    if (!this.targetModMemberId) return;
    const server = window.discordStore.getCurrentServer();
    const reasonInput = document.getElementById('banReasonInput') || document.getElementById('banModalReason');
    const reason = reasonInput ? reasonInput.value.trim() : 'Banido pelo moderador';

    window.discordStore.banMember(server.id, this.targetModMemberId, reason);
    this.closeBanModal();
    if (this.memberProfileModal) this.memberProfileModal.classList.add('hidden');
    if (this.isServerSettingsOpen()) {
      this.renderServerSettingsMembers(this.serverMemberFilter);
      this.renderServerSettingsBans();
    }
    this.renderMembers();
    if (window.discordAudio) window.discordAudio.playNotification();
  }

  // =========================================================
  // ENHANCED MEMBER PROFILE CARD
  // =========================================================
  openMemberProfile(memberId) {
    const server = window.discordStore.getCurrentServer();
    const u = window.discordStore.user;
    const isMe = memberId === u.id || memberId === 'me';
    
    let member = null;
    if (isMe) {
      const isOwner = (server.ownerId && server.ownerId === u.id) || (!server.ownerId && (u.id === 'user-admin' || u.id === 'me'));
      const myExisting = (server.members || []).find(m => m.id === u.id);
      member = {
        id: u.id,
        username: u.username,
        discriminator: u.discriminator,
        avatar: u.avatar,
        customStatus: u.customStatus,
        bannerColor: u.bannerColor || '#5865f2',
        decoration: u.decoration || 'none',
        badges: isOwner ? ['👑 Dono', '💎 Nitro', '⚡ Dev'] : (myExisting?.badges || ['Membro']),
        roles: isOwner ? ['role-admin'] : (myExisting?.roles || u.roles || ['role-everyone']),
        timeoutUntil: u.timeoutUntil
      };
    } else {
      member = (server.members || []).find(m => m.id === memberId);
    }

    if (!member) return;

    const modal = this.memberProfileModal;
    if (!modal) return;

    const banner = document.getElementById('profileModalBanner');
    if (banner) banner.style.backgroundColor = member.bannerColor || '#5865f2';

    const avatar = document.getElementById('profileModalAvatar');
    if (avatar) avatar.src = member.avatar;

    const decor = document.getElementById('profileModalDecoration');
    if (decor) {
      decor.className = 'avatar-decoration-overlay ' + (member.decoration && member.decoration !== 'none' ? `decoration-${member.decoration}` : '');
    }

    document.getElementById('profileModalName').textContent = member.username;
    document.getElementById('profileModalTag').textContent = `#${member.discriminator}`;
    document.getElementById('profileModalAbout').textContent = member.customStatus || 'Sem status definido.';

    const badgesContainer = document.getElementById('profileModalBadges');
    if (badgesContainer) {
      badgesContainer.innerHTML = (member.badges || []).map(b => `<span class="bg-[#1e1f22] text-[#f2f3f5] px-2 py-0.5 rounded text-xs border border-[#35373c]">${b}</span>`).join('');
    }

    // Timeout alert banner
    const isTimedOut = window.discordStore.isMemberTimedOut(server.id, member.id);
    const timeoutAlert = document.getElementById('profileModalTimeoutAlert');
    if (timeoutAlert) {
      if (isTimedOut) {
        timeoutAlert.classList.remove('hidden');
        const remaining = window.discordStore.getMemberTimeoutRemaining(server.id, member.id);
        const remEl = document.getElementById('profileModalTimeoutRemaining');
        if (remEl) remEl.textContent = `Restam ${remaining} segundos`;

        const btnRem = document.getElementById('btnRemoveTimeoutProfile');
        if (btnRem) {
          const canModerate = window.discordStore.hasPermission(server.id, u.id, 'MODERATE_MEMBERS');
          if (isMe || !canModerate) {
            btnRem.classList.add('hidden');
          } else {
            btnRem.classList.remove('hidden');
            btnRem.onclick = () => {
              this.removeMemberTimeout(member.id);
            };
          }
        }
      } else {
        timeoutAlert.classList.add('hidden');
      }
    }

    // Roles pills in profile card
    const rolesContainer = document.getElementById('profileModalRoles');
    const memberRoles = (server.roles || []).filter(r => (member.roles || []).includes(r.id) && r.id !== 'role-everyone');
    if (rolesContainer) {
      if (memberRoles.length === 0) {
        rolesContainer.innerHTML = `<span class="text-xs text-[#949ba4]">Nenhum cargo atribuído</span>`;
      } else {
        rolesContainer.innerHTML = memberRoles.map(r => `
          <span class="discord-role-pill">
            <span class="discord-role-dot" style="background-color: ${r.color};"></span>
            <span style="color: ${r.color};">${r.name}</span>
          </span>
        `).join('');
      }
    }

    // Role assignment dropdown button (+ Cargo)
    const canManageRoles = window.discordStore.hasPermission(server.id, 'me', 'MANAGE_ROLES') ||
                          window.discordStore.hasPermission(server.id, 'me', 'ADMINISTRATOR');
    const btnAddRole = document.getElementById('btnProfileAddRole');
    const roleMenu = document.getElementById('profileRoleMenu');

    if (btnAddRole && roleMenu) {
      if (canManageRoles && !isMe) {
        btnAddRole.classList.remove('hidden');
        btnAddRole.onclick = (e) => {
          e.stopPropagation();
          roleMenu.classList.toggle('hidden');
        };

        const serverRoles = server.roles || [];
        roleMenu.innerHTML = serverRoles.filter(r => r.id !== 'role-everyone').map(r => {
          const has = (member.roles || []).includes(r.id);
          return `
            <button onclick="window.discordApp.toggleMemberRole('${member.id}', '${r.id}'); window.discordApp.openMemberProfile('${member.id}')" class="w-full text-left px-2 py-1.5 rounded flex items-center space-x-2 hover:bg-[#35373c] text-[#dbdee1] transition">
              <span class="w-2.5 h-2.5 rounded-full" style="background-color: ${r.color};"></span>
              <span class="truncate">${r.name}</span>
              ${has ? '<span class="ml-auto text-xs text-[#23a55a]">✓</span>' : ''}
            </button>
          `;
        }).join('');
      } else {
        btnAddRole.classList.add('hidden');
      }
    }

    // Moderation action buttons
    const modActions = document.getElementById('profileModalModActions');
    if (modActions) {
      const canMod = window.discordStore.hasPermission(server.id, 'me', 'MODERATE_MEMBERS') ||
                     window.discordStore.hasPermission(server.id, 'me', 'ADMINISTRATOR');
      const canKick = window.discordStore.hasPermission(server.id, 'me', 'KICK_MEMBERS') ||
                      window.discordStore.hasPermission(server.id, 'me', 'ADMINISTRATOR');
      const canBan = window.discordStore.hasPermission(server.id, 'me', 'BAN_MEMBERS') ||
                     window.discordStore.hasPermission(server.id, 'me', 'ADMINISTRATOR');

      if (!isMe && (canMod || canKick || canBan)) {
        modActions.classList.remove('hidden');
        const btnT = document.getElementById('btnProfileTimeout');
        if (btnT) {
          btnT.onclick = () => {
            this.memberProfileModal.classList.add('hidden');
            this.openTimeoutModal(member.id);
          };
        }
        const btnK = document.getElementById('btnProfileKick');
        if (btnK) {
          btnK.onclick = () => {
            this.memberProfileModal.classList.add('hidden');
            this.openKickModal(member.id);
          };
        }
        const btnB = document.getElementById('btnProfileBan');
        if (btnB) {
          btnB.onclick = () => {
            this.memberProfileModal.classList.add('hidden');
            this.openBanModal(member.id);
          };
        }
      } else {
        modActions.classList.add('hidden');
      }
    }

    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }

  // =========================================================
  // AUTHENTICATION & LOGIN/REGISTER MODAL
  // =========================================================
  checkAuthState() {
    const isLoggedIn = localStorage.getItem('discord_logged_in') === 'true';
    const authScreen = document.getElementById('authScreen');
    if (!authScreen) return;

    if (!isLoggedIn) {
      authScreen.classList.remove('hidden');
      authScreen.classList.add('flex');
    } else {
      authScreen.classList.add('hidden');
      authScreen.classList.remove('flex');
    }
  }

  toggleAuthMode() {
    this.authMode = this.authMode === 'login' ? 'register' : 'login';
    const title = document.getElementById('authTitle');
    const subtitle = document.getElementById('authSubtitle');
    const emailGroup = document.getElementById('authEmailGroup');
    const submitBtn = document.getElementById('authSubmitBtn');
    const prompt = document.getElementById('authTogglePrompt');
    const toggleBtn = document.getElementById('authToggleBtn');
    const errBox = document.getElementById('authErrorMessage');
    if (errBox) errBox.classList.add('hidden');

    if (this.authMode === 'register') {
      if (title) title.textContent = 'Criar uma conta';
      if (subtitle) subtitle.textContent = 'Cadastre-se para conversar e entrar em servidores!';
      if (emailGroup) emailGroup.classList.remove('hidden');
      if (submitBtn) submitBtn.textContent = 'Continuar';
      if (prompt) prompt.textContent = 'Já tem uma conta?';
      if (toggleBtn) toggleBtn.textContent = 'Entrar';
    } else {
      if (title) title.textContent = 'Boas-vindas de volta!';
      if (subtitle) subtitle.textContent = 'Estamos muito animados em ver você novamente!';
      if (emailGroup) emailGroup.classList.add('hidden');
      if (submitBtn) submitBtn.textContent = 'Entrar';
      if (prompt) prompt.textContent = 'Precisa de uma conta?';
      if (toggleBtn) toggleBtn.textContent = 'Registre-se';
    }
  }

  async handleAuthSubmit() {
    const usernameInput = document.getElementById('authUsernameInput');
    const emailInput = document.getElementById('authEmailInput');
    const passwordInput = document.getElementById('authPasswordInput');
    const errBox = document.getElementById('authErrorMessage');

    const username = usernameInput ? usernameInput.value.trim() : '';
    const email = emailInput ? emailInput.value.trim() : '';
    const password = passwordInput ? passwordInput.value.trim() : '';

    if (!username || !password) {
      if (errBox) {
        errBox.textContent = 'Preencha o nome de usuário e a senha.';
        errBox.classList.remove('hidden');
      }
      return;
    }

    try {
      if (errBox) errBox.classList.add('hidden');
      if (this.authMode === 'register') {
        await window.firebaseService.register(username, email, password);
      } else {
        await window.firebaseService.login(username, password);
      }

      localStorage.setItem('discord_logged_in', 'true');
      this.checkAuthState();
      this.renderAll();
      if (window.discordAudio) window.discordAudio.playJoin();
    } catch (err) {
      if (errBox) {
        errBox.textContent = err.message || 'Erro ao realizar autenticação.';
        errBox.classList.remove('hidden');
      }
    }
  }

  async quickLogin(username, password) {
    const errBox = document.getElementById('authErrorMessage');
    if (errBox) errBox.classList.add('hidden');
    try {
      await window.firebaseService.login(username, password);
      localStorage.setItem('discord_logged_in', 'true');
      this.checkAuthState();
      this.renderAll();
      if (window.discordAudio) window.discordAudio.playJoin();
    } catch (err) {
      if (errBox) {
        errBox.textContent = err.message || 'Erro ao conectar';
        errBox.classList.remove('hidden');
      }
    }
  }

  handleLogout() {
    if (confirm('Deseja realmente sair da sua conta?')) {
      window.firebaseService.logout();
    }
  }

  // =========================================================
  // FRIENDS HUB (ONLINE, ALL, PENDING, BLOCKED, ADD)
  // =========================================================
  switchFriendsTab(tab) {
    this.currentFriendsTab = tab;
    document.querySelectorAll('.friends-tab-pill').forEach(btn => {
      btn.classList.remove('active');
      btn.classList.remove('text-[#dbdee1]');
      btn.classList.add('text-[#949ba4]');
    });

    const tabName = tab.charAt(0).toUpperCase() + tab.slice(1);
    const activeBtn = document.getElementById(`tabBtnFriends${tabName}`);
    if (activeBtn) {
      activeBtn.classList.add('active');
      activeBtn.classList.add('text-[#dbdee1]');
      activeBtn.classList.remove('text-[#949ba4]');
    }

    const listPane = document.getElementById('friendsListPane');
    const pendingPane = document.getElementById('friendsPendingPane');
    const invitesPane = document.getElementById('friendsInvitesPane');
    const addPane = document.getElementById('friendsAddPane');

    if (listPane) listPane.classList.add('hidden');
    if (pendingPane) pendingPane.classList.add('hidden');
    if (invitesPane) invitesPane.classList.add('hidden');
    if (addPane) addPane.classList.add('hidden');

    if (tab === 'add') {
      if (addPane) addPane.classList.remove('hidden');
      const input = document.getElementById('inputAddFriendUsername');
      if (input) {
        input.value = '';
        input.focus();
      }
      const fb = document.getElementById('addFriendFeedback');
      if (fb) fb.classList.add('hidden');
      this.renderRegisteredUsersToAdd();
    } else if (tab === 'pending') {
      if (pendingPane) pendingPane.classList.remove('hidden');
      this.renderFriendsPending();
    } else if (tab === 'invites') {
      if (invitesPane) invitesPane.classList.remove('hidden');
      this.renderServerInvites();
    } else {
      if (listPane) listPane.classList.remove('hidden');
      this.renderFriendsList();
    }
  }

  renderFriendsList(filterText = '') {
    const container = document.getElementById('friendsCardsContainer');
    if (!container) return;

    let friends = window.discordStore.getFriendsList();
    if (this.currentFriendsTab === 'online') {
      friends = friends.filter(f => f.status && f.status !== 'offline');
    }

    if (filterText) {
      const q = filterText.toLowerCase();
      friends = friends.filter(f => f.username.toLowerCase().includes(q));
    }

    const heading = document.getElementById('friendsCountHeading');
    if (heading) {
      const label = this.currentFriendsTab === 'online' ? 'DISPONÍVEL' : 'TODOS OS AMIGOS';
      heading.textContent = `${label} — ${friends.length}`;
    }

    if (friends.length === 0) {
      container.innerHTML = `
        <div class="py-12 text-center text-[#949ba4] text-xs space-y-2">
          <div class="text-3xl">👥</div>
          <div class="font-bold text-white text-sm">Nenhum amigo encontrado</div>
          <div>Adicione novos amigos pela aba "Adicionar Amigo" acima.</div>
        </div>
      `;
      return;
    }

    container.innerHTML = friends.map(f => `
      <div class="friend-row-item flex items-center justify-between p-2.5 rounded-lg transition group">
        <div class="flex items-center space-x-3 min-w-0">
          <div class="avatar-wrap relative flex-shrink-0">
            <img src="${f.avatar}" class="w-10 h-10 rounded-full object-cover" alt="${f.username}" />
            <div class="status-indicator ${f.status || 'offline'} w-3 h-3"></div>
          </div>
          <div class="min-w-0 leading-tight">
            <div class="flex items-center space-x-1.5">
              <span class="font-bold text-white text-sm truncate group-hover:underline cursor-pointer" onclick="window.discordApp.openMemberProfile('${f.id}')">${f.username}</span>
              <span class="text-xs text-[#949ba4]">#${f.discriminator || '0001'}</span>
            </div>
            <div class="text-xs text-[#949ba4] truncate mt-0.5">${f.customStatus || (f.status === 'online' ? 'Online' : 'Ausente')}</div>
          </div>
        </div>

        <div class="flex items-center space-x-2">
          <button onclick="window.discordApp.openDMWithFriend('${f.id}')" class="w-9 h-9 rounded-full bg-[#2b2d31] hover:bg-[#111214] text-[#b5bac1] hover:text-white flex items-center justify-center transition shadow" title="Enviar Mensagem">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/></svg>
          </button>
          <button onclick="if(confirm('Remover ${f.username} dos amigos?')) window.discordApp.handleRemoveFriend('${f.id}')" class="w-9 h-9 rounded-full bg-[#2b2d31] hover:bg-[#f23f43] text-[#b5bac1] hover:text-white flex items-center justify-center transition shadow" title="Remover Amigo">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          </button>
        </div>
      </div>
    `).join('');
  }

  filterFriends(val) {
    this.renderFriendsList(val);
  }

  renderFriendsPending() {
    const container = document.getElementById('pendingRequestsContainer');
    if (!container) return;

    const storedRequests = JSON.parse(localStorage.getItem('discord_friend_requests') || '[]');
    const myUsername = window.discordStore.user.username.toLowerCase();
    const myRequests = storedRequests.filter(r => !r.toUsername || r.toUsername.toLowerCase() === myUsername);

    const heading = document.getElementById('pendingCountHeading');
    if (heading) {
      heading.textContent = `PENDENTE — ${myRequests.length}`;
    }

    this.updateFriendsBadge();

    if (myRequests.length === 0) {
      container.innerHTML = `
        <div class="py-12 text-center text-[#949ba4] text-xs space-y-2">
          <div class="text-3xl">📭</div>
          <div class="font-bold text-white text-sm">Nenhuma solicitação de amizade pendente</div>
          <div>Quando alguém adicionar você, as solicitações aparecerão aqui.</div>
        </div>
      `;
      return;
    }

    container.innerHTML = myRequests.map(r => `
      <div class="flex items-center justify-between p-3 bg-[#2b2d31] border border-[#232428] rounded-xl">
        <div class="flex items-center space-x-3 min-w-0">
          <img src="${r.fromAvatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${r.fromUsername}`}" class="w-10 h-10 rounded-full object-cover" alt="${r.fromUsername}" />
          <div class="min-w-0">
            <div class="font-bold text-white text-sm truncate">${r.fromUsername} <span class="text-xs text-[#949ba4]">#${r.fromDiscriminator || '0001'}</span></div>
            <div class="text-xs text-[#23a55a] font-medium">Pedido de amizade recebido</div>
          </div>
        </div>

        <div class="flex items-center space-x-2">
          <button onclick="window.discordApp.handleAcceptFriendRequest('${r.id}')" class="w-9 h-9 rounded-full bg-[#1e1f22] hover:bg-[#23a55a] text-white flex items-center justify-center transition shadow" title="Aceitar">
            <svg class="w-5 h-5 text-[#23a55a] hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
          </button>
          <button onclick="window.discordApp.handleDeclineFriendRequest('${r.id}')" class="w-9 h-9 rounded-full bg-[#1e1f22] hover:bg-[#f23f43] text-white flex items-center justify-center transition shadow" title="Recusar">
            <svg class="w-5 h-5 text-[#f23f43] hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
      </div>
    `).join('');
  }

  updateFriendsBadge() {
    const badge = document.getElementById('friendsPendingBadge');
    if (!badge) return;
    const storedRequests = JSON.parse(localStorage.getItem('discord_friend_requests') || '[]');
    const myUsername = window.discordStore.user.username.toLowerCase();
    const count = storedRequests.filter(r => !r.toUsername || r.toUsername.toLowerCase() === myUsername).length;

    if (count > 0) {
      badge.textContent = count;
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }
  }

  async handleAddFriendSubmit() {
    const input = document.getElementById('inputAddFriendUsername');
    const feedback = document.getElementById('addFriendFeedback');
    const username = input ? input.value.trim() : '';

    if (!username) return;

    try {
      feedback.classList.remove('hidden', 'bg-[#23a55a]/15', 'text-[#23a55a]', 'bg-[#f23f43]/15', 'text-[#f23f43]');
      await window.firebaseService.sendFriendRequest(username);
      feedback.textContent = `✅ Sucesso! O seu pedido de amizade para "${username}" foi enviado.`;
      feedback.classList.add('bg-[#23a55a]/15', 'text-[#23a55a]', 'border', 'border-[#23a55a]/30');
      input.value = '';
      if (window.discordAudio) window.discordAudio.playNotification();
    } catch (err) {
      feedback.textContent = `❌ ${err.message || 'Erro ao enviar pedido de amizade.'}`;
      feedback.classList.add('bg-[#f23f43]/15', 'text-[#f23f43]', 'border', 'border-[#f23f43]/30');
    }
  }

  async handleAcceptFriendRequest(requestId) {
    await window.firebaseService.acceptFriendRequest(requestId);
    this.renderFriendsPending();
    this.renderFriendsList();
    this.renderChannels();
    if (window.discordAudio) window.discordAudio.playJoin();
  }

  async handleDeclineFriendRequest(requestId) {
    await window.firebaseService.declineFriendRequest(requestId);
    this.renderFriendsPending();
  }

  handleRemoveFriend(friendId) {
    window.discordStore.removeFriend(friendId);
    this.renderFriendsList();
    this.renderChannels();
  }

  openDMWithFriend(friendId) {
    window.discordStore.currentServerId = 'home';
    const dmId = `dm-${friendId}`;
    window.discordStore.currentChannelId = dmId;
    this.switchServer('home');
    this.handleChannelClick(dmId, 'text');
  }

  // =========================================================
  // SERVER INVITES MANAGEMENT
  // =========================================================
  async openInviteFriendsModal() {
    const modal = document.getElementById('inviteFriendsModal');
    if (!modal) return;
    const server = window.discordStore.getCurrentServer();
    const title = document.getElementById('inviteModalTitle');
    if (title) title.textContent = `Convidar pessoas para ${server.name}`;

    const linkInput = document.getElementById('serverInviteLinkInput');
    if (linkInput) {
      linkInput.value = `https://discord.gg/${server.id || 'clone'}`;
    }

    this.renderInviteFriendsList();
    modal.classList.remove('hidden');
    modal.classList.add('flex');

    if (window.firebaseService) {
      await window.firebaseService.fetchAllDatabaseUsers();
      this.renderInviteFriendsList();
    }
  }

  closeInviteFriendsModal() {
    const modal = document.getElementById('inviteFriendsModal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  }

  renderInviteFriendsList(filterText = '') {
    const container = document.getElementById('inviteFriendsListContainer');
    if (!container) return;

    let candidates = window.discordStore.getInviteCandidates();
    if (filterText) {
      const q = filterText.toLowerCase();
      candidates = candidates.filter(f => f.username.toLowerCase().includes(q));
    }

    if (candidates.length === 0) {
      container.innerHTML = `
        <div class="py-6 text-center text-xs text-[#949ba4] space-y-1">
          <div class="text-2xl">🔍</div>
          <div class="font-bold text-white">Nenhum usuário encontrado</div>
          <div class="text-[11px]">Quando outros amigos se cadastrarem no seu banco Firebase, eles aparecerão aqui automaticamente!</div>
        </div>
      `;
      return;
    }

    container.innerHTML = candidates.map(f => `
      <div class="flex items-center justify-between p-2 rounded-lg bg-[#2b2d31] hover:bg-[#35373c] transition">
        <div class="flex items-center space-x-2.5 min-w-0">
          <img src="${f.avatar}" class="w-8 h-8 rounded-full object-cover" alt="${f.username}" />
          <div class="min-w-0">
            <div class="flex items-center space-x-1.5">
              <span class="text-xs font-bold text-white truncate">${f.username}</span>
              ${f.isFriend ? '<span class="text-[9px] bg-[#5865f2]/20 text-[#5865f2] px-1 py-0.5 rounded font-semibold">AMIGO</span>' : '<span class="text-[9px] bg-[#23a55a]/20 text-[#23a55a] px-1 py-0.5 rounded font-semibold">BANCO</span>'}
            </div>
            <div class="text-[10px] text-[#949ba4] truncate">#${f.discriminator || '0001'}</div>
          </div>
        </div>
        <button id="btnInvite_${f.id}" onclick="window.discordApp.sendServerInviteToFriend('${f.id}')" class="px-3 py-1 bg-[#23a55a] hover:bg-[#1f9250] text-white text-xs font-bold rounded transition shadow">
          Convidar
        </button>
      </div>
    `).join('');
  }

  filterInviteFriends(val) {
    this.renderInviteFriendsList(val);
  }

  async sendServerInviteToFriend(friendId) {
    const serverId = window.discordStore.currentServerId;
    await window.firebaseService.sendServerInvite(serverId, friendId);

    const btn = document.getElementById(`btnInvite_${friendId}`);
    if (btn) {
      btn.textContent = 'Convidado ✓';
      btn.disabled = true;
      btn.className = 'px-3 py-1 bg-[#35373c] text-[#23a55a] text-xs font-bold rounded cursor-default';
    }

    if (window.discordAudio) window.discordAudio.playNotification();
  }

  renderRegisteredUsersToAdd() {
    const container = document.getElementById('registeredUsersContainer');
    if (!container) return;

    const myId = window.discordStore.user ? window.discordStore.user.id : null;
    const myFriends = window.discordStore.user?.friends || [];
    const users = (window.discordStore.databaseUsers || []).filter(u => u.id !== myId);

    if (users.length === 0) {
      container.innerHTML = `
        <div class="p-4 rounded-xl bg-[#1e1f22] border border-[#232428] text-center text-xs text-[#949ba4]">
          <p>Nenhum outro usuário cadastrado no banco de dados ainda.</p>
          <p class="text-[10px] text-[#80848e] mt-1">Peça para seu amigo se cadastrar para que ele apareça aqui!</p>
        </div>
      `;
      return;
    }

    container.innerHTML = users.map(u => {
      const isFriend = myFriends.includes(u.id);
      return `
        <div class="flex items-center justify-between p-2.5 rounded-xl bg-[#1e1f22] hover:bg-[#2b2d31] border border-[#232428] transition">
          <div class="flex items-center space-x-3 min-w-0">
            <img src="${u.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(u.username)}`}" class="w-9 h-9 rounded-full object-cover" alt="${u.username}" />
            <div class="min-w-0">
              <div class="text-xs font-bold text-white truncate flex items-center space-x-1.5">
                <span>${u.username}</span>
                <span class="text-[10px] text-[#949ba4]">#${u.discriminator || '0001'}</span>
              </div>
              <div class="text-[11px] text-[#949ba4] truncate">${u.customStatus || u.email || 'Usuário do Discord'}</div>
            </div>
          </div>
          <div>
            ${isFriend ? `
              <span class="text-xs text-[#23a55a] font-bold flex items-center space-x-1 px-3 py-1.5 bg-[#23a55a]/10 rounded-lg">
                <span>Amigos</span> <span>✓</span>
              </span>
            ` : `
              <button onclick="window.discordApp.quickAddFriend('${u.username}')" class="px-3 py-1.5 bg-[#5865f2] hover:bg-[#4752c4] text-white text-xs font-bold rounded-lg transition shadow">
                + Adicionar Amigo
              </button>
            `}
          </div>
        </div>
      `;
    }).join('');
  }

  async quickAddFriend(username) {
    const input = document.getElementById('inputAddFriendUsername');
    if (input) input.value = username;
    await this.handleAddFriendSubmit();
    this.renderRegisteredUsersToAdd();
  }

  async refreshDatabaseUsers() {
    if (window.firebaseService) {
      await window.firebaseService.fetchAllDatabaseUsers();
      this.renderRegisteredUsersToAdd();
      this.renderFriendsList();
      if (this.renderInviteFriendsList) this.renderInviteFriendsList();
    }
  }

  copyInviteLink() {
    const input = document.getElementById('serverInviteLinkInput');
    const btn = document.getElementById('btnCopyInviteLink');
    if (input) {
      navigator.clipboard.writeText(input.value);
      if (btn) {
        btn.textContent = 'Copiado!';
        btn.classList.remove('bg-[#5865f2]');
        btn.classList.add('bg-[#23a55a]');
        setTimeout(() => {
          btn.textContent = 'Copiar';
          btn.classList.remove('bg-[#23a55a]');
          btn.classList.add('bg-[#5865f2]');
        }, 2000);
      }
    }
  }

  handleServerInviteReceived(invite) {
    this.renderServers();
    this.renderServerInvites();

    // Mantém o toast flutuante oculto conforme solicitado pelo usuário
    const toast = document.getElementById('serverInviteToast');
    if (toast) {
      toast.classList.add('hidden');
    }

    // Toca som de notificação apenas para convites recebidos ao vivo (não na carga inicial ao recarregar a página)
    if (!invite.isInitial && !invite.isSender && window.discordAudio) {
      window.discordAudio.playNotification();
    }
  }

  async acceptServerInvite(inviteId) {
    const server = window.discordStore.acceptServerInvite(inviteId);
    if (!server) return;

    if (window.firebaseService && window.firebaseService.isConfigured && window.firebaseService.db) {
      try {
        await window.firebaseService.db.collection('server_invites').doc(inviteId).delete();
        // Fallback: se o id foi gerado automaticamente pelo Firestore
        const q = await window.firebaseService.db.collection('server_invites').where('id', '==', inviteId).get();
        q.forEach(doc => doc.ref.delete());
      } catch (e) {
        console.warn('Erro ao deletar convite do Firestore:', e);
      }
    }

    const toast = document.getElementById('serverInviteToast');
    if (toast) toast.classList.add('hidden');
    this.closeServerInvitesModal();

    this.renderServers();
    this.renderServerInvites();
    this.switchServer(server.id);

    if (window.discordAudio) window.discordAudio.playJoin();
  }

  async declineServerInvite(inviteId) {
    window.discordStore.declineServerInvite(inviteId);

    if (window.firebaseService && window.firebaseService.isConfigured && window.firebaseService.db) {
      try {
        await window.firebaseService.db.collection('server_invites').doc(inviteId).delete();
        const q = await window.firebaseService.db.collection('server_invites').where('id', '==', inviteId).get();
        q.forEach(doc => doc.ref.delete());
      } catch (e) {
        console.warn('Erro ao deletar convite do Firestore:', e);
      }
    }

    const toast = document.getElementById('serverInviteToast');
    if (toast) toast.classList.add('hidden');

    this.renderServers();
    this.renderServerInvites();
  }

  renderServerInvites() {
    const invites = window.discordStore.getServerInvites ? window.discordStore.getServerInvites() : [];
    const count = invites.length;

    const homeBadge = document.getElementById('homeNotificationBadge');
    if (homeBadge) {
      if (count > 0) {
        homeBadge.textContent = count;
        homeBadge.classList.remove('hidden');
      } else {
        homeBadge.classList.add('hidden');
      }
    }

    const tabBadge = document.getElementById('tabServerInvitesBadge');
    if (tabBadge) {
      if (count > 0) {
        tabBadge.textContent = count;
        tabBadge.classList.remove('hidden');
      } else {
        tabBadge.classList.add('hidden');
      }
    }

    const inboxBadge = document.getElementById('inboxNotificationBadge');
    if (inboxBadge) {
      if (count > 0) inboxBadge.classList.remove('hidden');
      else inboxBadge.classList.add('hidden');
    }

    const heading = document.getElementById('invitesCountHeading');
    if (heading) {
      heading.textContent = `CONVITES PARA SERVIDORES — ${count}`;
    }

    const renderCard = (inv) => `
      <div class="p-3.5 bg-[#2b2d31] border border-[#232428] rounded-xl flex items-center justify-between hover:bg-[#35373c]/50 transition group">
        <div class="flex items-center space-x-3 min-w-0">
          <div class="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white text-base overflow-hidden flex-shrink-0" style="background-color: ${inv.serverBg || '#5865F2'}">
            ${inv.serverIcon ? `<img src="${inv.serverIcon}" class="w-full h-full object-cover" />` : (inv.serverIconText || 'CD')}
          </div>
          <div class="min-w-0">
            <div class="text-sm font-bold text-white truncate">${inv.serverName || 'Servidor'}</div>
            <div class="text-xs text-[#949ba4] truncate mt-0.5">Convidado por <span class="text-[#dbdee1] font-semibold">${inv.fromUsername || 'Amigo'}</span></div>
          </div>
        </div>
        <div class="flex items-center space-x-2 flex-shrink-0 ml-3">
          <button onclick="window.discordApp.acceptServerInvite('${inv.id}')" class="px-3.5 py-1.5 bg-[#23a55a] hover:bg-[#1f9250] text-white text-xs font-bold rounded-lg transition shadow flex items-center space-x-1">
            <span>Entrar</span>
          </button>
          <button onclick="window.discordApp.declineServerInvite('${inv.id}')" class="px-3 py-1.5 bg-[#1e1f22] hover:bg-[#da373c] hover:text-white text-[#949ba4] text-xs font-semibold rounded-lg transition">
            Recusar
          </button>
        </div>
      </div>
    `;

    const emptyHtml = `
      <div class="p-8 text-center text-[#949ba4] space-y-2">
        <div class="text-3xl mb-1">📬</div>
        <div class="text-sm font-bold text-white">Nenhum convite pendente</div>
        <div class="text-xs max-w-sm mx-auto">Quando alguém te convidar para um servidor, o convite aparecerá aqui e a bolinha vermelha indicará na barra lateral!</div>
      </div>
    `;

    const container = document.getElementById('serverInvitesCardsContainer');
    if (container) {
      container.innerHTML = count === 0 ? emptyHtml : invites.map(renderCard).join('');
    }

    const modalList = document.getElementById('modalServerInvitesList');
    if (modalList) {
      modalList.innerHTML = count === 0 ? emptyHtml : invites.map(renderCard).join('');
    }
  }

  openServerInvitesModal() {
    const modal = document.getElementById('pendingServerInvitesModal');
    if (modal) {
      this.renderServerInvites();
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }
  }

  closeServerInvitesModal() {
    const modal = document.getElementById('pendingServerInvitesModal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  }

  toggleMobileDrawer() {
    const drawer = document.getElementById('mobileSidebarDrawer');
    const backdrop = document.getElementById('mobileDrawerBackdrop');
    if (!drawer) return;
    const isOpen = drawer.classList.contains('translate-x-0');
    if (isOpen) {
      this.closeMobileDrawer();
    } else {
      drawer.classList.remove('-translate-x-full');
      drawer.classList.add('translate-x-0');
      if (backdrop) backdrop.classList.remove('hidden');
    }
  }

  closeMobileDrawer() {
    const drawer = document.getElementById('mobileSidebarDrawer');
    const backdrop = document.getElementById('mobileDrawerBackdrop');
    if (drawer) {
      drawer.classList.remove('translate-x-0');
      drawer.classList.add('-translate-x-full');
    }
    if (backdrop) backdrop.classList.add('hidden');
  }

  toggleMobileMembers() {
    const members = document.getElementById('membersSidebar');
    const backdrop = document.getElementById('mobileMembersBackdrop');
    if (!members) return;
    const isOpen = members.classList.contains('translate-x-0');
    if (isOpen) {
      this.closeMobileMembers();
    } else {
      members.classList.remove('translate-x-full');
      members.classList.add('translate-x-0');
      if (backdrop) backdrop.classList.remove('hidden');
    }
  }

  closeMobileMembers() {
    const members = document.getElementById('membersSidebar');
    const backdrop = document.getElementById('mobileMembersBackdrop');
    if (members) {
      members.classList.remove('translate-x-0');
      members.classList.add('translate-x-full');
    }
    if (backdrop) backdrop.classList.add('hidden');
  }

  // =========================================================
  // FIREBASE CONFIGURATION MODAL
  // =========================================================
  openFirebaseConfigModal() {
    const modal = document.getElementById('firebaseConfigModal');
    if (!modal) return;

    const config = window.firebaseService.getConfig();
    document.getElementById('fbApiKey').value = config.apiKey || '';
    document.getElementById('fbAuthDomain').value = config.authDomain || '';
    document.getElementById('fbProjectId').value = config.projectId || '';
    document.getElementById('fbStorageBucket').value = config.storageBucket || '';
    document.getElementById('fbAppId').value = config.appId || '';

    this.updateFirebaseModalStatus();
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }

  closeFirebaseConfigModal() {
    const modal = document.getElementById('firebaseConfigModal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  }

  updateFirebaseModalStatus() {
    const isConfigured = window.firebaseService.isConfigured;
    const dot = document.getElementById('firebaseStatusDot');
    const text = document.getElementById('firebaseStatusText');

    if (dot && text) {
      if (isConfigured) {
        dot.className = 'w-2.5 h-2.5 rounded-full bg-[#23a55a]';
        text.textContent = '🟢 Conectado ao Firebase Cloud (Firestore & Auth Ativos)';
      } else {
        dot.className = 'w-2.5 h-2.5 rounded-full bg-[#f0b232]';
        text.textContent = '🟡 Modo Demonstração / Fallback Local (Pronto para conectar)';
      }
    }
  }

  updateFirebaseIndicator() {
    const dot = document.getElementById('headerFirebaseDot');
    const text = document.getElementById('headerFirebaseText');
    const isConfigured = window.firebaseService.isConfigured;

    if (dot && text) {
      if (isConfigured) {
        dot.className = 'w-2 h-2 rounded-full bg-[#23a55a] animate-pulse';
        text.textContent = 'Firebase Conectado';
      } else {
        dot.className = 'w-2 h-2 rounded-full bg-[#f0b232]';
        text.textContent = 'Firebase Local';
      }
    }
  }

  saveFirebaseConfig() {
    const newConfig = {
      apiKey: document.getElementById('fbApiKey').value.trim(),
      authDomain: document.getElementById('fbAuthDomain').value.trim(),
      projectId: document.getElementById('fbProjectId').value.trim(),
      storageBucket: document.getElementById('fbStorageBucket').value.trim(),
      messagingSenderId: '123456789012',
      appId: document.getElementById('fbAppId').value.trim()
    };

    window.firebaseService.saveConfig(newConfig);
    this.updateFirebaseModalStatus();
    this.updateFirebaseIndicator();
    alert('Configurações salvas! Se as chaves forem válidas, o Firebase conectará automaticamente.');
    this.closeFirebaseConfigModal();
  }

  resetFirebaseConfig() {
    localStorage.removeItem('discord_firebase_config');
    window.firebaseService.init();
    this.openFirebaseConfigModal();
    this.updateFirebaseIndicator();
    alert('Configurações restauradas para o Modo Local / Demo.');
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.discordApp = new DiscordApp();
});
