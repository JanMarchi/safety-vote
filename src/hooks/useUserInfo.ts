import { authService } from '@/services/authService';

const useUserInfo = (userType: 'admin-sistema' | 'rh' | 'eleitor') => {
  return authService.getUserInfo(userType);
};

export default useUserInfo;