// =========================================================
// FIREBASE CONFIGURATION & CLOUD DATABASE SERVICE
// =========================================================

/**
 * CONFIGURAÇÃO DO FIREBASE:
 * Substitua as chaves abaixo pelas chaves do seu projeto no Firebase Console:
 * 1. Acesse https://console.firebase.google.com
 * 2. Crie ou selecione seu projeto
 * 3. Vá em "Configurações do Projeto" > "Geral" > "Seus aplicativos" > "</>" (Web)
 * 4. Copie o objeto firebaseConfig e cole aqui abaixo, ou use o modal no aplicativo!
 */
window.DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyA5bGCCYQNUxKcFGrW-ZtiHXFoByJ8Q6og",
  authDomain: "musica-8695e.firebaseapp.com",
  projectId: "musica-8695e",
  storageBucket: "musica-8695e.firebasestorage.app",
  messagingSenderId: "1097906266177",
  appId: "1:1097906266177:web:62dc55ebf64843637d26c0",
  measurementId: "G-YJTS699EPC"
};

class FirebaseService {
  constructor() {
    this.app = null;
    this.auth = null;
    this.db = null;
    this.isConfigured = false;
    this.currentUser = null;
    this.listeners = new Map();

    this.init();
  }

  // Load config directly from configured credentials
  getConfig() {
    return window.DEFAULT_FIREBASE_CONFIG;
  }

  saveConfig(newConfig) {
    try {
      localStorage.setItem('discord_firebase_config', JSON.stringify(newConfig));
      this.init();
      return true;
    } catch (e) {
      console.error('Erro ao salvar config do Firebase:', e);
      return false;
    }
  }

  init() {
    const config = this.getConfig();

    // Check if configuration is real (not default placeholder)
    if (config.apiKey && !config.apiKey.includes('COLE_SUA_API_KEY')) {
      try {
        if (typeof firebase !== 'undefined') {
          if (!firebase.apps.length) {
            this.app = firebase.initializeApp(config);
          } else {
            this.app = firebase.app();
          }
          this.auth = firebase.auth();
          this.db = firebase.firestore();
          this.isConfigured = true;

          // Carrega todos os usuários e servidores do banco em background
          this.fetchAllDatabaseUsers();
          this.fetchAllServers();

          // Listen to auth changes
          this.auth.onAuthStateChanged(async (user) => {
            this.currentUser = user;
            if (user) {
              try {
                const userDoc = await this.db.collection('users').doc(user.uid).get();
                if (userDoc.exists) {
                  const profile = userDoc.data();
                  window.discordStore.user = profile;
                  window.discordStore.save('discord_user', profile);
                }
              } catch (e) {}

              this.attachFirestoreListeners(user);
              await this.fetchAllServers();
            }
            window.dispatchEvent(new CustomEvent('discord_firebase_auth_state', { detail: { user } }));
          });

          console.log('🔥 Firebase inicializado com sucesso e conectado ao Firestore!');
        } else {
          console.warn('SDK do Firebase não carregado via CDN.');
        }
      } catch (err) {
        console.warn('Erro ao inicializar Firebase (usando modo fallback local):', err.message);
        this.isConfigured = false;
      }
    } else {
      console.log('ℹ️ Firebase em modo Demonstração / Local. Configure suas chaves para sincronização na nuvem.');
      this.isConfigured = false;
    }
  }

  async fetchAllDatabaseUsers() {
    if (this.isConfigured && this.db) {
      try {
        const snapshot = await this.db.collection('users').get();
        const users = [];
        snapshot.forEach(doc => {
          users.push({ id: doc.id, ...doc.data() });
        });
        window.discordStore.syncDatabaseUsers(users);
        if (window.discordApp) {
          window.discordApp.renderFriendsList();
          if (window.discordApp.renderInviteFriendsList) {
            window.discordApp.renderInviteFriendsList();
          }
          if (window.discordApp.renderRegisteredUsersToAdd) {
            window.discordApp.renderRegisteredUsersToAdd();
          }
        }
        return users;
      } catch (e) {
        console.warn('Erro ao buscar usuários do Firestore:', e);
      }
    }
    return [];
  }

  attachFirestoreListeners(user) {
    if (!this.db || !user) return;

    // 1. Escuta em tempo real todos os usuários cadastrados no banco Firestore
    try {
      this.db.collection('users').onSnapshot(snapshot => {
        const dbUsers = [];
        snapshot.forEach(doc => {
          dbUsers.push({ id: doc.id, ...doc.data() });
        });
        window.discordStore.syncDatabaseUsers(dbUsers);
        if (window.discordApp) {
          window.discordApp.renderFriendsList();
          if (window.discordApp.renderInviteFriendsList) {
            window.discordApp.renderInviteFriendsList();
          }
          if (window.discordApp.renderRegisteredUsersToAdd) {
            window.discordApp.renderRegisteredUsersToAdd();
          }
        }
      });
    } catch (e) {
      console.warn('Erro ao escutar usuários:', e);
    }

    // 2. Escuta alterações no meu perfil (como novos amigos adicionados na nuvem)
    try {
      this.db.collection('users').doc(user.uid).onSnapshot(doc => {
        if (doc && doc.exists) {
          const data = doc.data();
          if (data && data.friends) {
            window.discordStore.user.friends = data.friends;
            window.discordStore.save('discord_user', window.discordStore.user);
            if (window.discordApp) {
              window.discordApp.renderFriendsList();
              window.discordApp.renderChannels();
            }
          }
        }
      });
    } catch (e) {}

    // 3. Escuta pedidos de amizade endereçados a mim (por ID único ou por username)
    try {
      this.db.collection('friend_requests')
        .onSnapshot(snapshot => {
          const myId = user.uid;
          const myName = (window.discordStore.user?.username || '').toLowerCase();

          snapshot.docChanges().forEach(change => {
            if (change.type === 'added') {
              const req = { id: change.doc.id, ...change.doc.data() };
              const isForMe = (req.toUserId && req.toUserId === myId) ||
                              (req.toUsername && req.toUsername.toLowerCase() === myName) ||
                              (req.toUsername_lower && req.toUsername_lower === myName);

              if (isForMe && req.fromId !== myId) {
                const storedRequests = JSON.parse(localStorage.getItem('discord_friend_requests') || '[]');
                if (!storedRequests.some(r => r.id === req.id)) {
                  storedRequests.push(req);
                  localStorage.setItem('discord_friend_requests', JSON.stringify(storedRequests));
                  window.dispatchEvent(new CustomEvent('discord_friend_request_received', { detail: req }));
                }
              }
            }
          });
        });
    } catch (e) {}

    // 4. Escuta convites para servidores endereçados a mim
    try {
      let isInitialSnapshot = true;
      this.db.collection('server_invites')
        .onSnapshot(snapshot => {
          const myId = user.uid;
          const myName = (window.discordStore.user?.username || '').toLowerCase();
          snapshot.docChanges().forEach(change => {
            if (change.type === 'added') {
              const data = change.doc.data();
              const inv = {
                ...data,
                id: data.id || change.doc.id,
                firestoreDocId: change.doc.id
              };
              const isForMe = inv.targetUserId === myId ||
                              (inv.targetUserId && inv.targetUserId.toLowerCase() === myName) ||
                              inv.targetUserId === 'all';
              if (isForMe && inv.fromId !== myId) {
                if (window.discordStore && window.discordStore.addServerInvite) {
                  window.discordStore.addServerInvite(inv);
                }
                window.dispatchEvent(new CustomEvent('discord_server_invite_received', {
                  detail: { ...inv, isInitial: isInitialSnapshot }
                }));
              }
            }
          });
          isInitialSnapshot = false;
        });
    } catch (e) {}

    // 5. Escuta em tempo real os servidores salvos no Firestore
    try {
      this.db.collection('servers').onSnapshot(snapshot => {
        snapshot.docChanges().forEach(change => {
          const srv = { id: change.doc.id, ...change.doc.data() };
          if (change.type === 'added' || change.type === 'modified') {
            if (window.discordStore && window.discordStore.upsertServerFromCloud) {
              window.discordStore.upsertServerFromCloud(srv);
            }
          } else if (change.type === 'removed') {
            if (window.discordStore && window.discordStore.removeServerFromCloud) {
              window.discordStore.removeServerFromCloud(change.doc.id);
            }
          }
        });
      }, err => {
        console.warn('Erro ao escutar servidores em tempo real:', err);
      });
    } catch (e) {
      console.warn('Erro ao registrar listener de servidores:', e);
    }
  }

  // =========================================================
  // AUTHENTICATION: LOGIN, REGISTER & LOGOUT
  // =========================================================

  async register(username, email, password) {
    if (!username || !password) {
      throw new Error('Nome de usuário e senha são obrigatórios.');
    }

    const cleanUsername = username.trim();
    const cleanEmail = email && email.includes('@') ? email.trim() : `${cleanUsername.toLowerCase().replace(/[^a-z0-9]/g, '')}@discordapp.com`;
    const cleanPassword = password.trim();

    // 1. Firebase Cloud Mode
    if (this.isConfigured && this.auth && this.db) {
      try {
        // Regra solicitada: os 2 primeiros usuários cadastrados são administradores/donos;
        // todos os usuários cadastrados a partir do 3º são membros normais.
        let isOwnerAdmin = false;
        try {
          const existingSnapshot = await this.db.collection('users').get();
          isOwnerAdmin = (existingSnapshot.size < 2);
        } catch (errCheck) {
          console.warn('Erro ao verificar contagem de usuários no banco:', errCheck);
        }

        const userCredential = await this.auth.createUserWithEmailAndPassword(cleanEmail, cleanPassword);
        const fbUser = userCredential.user;

        // Profile metadata
        const userProfile = {
          id: fbUser.uid,
          username: cleanUsername,
          username_lower: cleanUsername.toLowerCase(),
          discriminator: Math.floor(1000 + Math.random() * 9000).toString(),
          email: cleanEmail,
          avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanUsername)}`,
          status: 'online',
          customStatus: 'Olá! Estou usando o Discord Clone',
          bannerColor: '#5865F2',
          decoration: 'cyberpunk',
          friends: [],
          roles: isOwnerAdmin ? ['role-admin'] : ['role-everyone'],
          role: isOwnerAdmin ? 'Admin' : 'Membro',
          badges: isOwnerAdmin ? ['👑 Dono', '🚀 Impulsionador', '💻 Desenvolvedor Ativo'] : ['Membro'],
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        // Save in Firestore 'users' collection
        await this.db.collection('users').doc(fbUser.uid).set(userProfile);

        // Update local store
        window.discordStore.user = userProfile;
        window.discordStore.save('discord_user', userProfile);

        return userProfile;
      } catch (err) {
        console.error('Erro no registro Firebase:', err);
        let msg = err.message;
        if (err.code === 'auth/email-already-in-use') {
          msg = 'Este nome de usuário ou e-mail já está em uso. Faça login!';
        } else if (err.code === 'auth/weak-password') {
          msg = 'A senha precisa ter pelo menos 6 caracteres.';
        } else if (err.code === 'auth/invalid-email') {
          msg = 'Formato de e-mail inválido.';
        }
        throw new Error(msg);
      }
    }

    // 2. Local Fallback Mode (Works offline / without Firebase)
    const localAccounts = JSON.parse(localStorage.getItem('discord_local_accounts') || '{}');
    const isOwnerAdmin = Object.keys(localAccounts).length < 2;

    const localUser = {
      id: 'user_' + Math.random().toString(36).substring(2, 9),
      username: cleanUsername,
      discriminator: Math.floor(1000 + Math.random() * 9000).toString(),
      email: cleanEmail,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanUsername)}`,
      status: 'online',
      customStatus: 'Olá! Estou usando o Discord Clone',
      bannerColor: '#5865F2',
      decoration: 'cyberpunk',
      friends: [],
      roles: isOwnerAdmin ? ['role-admin'] : ['role-everyone'],
      role: isOwnerAdmin ? 'Admin' : 'Membro',
      badges: isOwnerAdmin ? ['👑 Dono', '🚀 Impulsionador'] : ['Membro']
    };

    // Save in local storage accounts catalog
    localAccounts[cleanUsername.toLowerCase()] = {
      user: localUser,
      password: cleanPassword
    };
    localStorage.setItem('discord_local_accounts', JSON.stringify(localAccounts));

    window.discordStore.user = localUser;
    window.discordStore.save('discord_user', localUser);
    return localUser;
  }

  async login(identifier, password) {
    if (!identifier || !password) {
      throw new Error('Informe o usuário/e-mail e a senha.');
    }

    const cleanId = identifier.trim();
    const cleanPassword = password.trim();

    // 1. Firebase Cloud Mode
    if (this.isConfigured && this.auth && this.db) {
      try {
        let emailToLogin = cleanId;

        // If identifier is not an email, lookup email by username in Firestore
        if (!cleanId.includes('@')) {
          let snapshot = await this.db.collection('users')
            .where('username_lower', '==', cleanId.toLowerCase())
            .limit(1)
            .get();

          if (snapshot.empty) {
            snapshot = await this.db.collection('users')
              .where('username', '==', cleanId)
              .limit(1)
              .get();
          }

          if (!snapshot.empty) {
            emailToLogin = snapshot.docs[0].data().email;
          } else {
            emailToLogin = `${cleanId.toLowerCase().replace(/[^a-z0-9]/g, '')}@discordapp.com`;
          }
        }

        const userCredential = await this.auth.signInWithEmailAndPassword(emailToLogin, cleanPassword);
        const fbUser = userCredential.user;

        // Fetch user profile from Firestore
        const doc = await this.db.collection('users').doc(fbUser.uid).get();
        let userProfile = doc.exists ? doc.data() : null;

        if (!userProfile) {
          userProfile = {
            id: fbUser.uid,
            username: cleanId.replace(/@.*$/, ''),
            discriminator: '0001',
            email: emailToLogin,
            avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&h=120&q=80',
            status: 'online',
            friends: []
          };
          await this.db.collection('users').doc(fbUser.uid).set(userProfile);
        }

        window.discordStore.user = userProfile;
        window.discordStore.save('discord_user', userProfile);

        return userProfile;
      } catch (err) {
        console.error('Erro de login no Firebase:', err);
        let msg = err.message;
        if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
          msg = 'Usuário ou senha incorretos. Se ainda não possui conta, clique em "Registre-se".';
        }
        throw new Error(msg);
      }
    }

    // 2. Local Fallback Mode
    const localAccounts = JSON.parse(localStorage.getItem('discord_local_accounts') || '{}');
    const acc = localAccounts[cleanId.toLowerCase()] || localAccounts[cleanId.toLowerCase().replace(/@.*$/, '')];

    if (acc) {
      if (acc.password !== cleanPassword) {
        throw new Error('Senha incorreta. Tente novamente.');
      }
      window.discordStore.user = acc.user;
      window.discordStore.save('discord_user', acc.user);
      return acc.user;
    }

    // Allow default login for demo testing
    const defaultUser = {
      id: 'me',
      username: cleanId.replace(/@.*$/, '') || 'DevMaster',
      discriminator: '1337',
      email: cleanId.includes('@') ? cleanId : `${cleanId}@discord.local`,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&h=120&q=80',
      status: 'online',
      customStatus: 'Construindo o Discord Clone 🚀',
      bannerColor: '#5865F2',
      decoration: 'cyberpunk',
      friends: ['user-admin', 'user-streamer']
    };

    window.discordStore.user = defaultUser;
    window.discordStore.save('discord_user', defaultUser);
    return defaultUser;
  }

  async logout() {
    if (this.isConfigured && this.auth) {
      try {
        await this.auth.signOut();
      } catch (e) {}
    }
    localStorage.removeItem('discord_logged_in');
    window.location.reload();
  }

  // =========================================================
  // FRIENDS SYSTEM (ADD, ACCEPT, DECLINE, REMOVE, LIST)
  // =========================================================

  async sendFriendRequest(targetUsername) {
    if (!targetUsername) throw new Error('Digite o nome do usuário para adicionar.');
    const myUser = window.discordStore.user;

    const cleanTarget = targetUsername.trim();
    if (cleanTarget.toLowerCase() === (myUser.username || '').toLowerCase() || cleanTarget === myUser.id) {
      throw new Error('Você não pode adicionar a si mesmo como amigo!');
    }

    let targetUserId = null;
    let targetExactName = cleanTarget;
    let targetAvatar = null;

    // Search in Firestore if available
    if (this.isConfigured && this.db) {
      try {
        let snapshot = await this.db.collection('users')
          .where('username_lower', '==', cleanTarget.toLowerCase())
          .limit(1)
          .get();

        if (snapshot.empty) {
          snapshot = await this.db.collection('users')
            .where('username', '==', cleanTarget)
            .limit(1)
            .get();
        }

        if (snapshot.empty && cleanTarget.length > 10) {
          const docDirect = await this.db.collection('users').doc(cleanTarget).get();
          if (docDirect.exists) {
            targetUserId = docDirect.id;
            targetExactName = docDirect.data().username || cleanTarget;
            targetAvatar = docDirect.data().avatar;
          }
        } else if (!snapshot.empty) {
          const doc = snapshot.docs[0];
          targetUserId = doc.id;
          targetExactName = doc.data().username || cleanTarget;
          targetAvatar = doc.data().avatar;
        }
      } catch (e) {
        console.warn('Erro ao buscar usuário no Firestore:', e);
      }
    }

    // Also check cached store users
    if (!targetUserId && window.discordStore.databaseUsers) {
      const found = window.discordStore.databaseUsers.find(u => 
        (u.username && u.username.toLowerCase() === cleanTarget.toLowerCase()) || u.id === cleanTarget
      );
      if (found) {
        targetUserId = found.id;
        targetExactName = found.username;
        targetAvatar = found.avatar;
      }
    }

    const request = {
      id: 'req_' + Date.now(),
      fromId: myUser.id,
      fromUsername: myUser.username,
      fromDiscriminator: myUser.discriminator || '1337',
      fromAvatar: myUser.avatar,
      toUserId: targetUserId,
      toUsername: targetExactName,
      toUsername_lower: targetExactName.toLowerCase(),
      status: 'pending',
      timestamp: new Date().toISOString()
    };

    // Firebase Firestore mode
    if (this.isConfigured && this.db) {
      try {
        await this.db.collection('friend_requests').add(request);
      } catch (e) {
        console.warn('Erro ao salvar no Firestore:', e);
      }
    }

    // Realtime sync via WebSocket and Local
    window.discordStore.sendWs({
      type: 'friend_request_sent',
      request
    });

    // Save in local friend requests
    const storedRequests = JSON.parse(localStorage.getItem('discord_friend_requests') || '[]');
    storedRequests.push(request);
    localStorage.setItem('discord_friend_requests', JSON.stringify(storedRequests));

    return request;
  }

  async acceptFriendRequest(requestId) {
    const storedRequests = JSON.parse(localStorage.getItem('discord_friend_requests') || '[]');
    const reqIndex = storedRequests.findIndex(r => r.id === requestId);
    if (reqIndex >= 0) {
      const req = storedRequests[reqIndex];
      storedRequests.splice(reqIndex, 1);
      localStorage.setItem('discord_friend_requests', JSON.stringify(storedRequests));

      // Add to friends
      if (!window.discordStore.user.friends) window.discordStore.user.friends = [];
      if (!window.discordStore.user.friends.includes(req.fromId)) {
        window.discordStore.user.friends.push(req.fromId);
        window.discordStore.save('discord_user', window.discordStore.user);
      }

      if (this.isConfigured && this.db) {
        try {
          await this.db.collection('friend_requests').doc(requestId).delete();
          // Update BOTH users in Firestore so friendship is mutual
          await this.db.collection('users').doc(window.discordStore.user.id).update({
            friends: firebase.firestore.FieldValue.arrayUnion(req.fromId)
          });
          await this.db.collection('users').doc(req.fromId).update({
            friends: firebase.firestore.FieldValue.arrayUnion(window.discordStore.user.id)
          });
        } catch (e) {
          console.warn('Erro ao atualizar amizade no Firestore:', e);
        }
      }

      window.discordStore.sendWs({
        type: 'friend_request_accepted',
        fromId: req.fromId,
        toId: window.discordStore.user.id
      });

      return true;
    }
    return false;
  }

  async declineFriendRequest(requestId) {
    const storedRequests = JSON.parse(localStorage.getItem('discord_friend_requests') || '[]');
    const filtered = storedRequests.filter(r => r.id !== requestId);
    localStorage.setItem('discord_friend_requests', JSON.stringify(filtered));

    if (this.isConfigured && this.db) {
      try {
        await this.db.collection('friend_requests').doc(requestId).delete();
      } catch (e) {}
    }
    return true;
  }

  // =========================================================
  // SERVER INVITES & NOTIFICATIONS
  // =========================================================

  async sendServerInvite(serverId, targetFriendId) {
    const server = window.discordStore.servers.find(s => s.id === serverId);
    if (!server) return false;
    const myUser = window.discordStore.user;

    const invite = {
      id: 'inv_' + Date.now(),
      serverId: server.id,
      serverName: server.name,
      serverIcon: server.iconImg || '',
      serverIconText: server.iconText || (server.name ? server.name.substring(0, 2).toUpperCase() : 'CD'),
      serverBg: server.iconBg || '#5865F2',
      serverData: JSON.parse(JSON.stringify(server)),
      fromId: myUser.id,
      fromUsername: myUser.username,
      fromAvatar: myUser.avatar,
      targetUserId: targetFriendId,
      timestamp: new Date().toISOString()
    };

    if (this.isConfigured && this.db) {
      try {
        await this.db.collection('server_invites').doc(invite.id).set(invite);
      } catch (e) {
        console.warn('Erro ao salvar convite no Firestore:', e);
      }
    }

    // Broadcast invite via WebSocket
    window.discordStore.sendWs({
      type: 'server_invite_sent',
      invite
    });

    // Local dispatch for sender feedback
    return true;
  }

  // =========================================================
  // DIRECT MESSAGES (DMs) IN CLOUD FIRESTORE
  // =========================================================

  async sendDirectMessage(dmId, text, attachment = null) {
    const myUser = window.discordStore.user;
    const message = {
      id: 'dm_msg_' + Date.now(),
      dmId: dmId,
      userId: myUser.id,
      username: myUser.username,
      userAvatar: myUser.avatar,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      content: text,
      attachment: attachment
    };

    if (this.isConfigured && this.db) {
      try {
        await this.db.collection('direct_messages').doc(dmId).collection('messages').add({
          ...message,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      } catch (e) {
        console.warn('Erro ao salvar DM no Firestore:', e);
      }
    }

    // Save in store messages
    if (!window.discordStore.messages[dmId]) {
      window.discordStore.messages[dmId] = [];
    }
    window.discordStore.messages[dmId].push(message);
    window.discordStore.save('discord_messages', window.discordStore.messages);

    // Broadcast DM
    window.discordStore.sendWs({
      type: 'new_dm_message',
      dmId,
      message
    });

    window.dispatchEvent(new CustomEvent('discord_message_received', { detail: { channelId: dmId, message } }));
    return message;
  }

  // =========================================================
  // SERVERS (CLOUD FIRESTORE PERSISTENCE & REALTIME SYNC)
  // =========================================================

  async saveServer(server) {
    if (!server || !server.id) return false;
    if (this.isConfigured && this.db) {
      try {
        const payload = JSON.parse(JSON.stringify(server));
        payload.memberIds = (server.members || []).map(m => m.id);
        payload.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
        await this.db.collection('servers').doc(server.id).set(payload, { merge: true });
        console.log(`☁️ Servidor "${server.name}" (${server.id}) salvo no Firestore com sucesso!`);
        return true;
      } catch (e) {
        console.warn('Erro ao salvar servidor no Firestore:', e);
      }
    }
    return false;
  }

  async deleteServer(serverId) {
    if (!serverId) return false;
    if (this.isConfigured && this.db) {
      try {
        await this.db.collection('servers').doc(serverId).delete();
        console.log(`☁️ Servidor ${serverId} excluído do Firestore!`);
        return true;
      } catch (e) {
        console.warn('Erro ao excluir servidor do Firestore:', e);
      }
    }
    return false;
  }

  async fetchAllServers() {
    if (this.isConfigured && this.db) {
      try {
        const snapshot = await this.db.collection('servers').get();
        snapshot.forEach(doc => {
          const srv = { id: doc.id, ...doc.data() };
          if (window.discordStore && window.discordStore.upsertServerFromCloud) {
            window.discordStore.upsertServerFromCloud(srv);
          }
        });
        if (window.discordStore && window.discordStore.syncLocalServersToCloud) {
          window.discordStore.syncLocalServersToCloud();
        }
      } catch (e) {
        console.warn('Erro ao carregar servidores do Firestore:', e);
      }
    }
  }

  // =========================================================
  // CHANNEL MESSAGES IN CLOUD FIRESTORE
  // =========================================================

  async sendChannelMessage(serverId, channelId, message) {
    if (!channelId || !message) return;
    if (this.isConfigured && this.db) {
      try {
        await this.db.collection('channel_messages').doc(channelId).collection('messages').doc(message.id).set({
          ...message,
          serverId: serverId,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      } catch (e) {
        console.warn('Erro ao salvar mensagem do canal no Firestore:', e);
      }
    }
  }

  async fetchChannelMessages(channelId) {
    if (!channelId) return [];
    if (this.isConfigured && this.db) {
      try {
        const snapshot = await this.db.collection('channel_messages').doc(channelId).collection('messages').get();
        const msgs = [];
        snapshot.forEach(doc => {
          msgs.push({ id: doc.id, ...doc.data() });
        });
        return msgs;
      } catch (e) {
        console.warn('Erro ao carregar mensagens do canal do Firestore:', e);
      }
    }
    return [];
  }
}

window.firebaseService = new FirebaseService();
