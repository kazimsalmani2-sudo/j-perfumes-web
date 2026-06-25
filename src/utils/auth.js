import { getAuth, signOut } from "firebase/auth";

export const handleLogout = async (navigate) => {
  const auth = getAuth();
  try {
    await signOut(auth);
    // Clear local storage
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    sessionStorage.clear();
    // Redirect to home or login
    navigate("/");
  } catch (error) {
    console.error("Logout error:", error);
  }
};
