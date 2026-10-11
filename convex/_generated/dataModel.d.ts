// Fallback stubs for Convex dataModel
import { GenericId } from "convex/values";

export type Doc<TableName extends string> = any;
export type Id<TableName extends string> = GenericId<TableName>;
