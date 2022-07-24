import * as React from 'react';

export interface Me {
    username: string;
    admin: boolean;
}

export interface AuthenticationContextValue {
    refresh: () => Promise<void>;
    signIn: (accessToken: string) => void;
    signOut: (redirect: boolean) => void;
    me?: Me;
}

export interface AuthenticatedContextValue extends AuthenticationContextValue {
    me: Me;
}

const AuthenticatedContextDefaultValue = {
    me: {
        username: "user",
        admin: true
    }
} as AuthenticatedContextValue;
export const AuthenticatedContext = React.createContext(
    AuthenticatedContextDefaultValue
);