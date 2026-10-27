import { useAuthContext } from "./AuthProvider";

export const useAuth = () => {
  return useAuthContext();
};

export default useAuth;
