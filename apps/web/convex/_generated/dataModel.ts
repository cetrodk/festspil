/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Stub file — replaced by Convex codegen when you run `npx convex dev`.
 */
export type Id<T extends string> = string & { __tableName: T };
export type Doc<T extends string> = Record<string, any> & { _id: Id<T> };
