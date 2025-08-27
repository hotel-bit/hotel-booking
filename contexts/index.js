"use client";

import { MessagesProvider } from "./MessagesContext";

export const AppProviders = ({ children }) => {
  return <MessagesProvider>{children}</MessagesProvider>;
};
