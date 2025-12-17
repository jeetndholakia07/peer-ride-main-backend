import Chat from "../models/Chat.js";
import Message from "../models/Message.js";
import jwt from "jsonwebtoken";
import cookie from "cookie";

const onlineUsers = new Map();

const socketHandler = (io) => {
  io.use((socket, next) => {
    try {
      //Get cookie header
      const cookieHeader = socket.handshake.headers.cookie;
      if (!cookieHeader) throw new Error("No cookies sent");

      //Parse cookies
      const cookies = cookie.parse(cookieHeader);
      const token = cookies['access_token'];
      if (!token) throw new Error("Missing token cookie");

      const payload = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = payload.id;

      console.log(`[AUTH] Socket authenticated: userId=${payload.id}`);
      next();
    } catch (err) {
      console.error("[AUTH ERROR]", err.message);
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.userId;
    console.log(`[CONNECTED] userId=${userId}, socketId=${socket.id}`);

    if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
    onlineUsers.get(userId).add(socket.id);
    socket.join(userId);

    socket.on("joinRoom", async ({ roomId }) => {
      console.log(`[JOIN ROOM] userId=${userId} joining roomId=${roomId}`);
      socket.join(roomId);

      const socketsInRoom = await io.in(roomId).fetchSockets();
      const userIds = socketsInRoom.map((s) => s.userId);
      console.log(`Users currently in room ${roomId}:`, userIds);
      // ---- Notify everyone in the room that this user joined ----
      socket.to(roomId).emit("roomJoined", { userId: userId });
      // ---- Send the online status of all users already in the room to this user ----
      const existingUsers = new Set();
      socketsInRoom.forEach((s) => {
        if (s.userId !== userId && !existingUsers.has(s.userId)) {
          existingUsers.add(s.userId);
          socket.emit("onlineStatus", { userId: s.userId, isOnline: true });
        }
      });

      // ---- Also broadcast that this user is online to everyone in the room ----
      socket.to(roomId).emit("onlineStatus", { userId: userId, isOnline: true });
    });

    socket.on("sendMessage", async ({ roomId, content, tempId }) => {
      console.log(`[SEND MESSAGE] from userId=${userId} to roomId=${roomId}`);
      console.log(`content="${content}", tempId=${tempId}`);

      const chat = await Chat.findOne({ roomId });
      if (!chat) {
        console.warn(`Chat not found for roomId=${roomId}`);
        return socket.emit("error", "Chat not found");
      }

      const message = {
        tempId,
        content,
        senderId: userId,
        isRead: false,
        createdAt: new Date(),
      };

      let msgDoc = await Message.findOne({ chat: chat._id });
      if (!msgDoc) {
        msgDoc = await Message.create({ chat: chat._id, messages: [message] });
      } else {
        msgDoc.messages.push(message);
        await msgDoc.save();
      }

      const savedMessage = msgDoc.messages[msgDoc.messages.length - 1];
      io.to(roomId).emit("newMessage", { roomId, message: savedMessage, tempId });

      console.log(`[MESSAGE STORED] chatId=${chat._id}, messageId=${savedMessage._id}`);
    });

    socket.on("typing", ({ roomId, isTyping }) => {
      socket.to(roomId).emit("typingStatus", {
        senderId: socket.userId,
        isTyping
      });
    });

    // ---- MARK AS READ ----
    socket.on("markAsRead", async ({ roomId }) => {
      try {
        const userId = socket.userId;
        const chat = await Chat.findOne({ roomId });
        if (!chat) return;

        const messageDoc = await Message.findOne({ chat: chat._id });
        if (!messageDoc) return;

        let updated = false;
        messageDoc.messages.forEach((msg) => {
          if (msg.senderId.toString() !== userId.toString() && !msg.isRead) {
            msg.isRead = true;
            updated = true;
          }
        });

        if (updated) {
          await messageDoc.save();

          // Notify both users: the one in the room AND the sender personally
          io.to(roomId).emit("messagesRead", { userId });

          // Notify sender even if they’re not currently in the room
          const senderId =
            chat.sender.toString() === userId.toString()
              ? chat.receiver.toString()
              : chat.sender.toString();

          io.to(senderId).emit("messagesRead", { userId });
        }
      } catch (err) {
        console.error("Error marking messages as read:", err);
      }
    });

    socket.on("getOnlineStatuses", () => {
      try {
        const statuses = {};
        onlineUsers.forEach((socketsSet, userId) => {
          statuses[userId] = socketsSet.size > 0;
        });

        socket.emit("onlineStatuses", statuses);
      } catch (err) {
        console.error("Error fetching online statuses:", err);
        socket.emit("error", "Failed to get online statuses");
      }
    });

    socket.on("leaveRoom", ({ roomId }) => {
      socket.leave(roomId);
      console.log(`User ${socket.userId} left room ${roomId}`);
      socket.to(roomId).emit("roomLeft", { userId: socket.userId });
    });

    // ---- UPDATE ONLINE STATUS (manual toggle) ----
    socket.on("updateOnlineStatus", async ({ userId: targetUserId, isOnline }) => {
      try {
        // Ensure the userId matches the authenticated socket
        if (targetUserId && targetUserId !== socket.userId) {
          return socket.emit("error", "Invalid userId for online status update");
        }

        const currentUserId = socket.userId;

        if (isOnline) {
          if (!onlineUsers.has(currentUserId)) onlineUsers.set(currentUserId, new Set());
          onlineUsers.get(currentUserId).add(socket.id);

          // Broadcast online to all relevant rooms
          await broadcastOnlineStatus(io, currentUserId, true);
        } else {
          const sockets = onlineUsers.get(currentUserId);
          if (sockets) {
            sockets.delete(socket.id);
            if (sockets.size === 0) {
              onlineUsers.delete(currentUserId);
              await broadcastOnlineStatus(io, currentUserId, false);
            }
          }
        }
      } catch (err) {
        console.error("Error updating online status:", err);
        socket.emit("error", "Failed to update online status");
      }
    });

    socket.on("disconnect", async () => {
      const sockets = onlineUsers.get(userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          onlineUsers.delete(userId);
          await broadcastOnlineStatus(io, userId, false);
        }
      }
      console.log(`[DISCONNECT] userId=${userId}, socketId=${socket.id}`);
    });
  });

  // ---- BROADCAST ONLINE STATUS ----
  async function broadcastOnlineStatus(io, userId, isOnline) {
    try {
      // Emit to all chats involving this user
      const chats = await Chat.find({
        $or: [{ sender: userId }, { receiver: userId }],
      });

      chats.forEach((chat) => {
        io.to(chat.roomId).emit("onlineStatus", { userId, isOnline });
      });

      // Also emit to the user's personal room
      io.to(userId).emit("onlineStatus", { userId, isOnline });

    } catch (err) {
      console.error("Error broadcasting online status:", err);
    }
  }
};

export default socketHandler;
