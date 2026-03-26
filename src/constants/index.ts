/**
 * Application Status Constants (Frontend)
 * Must match backend constants
 */
export const APPLICATION_STATUS = {
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED',
} as const;

/**
 * Disbursement Status Constants
 */
export const DISBURSEMENT_STATUS = {
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    PROCESSED: 'PROCESSED',
} as const;

/**
 * TAADA Flag Constants
 */
export const TAADA_FLAG = {
    FIRST_TIME: 'FIRST_TIME',
    ALREADY_FUNDED: 'ALREADY_FUNDED',
    REJECTED_BEFORE: 'REJECTED_BEFORE',
} as const;

/**
 * User Role Constants
 */
export const USER_ROLES = {
    ADMIN: 'ADMIN',
    STUDENT: 'STUDENT',
    COMMITTEE: 'COMMITTEE',
} as const;

/**
 * Bursary Type / Fund Source Constants
 */
export const BURSARY_TYPES = {
    MCA: 'MCA',
    CDF: 'CDF',
    COUNTY: 'COUNTY',
    NATIONAL: 'NATIONAL',
} as const;

export const BURSARY_TYPE_LABELS = {
    MCA: 'Mobilization on Contentious Areas',
    CDF: 'Constituency Development Fund',
    COUNTY: 'County Government Budget',
    NATIONAL: 'National Government Budget',
} as const;

/**
 * Cash Flow Transaction Types
 */
export const CASH_FLOW_TYPES = {
    ALLOCATION: 'ALLOCATION',
    DISBURSEMENT: 'DISBURSEMENT',
    REVERSAL: 'REVERSAL',
} as const;

/**
 * Status Badge Colors
 */
export const STATUS_COLORS: Record<string, string> = {
    [APPLICATION_STATUS.PENDING]: 'yellow',
    [APPLICATION_STATUS.APPROVED]: 'green',
    [APPLICATION_STATUS.REJECTED]: 'red',
    [DISBURSEMENT_STATUS.PENDING]: 'yellow',
    [DISBURSEMENT_STATUS.APPROVED]: 'green',
    [DISBURSEMENT_STATUS.PROCESSED]: 'blue',
} as const;

/**
 * API Error Messages (Frontend)
 */
export const ERROR_MESSAGES = {
    UNAUTHORIZED: 'Unauthorized - please log in',
    INVALID_TOKEN: 'Session expired - please log in again',
    FORBIDDEN: 'Access denied - insufficient permissions',
    NOT_FOUND: 'Resource not found',
    EMAIL_EXISTS: 'Email already registered',
    INVALID_CREDENTIALS: 'Invalid email or password',
    PASSWORD_MIN_LENGTH: 'Password must be at least 8 characters',
    MISSING_REQUIRED_FIELDS: 'Please fill in all required fields',
    SERVER_ERROR: 'Server error - please try again later',
    NETWORK_ERROR: 'Network error - please check your connection',
} as const;

/**
 * API Base Configuration
 */
export const API_CONFIG = {
    BASE_URL: 'http://localhost:5000/api',
    TIMEOUT: 30000, // 30 seconds
    TOKEN_KEY: 'cfg_token',
    USER_KEY: 'cfg_user',
} as const;
