"use client";

import { MessagesProvider } from "./MessagesContext";
import { ArticlesProvider } from "./ArticlesContext";
import { CitiesProvider } from "./CitiesContext";
import { HotelsProvider } from "./HotelsContext";
import { RoomTypesProvider } from "./RoomTypesContext";
import { ViewsProvider } from "./ViewsContext";
import { ContentProvider } from "./ContentContext";

export const AppProviders = ({ children }) => {
  return (
    <ContentProvider>
      <MessagesProvider>
        <ArticlesProvider>
          <CitiesProvider>
            <RoomTypesProvider>
              <ViewsProvider>
                <HotelsProvider>{children}</HotelsProvider>
              </ViewsProvider>
            </RoomTypesProvider>
          </CitiesProvider>
        </ArticlesProvider>
      </MessagesProvider>
    </ContentProvider>
  );
};
