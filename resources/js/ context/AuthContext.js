import React, { createContext, useContext } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ authData, children }) => (
    <AuthContext.Provider value={authData}>{children}</AuthContext.Provider>
);

export const useAuth = () => useContext(AuthContext);
