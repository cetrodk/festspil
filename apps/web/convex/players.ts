import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAvatarColor } from "./lib/colors";

export const joinRoom = mutation({
  args: {
    code: v.string(),
    name: v.string(),
    sessionId: v.string(),
  },
  handler: async (ctx, { code, name, sessionId }) => {
    const trimmedName = name.trim().slice(0, 16);
    if (!trimmedName) {
      throw new Error("Navn er påkrævet");
    }

    const room = await ctx.db
      .query("rooms")
      .withIndex("by_code", (q) => q.eq("code", code.toUpperCase()))
      .first();

    if (!room) {
      throw new Error("Rummet blev ikke fundet");
    }

    if (room.status !== "lobby") {
      throw new Error("Spillet er allerede i gang");
    }

    // Check if this session already has a player in this room
    const existingPlayer = await ctx.db
      .query("players")
      .withIndex("by_session", (q) => q.eq("sessionId", sessionId))
      .first();

    if (existingPlayer && existingPlayer.roomId === room._id) {
      // Reconnecting — update connection status
      await ctx.db.patch(existingPlayer._id, {
        isConnected: true,
        lastSeen: Date.now(),
      });
      return { playerId: existingPlayer._id, code: room.code };
    }

    // Check name uniqueness in room
    const playersInRoom = await ctx.db
      .query("players")
      .withIndex("by_room", (q) => q.eq("roomId", room._id))
      .collect();

    const nameTaken = playersInRoom.some(
      (p) => p.name.toLowerCase() === trimmedName.toLowerCase(),
    );
    if (nameTaken) {
      throw new Error("Navnet er allerede taget");
    }

    const playerIndex = playersInRoom.length;
    const playerId = await ctx.db.insert("players", {
      roomId: room._id,
      name: trimmedName,
      sessionId,
      avatarColor: getAvatarColor(playerIndex),
      score: 0,
      isConnected: true,
      lastSeen: Date.now(),
    });

    return { playerId, code: room.code };
  },
});

export const rejoinRoom = query({
  args: { sessionId: v.string() },
  handler: async (ctx, { sessionId }) => {
    const player = await ctx.db
      .query("players")
      .withIndex("by_session", (q) => q.eq("sessionId", sessionId))
      .first();

    if (!player) return null;

    const room = await ctx.db.get(player.roomId);
    if (!room || room.status === "finished") return null;

    return {
      playerId: player._id,
      roomCode: room.code,
      playerName: player.name,
      roomStatus: room.status,
    };
  },
});

export const getPlayers = query({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, { roomId }) => {
    return ctx.db
      .query("players")
      .withIndex("by_room", (q) => q.eq("roomId", roomId))
      .collect();
  },
});

export const heartbeat = mutation({
  args: { sessionId: v.string() },
  handler: async (ctx, { sessionId }) => {
    const player = await ctx.db
      .query("players")
      .withIndex("by_session", (q) => q.eq("sessionId", sessionId))
      .first();

    if (player) {
      await ctx.db.patch(player._id, {
        isConnected: true,
        lastSeen: Date.now(),
      });
    }
  },
});
