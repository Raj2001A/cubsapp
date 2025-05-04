/**
 * UI Types
 * 
 * Type definitions for UI components and contexts
 */

// Toast types
export type ToastType = 'info' | 'success' | 'warning' | 'error';

// Toast message
export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  timestamp: Date;
}

// Error severity levels
export enum ErrorSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

// Error state type
export interface ErrorState {
  hasError: boolean;
  message: string;
  severity: ErrorSeverity;
  operation: OperationType | '';
}

// Initial error state
export const initialErrorState: ErrorState = {
  hasError: false,
  message: '',
  severity: ErrorSeverity.INFO,
  operation: ''
};

// Initial backend health state
export const initialBackendHealthState = {
  isConnected: false,
  isChecking: false,
  lastChecked: 0
} as const;

// Operation types for loading and error states
export enum OperationType {
  GENERAL = 'general',
  AUTH = 'auth',
  EMPLOYEES = 'employees',
  DOCUMENTS = 'documents',
  UPLOAD = 'upload',
  DOWNLOAD = 'download',
  SEARCH = 'search',
  WEBSOCKET = 'websocket',
  BACKEND = 'backend',
  SYSTEM = 'system',
  AUTHENTICATION = 'authentication',
  FETCH_EMPLOYEES = 'fetch_employees',
  ADD_EMPLOYEE = 'add_employee',
  UPDATE_EMPLOYEE = 'update_employee',
  DELETE_EMPLOYEE = 'delete_employee',
  ADD_DOCUMENT = 'add_document',
  UPDATE_DOCUMENT = 'update_document',
  DELETE_DOCUMENT = 'delete_document',
  SEARCH_EMPLOYEES = 'search_employees',
  FILTER_EMPLOYEES = 'filter_employees',
  IMPORT_DATA = 'import_data',
  FETCH_DASHBOARD_DATA = 'fetch_dashboard_data',
  FETCH_DOCUMENTS = 'fetch_documents',
  EXPORT_DATA = 'export_data'
}

// Error message
export interface ErrorMessage {
  id: string;
  title: string;
  message: string;
  severity: ErrorSeverity;
  operationType: OperationType;
  timestamp: Date;
  dismissed: boolean;
}

// Loading state
export type LoadingState = {
  [key in OperationType]?: boolean;
};

// UI Context state
export interface UIContextState {
  loading: LoadingState;
  errors: ErrorMessage[];
  toasts: ToastMessage[];
}

// UI Context actions
export interface UIContextActions {
  setLoading: (operationType: OperationType, isLoading: boolean) => void;
  addError: (
    title: string,
    severity: ErrorSeverity,
    operationType: OperationType,
    message: string
  ) => void;
  dismissError: (id: string) => void;
  clearErrors: (operationType?: OperationType) => void;
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  dismissToast: (id: string) => void;
  clearToasts: () => void;
}

// UI Context
export interface UIContext extends UIContextState, UIContextActions {}

// Theme types
export type ThemeMode = 'light' | 'dark' | 'system';

// Theme context
export interface ThemeContext {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  isDark: boolean;
}

// Modal types
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
}

// Dropdown types
export interface DropdownOption {
  value: string;
  label: string;
  disabled?: boolean;
}

// Form field types
export interface FormFieldProps {
  id: string;
  label: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

// Button variants
export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'info' | 'ghost' | 'link';

// Button sizes
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// Button props
export interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

// Table column definition
export interface TableColumn<T> {
  key: string;
  header: string;
  accessor: (row: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
  className?: string;
}

// Pagination state
export interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

// Pagination props
export interface PaginationProps extends PaginationState {
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
}

// Sort direction
export type SortDirection = 'asc' | 'desc';

// Sort state
export interface SortState {
  column: string;
  direction: SortDirection;
}

// Filter operator
export type FilterOperator = 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'startsWith' | 'endsWith';

// Filter value
export type FilterValue = string | number | boolean | Date | null;

// Filter
export interface Filter {
  field: string;
  operator: FilterOperator;
  value: FilterValue;
}

// Data table state
export interface DataTableState<T> {
  data: T[];
  loading: boolean;
  pagination: PaginationState;
  sort: SortState | null;
  filters: Filter[];
}

// Data table actions
export interface DataTableActions<T> {
  setData: (data: T[]) => void;
  setLoading: (loading: boolean) => void;
  setPagination: (pagination: Partial<PaginationState>) => void;
  setSort: (sort: SortState | null) => void;
  setFilters: (filters: Filter[]) => void;
  addFilter: (filter: Filter) => void;
  removeFilter: (field: string) => void;
  clearFilters: () => void;
}

// Data table context
export interface DataTableContext<T> extends DataTableState<T>, DataTableActions<T> {}
