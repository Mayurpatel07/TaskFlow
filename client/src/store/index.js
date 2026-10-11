import { configureStore, createSlice } from "@reduxjs/toolkit";
const saved = () => {
  try {
    return JSON.parse(
      localStorage.getItem("tf-user") ||
        sessionStorage.getItem("tf-user") ||
        "null",
    );
  } catch {
    return null;
  }
};
const auth = createSlice({
  name: "auth",
  initialState: { user: saved() },
  reducers: {
    signedIn: (s, a) => {
      s.user = a.payload.user;
      const storage = a.payload.remember ? localStorage : sessionStorage;
      localStorage.removeItem("tf-token");
      localStorage.removeItem("tf-user");
      sessionStorage.removeItem("tf-token");
      sessionStorage.removeItem("tf-user");
      storage.setItem("tf-token", a.payload.token);
      storage.setItem("tf-user", JSON.stringify(a.payload.user));
    },
    signedOut: (s) => {
      s.user = null;
      for (const storage of [localStorage, sessionStorage]) {
        storage.removeItem("tf-user");
        storage.removeItem("tf-token");
      }
    },
  },
});
export const { signedIn, signedOut } = auth.actions;
export const store = configureStore({ reducer: { auth: auth.reducer } });
