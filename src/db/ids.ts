import * as Crypto from "expo-crypto";

export const newId = (): string => Crypto.randomUUID();
export const nowISO = (): string => new Date().toISOString();
