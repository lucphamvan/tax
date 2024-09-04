"use client";
import { Theme } from "@radix-ui/themes";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
const queryClient = new QueryClient();

interface ProviderProps {
  children: React.ReactNode;
}

const Provider = ({ children }: ProviderProps) => {
  return (
    <QueryClientProvider client={queryClient}>
      <Theme
        accentColor="grass"
        grayColor="gray"
        panelBackground="solid"
        scaling="100%"
        radius="small"
      >
        {children}
      </Theme>
    </QueryClientProvider>
  );
};
export default Provider;
