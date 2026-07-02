export type AvailabilitySlot = {
  start: string;
  end: string;
} | null;

export type BackendAvailabilityEntry = {
  date: string;
  slot1?: AvailabilitySlot;
  slot2?: AvailabilitySlot;
};

export type AvailabilityState = {
  isAvailable: boolean;
  availability: BackendAvailabilityEntry[];
};

export interface AvailabilityService {
  getMe: () => Promise<AvailabilityState>;
  toggleOnline: (isAvailable: boolean) => Promise<AvailabilityState>;
  syncDay: (payload: {
    date: string;
    slot1?: AvailabilitySlot;
    slot2?: AvailabilitySlot;
  }) => Promise<AvailabilityState>;
  deleteDay: (date: string) => Promise<AvailabilityState>;
}

