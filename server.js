const express = require('express');
const http = require('http');
const path = require('path');
const { WebSocketServer, WebSocket } = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT || 3000;

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// In-memory server state for real-time synchronization between tabs/devices
const activeUsers = new Map();
const activeStreams = new Map();

// REST endpoints for health and status
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'Discord Clone',
    timestamp: new Date().toISOString(),
    connectedUsers: activeUsers.size,
    activeStreams: activeStreams.size
  });
});

// WebSocket real-time communication & WebRTC signaling
wss.on('connection', (ws, req) => {
  const clientId = 'user_' + Math.random().toString(36).substring(2, 9);
  
  ws.clientId = clientId;
  activeUsers.set(clientId, {
    id: clientId,
    username: 'Usuário ' + clientId.substring(5),
    voiceChannel: null,
    isStreaming: false,
    isMuted: false,
    isDeafened: false
  });

  // Notify new connection with active voice participants and streams
  const voiceParticipantsList = [];
  activeUsers.forEach((u, cId) => {
    if (u.voiceChannel) {
      voiceParticipantsList.push({
        clientId: cId,
        channelId: u.voiceChannel,
        user: {
          id: u.userId || cId,
          username: u.username,
          avatar: u.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(u.username)}`,
          isStreaming: u.isStreaming || false,
          isMuted: u.isMuted || false
        }
      });
    }
  });

  ws.send(JSON.stringify({
    type: 'init',
    clientId: clientId,
    activeUsers: Array.from(activeUsers.values()),
    activeStreams: Array.from(activeStreams.values()),
    voiceParticipants: voiceParticipantsList
  }));

  // Broadcast user count update
  broadcast({
    type: 'user_count',
    count: activeUsers.size
  }, ws);

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      
      switch (data.type) {
        case 'chat_message':
          // Broadcast chat message to all clients
          broadcast({
            type: 'chat_message',
            message: data.message,
            channelId: data.channelId,
            senderId: clientId
          });
          break;

        case 'reaction_add':
          broadcast({
            type: 'reaction_add',
            messageId: data.messageId,
            emoji: data.emoji,
            userId: data.userId || clientId
          }, ws);
          break;

        case 'voice_join':
          if (activeUsers.has(clientId)) {
            const u = activeUsers.get(clientId);
            u.voiceChannel = data.channelId;
            if (data.user) {
              u.username = data.user.username;
              u.avatar = data.user.avatar;
              u.userId = data.user.id;
            }
          }
          broadcast({
            type: 'voice_update',
            userId: clientId,
            channelId: data.channelId,
            user: data.user
          });
          break;

        case 'voice_leave':
          const oldChan = activeUsers.has(clientId) ? activeUsers.get(clientId).voiceChannel : data.channelId;
          if (activeUsers.has(clientId)) {
            activeUsers.get(clientId).voiceChannel = null;
            activeUsers.get(clientId).isStreaming = false;
          }
          activeStreams.delete(clientId);
          broadcast({
            type: 'voice_leave',
            userId: clientId,
            channelId: oldChan,
            user: data.user
          });
          broadcast({
            type: 'stream_stopped',
            userId: clientId
          });
          break;

        case 'stream_started':
          activeStreams.set(clientId, {
            streamId: clientId,
            channelId: data.channelId,
            title: data.title || 'Transmissão ao Vivo',
            quality: data.quality || '1080p 60fps',
            user: data.user
          });
          if (activeUsers.has(clientId)) {
            activeUsers.get(clientId).isStreaming = true;
          }
          broadcast({
            type: 'stream_started',
            stream: activeStreams.get(clientId)
          });
          break;

        case 'stream_stopped':
          activeStreams.delete(clientId);
          if (activeUsers.has(clientId)) {
            activeUsers.get(clientId).isStreaming = false;
          }
          broadcast({
            type: 'stream_stopped',
            userId: clientId
          });
          break;

        // WebRTC Signaling for remote screen view & voice P2P between peers
        case 'webrtc_offer':
        case 'webrtc_answer':
        case 'webrtc_ice_candidate':
        case 'webrtc_request_watch':
        case 'webrtc_voice_offer':
        case 'webrtc_voice_answer':
        case 'webrtc_voice_ice_candidate':
          wss.clients.forEach(client => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              if (!data.targetId || client.clientId === data.targetId) {
                client.send(JSON.stringify({
                  ...data,
                  fromId: clientId
                }));
              }
            }
          });
          break;

        case 'server_created':
        case 'server_invite_sent':
        case 'server_member_joined':
          broadcast(data, ws);
          break;

        case 'speaking_state':
          broadcast({
            type: 'speaking_state',
            userId: clientId,
            speaking: data.speaking
          }, ws);
          break;

        default:
          broadcast(data, ws);
      }
    } catch (err) {
      console.error('Error handling WebSocket message:', err);
    }
  });

  ws.on('close', () => {
    const userObj = activeUsers.get(clientId);
    const lastVoiceChannel = userObj ? userObj.voiceChannel : null;
    activeUsers.delete(clientId);
    activeStreams.delete(clientId);
    if (lastVoiceChannel) {
      broadcast({
        type: 'voice_leave',
        channelId: lastVoiceChannel,
        userId: clientId,
        user: userObj ? { id: userObj.userId || clientId, username: userObj.username } : null
      });
    }
    broadcast({
      type: 'user_disconnect',
      userId: clientId,
      count: activeUsers.size
    });
  });

  ws.on('error', (err) => {
    console.error(`WebSocket error on client ${clientId}:`, err.message);
  });
});

function broadcast(data, excludeWs = null) {
  const payload = JSON.stringify(data);
  wss.clients.forEach(client => {
    if (client !== excludeWs && client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}

// Start server
server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🎮 Discord Clone Server rodando na porta ${PORT}`);
  console.log(`🌐 Acesse no seu navegador: http://localhost:${PORT}`);
  console.log(`📺 Go Live (Compartilhamento de Tela) disponível!`);
  console.log(`====================================================`);
});
