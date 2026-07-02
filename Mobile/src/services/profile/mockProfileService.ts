import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../../constants/appConfig';
import { ProfileService } from './profileService';

function getAvatarStorageKey(userId: string) {
  return `${STORAGE_KEYS.avatarPrefix}${userId}`;
}

export const mockProfileService: ProfileService = {
  async getAvatar(userId) {
    return AsyncStorage.getItem(getAvatarStorageKey(userId));
  },

  async saveAvatar(userId, uri) {
    await AsyncStorage.setItem(getAvatarStorageKey(userId), uri);
    return uri;
  },
};
