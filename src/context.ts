import { createContext, useContext } from 'react';

export const AuthContext = createContext({
    authToken: '', setAuthToken: (t: string) => { return; }
});

export function useAuth() {
    return useContext(AuthContext);
}