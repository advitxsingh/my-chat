import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: { chatId: v.string() },
  handler: async (ctx: any, args: any) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_chatId", (q: any) => q.eq("chatId", args.chatId))
      .order("asc")
      .collect();
  },
});

export const send = mutation({
  args: {
    chatId: v.string(),
    role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
    content: v.string(),
  },
  handler: async (ctx: any, args: any) => {
    const now = Date.now();
    const messageId = await ctx.db.insert("messages", {
      chatId: args.chatId,
      role: args.role,
      content: args.content,
      createdAt: now,
    });

    try {
      await ctx.db.patch(args.chatId, {
        updatedAt: now,
      });
    } catch {
      // Ignored
    }

    return messageId;
  },
});

export const clear = mutation({
  args: { chatId: v.string() },
  handler: async (ctx: any, args: any) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_chatId", (q: any) => q.eq("chatId", args.chatId))
      .collect();

    for (const msg of messages) {
      await ctx.db.delete(msg._id);
    }
  },
});
