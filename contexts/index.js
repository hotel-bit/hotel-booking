"use client";

import { MessagesProvider } from "./MessagesContext";
import { ArticlesProvider } from "./ArticlesContext";
import { CitiesProvider } from "./CitiesContext";

export const AppProviders = ({ children }) => {
  return (
    <MessagesProvider>
      <ArticlesProvider>
        <CitiesProvider>{children}</CitiesProvider>
      </ArticlesProvider>
    </MessagesProvider>
  );
};
