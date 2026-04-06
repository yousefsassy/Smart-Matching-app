import { LocationPickerRouteParams, LocationPickerSelectionParams } from './locationPicker';

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
  CreateRequest: LocationPickerSelectionParams | undefined;
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

export const TAB_HIDDEN_ROUTES = new Set(['CreateRequest', 'LocationPicker', 'RequestDetail', 'RateProvider']);
