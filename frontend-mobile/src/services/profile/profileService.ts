export interface ProfileService {
  getAvatar: (userId: string) => Promise<string | null>;
  saveAvatar: (userId: string, uri: string) => Promise<void>;
}
