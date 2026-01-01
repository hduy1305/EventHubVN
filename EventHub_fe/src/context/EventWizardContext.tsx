import React, { createContext, useContext, useReducer } from 'react';

export type WizardPrivacy = 'PUBLIC' | 'PRIVATE';

export interface WizardVenue {
  name: string;
  province: string;
  district: string;
  ward: string;
  streetAddress: string;
}

export interface WizardBasicInfo {
  eventCode: string;
  name: string;
  category: string;
  description: string;
  logoUrl: string;
  bannerUrl: string;
  venue: WizardVenue;
}

export interface WizardOrganizerInfo {
  organizerCode: string;
  organizerName: string;
  logoUrl: string;
  description: string;
  termsAgreed: boolean;
  accountStatus: string;
}

export interface WizardShowtime {
  code: string;
  startTime: string;
  endTime: string;
}

export interface WizardTicketType {
  code: string;
  name: string;
  price: number;
  maxQuantity: number;
  saleStart: string;
  saleEnd: string;
  description: string;
}

export interface WizardTicketDetail {
  code: string;
  zoneName: string;
  ticketTypeCode: string;
  checkInTime: string;
}

export interface WizardAllocation {
  showtimeCode: string;
  ticketTypeCode: string;
  quantity: number;
}

export interface WizardSettings {
  customUrl: string;
  privacy: WizardPrivacy;
}

export interface WizardPayoutInfo {
  accountHolderName: string;
  bankNumber: string;
  bankName: string;
}

export interface WizardInvoiceInfo {
  enabled: boolean;
  companyName: string;
  taxCode: string;
  address: string;
}

export interface EventWizardState {
  eventId?: number;
  organizerId?: string;
  status?: string;
  basicInfo: WizardBasicInfo;
  organizerInfo: WizardOrganizerInfo;
  showtimes: WizardShowtime[];
  ticketTypes: WizardTicketType[];
  ticketDetails: WizardTicketDetail[];
  allocations: WizardAllocation[];
  settings: WizardSettings;
  payoutInfo: WizardPayoutInfo;
  invoiceInfo: WizardInvoiceInfo;
}

type WizardAction =
  | { type: 'SET_EVENT_ID'; payload?: number }
  | { type: 'SET_ORGANIZER_ID'; payload?: string }
  | { type: 'SET_STATUS'; payload?: string }
  | { type: 'UPDATE_BASIC_INFO'; payload: Partial<WizardBasicInfo> }
  | { type: 'UPDATE_VENUE'; payload: Partial<WizardVenue> }
  | { type: 'UPDATE_ORGANIZER_INFO'; payload: Partial<WizardOrganizerInfo> }
  | { type: 'SET_SHOWTIMES'; payload: WizardShowtime[] }
  | { type: 'SET_TICKET_TYPES'; payload: WizardTicketType[] }
  | { type: 'SET_TICKET_DETAILS'; payload: WizardTicketDetail[] }
  | { type: 'SET_ALLOCATIONS'; payload: WizardAllocation[] }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<WizardSettings> }
  | { type: 'UPDATE_PAYOUT'; payload: Partial<WizardPayoutInfo> }
  | { type: 'UPDATE_INVOICE'; payload: Partial<WizardInvoiceInfo> };

const initialState: EventWizardState = {
  basicInfo: {
    eventCode: '',
    name: '',
    category: '',
    description: '',
    logoUrl: '',
    bannerUrl: '',
    venue: {
      name: '',
      province: '',
      district: '',
      ward: '',
      streetAddress: '',
    },
  },
  organizerInfo: {
    organizerCode: '',
    organizerName: '',
    logoUrl: '',
    description: '',
    termsAgreed: false,
    accountStatus: 'Verified',
  },
  showtimes: [],
  ticketTypes: [],
  ticketDetails: [],
  allocations: [],
  settings: {
    customUrl: '',
    privacy: 'PUBLIC',
  },
  payoutInfo: {
    accountHolderName: '',
    bankNumber: '',
    bankName: '',
  },
  invoiceInfo: {
    enabled: false,
    companyName: '',
    taxCode: '',
    address: '',
  },
};

const EventWizardContext = createContext<{
  state: EventWizardState;
  dispatch: React.Dispatch<WizardAction>;
} | null>(null);

function wizardReducer(state: EventWizardState, action: WizardAction): EventWizardState {
  switch (action.type) {
    case 'SET_EVENT_ID':
      return { ...state, eventId: action.payload };
    case 'SET_ORGANIZER_ID':
      return { ...state, organizerId: action.payload };
    case 'SET_STATUS':
      return { ...state, status: action.payload };
    case 'UPDATE_BASIC_INFO':
      return { ...state, basicInfo: { ...state.basicInfo, ...action.payload } };
    case 'UPDATE_VENUE':
      return {
        ...state,
        basicInfo: {
          ...state.basicInfo,
          venue: { ...state.basicInfo.venue, ...action.payload },
        },
      };
    case 'UPDATE_ORGANIZER_INFO':
      return { ...state, organizerInfo: { ...state.organizerInfo, ...action.payload } };
    case 'SET_SHOWTIMES':
      return { ...state, showtimes: action.payload };
    case 'SET_TICKET_TYPES':
      return { ...state, ticketTypes: action.payload };
    case 'SET_TICKET_DETAILS':
      return { ...state, ticketDetails: action.payload };
    case 'SET_ALLOCATIONS':
      return { ...state, allocations: action.payload };
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };
    case 'UPDATE_PAYOUT':
      return { ...state, payoutInfo: { ...state.payoutInfo, ...action.payload } };
    case 'UPDATE_INVOICE':
      return { ...state, invoiceInfo: { ...state.invoiceInfo, ...action.payload } };
    default:
      return state;
  }
}

export const EventWizardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(wizardReducer, initialState);
  return (
    <EventWizardContext.Provider value={{ state, dispatch }}>
      {children}
    </EventWizardContext.Provider>
  );
};

export function useEventWizard() {
  const context = useContext(EventWizardContext);
  if (!context) {
    throw new Error('useEventWizard must be used within EventWizardProvider');
  }
  return context;
}
