import { LocationPickerRouteParams, LocationPickerSelectionParams } from './locationPicker';
import { ServiceCategory } from '../types/serviceRequest';

export type MainTabParamList = {
  HomeTab: undefined;
  RequestsTab: undefined;
  CalendarTab: undefined;
  ProfileTab: undefined;
};

export type HomeStackParamList = {
  Dashboard: undefined;
  MyRequests: undefined;
  IncomingRequests: undefined;
  CreateRequest: undefined;
  VoiceRequest:
    | {
        autoStart?: boolean;
        source?: 'dashboard-fab' | 'create-request';
      }
    | undefined;
  ManualRequest: { prefill?: ManualRequestPrefillParams } | undefined;
  MatchingResults: { requestId: string };
  LocationPicker: LocationPickerRouteParams;
  RequestDetail: { requestId: string };
  RateProvider: { requestId: string };
};

export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Signup: undefined;
  ClientSignup: undefined;
  ProviderSignup: LocationPickerSelectionParams | undefined;
  LocationPicker: LocationPickerRouteParams;
};

export interface ManualRequestPrefillParams {
  serviceCategory?: ServiceCategory | null;
  description?: string;
  scheduleDateIso?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  source?: 'voice';
}

export const TAB_HIDDEN_ROUTES = new Set([
  'CreateRequest',
  'VoiceRequest',
  'ManualRequest',
  'MatchingResults',
  'LocationPicker',
  'RequestDetail',
  'RateProvider',
]);
