"use client";

import { MessagesProvider } from "./MessagesContext";
import { ArticlesProvider } from "./ArticlesContext";
import { CitiesProvider } from "./CitiesContext";
import { HotelsProvider } from "./HotelsContext";

export const AppProviders = ({ children }) => {
  return (
    <MessagesProvider>
      <ArticlesProvider>
        <CitiesProvider>
          <HotelsProvider>{children}</HotelsProvider>
        </CitiesProvider>
      </ArticlesProvider>
    </MessagesProvider>
  );
};
