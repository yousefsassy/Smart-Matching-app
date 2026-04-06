import { NormalizedLocation } from '../types/location';

export type LocationPickerMode = 'provider' | 'request';
export type LocationPickerReturnScreen = 'ProviderSignup' | 'CreateRequest';

export interface LocationPickerRouteParams {
  mode: LocationPickerMode;
  returnScreen: LocationPickerReturnScreen;
  selectionKey: string;
  title?: string;
  initialLocation?: NormalizedLocation | null;
}

export interface LocationPickerSelectionParams {
  selectedLocation?: NormalizedLocation;
  selectedLocationNonce?: string;
}
