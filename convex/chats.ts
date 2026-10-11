import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx: any) => {
    return await ctx.db
      .query("chats")
      .withIndex("by_updatedAt")
      .order("desc")
      .collect();
  },
});

export const get = query({
  args: { id: v.id("chats") },
  handler: async (ctx: any, args: any) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    model: v.string(),
  },
  handler: async (ctx: any, args: any) => {
    const now = Date.now();
    const chatId = await ctx.db.insert("chats", {
      title: args.title,
      model: args.model,
      createdAt: now,
      updatedAt: now,
    });
    return chatId;
  },
});

export const updateTitle = mutation({
  args: {
    id: v.id("chats"),
    title: v.string(),
  },
  handler: async (ctx: any, args: any) => {
    await ctx.db.patch(args.id, {
      title: args.title,
      updatedAt: Date.now(),
    });
  },
});

export const updateModel = mutation({
  args: {
    id: v.id("chats"),
    model: v.string(),
  },
  handler: async (ctx: any, args: any) => {
    await ctx.db.patch(args.id, {
      model: args.model,
      updatedAt: Date.now(),
    });
  },
});

export const deleteChat = mutation({
  args: { id: v.id("chats") },
  handler: async (ctx: any, args: any) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_chatId", (q: any) => q.eq("chatId", args.id))
      .collect();

    for (const msg of messages) {
      await ctx.db.delete(msg._id);
    }

    await ctx.db.delete(args.id);
  },
});
