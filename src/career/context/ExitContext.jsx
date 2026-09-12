import React, { createContext, useContext } from 'react';

const ExitContext = createContext({ onExit: () => {}, currentUser: null });

export function ExitProvider({ onExit, currentUser, children }) {
  return (
    <ExitContext.Provider value={{ onExit: onExit || (() => {}), currentUser: currentUser || null }}>
      {children}
    </ExitContext.Provider>
  );
}

export function useExit() {
  return useContext(ExitContext).onExit;
}

export function useCurrentUser() {
  return useContext(ExitContext).currentUser;
}
