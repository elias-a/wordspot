import { createContext, useContext } from 'react';

export const AuthContext = createContext({
    authTokens: '', setAuthTokens: (t: string) => { return; }
});

export function useAuth() {
    return useContext(AuthContext);
}