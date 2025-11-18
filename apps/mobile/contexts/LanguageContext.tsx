import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Locale = 'es' | 'en';

const STORAGE_KEY = 'app_locale';

const TRANSLATIONS: Record<Locale, {
  settings: string;
  account: string;
  notifications: string;
  language: string;
  appearance: string;
  spanish: string;
  english: string;
  profileTitle: string;
  // Profile / User info
  profileLoading: string;
  profileLoadError: string;
  back: string;
  retry: string;
  changePasswordTitle: string;
  changePasswordSubtitle: string;
  changePasswordModalTitle: string;
  changePasswordModalBody: string;
  currentPasswordPlaceholder: string;
  newPasswordPlaceholder: string;
  confirmNewPasswordPlaceholder: string;
  passwordRequirementsTitle: string;
  passwordReqLength: string;
  passwordReqUppercase: string;
  passwordReqNumber: string;
  passwordReqNoSpecial: string;
  passwordsMatch: string;
  passwordsDoNotMatch: string;
  cancel: string;
  change: string;
  deleteAccountTitle: string;
  deleteAccountSubtitle: string;
  deleteAccountConfirmTitle: string;
  deleteAccountConfirmBody: string;
  deleteAccountSecondTitle: string;
  deleteAccountSecondBody: string;
  deleteAccountConfirmPlaceholder: string;
  deleteAccountButton: string;
  continue: string;
  nameFieldPlaceholder: string;
  statsLoading: string;
  statsRetry: string;
  statsTitle: string;
  statsReportsCreated: string;
  statsReportsFollowed: string;
  statsVotesReceived: string;
  statsVotesMade: string;
  editEmailTitle: string;
  editEmailLabel: string;
  editEmailPlaceholder: string;
  saving: string;
  save: string;
  editPhoneTitle: string;
  editPhoneLabel: string;
  editPhoneHint: string;
  editPhonePlaceholder: string;
  editNameTitle: string;
  firstNameLabel: string;
  lastNameLabel: string;
  // Auth / Welcome
  welcomeTitle: string;
  welcomeRegister: string;
  welcomeLogin: string;
  loginTitle: string;
  loginHello: string;
  loginUserLabel: string;
  loginPasswordLabel: string;
  loginForgotPassword: string;
  loginSubmitting: string;
  loginSuccess: string;
  loginErrorClose: string;
  loginEmptyFieldsError: string;
  loginErrorPrefix: string;
  loginErrorFallback: string;
  // Auth Service messages
  authServiceInvalidCredentials: string;
  authServiceConnectionError: string;
  authServiceCodeExpired: string;
  authServiceCodeSent: string;
  authServiceCodeVerified: string;
  authServicePasswordUpdated: string;
  authServiceSendCodeError: string;
  registerTitle: string;
  registerHello: string;
  registerRutLabel: string;
  registerUsernameLabel: string;
  registerEmailLabel: string;
  registerPasswordLabel: string;
  registerRepeatPasswordLabel: string;
  registerPhoneLabel: string;
  registerPhonePrefix: string;
  registerHaveAccount: string;
  registerSubmitting: string;
  registerSuccess: string;
  registerErrorPrefix: string;
  registerUsernameRequired: string;
  registerPhoneInvalid: string;
  recoverTitle: string;
  recoverHeaderQuestion: string;
  recoverSelectMethod: string;
  recoverMethodRut: string;
  recoverMethodEmail: string;
  recoverButtonSending: string;
  recoverButton: string;
  recoverSendingCodeTitle: string;
  recoverSendingCodeBody: string;
  recoverCodeSentTitle: string;
  recoverErrorTitle: string;
  recoverModalUnderstand: string;
  recoverFieldRequired: string;
  recoverConnectionError: string;
  verifyTitle: string;
  verifyHeaderTitle: string;
  verifyCodeSentTo: string;
  verifyCodePlaceholder: string;
  verifyCodeHint: string;
  verifyButtonVerifying: string;
  verifyButton: string;
  verifyResendQuestion: string;
  verifyResendLink: string;
  verifyModalVerifyingTitle: string;
  verifyModalVerifyingBody: string;
  verifyModalSuccessTitle: string;
  verifyModalErrorTitle: string;
  verifyModalRetry: string;
  resetTitle: string;
  resetHeaderAlmost: string;
  resetInfoTitle: string;
  resetInfoBody: string;
  resetNewPasswordLabel: string;
  resetConfirmPasswordLabel: string;
  resetButtonUpdating: string;
  resetButton: string;
  resetModalUpdatingTitle: string;
  resetModalUpdatingBody: string;
  resetModalSuccessTitle: string;
  resetModalRedirectHint: string;
  resetModalErrorTitle: string;
  resetModalRetry: string;
  emailPlaceholder: string;
  emailErrorDefault: string;
  rutPlaceholder: string;
  rutErrorDefault: string;
  // Not Found / Errors
  notFoundTitle: string;
  notFoundMessage: string;
  notFoundGoHome: string;
  // Loading
  loading: string;
  redirecting: string;
  // User Profile
  userProfileTitle: string;
  userProfileOf: string;
  // GPS Permission Modal
  gpsPermissionTitle: string;
  gpsPermissionDescription: string;
  gpsLocateReports: string;
  gpsLocateReportsDesc: string;
  gpsAutoRegister: string;
  gpsAutoRegisterDesc: string;
  gpsShowNearby: string;
  gpsShowNearbyDesc: string;
  gpsPrivacyNote: string;
  gpsAllowAccess: string;
  gpsNotNow: string;
  // Project Card
  projectUntitled: string;
  projectUnknownStatus: string;
  projectPriorityNormal: string;
  projectViewDetails: string;
  projectOriginReport: string;
  // Sound Notifications
  soundNotificationTitle: string;
  soundEnabled: string;
  soundDisabled: string;
  soundTestTitle: string;
  soundSuccess: string;
  soundError: string;
  soundWarning: string;
  soundInfo: string;
  soundNotification: string;
  soundPlay: string;
  // System Metrics
  systemMetricsTitle: string;
  metricsUsers: string;
  metricsReports: string;
  metricsUptime: string;
  // Location Errors
  locationPermissionDenied: string;
  locationPermissionDeniedByUser: string;
  // Analytics Screen
  analyticsTitle: string;
  analyticsReportTrend: string;
  analyticsReportsByDay: string;
  analyticsVsLastWeek: string;
  analyticsTotalThisWeek: string;
  analyticsPeakMax: string;
  analyticsMainMetrics: string;
  analyticsTrends: string;
  analyticsActiveUsers: string;
  analyticsUsersLast24h: string;
  analyticsNewReports: string;
  analyticsReportsThisWeek: string;
  analyticsEngagementRate: string;
  analyticsAvgEngagement: string;
  analyticsByCategory: string;
  analyticsCategoryInfra: string;
  analyticsCategorySecurity: string;
  analyticsCategoryMaintenance: string;
  analyticsCategoryOther: string;
  analyticsReportsLabel: string;
  // Days of week (short)
  dayMon: string;
  dayTue: string;
  dayWed: string;
  dayThu: string;
  dayFri: string;
  daySat: string;
  daySun: string;
  // Reset Password Screen
  resetPasswordTitle: string;
  resetPasswordAlmostThere: string;
  resetPasswordInstruction: string;
  resetPasswordRequirements: string;
  resetPasswordNewLabel: string;
  resetPasswordConfirmLabel: string;
  resetPasswordReqLength: string;
  resetPasswordReqUppercase: string;
  resetPasswordReqNumber: string;
  resetPasswordReqNoSpecial: string;
  resetPasswordMatch: string;
  resetPasswordNoMatch: string;
  resetPasswordButton: string;
  resetPasswordUpdating: string;
  resetPasswordModalUpdating: string;
  resetPasswordModalUpdatingBody: string;
  resetPasswordModalSuccess: string;
  resetPasswordModalError: string;
  resetPasswordModalRedirecting: string;
  resetPasswordModalRetry: string;
  resetPasswordErrorEmpty: string;
  resetPasswordErrorRequirements: string;
  resetPasswordErrorNoMatch: string;
  resetPasswordErrorNoToken: string;
  // Verify Reset Code Screen
  verifyCodeTitle: string;
  verifyCodeEnterCode: string;
  verifyCodeInstruction: string;
  verifyCodeButton: string;
  verifyCodeVerifying: string;
  verifyCodeNoReceived: string;
  verifyCodeResend: string;
  verifyCodeModalVerifying: string;
  verifyCodeModalVerifyingBody: string;
  verifyCodeModalSuccess: string;
  verifyCodeModalError: string;
  verifyCodeModalRetry: string;
  verifyCodeErrorInvalid: string;
  // Comments Modal
  commentsTitle: string;
  commentsLoading: string;
  commentsEmpty: string;
  commentsPlaceholder: string;
  commentsYouLabel: string;
  commentsDeleteTitle: string;
  commentsDeleteMessage: string;
  commentsDeleteCancel: string;
  commentsDeleteConfirm: string;
  commentsCharCount: string;
  commentsErrorLogin: string;
  commentsErrorLoadLogin: string;
  commentsErrorLoad: string;
  commentsErrorTooLong: string;
  commentsErrorPublishLogin: string;
  commentsErrorPublish: string;
  commentsErrorDeleteLogin: string;
  commentsErrorDelete: string;
  commentsSuccessPublished: string;
  commentsSuccessDeleted: string;
  // Home - Empty States
  emptyFollowedTitle: string;
  emptyFollowedMessage: string;
  emptyFollowedButton: string;
  // Home - Followed Reports Placeholder
  followedPlaceholderTitle: string;
  followedPlaceholderMessage: string;
  followedPlaceholderButton: string;
  followedPlaceholderTip: string;
  // Home - Followed Report Card
  followedCardUnfollowTitle: string;
  followedCardUnfollowMessage: string;
  followedCardUnfollowCancel: string;
  followedCardUnfollowConfirm: string;
  followedCardUnfollowError: string;
  followedCardUrgencyLow: string;
  followedCardUrgencyMedium: string;
  followedCardUrgencyHigh: string;
  followedCardUrgencyCritical: string;
  followedCardUrgencyUnknown: string;
  followedCardStatusNew: string;
  followedCardStatusInProgress: string;
  followedCardStatusResolved: string;
  followedCardStatusRejected: string;
  followedCardToday: string;
  followedCardYesterday: string;
  followedCardDaysAgo: string;
  followedCardWeeksAgo: string;
  // Home - Category Filter
  categoryFilterAll: string;
  categoryInfrastructure: string;
  categorySignage: string;
  categoryLighting: string;
  categoryCleaning: string;
  categoryGreenAreas: string;
  categoryPublicServices: string;
  // Home - Admin Content
  adminSystemStatus: string;
  adminUserManagement: string;
  adminNewRegistrationsToday: string;
  adminNewUsers: string;
  adminActiveUsers: string;
  adminActiveUsersLast24h: string;
  adminStable: string;
  adminControlPanel: string;
  adminManageUsers: string;
  adminAnalytics: string;
  adminCreateNotification: string;
  // Home - Admin Drawer Menu
  adminDrawerMenuTitle: string;
  adminDrawerMenuProfileTap: string;
  adminDrawerMenuHome: string;
  adminDrawerMenuMap: string;
  adminDrawerMenuSettings: string;
  adminDrawerMenuLogout: string;
  // List Report
  listReportTitle: string;
  listReportSearchPlaceholder: string;
  listReportSearching: string;
  listReportResult: string;
  listReportResults: string;
  listReportFilters: string;
  listReportClearFilters: string;
  listReportStatus: string;
  listReportUrgency: string;
  listReportSort: string;
  listReportAllStatuses: string;
  listReportAllUrgencies: string;
  listReportSortBy: string;
  listReportSortByUrgency: string;
  listReportSortByRecent: string;
  listReportSortByStatus: string;
  listReportReportsCount: string;
  listReportLoading: string;
  listReportNoResults: string;
  listReportClearFiltersButton: string;
  listReportLoadMore: string;
  listReportFilterByStatus: string;
  listReportUrgencyLevel: string;
  listReportCategory: string;
  listReportType: string;
  listReportAllTypes: string;
  listReportTypeOfComplaint: string;
  listReportSortByOldest: string;
  listReportSortByVotes: string;
  listReportPage: string;
  listReportOf: string;
  listReportPrevious: string;
  listReportNext: string;
  listReportRetry: string;
  // Map
  mapFiltersTitle: string;
  mapCategoriesTitle: string;
  mapZoomToSee: string;
  mapCategoryLabel: string;
  mapLocationLabel: string;
  mapCategoryNotAvailable: string;
  // Pin Details Modal
  pinDetailsTitle: string;
  pinDetailsCategory: string;
  pinDetailsDescription: string;
  pinDetailsBasicInfo: string;
  pinDetailsDate: string;
  pinDetailsTime: string;
  pinDetailsUrgency: string;
  pinDetailsLocation: string;
  pinDetailsLatitude: string;
  pinDetailsLongitude: string;
  pinDetailsAddress: string;
  pinDetailsEvidence: string;
  pinDetailsLoading: string;
  pinDetailsNoDetails: string;
  pinDetailsLoadingImage: string;
  pinDetailsImageNotAvailable: string;
  pinDetailsDateNotAvailable: string;
  pinDetailsTimeNotAvailable: string;
  // Home - Client Content
  homeLoadingReports: string;
  homeNoReportsAvailable: string;
  homeSwipeToRefresh: string;
  homeErrorLoadMore: string;
  homeAllReportsViewed: string;
  homeLoadingMore: string;
  homeLoadMoreButton: string;
  homeErrorLoadReports: string;
  homeErrorConnection: string;
  homeLocationTitle: string;
  homeLocationAddress: string;
  // Home - Auth Content
  homeCriticalReportsTitle: string;
  homeNoCriticalReports: string;
  // Notifications - Create Screen
  notifyCreateTitle: string;
  notifyCreateSubtitle: string;
  notifyInfoTitle: string;
  notifyInfoBody: string;
  notifyUserIdLabel: string;
  notifyUserIdPlaceholder: string;
  notifyUserIdHint: string;
  notifyTitleLabel: string;
  notifyTitlePlaceholder: string;
  notifyTitleCharCount: string;
  notifyMessageLabel: string;
  notifyMessagePlaceholder: string;
  notifyTypeLabel: string;
  notifyTypeInfo: string;
  notifyTypeSuccess: string;
  notifyTypeWarning: string;
  notifyTypeError: string;
  notifyReportIdLabel: string;
  notifyReportIdPlaceholder: string;
  notifyReportIdHint: string;
  notifyButtonCancel: string;
  notifyButtonCreate: string;
  notifyErrorUserRequired: string;
  notifyErrorTitleRequired: string;
  notifyErrorMessageRequired: string;
  notifySuccessTitle: string;
  notifySuccessMessage: string;
  notifySuccessCreateAnother: string;
  notifySuccessGoBack: string;
  notifyErrorTitle: string;
  notifyErrorDefault: string;
  // Notifications - List Screen
  notifyListTitle: string;
  notifyListLoading: string;
  notifyListUnreadCount: string;
  notifyListEmpty: string;
  // Profile - Edit Modals
  profileEditNameError: string;
  profileEditNameErrorBody: string;
  profileEditEmailErrorEmpty: string;
  profileEditEmailErrorInvalid: string;
  profileEditPhoneErrorEmpty: string;
  profileEditPhoneErrorInvalid: string;
  // Profile - Delete Account
  profileDeleteErrorConfirm: string;
  profileDeleteSuccessTitle: string;
  profileDeleteErrorTitle: string;
  profileDeleteErrorConnection: string;
  // Profile - Change Password
  profilePasswordErrorAllFields: string;
  profilePasswordErrorMismatch: string;
  profilePasswordErrorRequirements: string;
  profilePasswordSuccessTitle: string;
  profilePasswordErrorTitle: string;
  profilePasswordErrorConnection: string;
  // Profile - Public Profile
  profileQRCodeLabel: string;
  profilePhoneLabel: string;
  profileSettingsAccessibility: string;
  // Posts - Report Card
  postsFollowToast: string;
  postsUnfollowToast: string;
  postsFollowing: string;
  postsFollow: string;
  postsShare: string;
  postsImageError: string;
  postsNoImage: string;
  // Home - Followed Report Card
  homeCardUrgencyLow: string;
  homeCardUrgencyMedium: string;
  homeCardUrgencyHigh: string;
  homeCardUrgencyCritical: string;
  homeCardUrgencyUnknown: string;
  homeCardStatusNew: string;
  homeCardStatusInProgress: string;
  homeCardStatusResolved: string;
  homeCardStatusRejected: string;
  homeCardDateToday: string;
  homeCardDateYesterday: string;
  homeCardDateDaysAgo: string;
  homeCardDateWeeksAgo: string;
  homeCardUnfollowTitle: string;
  homeCardUnfollowMessage: string;
  homeCardUnfollowCancel: string;
  homeCardUnfollowConfirm: string;
  homeCardUnfollowError: string;
  homeCardUnfollowErrorMessage: string;
  homeCardCategoryLabel: string;
  // Report - Form
  reportFormTitlePlaceholder: string;
  reportFormDescriptionPlaceholder: string;
  reportFormMediaTitle: string;
  reportFormLocationTitle: string;
  reportFormConfigTitle: string;
  reportFormPublicToggleLabel: string;
  reportFormTypePlaceholder: string;
  reportFormType1: string;
  reportFormType2: string;
  reportFormType3: string;
  reportFormType6: string;
  reportFormType7: string;
  reportFormCityPlaceholder: string;
  reportFormSelectCity: string;
  reportFormSelectLocation: string;
  reportFormAddressPlaceholder: string;
  reportFormPublicLabel: string;
  reportFormPublicDescription: string;
  reportFormPrivateDescription: string;
  reportFormMapTitle: string;
  // Report - Create Screen
  reportCreateErrorAuth: string;
  reportCreateSuccessTitle: string;
  reportCreateSuccessMessage: string;
  reportCreateDiscardTitle: string;
  reportCreateDiscardMessage: string;
  reportCreateDiscardCancel: string;
  reportCreateDiscardConfirm: string;
  reportCreateSubmittingTitle: string;
  reportCreateSubmittingMessage: string;
  reportCreateSubmittingContinue: string;
  reportCreateSubmittingCancel: string;
  reportCreatePreviewTitle: string;
  reportCreateProcessing: string;
  reportCreateScreenTitle: string;
  reportCreateInfoTitle: string;
  reportCreateInfoConfidential: string;
  reportCreateInfoReviewTime: string;
  reportCreateInfoNotifications: string;
  reportCreateInfoEmergencies: string;
  reportCreateEditModeTitle: string;
  reportCreateEditModeMessage: string;
  reportCreateEditModeUnderstand: string;
  // Report - Camera/Media
  reportMediaPermissionsTitle: string;
  reportMediaPermissionsMessage: string;
  reportMediaLimitImages: string;
  reportMediaLimitVideo: string;
  reportMediaErrorPhoto: string;
  reportMediaErrorImage: string;
  reportMediaErrorVideo: string;
  reportMediaAddImage: string;
  reportMediaAddVideo: string;
  reportMediaTakePhoto: string;
  reportMediaSelectGallery: string;
  reportMediaRecordVideo: string;
  // Report - Validation
  reportValidationTitle: string;
  reportValidationDescription: string;
  reportValidationAddress: string;
  reportValidationType: string;
  reportValidationUrgency: string;
  reportValidationCity: string;
  reportValidationLocation: string;
  reportValidationFormError: string;
  reportValidationFilesError: string;
  reportValidationNetworkError: string;
  reportValidationUnexpectedError: string;
  // Report - Details
  reportDetailsNotFound: string;
  reportDetailsError: string;
  // Report - Preview
  reportPreviewTitle: string;
  reportPreviewType: string;
  reportPreviewUrgency: string;
  reportPreviewCity: string;
  reportPreviewPublic: string;
  reportPreviewPrivate: string;
  reportPreviewLocation: string;
  reportPreviewNoAddress: string;
  reportPreviewImages: string;
  reportPreviewVideo: string;
  reportPreviewVideoAttached: string;
  reportPreviewSending: string;
  reportPreviewEdit: string;
  reportPreviewConfirmSend: string;
  reportPreviewConfirmTitle: string;
  reportPreviewConfirmMessage: string;
  reportPreviewConfirmReview: string;
  reportPreviewConfirmButton: string;
  reportPreviewCloseTitle: string;
  reportPreviewCloseMessage: string;
  reportPreviewCloseContinue: string;
  reportPreviewCloseCancel: string;
  reportPreviewEditDisabledTitle: string;
  reportPreviewEditDisabledMessage: string;
  reportPreviewNotSelected: string;
  // Report - Followed screen
  reportFollowedLoading: string;
  reportFollowedTitle: string;
  reportFollowedEmptyTitle: string;
  reportFollowedEmptySubtitle: string;
  reportFollowedError: string;
  reportFollowedUnfollowTitle: string;
  reportFollowedUnfollowMessage: string;
  reportFollowedUnfollowButton: string;
  reportFollowedUnfollowError: string;
  reportFollowedUnfollowSuccess: string;
  reportFollowedUnknownUser: string;
  reportFollowedUnfollowLabel: string;
  reportFollowedTimeNow: string;
  // Report - Service errors
  reportServiceSessionExpired: string;
  reportServiceInvalidUrgency: string;
  reportServiceInvalidType: string;
  reportServiceInvalidCity: string;
  reportServiceSuccess: string;
  reportServiceErrorCreate: string;
  reportServiceTimeoutLoadMore: string;
  reportServiceErrorLoadMore: string;
  // Report - Map
  reportMapSelectTitle: string;
  reportMapViewTitle: string;
  reportMapLocationError: string;
  reportMapInstruction: string;
  reportMapViewInstruction: string;
  reportMapSelectedLabel: string;
  reportMapLocationLabel: string;
  reportMapConfirm: string;
  reportMapCancel: string;
  reportMapClose: string;
  // Report - Details hooks
  reportDetailsLoadError: string;
  reportDetailsLoadErrorMessage: string;
  reportDetailsInvalidDate: string;
  reportDetailsUnknownError: string;
  // Report - Details Screen
  reportDetailsIdRequired: string;
  reportDetailsIdRequiredMessage: string;
  reportDetailsLoading: string;
  reportDetailsIdLabel: string;
  reportDetailsRetry: string;
  reportDetailsBack: string;
  reportDetailsTitle: string;
  // Report - Media Section
  reportMediaSectionImage: string;
  reportMediaSectionVideo: string;
  reportMediaSectionImagesSelected: string;
  reportMediaSectionVideoSelected: string;
  reportMediaSectionVideoLabel: string;
  reportMediaSectionMaxImages: string;
  reportMediaSectionRemaining: string;
  reportMediaSectionMaxVideo: string;
  // Report - Urgency Selector
  reportUrgencyTitle: string;
  reportUrgencyLow: string;
  reportUrgencyMedium: string;
  reportUrgencyHigh: string;
  reportUrgencyCritical: string;
  // Projects - Card
  projectCardNoTitle: string;
  projectCardStatusUnknown: string;
  projectCardStatusPlanning: string;
  projectCardStatusInProgress: string;
  projectCardStatusCompleted: string;
  projectCardPriorityImportant: string;
  projectCardPriorityUrgent: string;
  // Profile - Public Profile Additional
  profileInfoTitle: string;
  profileFollowSuccess: string;
  profileUnfollowSuccess: string;
  profileUserLabel: string;
  profileQRViewLabel: string;
  profileEmailLabel: string;
  profileEmailNotPublic: string;
  profilePhoneNotPublic: string;
  // Profile - UserInfo Toasts
  profileEmailUpdateSuccess: string;
  profileEmailUpdateError: string;
  profilePhoneUpdateSuccess: string;
  profilePhoneUpdateError: string;
  profileNameUpdateSuccess: string;
  profileNameUpdateError: string;
  profileChangePasswordComingSoon: string;
  // Home - Client Drawer Menu
  drawerMenuTitle: string;
  drawerLoading: string;
  drawerUser: string;
  drawerEmail: string;
  drawerTapToProfile: string;
  drawerHome: string;
  drawerMap: string;
  drawerSettings: string;
  drawerLogout: string;
  drawerFilters: string;
  drawerAdminMenuTitle: string;
  drawerAdminUser: string;
  drawerAdminEmail: string;
  // Header
  headerOpenMenu: string;
  headerSearch: string;
  headerAdminPanel: string;
  headerProfile: string;
  // Drawer Auth
  drawerAuthMenuTitle: string;
  drawerAuthUser: string;
  drawerAuthEmail: string;
  // Search
  searchTitle: string;
  searchPlaceholder: string;
  searchNoResults: string;
  searchBy: string;
  searchCommentsSingular: string;
  searchCommentsPlural: string;
  // Statistics
  statisticsTitle: string;
  statisticsLastUpdate: string;
  statisticsRefreshing: string;
  statisticsGlobalMetrics: string;
  statisticsTotalReports: string;
  statisticsNewReports: string;
  statisticsInProgress: string;
  statisticsResolved: string;
  statisticsRejected: string;
  statisticsTotalProjects: string;
  statisticsActiveProjects: string;
  statisticsDistributionByStatus: string;
  statisticsDistributionByUrgency: string;
  statisticsTopProblems: string;
  statisticsTemporalEvolution: string;
  statisticsTopProjects: string;
  statisticsInsights: string;
  statisticsViewProject: string;
  statisticsMonthly: string;
  statisticsGrowth: string;
  statisticsNoData: string;
  statisticsLocation: string;
  statisticsTimeNow: string;
  statisticsTimeMinutes: string;
  statisticsTimeHours: string;
  statisticsTimeYesterday: string;
  statisticsTimeDays: string;
  statisticsTimeWeeks: string;
  // Users
  usersTitle: string;
  usersSearchPlaceholder: string;
  usersAddNew: string;
  usersLoading: string;
  usersError: string;
  usersEmpty: string;
  usersRoleUser: string;
  usersRoleAdmin: string;
  usersRoleMunicipal: string;
  usersRoleUnknown: string;
  usersStatusEnabled: string;
  usersStatusDisabled: string;
  usersConfirmToggle: string;
  usersConfirmEnable: string;
  usersConfirmDisable: string;
  usersCancel: string;
  usersConfirm: string;
  usersErrorUpdate: string;
  usersAccessDenied: string;
  usersAccessDeniedMessage: string;
  usersUnderstood: string;
  usersConnectivityOk: string;
  usersConnectivityError: string;
  usersRetry: string;
  usersTestConnection: string;
  usersVerifyAuth: string;
  usersErrorLoad: string;
  usersErrorUnexpected: string;
  usersAddTitle: string;
  usersAddRut: string;
  usersAddRutPlaceholder: string;
  usersAddName: string;
  usersAddNamePlaceholder: string;
  usersAddLastName: string;
  usersAddLastNamePlaceholder: string;
  usersAddNickname: string;
  usersAddNicknamePlaceholder: string;
  usersAddEmail: string;
  usersAddEmailPlaceholder: string;
  usersAddPassword: string;
  usersAddPhone: string;
  usersAddPhonePlaceholder: string;
  usersAddRole: string;
  usersAddRoleClient: string;
  usersAddRoleAdmin: string;
  usersAddRoleAuthority: string;
  usersAddPhoto: string;
  usersAddSubmit: string;
  usersAddErrorRutRequired: string;
  usersAddErrorRutInvalid: string;
  usersAddErrorNameRequired: string;
  usersAddErrorLastNameRequired: string;
  usersAddErrorNicknameRequired: string;
  usersAddErrorEmailRequired: string;
  usersAddErrorEmailInvalid: string;
  usersAddErrorPasswordRequired: string;
  usersAddErrorPasswordLength: string;
  usersAddErrorPhoneRequired: string;
  usersAddErrorPhoneInvalid: string;
  usersAddPermissionsTitle: string;
  usersAddPermissionsMessage: string;
  // Home - Client Content
  homeTabAll: string;
  homeTabFollowed: string;
  homeFollowLabel: string;
  homeFollowingLabel: string;
  homeShareTitle: string;
  homeReportContentTitle: string;
  homeReportContentMessage: string;
  homeReportContentReported: string;
  homeNavigationMaps: string;
  homeShareMessage: string;
  homeReportButton: string;
  homeReportedTitle: string;
  homeReportedMessage: string;
  homeNavigationTitle: string;
  homeViewOnMap: string;
  // Home - Filters Modal
  filtersTitle: string;
  filtersCategory: string;
  filtersStatus: string;
  filtersStatusAll: string;
  filtersStatusNew: string;
  filtersStatusInProgress: string;
  filtersStatusResolved: string;
  filtersStatusRejected: string;
  filtersUrgency: string;
  filtersAll: string;
  filtersNew: string;
  filtersInProgress: string;
  filtersResolved: string;
  filtersRejected: string;
  filtersUrgencyLow: string;
  filtersUrgencyMedium: string;
  filtersUrgencyHigh: string;
  filtersUrgencyCritical: string;
  filtersApply: string;
  filtersClear: string;
}> = {
  es: {
    settings: 'Ajustes',
    account: 'Cuenta',
    notifications: 'Notificaciones',
    language: 'Idioma',
    appearance: 'Apariencia',
    spanish: 'Español',
    english: 'Inglés',
    profileTitle: 'Perfil de usuario',
    profileLoading: 'Cargando perfil...',
    profileLoadError: 'Error al cargar el perfil',
    back: 'Volver',
    retry: 'Reintentar',
    changePasswordTitle: 'Cambiar Contraseña',
    changePasswordSubtitle: 'Actualiza tu contraseña de forma segura',
    changePasswordModalTitle: 'Cambiar Contraseña',
    changePasswordModalBody: 'Ingresa tu contraseña actual y la nueva contraseña que deseas usar.',
    currentPasswordPlaceholder: 'Contraseña actual',
    newPasswordPlaceholder: 'Nueva contraseña',
    confirmNewPasswordPlaceholder: 'Confirmar nueva contraseña',
    passwordRequirementsTitle: 'Requisitos de contraseña:',
    passwordReqLength: 'Entre 8 y 16 caracteres',
    passwordReqUppercase: 'Al menos una mayúscula',
    passwordReqNumber: 'Al menos un número',
    passwordReqNoSpecial: 'Solo letras y números',
  passwordsMatch: 'Las contraseñas coinciden',
  passwordsDoNotMatch: 'Las contraseñas no coinciden',
    cancel: 'Cancelar',
    change: 'Cambiar',
    deleteAccountTitle: 'Eliminar Cuenta',
    deleteAccountSubtitle: 'Acción irreversible - Contacta soporte para recuperar',
    deleteAccountConfirmTitle: '¿Eliminar Cuenta?',
    deleteAccountConfirmBody:
      'Esta acción desactivará tu cuenta permanentemente y es irreversible desde la aplicación.\n\nPerderás acceso a todos tus datos y no podrás iniciar sesión.\n\nPara reactivar, deberás contactar directamente con soporte técnico.',
    deleteAccountSecondTitle: 'Confirmar Eliminación',
    deleteAccountSecondBody:
      'Para confirmar la eliminación permanente de tu cuenta, escribe "ELIMINAR" en el campo abajo:',
    deleteAccountConfirmPlaceholder: 'Escribe ELIMINAR',
    deleteAccountButton: 'Eliminar Cuenta',
    continue: 'Continuar',
    nameFieldPlaceholder: 'Agrega tu nombre y apellido para completar tu perfil',
    statsLoading: 'Cargando estadísticas...',
    statsRetry: 'Reintentar',
    statsTitle: 'Actividad',
    statsReportsCreated: 'Reportes creados',
    statsReportsFollowed: 'Reportes seguidos',
    statsVotesReceived: 'Votos recibidos',
    statsVotesMade: 'Votos realizados',
    editEmailTitle: 'Editar Email',
    editEmailLabel: 'Nuevo email',
    editEmailPlaceholder: 'ejemplo@correo.com',
    saving: 'Guardando...',
    save: 'Guardar',
    editPhoneTitle: 'Editar Teléfono',
    editPhoneLabel: 'Nuevo teléfono',
    editPhoneHint: 'Ingresa solo los 8 dígitos finales (automáticamente se agrega +56 9)',
    editPhonePlaceholder: '1234 5678',
    editNameTitle: 'Editar nombre',
    firstNameLabel: 'Nombre',
    lastNameLabel: 'Apellido',
    welcomeTitle: 'Bienvenidos',
    welcomeRegister: 'Registrarse',
    welcomeLogin: 'Iniciar Sesión',
    loginTitle: 'Inicio Sesión',
    loginHello: 'Hola!',
    loginUserLabel: 'Usuario',
    loginPasswordLabel: 'Contraseña',
    loginForgotPassword: '¿Olvidaste tu contraseña?',
    loginSubmitting: 'Iniciando sesión...',
    loginSuccess: '¡Inicio de sesión exitoso!',
    loginErrorClose: 'Cerrar',
    loginEmptyFieldsError: 'Por favor, completa todos los campos.',
    loginErrorPrefix: 'Error al iniciar sesión: ',
    loginErrorFallback: 'Verifica tus credenciales.',
    // Auth Service messages
    authServiceInvalidCredentials: 'Verifica tus credenciales.',
    authServiceConnectionError: 'Error de conexión. Verifica tu conexión a internet.',
    authServiceCodeExpired: 'Código inválido o expirado',
    authServiceCodeSent: 'Código enviado exitosamente',
    authServiceCodeVerified: 'Código verificado exitosamente',
    authServicePasswordUpdated: 'Contraseña actualizada exitosamente',
    authServiceSendCodeError: 'Error al enviar el código',
    registerTitle: 'Registrarse',
    registerHello: 'Hola!',
    registerRutLabel: 'RUT',
    registerUsernameLabel: 'Nombre de Usuario',
    registerEmailLabel: 'Correo Electrónico',
    registerPasswordLabel: 'Contraseña',
    registerRepeatPasswordLabel: 'Repetir Contraseña',
    registerPhoneLabel: 'Teléfono',
    registerPhonePrefix: '+569',
    registerHaveAccount: 'Ya tengo cuenta',
    registerSubmitting: 'Registrando usuario...',
    registerSuccess: '¡Registro exitoso! Serás redirigido al inicio de sesión.',
    registerErrorPrefix: 'Error en el registro: ',
  registerUsernameRequired: 'Usuario requerido',
  registerPhoneInvalid: 'Teléfono inválido',
    recoverTitle: 'Recuperar Contraseña',
    recoverHeaderQuestion: '¿Olvidaste tu\ncontraseña?',
    recoverSelectMethod: 'Selecciona cómo buscar tu cuenta',
    recoverMethodRut: 'RUT',
    recoverMethodEmail: 'Email',
    recoverButtonSending: 'Enviando...',
    recoverButton: 'Recuperar',
    recoverSendingCodeTitle: 'Enviando código...',
    recoverSendingCodeBody: 'Por favor espera mientras procesamos tu solicitud',
    recoverCodeSentTitle: '¡Código enviado!',
    recoverErrorTitle: 'Error',
    recoverModalUnderstand: 'Entendido',
  recoverFieldRequired: 'Por favor, completa el campo requerido.',
  recoverConnectionError: 'Error de conexión. Verifica tu conexión a internet.',
    verifyTitle: 'Verificar Código',
    verifyHeaderTitle: 'Ingresa el\ncódigo',
    verifyCodeSentTo: 'Código enviado a:',
    verifyCodePlaceholder: '000000',
    verifyCodeHint: 'Ingresa los 6 dígitos del código',
    verifyButtonVerifying: 'Verificando...',
    verifyButton: 'Verificar Código',
    verifyResendQuestion: '¿No recibiste el código?',
    verifyResendLink: 'Enviar nuevamente',
    verifyModalVerifyingTitle: 'Verificando código...',
    verifyModalVerifyingBody: 'Por favor espera mientras validamos tu código',
    verifyModalSuccessTitle: '¡Código verificado!',
    verifyModalErrorTitle: 'Error',
    verifyModalRetry: 'Reintentar',
    resetTitle: 'Nueva Contraseña',
    resetHeaderAlmost: '¡Ya casi!',
    resetInfoTitle: 'Ingresa tu nueva contraseña',
    resetInfoBody: 'Debe cumplir con los requisitos de seguridad',
    resetNewPasswordLabel: 'Nueva Contraseña',
    resetConfirmPasswordLabel: 'Confirmar Contraseña',
    resetButtonUpdating: 'Actualizando...',
    resetButton: 'Cambiar Contraseña',
    resetModalUpdatingTitle: 'Actualizando contraseña...',
    resetModalUpdatingBody: 'Por favor espera mientras actualizamos tu contraseña',
    resetModalSuccessTitle: '¡Contraseña actualizada!',
    resetModalRedirectHint: 'Redirigiendo al inicio de sesión...',
    resetModalErrorTitle: 'Error',
    resetModalRetry: 'Reintentar',
    emailPlaceholder: 'usuarioinfracheck@correo.cl',
    emailErrorDefault: 'Ingresa un correo válido (ej: usuario@dominio.com)',
    rutPlaceholder: '12.345.678-k',
    rutErrorDefault: 'Ingresa un RUT válido (ej: 12.345.678-9)',
    notFoundTitle: '¡Oops!',
    notFoundMessage: 'Esta pantalla no existe.',
    notFoundGoHome: '¡Ir a la pantalla de inicio!',
    loading: 'Cargando...',
    redirecting: 'Redirigiendo...',
    userProfileTitle: 'Perfil de Usuario',
    userProfileOf: 'Perfil de',
    gpsPermissionTitle: 'Permiso de Ubicación',
    gpsPermissionDescription: 'InfraCheck necesita acceder a tu ubicación para:',
    gpsLocateReports: 'Ubicar reportes',
    gpsLocateReportsDesc: 'en el mapa de forma precisa',
    gpsAutoRegister: 'Registrar automáticamente',
    gpsAutoRegisterDesc: 'la dirección del problema reportado',
    gpsShowNearby: 'Mostrar reportes cercanos',
    gpsShowNearbyDesc: 'a tu ubicación actual',
    gpsPrivacyNote: '🔒 Tu ubicación solo se usa cuando creas o visualizas reportes. No la compartimos con terceros.',
    gpsAllowAccess: 'Permitir Acceso',
    gpsNotNow: 'Ahora No',
    projectUntitled: 'Sin título',
    projectUnknownStatus: 'Desconocido',
    projectPriorityNormal: 'Normal',
    projectViewDetails: 'Ver detalle',
    projectOriginReport: 'Reporte origen',
    soundNotificationTitle: 'Sonidos de Notificación',
    soundEnabled: 'Activado',
    soundDisabled: 'Desactivado',
    soundTestTitle: 'Probar sonidos:',
    soundSuccess: 'Éxito',
    soundError: 'Error',
    soundWarning: 'Advertencia',
    soundInfo: 'Información',
    soundNotification: 'Notificación',
    soundPlay: 'Tocar',
    systemMetricsTitle: 'Métricas del Sistema',
    metricsUsers: 'Usuarios',
    metricsReports: 'Reportes',
    metricsUptime: 'Uptime',
    locationPermissionDenied: 'Permiso de ubicación denegado',
    locationPermissionDeniedByUser: 'Permiso de ubicación denegado por el usuario',
    analyticsTitle: 'Analytics',
    analyticsReportTrend: 'Tendencia de Reportes',
    analyticsReportsByDay: 'Reportes por día de la semana',
    analyticsVsLastWeek: 'vs Semana anterior',
    analyticsTotalThisWeek: 'Total esta semana',
    analyticsPeakMax: 'Pico máximo',
    analyticsMainMetrics: 'Métricas Principales',
    analyticsTrends: 'Tendencias',
    analyticsActiveUsers: 'Usuarios Activos',
    analyticsUsersLast24h: 'usuarios en las últimas 24h',
    analyticsNewReports: 'Reportes Nuevos',
    analyticsReportsThisWeek: 'reportes esta semana',
    analyticsEngagementRate: 'Engagement Rate',
    analyticsAvgEngagement: 'de engagement promedio',
    analyticsByCategory: 'Por Categoría',
    analyticsCategoryInfra: 'Infraestructura',
    analyticsCategorySecurity: 'Seguridad',
    analyticsCategoryMaintenance: 'Mantenimiento',
    analyticsCategoryOther: 'Otros',
    analyticsReportsLabel: 'Reportes',
    dayMon: 'Lun',
    dayTue: 'Mar',
    dayWed: 'Mié',
    dayThu: 'Jue',
    dayFri: 'Vie',
    daySat: 'Sáb',
    daySun: 'Dom',
    // Reset Password Screen
    resetPasswordTitle: 'Nueva Contraseña',
    resetPasswordAlmostThere: '¡Ya casi!',
    resetPasswordInstruction: 'Ingresa tu nueva contraseña',
    resetPasswordRequirements: 'Debe cumplir con los requisitos de seguridad',
    resetPasswordNewLabel: 'Nueva Contraseña',
    resetPasswordConfirmLabel: 'Confirmar Contraseña',
    resetPasswordReqLength: 'Entre 8 y 16 caracteres',
    resetPasswordReqUppercase: 'Al menos una mayúscula',
    resetPasswordReqNumber: 'Al menos un número',
    resetPasswordReqNoSpecial: 'Solo letras y números',
    resetPasswordMatch: '✓ Las contraseñas coinciden',
    resetPasswordNoMatch: '✗ Las contraseñas no coinciden',
    resetPasswordButton: 'Cambiar Contraseña',
    resetPasswordUpdating: 'Actualizando...',
    resetPasswordModalUpdating: 'Actualizando contraseña...',
    resetPasswordModalUpdatingBody: 'Por favor espera mientras actualizamos tu contraseña',
    resetPasswordModalSuccess: '¡Contraseña actualizada!',
    resetPasswordModalError: 'Error',
    resetPasswordModalRedirecting: 'Redirigiendo al inicio de sesión...',
    resetPasswordModalRetry: 'Reintentar',
    resetPasswordErrorEmpty: 'Por favor, completa todos los campos.',
    resetPasswordErrorRequirements: 'La contraseña no cumple con los requisitos de seguridad.',
    resetPasswordErrorNoMatch: 'Las contraseñas no coinciden.',
    resetPasswordErrorNoToken: 'Token de reset no válido. Intenta el proceso nuevamente.',
    // Verify Reset Code Screen
    verifyCodeTitle: 'Verificar Código',
    verifyCodeEnterCode: 'Ingresa el\ncódigo',
    verifyCodeInstruction: 'Ingresa los 6 dígitos del código',
    verifyCodeButton: 'Verificar Código',
    verifyCodeVerifying: 'Verificando...',
    verifyCodeNoReceived: '¿No recibiste el código?',
    verifyCodeResend: 'Enviar nuevamente',
    verifyCodeModalVerifying: 'Verificando código...',
    verifyCodeModalVerifyingBody: 'Por favor espera mientras validamos tu código',
    verifyCodeModalSuccess: '¡Código verificado!',
    verifyCodeModalError: 'Error',
    verifyCodeModalRetry: 'Reintentar',
    verifyCodeErrorInvalid: 'Ingresa un código de 6 dígitos válido',
    // Comments Modal
    commentsTitle: 'Comentarios',
    commentsLoading: 'Cargando comentarios...',
    commentsEmpty: 'No hay comentarios aún.\n¡Sé el primero en comentar!',
    commentsPlaceholder: 'Escribe un comentario...',
    commentsYouLabel: 'Tú',
    commentsDeleteTitle: 'Eliminar comentario',
    commentsDeleteMessage: '¿Estás seguro de que quieres eliminar este comentario de',
    commentsDeleteCancel: 'Cancelar',
    commentsDeleteConfirm: 'Eliminar',
    commentsCharCount: '/1000',
    commentsErrorLogin: 'Debes iniciar sesión',
    commentsErrorLoadLogin: 'Debes iniciar sesión para ver los comentarios',
    commentsErrorLoad: 'Error al cargar comentarios',
    commentsErrorTooLong: 'El comentario no puede exceder los 1000 caracteres',
    commentsErrorPublishLogin: 'Debes iniciar sesión para comentar',
    commentsErrorPublish: 'Error al publicar el comentario',
    commentsErrorDeleteLogin: 'Debes iniciar sesión para eliminar comentarios',
    commentsErrorDelete: 'Error al eliminar el comentario',
    commentsSuccessPublished: '¡Comentario publicado!',
    commentsSuccessDeleted: 'Comentario eliminado',
    // Home - Empty States
    emptyFollowedTitle: 'No sigues ningún reporte aún',
    emptyFollowedMessage: 'Explora los reportes disponibles y comienza a seguir los que te interesen para recibir actualizaciones',
    emptyFollowedButton: 'Explorar Reportes',
    // Home - Followed Reports Placeholder
    followedPlaceholderTitle: 'Reportes Seguidos',
    followedPlaceholderMessage: 'Aquí aparecerán los reportes que decidas seguir.\nMantente al tanto de su progreso y actualizaciones.',
    followedPlaceholderButton: 'Cargar Seguimientos',
    followedPlaceholderTip: '💡 Toca el botón "Seguir" en cualquier reporte\npara agregarlo a tu lista de seguimiento',
    // Home - Followed Report Card
    followedCardUnfollowTitle: 'Dejar de seguir',
    followedCardUnfollowMessage: '¿Estás seguro que deseas dejar de seguir este reporte?',
    followedCardUnfollowCancel: 'Cancelar',
    followedCardUnfollowConfirm: 'Dejar de seguir',
    followedCardUnfollowError: 'No se pudo dejar de seguir el reporte',
    followedCardUrgencyLow: 'Baja',
    followedCardUrgencyMedium: 'Media',
    followedCardUrgencyHigh: 'Alta',
    followedCardUrgencyCritical: 'Crítica',
    followedCardUrgencyUnknown: 'Desconocida',
    followedCardStatusNew: 'Nuevo',
    followedCardStatusInProgress: 'En Proceso',
    followedCardStatusResolved: 'Resuelto',
    followedCardStatusRejected: 'Rechazado',
    followedCardToday: 'Hoy',
    followedCardYesterday: 'Ayer',
    followedCardDaysAgo: 'días',
    followedCardWeeksAgo: 'semanas',
    // Home - Category Filter
    categoryFilterAll: 'Todas',
    categoryInfrastructure: 'Infraestructura',
    categorySignage: 'Señalización',
    categoryLighting: 'Alumbrado',
    categoryCleaning: 'Limpieza',
    categoryGreenAreas: 'Áreas Verdes',
    categoryPublicServices: 'Servicios Públicos',
    // Home - Admin Content
    adminSystemStatus: 'Estado del Sistema',
    adminUserManagement: 'Gestión de Usuarios',
    adminNewRegistrationsToday: 'Nuevos Registros Hoy',
    adminNewUsers: 'usuarios nuevos',
    adminActiveUsers: 'Usuarios Activos',
    adminActiveUsersLast24h: 'en las últimas 24h',
    adminStable: 'Estable',
    adminControlPanel: 'Panel de Control',
    adminManageUsers: 'Gestionar Usuarios',
    adminAnalytics: 'Analytics',
    adminCreateNotification: 'Crear Notificación',
    // Home - Admin Drawer Menu
    adminDrawerMenuTitle: 'Menú Admin',
    adminDrawerMenuProfileTap: 'Toca para ver perfil',
    adminDrawerMenuHome: 'Inicio',
    adminDrawerMenuMap: 'Mapa',
    adminDrawerMenuSettings: 'Ajustes',
    adminDrawerMenuLogout: 'Cerrar sesión',
    // List Report
    listReportTitle: 'Lista de Reportes',
    listReportSearchPlaceholder: 'Buscar reportes...',
    listReportSearching: 'Buscando:',
    listReportResult: 'resultado',
    listReportResults: 'resultados',
    listReportFilters: 'Filtros',
    listReportClearFilters: 'Limpiar',
    listReportStatus: 'Estado',
    listReportUrgency: 'Urgencia',
    listReportSort: 'Ordenar',
    listReportAllStatuses: 'Todos los estados',
    listReportAllUrgencies: 'Todas las urgencias',
    listReportSortBy: 'Ordenar por',
    listReportSortByUrgency: 'Más urgentes',
    listReportSortByRecent: 'Más recientes',
    listReportSortByStatus: 'Por estado',
    listReportReportsCount: 'Reportes ({count})',
    listReportLoading: 'Cargando reportes...',
    listReportNoResults: 'No se encontraron reportes con los filtros aplicados',
    listReportClearFiltersButton: 'Limpiar filtros',
    listReportLoadMore: 'Cargar más reportes',
    listReportFilterByStatus: 'Filtrar por estado',
    listReportUrgencyLevel: 'Nivel de urgencia',
    listReportCategory: 'Categoría',
    listReportType: 'Tipo',
    listReportAllTypes: 'Todos los tipos',
    listReportTypeOfComplaint: 'Tipo de denuncia',
    listReportSortByOldest: 'Más antiguos',
    listReportSortByVotes: 'Más votados',
    listReportPage: 'Página',
    listReportOf: 'de',
    listReportPrevious: 'Anterior',
    listReportNext: 'Siguiente',
    listReportRetry: 'Reintentar',
    // Map
    mapFiltersTitle: 'Filtros',
    mapCategoriesTitle: 'Categorías',
    mapZoomToSee: 'Acerca el mapa para ver los reportes',
    mapCategoryLabel: 'Categoría',
    mapLocationLabel: 'Ubicación',
    mapCategoryNotAvailable: 'Categoría no disponible',
    // Pin Details Modal
    pinDetailsTitle: 'Detalles del reporte',
    pinDetailsCategory: 'Categoría',
    pinDetailsDescription: 'Descripción',
    pinDetailsBasicInfo: 'Información básica',
    pinDetailsDate: 'Fecha',
    pinDetailsTime: 'Hora',
    pinDetailsUrgency: 'Urgencia',
    pinDetailsLocation: 'Ubicación',
    pinDetailsLatitude: 'Latitud',
    pinDetailsLongitude: 'Longitud',
    pinDetailsAddress: 'Dirección',
    pinDetailsEvidence: 'Evidencia fotográfica',
    pinDetailsLoading: 'Cargando detalles...',
    pinDetailsNoDetails: 'No hay detalles disponibles',
    pinDetailsLoadingImage: 'Cargando imagen...',
    pinDetailsImageNotAvailable: 'Imagen no disponible',
    pinDetailsDateNotAvailable: 'Fecha no disponible',
    pinDetailsTimeNotAvailable: 'Hora no disponible',
    // Home - Client Content
    homeLoadingReports: 'Cargando reportes...',
    homeNoReportsAvailable: 'No hay reportes disponibles',
    homeSwipeToRefresh: 'Desliza hacia abajo para actualizar',
    homeErrorLoadMore: 'Error al cargar más reportes',
    homeAllReportsViewed: 'Ya has visto todos los reportes',
    homeLoadingMore: 'Cargando más reportes...',
    homeLoadMoreButton: 'Cargar más reportes',
    homeErrorLoadReports: 'Error al cargar reportes',
    homeErrorConnection: 'Hubo un problema al conectarse con el servidor. Verifica tu conexión a internet.',
    homeLocationTitle: 'Ubicación del Reporte',
    homeLocationAddress: 'Dirección',
    // Home - Auth Content
    homeCriticalReportsTitle: 'Reportes Críticos',
    homeNoCriticalReports: 'No hay reportes críticos pendientes',
    // Notifications - Create Screen
    notifyCreateTitle: 'Crear Notificación',
    notifyCreateSubtitle: 'Panel Administrativo',
    notifyInfoTitle: 'Información',
    notifyInfoBody: 'Esta función permite crear notificaciones de prueba para cualquier usuario del sistema.',
    notifyUserIdLabel: 'RUT o ID del Usuario',
    notifyUserIdPlaceholder: 'Ej: 12345678-9 o 5',
    notifyUserIdHint: 'Puedes ingresar el RUT (con o sin guión) o el ID numérico',
    notifyTitleLabel: 'Título',
    notifyTitlePlaceholder: 'Ej: Actualización importante',
    notifyTitleCharCount: '{count}/200 caracteres',
    notifyMessageLabel: 'Mensaje',
    notifyMessagePlaceholder: 'Escribe el mensaje de la notificación...',
    notifyTypeLabel: 'Tipo de Notificación',
    notifyTypeInfo: 'Información',
    notifyTypeSuccess: 'Éxito',
    notifyTypeWarning: 'Advertencia',
    notifyTypeError: 'Error',
    notifyReportIdLabel: 'ID del Reporte (Opcional)',
    notifyReportIdPlaceholder: 'Ej: 123',
    notifyReportIdHint: 'Si la notificación está relacionada con un reporte específico',
    notifyButtonCancel: 'Cancelar',
    notifyButtonCreate: 'Crear Notificación',
    notifyErrorUserRequired: 'Debes ingresar el RUT o ID del usuario',
    notifyErrorTitleRequired: 'Debes ingresar un título',
    notifyErrorMessageRequired: 'Debes ingresar un mensaje',
    notifySuccessTitle: 'Éxito',
    notifySuccessMessage: 'Notificación creada correctamente',
    notifySuccessCreateAnother: 'Crear otra',
    notifySuccessGoBack: 'Volver',
    notifyErrorTitle: 'Error',
    notifyErrorDefault: 'No se pudo crear la notificación',
    // Notifications - List Screen
    notifyListTitle: 'Notificaciones',
    notifyListLoading: 'Cargando notificaciones...',
    notifyListUnreadCount: 'Tienes {count} notificación(es) sin leer',
    notifyListEmpty: 'No tienes notificaciones',
    // Profile - Edit Modals
    profileEditNameError: 'Datos incompletos',
    profileEditNameErrorBody: 'Por favor ingresa nombre y apellido.',
    profileEditEmailErrorEmpty: 'El email no puede estar vacío',
    profileEditEmailErrorInvalid: 'Por favor ingresa un email válido',
    profileEditPhoneErrorEmpty: 'El teléfono no puede estar vacío',
    profileEditPhoneErrorInvalid: 'Por favor ingresa 8 dígitos para el número móvil',
    // Profile - Delete Account
    profileDeleteErrorConfirm: 'Debes escribir "ELIMINAR" exactamente para confirmar',
    profileDeleteSuccessTitle: 'Cuenta Eliminada',
    profileDeleteErrorTitle: 'Error',
    profileDeleteErrorConnection: 'Error de conexión. Intenta nuevamente.',
    // Profile - Change Password
    profilePasswordErrorAllFields: 'Todos los campos son obligatorios',
    profilePasswordErrorMismatch: 'La nueva contraseña y su confirmación no coinciden',
    profilePasswordErrorRequirements: 'La contraseña no cumple con los requisitos de seguridad',
    profilePasswordSuccessTitle: 'Contraseña Cambiada',
    profilePasswordErrorTitle: 'Error',
    profilePasswordErrorConnection: 'Error de conexión. Intenta nuevamente.',
    // Profile - Public Profile
    profileQRCodeLabel: 'Código QR',
    profilePhoneLabel: 'Teléfono',
    profileSettingsAccessibility: 'Configuración',
    // Posts - Report Card
    postsFollowToast: '¡Ahora sigues este reporte!',
    postsUnfollowToast: 'Dejaste de seguir este reporte',
    postsFollowing: 'Siguiendo',
    postsFollow: 'Seguir',
    postsShare: 'Compartir',
    postsImageError: 'Error al cargar imagen',
    postsNoImage: 'Sin imagen',
    // Home - Followed Report Card
    homeCardUrgencyLow: 'Bajo',
    homeCardUrgencyMedium: 'Medio',
    homeCardUrgencyHigh: 'Alto',
    homeCardUrgencyCritical: 'Crítico',
    homeCardUrgencyUnknown: 'Desconocido',
    homeCardStatusNew: 'Nuevo',
    homeCardStatusInProgress: 'En proceso',
    homeCardStatusResolved: 'Resuelto',
    homeCardStatusRejected: 'Rechazado',
    homeCardDateToday: 'Hoy',
    homeCardDateYesterday: 'Ayer',
    homeCardDateDaysAgo: 'Hace {days} días',
    homeCardDateWeeksAgo: 'Hace {weeks} semanas',
    homeCardUnfollowTitle: 'Dejar de seguir',
    homeCardUnfollowMessage: '¿Estás seguro que deseas dejar de seguir este reporte?',
    homeCardUnfollowCancel: 'Cancelar',
    homeCardUnfollowConfirm: 'Dejar de seguir',
    homeCardUnfollowError: 'Error',
    homeCardUnfollowErrorMessage: 'No se pudo dejar de seguir el reporte',
    homeCardCategoryLabel: 'Categoría:',
    // Report - Form
    reportFormTitlePlaceholder: 'Título',
    reportFormDescriptionPlaceholder: 'Descripción del problema',
    reportFormMediaTitle: 'Medios',
    reportFormLocationTitle: 'Ubicación',
    reportFormConfigTitle: 'Configuración',
    reportFormPublicToggleLabel: 'Reporte público',
    reportFormTypePlaceholder: 'Seleccione el tipo de denuncia',
    reportFormType1: 'Calles y Veredas en Mal Estado',
    reportFormType2: 'Luz o Alumbrado Público Dañado',
    reportFormType3: 'Drenaje o Aguas Estancadas',
    reportFormType6: 'Emergencias o Situaciones de Riesgo',
    reportFormType7: 'Infraestructura o Mobiliario Público Dañado',
    reportFormCityPlaceholder: 'Seleccione Ciudad',
    reportFormSelectCity: 'Seleccione una ciudad',
    reportFormSelectLocation: 'Seleccionar en el mapa',
    reportFormAddressPlaceholder: 'Dirección',
    reportFormPublicLabel: 'Publicar',
    reportFormPublicDescription: 'Su reporte será visible para otros usuarios',
    reportFormPrivateDescription: 'Su reporte será privado',
    reportFormMapTitle: 'Seleccionar Ubicación del Problema',
    // Report - Create Screen
    reportCreateErrorAuth: 'Debe iniciar sesión para crear un reporte',
    reportCreateSuccessTitle: 'Reporte Creado',
    reportCreateSuccessMessage: 'Su reporte ha sido enviado exitosamente',
    reportCreateDiscardTitle: 'Descartar Cambios',
    reportCreateDiscardMessage: '¿Está seguro que desea salir? Los cambios no guardados se perderán',
    reportCreateDiscardCancel: 'Cancelar',
    reportCreateDiscardConfirm: 'Salir',
    reportCreateSubmittingTitle: 'Reporte en proceso',
    reportCreateSubmittingMessage: 'El reporte se está enviando. ¿Desea cancelar?',
    reportCreateSubmittingContinue: 'Continuar enviando',
    reportCreateSubmittingCancel: 'Cancelar envío',
    reportCreatePreviewTitle: 'Vista Previa del Reporte',
    reportCreateProcessing: 'Procesando...',
    reportCreateScreenTitle: 'Nuevo Reporte',
    reportCreateInfoTitle: 'Información Importante:',
    reportCreateInfoConfidential: 'Sus datos personales se mantendrán confidenciales',
    reportCreateInfoReviewTime: 'El reporte será revisado en un plazo de 24-48 horas',
    reportCreateInfoNotifications: 'Recibirá notificaciones sobre el estado de su reporte',
    reportCreateInfoEmergencies: 'Para emergencias, contacte directamente a los servicios de emergencia',
    reportCreateEditModeTitle: 'Modo de edición',
    reportCreateEditModeMessage: 'Puedes modificar los datos del reporte. Los cambios se guardarán automáticamente.',
    reportCreateEditModeUnderstand: 'Entendido',
    // Report - Camera/Media
    reportMediaPermissionsTitle: 'Permisos requeridos',
    reportMediaPermissionsMessage: 'Se necesitan permisos de cámara y galería',
    reportMediaLimitImages: 'Solo puedes agregar hasta {max} imágenes',
    reportMediaLimitVideo: 'Solo puedes agregar un video',
    reportMediaErrorPhoto: 'No se pudo tomar la foto',
    reportMediaErrorImage: 'No se pudo seleccionar la imagen',
    reportMediaErrorVideo: 'No se pudo seleccionar el video',
    reportMediaAddImage: 'Agregar Imagen',
    reportMediaAddVideo: 'Agregar Video',
    reportMediaTakePhoto: 'Tomar foto',
    reportMediaSelectGallery: 'Seleccionar de galería',
    reportMediaRecordVideo: 'Grabar video',
    // Report - Validation
    reportValidationTitle: 'El título es obligatorio',
    reportValidationDescription: 'La descripción es obligatoria',
    reportValidationAddress: 'La dirección es obligatoria',
    reportValidationType: 'Seleccione un tipo de denuncia',
    reportValidationUrgency: 'Seleccione un nivel de urgencia',
    reportValidationCity: 'Seleccione una ciudad',
    reportValidationLocation: 'Seleccione una ubicación en el mapa',
    reportValidationFormError: 'Verifique los datos del formulario',
    reportValidationFilesError: 'Los archivos son demasiado grandes',
    reportValidationNetworkError: 'Error de conexión. Verifique su conexión a internet',
    reportValidationUnexpectedError: 'Hubo un error inesperado',
    // Report - Details
    reportDetailsNotFound: 'Reporte no encontrado',
    reportDetailsError: 'No se pudo cargar el reporte',
    // Report - Preview
    reportPreviewTitle: 'Vista Previa',
    reportPreviewType: 'Tipo:',
    reportPreviewUrgency: 'Urgencia:',
    reportPreviewCity: 'Ciudad:',
    reportPreviewPublic: 'Público',
    reportPreviewPrivate: 'Privado',
    reportPreviewLocation: 'Ubicación',
    reportPreviewNoAddress: 'Sin dirección especificada',
    reportPreviewImages: 'Imágenes',
    reportPreviewVideo: 'Video',
    reportPreviewVideoAttached: 'Video adjunto',
    reportPreviewSending: 'Enviando reporte... No cierres la aplicación.',
    reportPreviewEdit: 'Editar',
    reportPreviewConfirmSend: 'Confirmar y Enviar',
    reportPreviewConfirmTitle: 'Confirmar envío',
    reportPreviewConfirmMessage: '¿Estás seguro de que deseas enviar este reporte? Una vez enviado no podrás modificarlo.',
    reportPreviewConfirmReview: 'Revisar',
    reportPreviewConfirmButton: 'Enviar',
    reportPreviewCloseTitle: 'Reporte en proceso',
    reportPreviewCloseMessage: 'El reporte se está enviando. ¿Estás seguro de que deseas cancelar?',
    reportPreviewCloseContinue: 'Continuar',
    reportPreviewCloseCancel: 'Cancelar',
    reportPreviewEditDisabledTitle: 'No disponible',
    reportPreviewEditDisabledMessage: 'No se puede editar mientras el reporte se está enviando.',
    reportPreviewNotSelected: 'No seleccionado',
    // Report - Followed screen
    reportFollowedLoading: 'Cargando reportes...',
    reportFollowedTitle: 'Reportes Seguidos',
    reportFollowedEmptyTitle: 'No sigues ningún reporte aún',
    reportFollowedEmptySubtitle: 'Comienza a seguir reportes para verlos aquí',
    reportFollowedError: 'Error al cargar los reportes',
    reportFollowedUnfollowTitle: 'Dejar de seguir',
    reportFollowedUnfollowMessage: '¿Estás seguro que deseas dejar de seguir "{title}"?',
    reportFollowedUnfollowButton: 'Dejar de seguir',
    reportFollowedUnfollowError: 'No se pudo dejar de seguir el reporte',
    reportFollowedUnfollowSuccess: 'Has dejado de seguir el reporte',
    reportFollowedUnknownUser: 'Usuario desconocido',
    reportFollowedUnfollowLabel: 'Dejar de seguir',
    reportFollowedTimeNow: 'Ahora',
    // Report - Service errors
    reportServiceSessionExpired: 'Sesión expirada. Inicie sesión nuevamente.',
    reportServiceInvalidUrgency: 'Valor de urgencia inválido',
    reportServiceInvalidType: 'Tipo de denuncia inválido',
    reportServiceInvalidCity: 'Ciudad inválida',
    reportServiceSuccess: 'Reporte creado exitosamente',
    reportServiceErrorCreate: 'Hubo un error al crear el reporte',
    reportServiceTimeoutLoadMore: 'No se pudieron cargar más reportes. Verifica tu conexión.',
    reportServiceErrorLoadMore: 'Error al cargar más reportes. Toca para reintentar.',
    // Report - Map
    reportMapSelectTitle: 'Seleccionar Ubicación',
    reportMapViewTitle: 'Ubicación',
    reportMapLocationError: 'No se pudo obtener la ubicación actual',
    reportMapInstruction: 'Toca en el mapa para colocar el marcador o arrastra el marcador para moverlo',
    reportMapViewInstruction: 'Ubicación en el mapa',
    reportMapSelectedLabel: 'Ubicación seleccionada:',
    reportMapLocationLabel: 'Ubicación:',
    reportMapConfirm: 'Confirmar Ubicación',
    reportMapCancel: 'Cancelar',
    reportMapClose: 'Cerrar',
    // Report - Details hooks
    reportDetailsLoadError: 'No se pudo cargar el reporte',
    reportDetailsLoadErrorMessage: 'Error al cargar el reporte',
    reportDetailsInvalidDate: 'Fecha inválida',
    reportDetailsUnknownError: 'Error desconocido al cargar reportes',
    // Report - Details Screen
    reportDetailsIdRequired: 'ID de reporte requerido',
    reportDetailsIdRequiredMessage: 'No se proporcionó un ID de reporte válido',
    reportDetailsLoading: 'Cargando reporte...',
    reportDetailsIdLabel: 'ID del reporte',
    reportDetailsRetry: 'Reintentar',
    reportDetailsBack: 'Volver',
    reportDetailsTitle: 'Detalle del Reporte',
    // Report - Media Section
    reportMediaSectionImage: 'Imagen',
    reportMediaSectionVideo: 'Video',
    reportMediaSectionImagesSelected: 'Imágenes seleccionadas:',
    reportMediaSectionVideoSelected: 'Video seleccionado:',
    reportMediaSectionVideoLabel: 'Video',
    reportMediaSectionMaxImages: 'Máximo 5 imágenes',
    reportMediaSectionRemaining: 'restantes',
    reportMediaSectionMaxVideo: 'Máximo 1 video de 60 segundos',
    // Report - Urgency Selector
    reportUrgencyTitle: 'Nivel de Urgencia',
    reportUrgencyLow: 'Baja',
    reportUrgencyMedium: 'Media',
    reportUrgencyHigh: 'Alta',
    reportUrgencyCritical: 'Crítica',
    // Projects - Card
    projectCardNoTitle: 'Sin título',
    projectCardStatusUnknown: 'Desconocido',
    projectCardStatusPlanning: 'Planificación',
    projectCardStatusInProgress: 'En Progreso',
    projectCardStatusCompleted: 'Completado',
    projectCardPriorityImportant: 'Importante',
    projectCardPriorityUrgent: 'Urgente',
    // Profile - Public Profile Additional
    profileInfoTitle: 'Información',
    profileFollowSuccess: 'Ahora sigues a este usuario',
    profileUnfollowSuccess: 'Has dejado de seguir a este usuario',
    profileUserLabel: 'Usuario',
    profileQRViewLabel: 'Ver código QR del usuario',
    profileEmailLabel: 'Email',
    profileEmailNotPublic: 'No disponible públicamente',
    profilePhoneNotPublic: 'No disponible públicamente',
    // Profile - UserInfo Toasts
    profileEmailUpdateSuccess: 'Tu email ha sido actualizado correctamente',
    profileEmailUpdateError: 'No se pudo actualizar el email',
    profilePhoneUpdateSuccess: 'Tu teléfono ha sido actualizado correctamente',
    profilePhoneUpdateError: 'No se pudo actualizar el teléfono',
    profileNameUpdateSuccess: 'Tu nombre y apellido han sido actualizados correctamente',
    profileNameUpdateError: 'No se pudo actualizar el nombre',
    profileChangePasswordComingSoon: 'Esta funcionalidad estará disponible próximamente',
    // Home - Client Drawer Menu
    drawerMenuTitle: 'Menú',
    drawerLoading: 'Cargando...',
    drawerUser: 'Usuario',
    drawerEmail: 'email@ejemplo.com',
    drawerTapToProfile: 'Toca para ver perfil',
    drawerHome: 'Inicio',
    drawerMap: 'Mapa',
    drawerSettings: 'Ajustes',
    drawerLogout: 'Cerrar sesión',
    drawerFilters: 'Filtros Avanzados',
    drawerAdminMenuTitle: 'Menú Admin',
    drawerAdminUser: 'Admin Usuario',
    drawerAdminEmail: 'admin@infracheck.com',
    // Header
    headerOpenMenu: 'Abrir menú',
    headerSearch: 'Buscar',
    headerAdminPanel: 'Panel - Admin',
    headerProfile: 'Perfil',
    // Drawer Auth
    drawerAuthMenuTitle: 'Menú Autoridad',
    drawerAuthUser: 'Usuario Autoridad',
    drawerAuthEmail: 'autoridad@infracheck.com',
    // Search
    searchTitle: 'Buscar Publicaciones',
    searchPlaceholder: 'Buscar por título...',
    searchNoResults: 'No se encontraron resultados',
    searchBy: 'Por',
    searchCommentsSingular: 'comentario',
    searchCommentsPlural: 'comentarios',
    // Statistics
    statisticsTitle: 'Estadísticas Globales',
    statisticsLastUpdate: 'Última actualización',
    statisticsRefreshing: 'Actualizando...',
    statisticsGlobalMetrics: 'Métricas Globales',
    statisticsTotalReports: 'Total de Reportes',
    statisticsNewReports: 'Nuevos',
    statisticsInProgress: 'En Proceso',
    statisticsResolved: 'Resueltos',
    statisticsRejected: 'Rechazados',
    statisticsTotalProjects: 'Total de Proyectos',
    statisticsActiveProjects: 'Activos',
    statisticsDistributionByStatus: 'Distribución por Estado',
    statisticsDistributionByUrgency: 'Distribución por Urgencia',
    statisticsTopProblems: 'Principales Problemas',
    statisticsTemporalEvolution: 'Evolución Temporal',
    statisticsTopProjects: 'Top 5 Proyectos',
    statisticsInsights: 'Insights del Sistema',
    statisticsViewProject: 'Ver Proyecto',
    statisticsMonthly: 'Reportes mensuales',
    statisticsGrowth: 'Crecimiento',
    statisticsNoData: 'Sin datos',
    statisticsLocation: 'Ubicación',
    statisticsTimeNow: 'Hace un momento',
    statisticsTimeMinutes: 'min',
    statisticsTimeHours: 'h',
    statisticsTimeYesterday: 'Ayer',
    statisticsTimeDays: 'días',
    statisticsTimeWeeks: 'semanas',
    // Users
    usersTitle: 'Gestión de Usuarios',
    usersSearchPlaceholder: 'Buscar por nombre, email o nickname...',
    usersAddNew: 'Nuevo Usuario',
    usersLoading: 'Cargando usuarios...',
    usersError: 'Error al cargar usuarios',
    usersEmpty: 'No hay usuarios registrados',
    usersRoleUser: 'Usuario',
    usersRoleAdmin: 'Administrador',
    usersRoleMunicipal: 'Municipal',
    usersRoleUnknown: 'Desconocido',
    usersStatusEnabled: 'Habilitado',
    usersStatusDisabled: 'Deshabilitado',
    usersConfirmToggle: 'Confirmar cambio',
    usersConfirmEnable: '¿Estás seguro de que deseas habilitar a {user}?',
    usersConfirmDisable: '¿Estás seguro de que deseas deshabilitar a {user}?',
    usersCancel: 'Cancelar',
    usersConfirm: 'Confirmar',
    usersErrorUpdate: 'Error inesperado al actualizar el estado',
    usersAccessDenied: 'Acceso denegado',
    usersAccessDeniedMessage: 'No tienes permisos para acceder a esta sección. Solo administradores pueden gestionar usuarios.',
    usersUnderstood: 'Entendido',
    usersConnectivityOk: 'Conectividad OK',
    usersConnectivityError: 'Error de Conectividad',
    usersRetry: 'Reintentar',
    usersTestConnection: 'Probar Conexión',
    usersVerifyAuth: 'Verificar Auth',
    usersErrorLoad: 'Error al cargar usuarios',
    usersErrorUnexpected: 'Error inesperado al cargar usuarios',
    // Users Add Modal
    usersAddTitle: 'Agregar Nuevo Usuario',
    usersAddRut: 'RUT',
    usersAddRutPlaceholder: 'Ej: 12.345.678-9',
    usersAddName: 'Nombre',
    usersAddNamePlaceholder: 'Ingresa el nombre',
    usersAddLastName: 'Apellido',
    usersAddLastNamePlaceholder: 'Ingresa el apellido',
    usersAddNickname: 'Nickname',
    usersAddNicknamePlaceholder: 'Ingresa el nickname',
    usersAddEmail: 'Email',
    usersAddEmailPlaceholder: 'ejemplo@correo.com',
    usersAddPassword: 'Contraseña',
    usersAddPhone: 'Teléfono',
    usersAddPhonePlaceholder: '+56 9 1234 5678',
    usersAddRole: 'Rol del Usuario',
    usersAddRoleClient: 'Cliente',
    usersAddRoleAdmin: 'Administrador',
    usersAddRoleAuthority: 'Autoridad',
    usersAddPhoto: 'Foto de Perfil (Opcional)',
    usersAddSubmit: 'Agregar Usuario',
    usersAddErrorRutRequired: 'RUT es requerido',
    usersAddErrorRutInvalid: 'Formato de RUT inválido (ej: 12.345.678-9)',
    usersAddErrorNameRequired: 'Nombre es requerido',
    usersAddErrorLastNameRequired: 'Apellido es requerido',
    usersAddErrorNicknameRequired: 'Nickname es requerido',
    usersAddErrorEmailRequired: 'Email es requerido',
    usersAddErrorEmailInvalid: 'Email inválido',
    usersAddErrorPasswordRequired: 'Contraseña es requerida',
    usersAddErrorPasswordLength: 'Contraseña debe tener al menos 6 caracteres',
    usersAddErrorPhoneRequired: 'Teléfono es requerido',
    usersAddErrorPhoneInvalid: 'Teléfono debe tener 8-9 dígitos',
    usersAddPermissionsTitle: 'Permisos necesarios',
    usersAddPermissionsMessage: 'Se necesitan permisos de cámara y galería para seleccionar una foto de perfil',
    // Home - Client Content
    homeTabAll: 'Todos',
    homeTabFollowed: 'Seguidos',
    homeFollowLabel: 'Seguir',
    homeFollowingLabel: 'Siguiendo ✓',
    homeShareTitle: 'Compartir Reporte',
    homeReportContentTitle: 'Reportar Contenido',
    homeReportContentMessage: '¿Quieres reportar el contenido "{title}"?',
    homeReportContentReported: 'El contenido ha sido reportado exitosamente.',
    homeNavigationMaps: 'Abriendo en Google Maps...',
    homeShareMessage: 'Mira este reporte: "{title}" - ID: {id}',
    homeReportButton: 'Reportar',
    homeReportedTitle: 'Reportado',
    homeReportedMessage: 'El contenido ha sido reportado exitosamente.',
    homeNavigationTitle: 'Navegación',
    homeViewOnMap: 'Ver en Mapa',
    // Home - Filters Modal
    filtersTitle: 'Filtros Avanzados',
    filtersCategory: 'Categoría',
    filtersStatus: 'Estado',
    filtersStatusAll: 'Todos',
    filtersStatusNew: 'Nuevo',
    filtersStatusInProgress: 'En Proceso',
    filtersStatusResolved: 'Resuelto',
    filtersStatusRejected: 'Rechazado',
    filtersUrgency: 'Urgencia',
    filtersAll: 'Todos',
    filtersNew: 'Nuevo',
    filtersInProgress: 'En Proceso',
    filtersResolved: 'Resuelto',
    filtersRejected: 'Rechazado',
    filtersUrgencyLow: 'Baja',
    filtersUrgencyMedium: 'Media',
    filtersUrgencyHigh: 'Alta',
    filtersUrgencyCritical: 'Crítica',
    filtersApply: 'Aplicar Filtros',
    filtersClear: 'Limpiar Filtros',
  },
  en: {
    settings: 'Settings',
    account: 'Account',
    notifications: 'Notifications',
    language: 'Language',
    appearance: 'Appearance',
    spanish: 'Spanish',
    english: 'English',
    profileTitle: 'User profile',
    profileLoading: 'Loading profile...',
    profileLoadError: 'Error loading profile',
    back: 'Back',
    retry: 'Retry',
    changePasswordTitle: 'Change Password',
    changePasswordSubtitle: 'Update your password securely',
    changePasswordModalTitle: 'Change Password',
    changePasswordModalBody: 'Enter your current password and the new password you want to use.',
    currentPasswordPlaceholder: 'Current password',
    newPasswordPlaceholder: 'New password',
    confirmNewPasswordPlaceholder: 'Confirm new password',
    passwordRequirementsTitle: 'Password requirements:',
    passwordReqLength: 'Between 8 and 16 characters',
    passwordReqUppercase: 'At least one uppercase letter',
    passwordReqNumber: 'At least one number',
    passwordReqNoSpecial: 'Letters and numbers only',
  passwordsMatch: 'Passwords match',
  passwordsDoNotMatch: 'Passwords do not match',
    cancel: 'Cancel',
    change: 'Change',
    deleteAccountTitle: 'Delete Account',
    deleteAccountSubtitle: 'Irreversible action - Contact support to recover',
    deleteAccountConfirmTitle: 'Delete Account?',
    deleteAccountConfirmBody:
      'This action will permanently deactivate your account and is irreversible from the app.\n\nYou will lose access to all your data and will not be able to log in.\n\nTo reactivate, you must contact support directly.',
    deleteAccountSecondTitle: 'Confirm Deletion',
    deleteAccountSecondBody:
      'To confirm permanent deletion of your account, type "ELIMINAR" in the field below:',
    deleteAccountConfirmPlaceholder: 'Type ELIMINAR',
    deleteAccountButton: 'Delete Account',
    continue: 'Continue',
    nameFieldPlaceholder: 'Add your first and last name to complete your profile',
    statsLoading: 'Loading stats...',
    statsRetry: 'Retry',
    statsTitle: 'Activity',
    statsReportsCreated: 'Reports created',
    statsReportsFollowed: 'Reports followed',
    statsVotesReceived: 'Votes received',
    statsVotesMade: 'Votes made',
    editEmailTitle: 'Edit Email',
    editEmailLabel: 'New email',
    editEmailPlaceholder: 'example@mail.com',
    saving: 'Saving...',
    save: 'Save',
    editPhoneTitle: 'Edit Phone',
    editPhoneLabel: 'New phone',
    editPhoneHint: 'Enter only the last 8 digits (prefix +56 9 is added automatically)',
    editPhonePlaceholder: '1234 5678',
    editNameTitle: 'Edit name',
    firstNameLabel: 'First name',
    lastNameLabel: 'Last name',
    welcomeTitle: 'Welcome',
    welcomeRegister: 'Sign up',
    welcomeLogin: 'Log in',
    loginTitle: 'Log in',
    loginHello: 'Hi!',
    loginUserLabel: 'User',
    loginPasswordLabel: 'Password',
    loginForgotPassword: 'Forgot your password?',
    loginSubmitting: 'Signing in...',
    loginSuccess: 'Login successful!',
    loginErrorClose: 'Close',
    loginEmptyFieldsError: 'Please fill in all fields.',
    loginErrorPrefix: 'Error signing in: ',
    loginErrorFallback: 'Check your credentials.',
    // Auth Service messages
    authServiceInvalidCredentials: 'Please check your credentials.',
    authServiceConnectionError: 'Connection error. Check your internet connection.',
    authServiceCodeExpired: 'Invalid or expired code',
    authServiceCodeSent: 'Code sent successfully',
    authServiceCodeVerified: 'Code verified successfully',
    authServicePasswordUpdated: 'Password updated successfully',
    authServiceSendCodeError: 'Error sending code',
    registerTitle: 'Sign up',
    registerHello: 'Hi!',
    registerRutLabel: 'RUT',
    registerUsernameLabel: 'Username',
    registerEmailLabel: 'Email',
    registerPasswordLabel: 'Password',
    registerRepeatPasswordLabel: 'Repeat password',
    registerPhoneLabel: 'Phone',
    registerPhonePrefix: '+569',
    registerHaveAccount: 'I already have an account',
    registerSubmitting: 'Registering user...',
    registerSuccess: 'Registration successful! You will be redirected to login.',
    registerErrorPrefix: 'Registration error: ',
  registerUsernameRequired: 'Username is required',
  registerPhoneInvalid: 'Invalid phone number',
    recoverTitle: 'Recover Password',
    recoverHeaderQuestion: 'Forgot your\npassword?',
    recoverSelectMethod: 'Choose how to find your account',
    recoverMethodRut: 'RUT',
    recoverMethodEmail: 'Email',
    recoverButtonSending: 'Sending...',
    recoverButton: 'Recover',
    recoverSendingCodeTitle: 'Sending code...',
    recoverSendingCodeBody: 'Please wait while we process your request',
    recoverCodeSentTitle: 'Code sent!',
    recoverErrorTitle: 'Error',
    recoverModalUnderstand: 'Got it',
  recoverFieldRequired: 'Please fill in the required field.',
  recoverConnectionError: 'Connection error. Please check your internet connection.',
    verifyTitle: 'Verify Code',
    verifyHeaderTitle: 'Enter the\ncode',
    verifyCodeSentTo: 'Code sent to:',
    verifyCodePlaceholder: '000000',
    verifyCodeHint: 'Enter the 6 digits of the code',
    verifyButtonVerifying: 'Verifying...',
    verifyButton: 'Verify code',
    verifyResendQuestion: 'Didn’t receive the code?',
    verifyResendLink: 'Send again',
    verifyModalVerifyingTitle: 'Verifying code...',
    verifyModalVerifyingBody: 'Please wait while we validate your code',
    verifyModalSuccessTitle: 'Code verified!',
    verifyModalErrorTitle: 'Error',
    verifyModalRetry: 'Retry',
    resetTitle: 'New Password',
    resetHeaderAlmost: 'Almost there!',
    resetInfoTitle: 'Enter your new password',
    resetInfoBody: 'It must meet the security requirements',
    resetNewPasswordLabel: 'New Password',
    resetConfirmPasswordLabel: 'Confirm Password',
    resetButtonUpdating: 'Updating...',
    resetButton: 'Change Password',
    resetModalUpdatingTitle: 'Updating password...',
    resetModalUpdatingBody: 'Please wait while we update your password',
    resetModalSuccessTitle: 'Password updated!',
    resetModalRedirectHint: 'Redirecting to login...',
    resetModalErrorTitle: 'Error',
    resetModalRetry: 'Retry',
    emailPlaceholder: 'userinfracheck@mail.com',
    emailErrorDefault: 'Enter a valid email (e.g., user@domain.com)',
    rutPlaceholder: '12.345.678-k',
    rutErrorDefault: 'Enter a valid RUT (e.g., 12.345.678-9)',
    notFoundTitle: 'Oops!',
    notFoundMessage: "This screen doesn't exist.",
    notFoundGoHome: 'Go to home screen!',
    loading: 'Loading...',
    redirecting: 'Redirecting...',
    userProfileTitle: 'User Profile',
    userProfileOf: 'Profile of',
    gpsPermissionTitle: 'Location Permission',
    gpsPermissionDescription: 'InfraCheck needs access to your location to:',
    gpsLocateReports: 'Locate reports',
    gpsLocateReportsDesc: 'on the map accurately',
    gpsAutoRegister: 'Automatically register',
    gpsAutoRegisterDesc: 'the address of the reported issue',
    gpsShowNearby: 'Show nearby reports',
    gpsShowNearbyDesc: 'to your current location',
    gpsPrivacyNote: '🔒 Your location is only used when you create or view reports. We do not share it with third parties.',
    gpsAllowAccess: 'Allow Access',
    gpsNotNow: 'Not Now',
    projectUntitled: 'Untitled',
    projectUnknownStatus: 'Unknown',
    projectPriorityNormal: 'Normal',
    projectViewDetails: 'View details',
    projectOriginReport: 'Origin report',
    soundNotificationTitle: 'Notification Sounds',
    soundEnabled: 'Enabled',
    soundDisabled: 'Disabled',
    soundTestTitle: 'Test sounds:',
    soundSuccess: 'Success',
    soundError: 'Error',
    soundWarning: 'Warning',
    soundInfo: 'Information',
    soundNotification: 'Notification',
    soundPlay: 'Play',
    systemMetricsTitle: 'System Metrics',
    metricsUsers: 'Users',
    metricsReports: 'Reports',
    metricsUptime: 'Uptime',
    locationPermissionDenied: 'Location permission denied',
    locationPermissionDeniedByUser: 'Location permission denied by user',
    analyticsTitle: 'Analytics',
    analyticsReportTrend: 'Report Trend',
    analyticsReportsByDay: 'Reports per day of the week',
    analyticsVsLastWeek: 'vs Last week',
    analyticsTotalThisWeek: 'Total this week',
    analyticsPeakMax: 'Peak max',
    analyticsMainMetrics: 'Main Metrics',
    analyticsTrends: 'Trends',
    analyticsActiveUsers: 'Active Users',
    analyticsUsersLast24h: 'users in the last 24h',
    analyticsNewReports: 'New Reports',
    analyticsReportsThisWeek: 'reports this week',
    analyticsEngagementRate: 'Engagement Rate',
    analyticsAvgEngagement: 'average engagement',
    analyticsByCategory: 'By Category',
    analyticsCategoryInfra: 'Infrastructure',
    analyticsCategorySecurity: 'Security',
    analyticsCategoryMaintenance: 'Maintenance',
    analyticsCategoryOther: 'Other',
    analyticsReportsLabel: 'Reports',
    dayMon: 'Mon',
    dayTue: 'Tue',
    dayWed: 'Wed',
    dayThu: 'Thu',
    dayFri: 'Fri',
    daySat: 'Sat',
    daySun: 'Sun',
    // Reset Password Screen
    resetPasswordTitle: 'New Password',
    resetPasswordAlmostThere: 'Almost there!',
    resetPasswordInstruction: 'Enter your new password',
    resetPasswordRequirements: 'Must meet security requirements',
    resetPasswordNewLabel: 'New Password',
    resetPasswordConfirmLabel: 'Confirm Password',
    resetPasswordReqLength: 'Between 8 and 16 characters',
    resetPasswordReqUppercase: 'At least one uppercase letter',
    resetPasswordReqNumber: 'At least one number',
    resetPasswordReqNoSpecial: 'Only letters and numbers',
    resetPasswordMatch: '✓ Passwords match',
    resetPasswordNoMatch: '✗ Passwords do not match',
    resetPasswordButton: 'Change Password',
    resetPasswordUpdating: 'Updating...',
    resetPasswordModalUpdating: 'Updating password...',
    resetPasswordModalUpdatingBody: 'Please wait while we update your password',
    resetPasswordModalSuccess: 'Password updated!',
    resetPasswordModalError: 'Error',
    resetPasswordModalRedirecting: 'Redirecting to login...',
    resetPasswordModalRetry: 'Retry',
    resetPasswordErrorEmpty: 'Please fill in all fields.',
    resetPasswordErrorRequirements: 'Password does not meet security requirements.',
    resetPasswordErrorNoMatch: 'Passwords do not match.',
    resetPasswordErrorNoToken: 'Invalid reset token. Please try the process again.',
    // Verify Reset Code Screen
    verifyCodeTitle: 'Verify Code',
    verifyCodeEnterCode: 'Enter the\ncode',
    verifyCodeInstruction: 'Enter the 6-digit code',
    verifyCodeButton: 'Verify Code',
    verifyCodeVerifying: 'Verifying...',
    verifyCodeNoReceived: "Didn't receive the code?",
    verifyCodeResend: 'Resend',
    verifyCodeModalVerifying: 'Verifying code...',
    verifyCodeModalVerifyingBody: 'Please wait while we validate your code',
    verifyCodeModalSuccess: 'Code verified!',
    verifyCodeModalError: 'Error',
    verifyCodeModalRetry: 'Retry',
    verifyCodeErrorInvalid: 'Enter a valid 6-digit code',
    // Comments Modal
    commentsTitle: 'Comments',
    commentsLoading: 'Loading comments...',
    commentsEmpty: 'No comments yet.\nBe the first to comment!',
    commentsPlaceholder: 'Write a comment...',
    commentsYouLabel: 'You',
    commentsDeleteTitle: 'Delete comment',
    commentsDeleteMessage: 'Are you sure you want to delete this comment from',
    commentsDeleteCancel: 'Cancel',
    commentsDeleteConfirm: 'Delete',
    commentsCharCount: '/1000',
    commentsErrorLogin: 'You must be logged in',
    commentsErrorLoadLogin: 'You must be logged in to view comments',
    commentsErrorLoad: 'Error loading comments',
    commentsErrorTooLong: 'Comment cannot exceed 1000 characters',
    commentsErrorPublishLogin: 'You must be logged in to comment',
    commentsErrorPublish: 'Error publishing comment',
    commentsErrorDeleteLogin: 'You must be logged in to delete comments',
    commentsErrorDelete: 'Error deleting comment',
    commentsSuccessPublished: 'Comment published!',
    commentsSuccessDeleted: 'Comment deleted',
    // Home - Empty States
    emptyFollowedTitle: "You're not following any reports yet",
    emptyFollowedMessage: 'Explore available reports and start following the ones that interest you to receive updates',
    emptyFollowedButton: 'Explore Reports',
    // Home - Followed Reports Placeholder
    followedPlaceholderTitle: 'Followed Reports',
    followedPlaceholderMessage: 'Reports you choose to follow will appear here.\nStay up to date with their progress and updates.',
    followedPlaceholderButton: 'Load Following',
    followedPlaceholderTip: '💡 Tap the "Follow" button on any report\nto add it to your following list',
    // Home - Followed Report Card
    followedCardUnfollowTitle: 'Unfollow',
    followedCardUnfollowMessage: 'Are you sure you want to unfollow this report?',
    followedCardUnfollowCancel: 'Cancel',
    followedCardUnfollowConfirm: 'Unfollow',
    followedCardUnfollowError: 'Could not unfollow report',
    followedCardUrgencyLow: 'Low',
    followedCardUrgencyMedium: 'Medium',
    followedCardUrgencyHigh: 'High',
    followedCardUrgencyCritical: 'Critical',
    followedCardUrgencyUnknown: 'Unknown',
    followedCardStatusNew: 'New',
    followedCardStatusInProgress: 'In Progress',
    followedCardStatusResolved: 'Resolved',
    followedCardStatusRejected: 'Rejected',
    followedCardToday: 'Today',
    followedCardYesterday: 'Yesterday',
    followedCardDaysAgo: 'days',
    followedCardWeeksAgo: 'weeks',
    // Home - Category Filter
    categoryFilterAll: 'All',
    categoryInfrastructure: 'Infrastructure',
    categorySignage: 'Signage',
    categoryLighting: 'Lighting',
    categoryCleaning: 'Cleaning',
    categoryGreenAreas: 'Green Areas',
    categoryPublicServices: 'Public Services',
    // Home - Admin Content
    adminSystemStatus: 'System Status',
    adminUserManagement: 'User Management',
    adminNewRegistrationsToday: 'New Registrations Today',
    adminNewUsers: 'new users',
    adminActiveUsers: 'Active Users',
    adminActiveUsersLast24h: 'in the last 24h',
    adminStable: 'Stable',
    adminControlPanel: 'Control Panel',
    adminManageUsers: 'Manage Users',
    adminAnalytics: 'Analytics',
    adminCreateNotification: 'Create Notification',
    // Home - Admin Drawer Menu
    adminDrawerMenuTitle: 'Admin Menu',
    adminDrawerMenuProfileTap: 'Tap to view profile',
    adminDrawerMenuHome: 'Home',
    adminDrawerMenuMap: 'Map',
    adminDrawerMenuSettings: 'Settings',
    adminDrawerMenuLogout: 'Logout',
    // List Report
    listReportTitle: 'Reports List',
    listReportSearchPlaceholder: 'Search reports...',
    listReportSearching: 'Searching:',
    listReportResult: 'result',
    listReportResults: 'results',
    listReportFilters: 'Filters',
    listReportClearFilters: 'Clear',
    listReportStatus: 'Status',
    listReportUrgency: 'Urgency',
    listReportSort: 'Sort',
    listReportAllStatuses: 'All statuses',
    listReportAllUrgencies: 'All urgencies',
    listReportSortBy: 'Sort by',
    listReportSortByUrgency: 'Most urgent',
    listReportSortByRecent: 'Most recent',
    listReportSortByStatus: 'By status',
    listReportReportsCount: 'Reports ({count})',
    listReportLoading: 'Loading reports...',
    listReportNoResults: 'No reports found with the applied filters',
    listReportClearFiltersButton: 'Clear filters',
    listReportLoadMore: 'Load more reports',
    listReportFilterByStatus: 'Filter by status',
    listReportUrgencyLevel: 'Urgency level',
    listReportCategory: 'Category',
    listReportType: 'Type',
    listReportAllTypes: 'All types',
    listReportTypeOfComplaint: 'Type of complaint',
    listReportSortByOldest: 'Oldest',
    listReportSortByVotes: 'Most voted',
    listReportPage: 'Page',
    listReportOf: 'of',
    listReportPrevious: 'Previous',
    listReportNext: 'Next',
    listReportRetry: 'Retry',
    // Map
    mapFiltersTitle: 'Filters',
    mapCategoriesTitle: 'Categories',
    mapZoomToSee: 'Zoom in to see reports',
    mapCategoryLabel: 'Category',
    mapLocationLabel: 'Location',
    mapCategoryNotAvailable: 'Category not available',
    // Pin Details Modal
    pinDetailsTitle: 'Report details',
    pinDetailsCategory: 'Category',
    pinDetailsDescription: 'Description',
    pinDetailsBasicInfo: 'Basic information',
    pinDetailsDate: 'Date',
    pinDetailsTime: 'Time',
    pinDetailsUrgency: 'Urgency',
    pinDetailsLocation: 'Location',
    pinDetailsLatitude: 'Latitude',
    pinDetailsLongitude: 'Longitude',
    pinDetailsAddress: 'Address',
    pinDetailsEvidence: 'Photographic evidence',
    pinDetailsLoading: 'Loading details...',
    pinDetailsNoDetails: 'No details available',
    pinDetailsLoadingImage: 'Loading image...',
    pinDetailsImageNotAvailable: 'Image not available',
    pinDetailsDateNotAvailable: 'Date not available',
    pinDetailsTimeNotAvailable: 'Time not available',
    // Home - Client Content
    homeLoadingReports: 'Loading reports...',
    homeNoReportsAvailable: 'No reports available',
    homeSwipeToRefresh: 'Swipe down to refresh',
    homeErrorLoadMore: 'Error loading more reports',
    homeAllReportsViewed: 'You have viewed all reports',
    homeLoadingMore: 'Loading more reports...',
    homeLoadMoreButton: 'Load more reports',
    homeErrorLoadReports: 'Error loading reports',
    homeErrorConnection: 'There was a problem connecting to the server. Please check your internet connection.',
    homeLocationTitle: 'Report Location',
    homeLocationAddress: 'Address',
    // Home - Auth Content
    homeCriticalReportsTitle: 'Critical Reports',
    homeNoCriticalReports: 'No critical reports pending',
    // Notifications - Create Screen
    notifyCreateTitle: 'Create Notification',
    notifyCreateSubtitle: 'Admin Panel',
    notifyInfoTitle: 'Information',
    notifyInfoBody: 'This function allows you to create test notifications for any user in the system.',
    notifyUserIdLabel: 'User RUT or ID',
    notifyUserIdPlaceholder: 'Ex: 12345678-9 or 5',
    notifyUserIdHint: 'You can enter the RUT (with or without hyphen) or the numeric ID',
    notifyTitleLabel: 'Title',
    notifyTitlePlaceholder: 'Ex: Important update',
    notifyTitleCharCount: '{count}/200 characters',
    notifyMessageLabel: 'Message',
    notifyMessagePlaceholder: 'Write the notification message...',
    notifyTypeLabel: 'Notification Type',
    notifyTypeInfo: 'Information',
    notifyTypeSuccess: 'Success',
    notifyTypeWarning: 'Warning',
    notifyTypeError: 'Error',
    notifyReportIdLabel: 'Report ID (Optional)',
    notifyReportIdPlaceholder: 'Ex: 123',
    notifyReportIdHint: 'If the notification is related to a specific report',
    notifyButtonCancel: 'Cancel',
    notifyButtonCreate: 'Create Notification',
    notifyErrorUserRequired: 'You must enter the user RUT or ID',
    notifyErrorTitleRequired: 'You must enter a title',
    notifyErrorMessageRequired: 'You must enter a message',
    notifySuccessTitle: 'Success',
    notifySuccessMessage: 'Notification created successfully',
    notifySuccessCreateAnother: 'Create another',
    notifySuccessGoBack: 'Go back',
    notifyErrorTitle: 'Error',
    notifyErrorDefault: 'Could not create notification',
    // Notifications - List Screen
    notifyListTitle: 'Notifications',
    notifyListLoading: 'Loading notifications...',
    notifyListUnreadCount: 'You have {count} unread notification(s)',
    notifyListEmpty: 'You have no notifications',
    // Profile - Edit Modals
    profileEditNameError: 'Incomplete data',
    profileEditNameErrorBody: 'Please enter first and last name.',
    profileEditEmailErrorEmpty: 'Email cannot be empty',
    profileEditEmailErrorInvalid: 'Please enter a valid email',
    profileEditPhoneErrorEmpty: 'Phone number cannot be empty',
    profileEditPhoneErrorInvalid: 'Please enter 8 digits for the mobile number',
    // Profile - Delete Account
    profileDeleteErrorConfirm: 'You must type "ELIMINAR" exactly to confirm',
    profileDeleteSuccessTitle: 'Account Deleted',
    profileDeleteErrorTitle: 'Error',
    profileDeleteErrorConnection: 'Connection error. Please try again.',
    // Profile - Change Password
    profilePasswordErrorAllFields: 'All fields are required',
    profilePasswordErrorMismatch: 'The new password and its confirmation do not match',
    profilePasswordErrorRequirements: 'The password does not meet security requirements',
    profilePasswordSuccessTitle: 'Password Changed',
    profilePasswordErrorTitle: 'Error',
    profilePasswordErrorConnection: 'Connection error. Please try again.',
    // Profile - Public Profile
    profileQRCodeLabel: 'QR Code',
    profilePhoneLabel: 'Phone',
    profileSettingsAccessibility: 'Settings',
    // Posts - Report Card
    postsFollowToast: 'You are now following this report!',
    postsUnfollowToast: 'You unfollowed this report',
    postsFollowing: 'Following',
    postsFollow: 'Follow',
    postsShare: 'Share',
    postsImageError: 'Error loading image',
    postsNoImage: 'No image',
    // Home - Followed Report Card
    homeCardUrgencyLow: 'Low',
    homeCardUrgencyMedium: 'Medium',
    homeCardUrgencyHigh: 'High',
    homeCardUrgencyCritical: 'Critical',
    homeCardUrgencyUnknown: 'Unknown',
    homeCardStatusNew: 'New',
    homeCardStatusInProgress: 'In Progress',
    homeCardStatusResolved: 'Resolved',
    homeCardStatusRejected: 'Rejected',
    homeCardDateToday: 'Today',
    homeCardDateYesterday: 'Yesterday',
    homeCardDateDaysAgo: '{days} days ago',
    homeCardDateWeeksAgo: '{weeks} weeks ago',
    homeCardUnfollowTitle: 'Unfollow',
    homeCardUnfollowMessage: 'Are you sure you want to unfollow this report?',
    homeCardUnfollowCancel: 'Cancel',
    homeCardUnfollowConfirm: 'Unfollow',
    homeCardUnfollowError: 'Error',
    homeCardUnfollowErrorMessage: 'Could not unfollow the report',
    homeCardCategoryLabel: 'Category:',
    // Report - Form
    reportFormTitlePlaceholder: 'Title',
    reportFormDescriptionPlaceholder: 'Problem description',
    reportFormMediaTitle: 'Media',
    reportFormLocationTitle: 'Location',
    reportFormConfigTitle: 'Configuration',
    reportFormPublicToggleLabel: 'Public report',
    reportFormTypePlaceholder: 'Select report type',
    reportFormType1: 'Roads and Sidewalks in Poor Condition',
    reportFormType2: 'Damaged Street Lighting',
    reportFormType3: 'Drainage or Standing Water',
    reportFormType6: 'Emergencies or Risk Situations',
    reportFormType7: 'Damaged Public Infrastructure or Furniture',
    reportFormCityPlaceholder: 'Select City',
    reportFormSelectCity: 'Select a city',
    reportFormSelectLocation: 'Select on map',
    reportFormAddressPlaceholder: 'Address',
    reportFormPublicLabel: 'Publish',
    reportFormPublicDescription: 'Your report will be visible to other users',
    reportFormPrivateDescription: 'Your report will be private',
    reportFormMapTitle: 'Select Problem Location',
    // Report - Create Screen
    reportCreateErrorAuth: 'You must log in to create a report',
    reportCreateSuccessTitle: 'Report Created',
    reportCreateSuccessMessage: 'Your report has been sent successfully',
    reportCreateDiscardTitle: 'Discard Changes',
    reportCreateDiscardMessage: 'Are you sure you want to exit? Unsaved changes will be lost',
    reportCreateDiscardCancel: 'Cancel',
    reportCreateDiscardConfirm: 'Exit',
    reportCreateSubmittingTitle: 'Report in progress',
    reportCreateSubmittingMessage: 'The report is being sent. Do you want to cancel?',
    reportCreateSubmittingContinue: 'Continue sending',
    reportCreateSubmittingCancel: 'Cancel sending',
    reportCreatePreviewTitle: 'Report Preview',
    reportCreateProcessing: 'Processing...',
    reportCreateScreenTitle: 'New Report',
    reportCreateInfoTitle: 'Important Information:',
    reportCreateInfoConfidential: 'Your personal information will be kept confidential',
    reportCreateInfoReviewTime: 'The report will be reviewed within 24-48 hours',
    reportCreateInfoNotifications: 'You will receive notifications about the status of your report',
    reportCreateInfoEmergencies: 'For emergencies, contact local emergency services directly',
    reportCreateEditModeTitle: 'Edit Mode',
    reportCreateEditModeMessage: 'You can modify the report data. Changes will be saved automatically.',
    reportCreateEditModeUnderstand: 'Understood',
    // Report - Camera/Media
    reportMediaPermissionsTitle: 'Permissions required',
    reportMediaPermissionsMessage: 'Camera and gallery permissions are required',
    reportMediaLimitImages: 'You can only add up to {max} images',
    reportMediaLimitVideo: 'You can only add one video',
    reportMediaErrorPhoto: 'Could not take photo',
    reportMediaErrorImage: 'Could not select image',
    reportMediaErrorVideo: 'Could not select video',
    reportMediaAddImage: 'Add Image',
    reportMediaAddVideo: 'Add Video',
    reportMediaTakePhoto: 'Take photo',
    reportMediaSelectGallery: 'Select from gallery',
    reportMediaRecordVideo: 'Record video',
    // Report - Validation
    reportValidationTitle: 'Title is required',
    reportValidationDescription: 'Description is required',
    reportValidationAddress: 'Address is required',
    reportValidationType: 'Select a report type',
    reportValidationUrgency: 'Select an urgency level',
    reportValidationCity: 'Select a city',
    reportValidationLocation: 'Select a location on the map',
    reportValidationFormError: 'Please verify form data',
    reportValidationFilesError: 'Files are too large',
    reportValidationNetworkError: 'Connection error. Check your internet connection',
    reportValidationUnexpectedError: 'An unexpected error occurred',
    // Report - Details
    reportDetailsNotFound: 'Report not found',
    reportDetailsError: 'Could not load report',
    // Report - Preview
    reportPreviewTitle: 'Preview',
    reportPreviewType: 'Type:',
    reportPreviewUrgency: 'Urgency:',
    reportPreviewCity: 'City:',
    reportPreviewPublic: 'Public',
    reportPreviewPrivate: 'Private',
    reportPreviewLocation: 'Location',
    reportPreviewNoAddress: 'No address specified',
    reportPreviewImages: 'Images',
    reportPreviewVideo: 'Video',
    reportPreviewVideoAttached: 'Video attached',
    reportPreviewSending: 'Sending report... Do not close the app.',
    reportPreviewEdit: 'Edit',
    reportPreviewConfirmSend: 'Confirm and Send',
    reportPreviewConfirmTitle: 'Confirm submission',
    reportPreviewConfirmMessage: 'Are you sure you want to submit this report? Once submitted, you won\'t be able to modify it.',
    reportPreviewConfirmReview: 'Review',
    reportPreviewConfirmButton: 'Send',
    reportPreviewCloseTitle: 'Report in progress',
    reportPreviewCloseMessage: 'The report is being sent. Are you sure you want to cancel?',
    reportPreviewCloseContinue: 'Continue',
    reportPreviewCloseCancel: 'Cancel',
    reportPreviewEditDisabledTitle: 'Not available',
    reportPreviewEditDisabledMessage: 'Cannot edit while the report is being sent.',
    reportPreviewNotSelected: 'Not selected',
    // Report - Followed screen
    reportFollowedLoading: 'Loading reports...',
    reportFollowedTitle: 'Followed Reports',
    reportFollowedEmptyTitle: "You don't follow any reports yet",
    reportFollowedEmptySubtitle: 'Start following reports to see them here',
    reportFollowedError: 'Error loading reports',
    reportFollowedUnfollowTitle: 'Unfollow',
    reportFollowedUnfollowMessage: 'Are you sure you want to unfollow "{title}"?',
    reportFollowedUnfollowButton: 'Unfollow',
    reportFollowedUnfollowError: 'Could not unfollow report',
    reportFollowedUnfollowSuccess: 'You have unfollowed the report',
    reportFollowedUnknownUser: 'Unknown user',
    reportFollowedUnfollowLabel: 'Unfollow',
    reportFollowedTimeNow: 'Now',
    // Report - Service errors
    reportServiceSessionExpired: 'Session expired. Please log in again.',
    reportServiceInvalidUrgency: 'Invalid urgency value',
    reportServiceInvalidType: 'Invalid report type',
    reportServiceInvalidCity: 'Invalid city',
    reportServiceSuccess: 'Report created successfully',
    reportServiceErrorCreate: 'There was an error creating the report',
    reportServiceTimeoutLoadMore: 'Could not load more reports. Check your connection.',
    reportServiceErrorLoadMore: 'Error loading more reports. Tap to retry.',
    // Report - Map
    reportMapSelectTitle: 'Select Location',
    reportMapViewTitle: 'Location',
    reportMapLocationError: 'Could not get current location',
    reportMapInstruction: 'Tap on the map to place the marker or drag the marker to move it',
    reportMapViewInstruction: 'Location on map',
    reportMapSelectedLabel: 'Selected location:',
    reportMapLocationLabel: 'Location:',
    reportMapConfirm: 'Confirm Location',
    reportMapCancel: 'Cancel',
    reportMapClose: 'Close',
    // Report - Details hooks
    reportDetailsLoadError: 'Could not load report',
    reportDetailsLoadErrorMessage: 'Error loading report',
    reportDetailsInvalidDate: 'Invalid date',
    reportDetailsUnknownError: 'Unknown error loading reports',
    // Report - Details Screen
    reportDetailsIdRequired: 'Report ID required',
    reportDetailsIdRequiredMessage: 'No valid report ID was provided',
    reportDetailsLoading: 'Loading report...',
    reportDetailsIdLabel: 'Report ID',
    reportDetailsRetry: 'Retry',
    reportDetailsBack: 'Back',
    reportDetailsTitle: 'Report Details',
    // Report - Media Section
    reportMediaSectionImage: 'Image',
    reportMediaSectionVideo: 'Video',
    reportMediaSectionImagesSelected: 'Selected images:',
    reportMediaSectionVideoSelected: 'Selected video:',
    reportMediaSectionVideoLabel: 'Video',
    reportMediaSectionMaxImages: 'Maximum 5 images',
    reportMediaSectionRemaining: 'remaining',
    reportMediaSectionMaxVideo: 'Maximum 1 video of 60 seconds',
    // Report - Urgency Selector
    reportUrgencyTitle: 'Urgency Level',
    reportUrgencyLow: 'Low',
    reportUrgencyMedium: 'Medium',
    reportUrgencyHigh: 'High',
    reportUrgencyCritical: 'Critical',
    // Projects - Card
    projectCardNoTitle: 'No title',
    projectCardStatusUnknown: 'Unknown',
    projectCardStatusPlanning: 'Planning',
    projectCardStatusInProgress: 'In Progress',
    projectCardStatusCompleted: 'Completed',
    projectCardPriorityImportant: 'Important',
    projectCardPriorityUrgent: 'Urgent',
    // Profile - Public Profile Additional
    profileInfoTitle: 'Information',
    profileFollowSuccess: 'You are now following this user',
    profileUnfollowSuccess: 'You have unfollowed this user',
    profileUserLabel: 'User',
    profileQRViewLabel: 'View user QR code',
    profileEmailLabel: 'Email',
    profileEmailNotPublic: 'Not publicly available',
    profilePhoneNotPublic: 'Not publicly available',
    // Profile - UserInfo Toasts
    profileEmailUpdateSuccess: 'Your email has been successfully updated',
    profileEmailUpdateError: 'Could not update email',
    profilePhoneUpdateSuccess: 'Your phone has been successfully updated',
    profilePhoneUpdateError: 'Could not update phone',
    profileNameUpdateSuccess: 'Your name and surname have been successfully updated',
    profileNameUpdateError: 'Could not update name',
    profileChangePasswordComingSoon: 'This functionality will be available soon',
    // Home - Client Drawer Menu
    drawerMenuTitle: 'Menu',
    drawerLoading: 'Loading...',
    drawerUser: 'User',
    drawerEmail: 'email@example.com',
    drawerTapToProfile: 'Tap to view profile',
    drawerHome: 'Home',
    drawerMap: 'Map',
    drawerSettings: 'Settings',
    drawerLogout: 'Logout',
    drawerFilters: 'Advanced Filters',
    drawerAdminMenuTitle: 'Admin Menu',
    drawerAdminUser: 'Admin User',
    drawerAdminEmail: 'admin@infracheck.com',
    // Header
    headerOpenMenu: 'Open menu',
    headerSearch: 'Search',
    headerAdminPanel: 'Panel - Admin',
    headerProfile: 'Profile',
    // Drawer Auth
    drawerAuthMenuTitle: 'Authority Menu',
    drawerAuthUser: 'Authority User',
    drawerAuthEmail: 'authority@infracheck.com',
    // Search
    searchTitle: 'Search Posts',
    searchPlaceholder: 'Search by title...',
    searchNoResults: 'No results found',
    searchBy: 'By',
    searchCommentsSingular: 'comment',
    searchCommentsPlural: 'comments',
    // Statistics
    statisticsTitle: 'Global Statistics',
    statisticsLastUpdate: 'Last update',
    statisticsRefreshing: 'Refreshing...',
    statisticsGlobalMetrics: 'Global Metrics',
    statisticsTotalReports: 'Total Reports',
    statisticsNewReports: 'New',
    statisticsInProgress: 'In Progress',
    statisticsResolved: 'Resolved',
    statisticsRejected: 'Rejected',
    statisticsTotalProjects: 'Total Projects',
    statisticsActiveProjects: 'Active',
    statisticsDistributionByStatus: 'Distribution by Status',
    statisticsDistributionByUrgency: 'Distribution by Urgency',
    statisticsTopProblems: 'Top Problems',
    statisticsTemporalEvolution: 'Temporal Evolution',
    statisticsTopProjects: 'Top 5 Projects',
    statisticsInsights: 'System Insights',
    statisticsViewProject: 'View Project',
    statisticsMonthly: 'Monthly reports',
    statisticsGrowth: 'Growth',
    statisticsNoData: 'No data',
    statisticsLocation: 'Location',
    statisticsTimeNow: 'Just now',
    statisticsTimeMinutes: 'min',
    statisticsTimeHours: 'h',
    statisticsTimeYesterday: 'Yesterday',
    statisticsTimeDays: 'days',
    statisticsTimeWeeks: 'weeks',
    // Users
    usersTitle: 'User Management',
    usersSearchPlaceholder: 'Search by name, email or nickname...',
    usersAddNew: 'New User',
    usersLoading: 'Loading users...',
    usersError: 'Error loading users',
    usersEmpty: 'No registered users',
    usersRoleUser: 'User',
    usersRoleAdmin: 'Administrator',
    usersRoleMunicipal: 'Municipal',
    usersRoleUnknown: 'Unknown',
    usersStatusEnabled: 'Enabled',
    usersStatusDisabled: 'Disabled',
    usersConfirmToggle: 'Confirm change',
    usersConfirmEnable: 'Are you sure you want to enable {user}?',
    usersConfirmDisable: 'Are you sure you want to disable {user}?',
    usersCancel: 'Cancel',
    usersConfirm: 'Confirm',
    usersErrorUpdate: 'Unexpected error updating status',
    usersAccessDenied: 'Access denied',
    usersAccessDeniedMessage: 'You don\'t have permission to access this section. Only administrators can manage users.',
    usersUnderstood: 'Understood',
    usersConnectivityOk: 'Connectivity OK',
    usersConnectivityError: 'Connectivity Error',
    usersRetry: 'Retry',
    usersTestConnection: 'Test Connection',
    usersVerifyAuth: 'Verify Auth',
    usersErrorLoad: 'Error loading users',
    usersErrorUnexpected: 'Unexpected error loading users',
    // Users Add Modal
    usersAddTitle: 'Add New User',
    usersAddRut: 'RUT',
    usersAddRutPlaceholder: 'Ex: 12.345.678-9',
    usersAddName: 'Name',
    usersAddNamePlaceholder: 'Enter name',
    usersAddLastName: 'Last Name',
    usersAddLastNamePlaceholder: 'Enter last name',
    usersAddNickname: 'Nickname',
    usersAddNicknamePlaceholder: 'Enter nickname',
    usersAddEmail: 'Email',
    usersAddEmailPlaceholder: 'example@email.com',
    usersAddPassword: 'Password',
    usersAddPhone: 'Phone',
    usersAddPhonePlaceholder: '+56 9 1234 5678',
    usersAddRole: 'User Role',
    usersAddRoleClient: 'Client',
    usersAddRoleAdmin: 'Administrator',
    usersAddRoleAuthority: 'Authority',
    usersAddPhoto: 'Profile Photo (Optional)',
    usersAddSubmit: 'Add User',
    usersAddErrorRutRequired: 'RUT is required',
    usersAddErrorRutInvalid: 'Invalid RUT format (ex: 12.345.678-9)',
    usersAddErrorNameRequired: 'Name is required',
    usersAddErrorLastNameRequired: 'Last name is required',
    usersAddErrorNicknameRequired: 'Nickname is required',
    usersAddErrorEmailRequired: 'Email is required',
    usersAddErrorEmailInvalid: 'Invalid email',
    usersAddErrorPasswordRequired: 'Password is required',
    usersAddErrorPasswordLength: 'Password must be at least 6 characters',
    usersAddErrorPhoneRequired: 'Phone is required',
    usersAddErrorPhoneInvalid: 'Phone must have 8-9 digits',
    usersAddPermissionsTitle: 'Permissions needed',
    usersAddPermissionsMessage: 'Camera and gallery permissions are needed to select a profile photo',
    // Home - Client Content
    homeTabAll: 'All',
    homeTabFollowed: 'Followed',
    homeFollowLabel: 'Follow',
    homeFollowingLabel: 'Following ✓',
    homeShareTitle: 'Share Report',
    homeReportContentTitle: 'Report Content',
    homeReportContentMessage: 'Do you want to report the content "{title}"?',
    homeReportContentReported: 'Content has been successfully reported.',
    homeNavigationMaps: 'Opening in Google Maps...',
    homeShareMessage: 'Check out this report: "{title}" - ID: {id}',
    homeReportButton: 'Report',
    homeReportedTitle: 'Reported',
    homeReportedMessage: 'Content has been reported successfully.',
    homeNavigationTitle: 'Navigation',
    homeViewOnMap: 'View on Map',
    // Home - Filters Modal
    filtersTitle: 'Advanced Filters',
    filtersCategory: 'Category',
    filtersStatus: 'Status',
    filtersStatusAll: 'All',
    filtersStatusNew: 'New',
    filtersStatusInProgress: 'In Progress',
    filtersStatusResolved: 'Resolved',
    filtersStatusRejected: 'Rejected',
    filtersUrgency: 'Urgency',
    filtersAll: 'All',
    filtersNew: 'New',
    filtersInProgress: 'In Progress',
    filtersResolved: 'Resolved',
    filtersRejected: 'Rejected',
    filtersUrgencyLow: 'Low',
    filtersUrgencyMedium: 'Medium',
    filtersUrgencyHigh: 'High',
    filtersUrgencyCritical: 'Critical',
    filtersApply: 'Apply Filters',
    filtersClear: 'Clear Filters',
  },
};

export interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: keyof typeof TRANSLATIONS['es']) => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<Locale>('es');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved === 'es' || saved === 'en') {
          setLocaleState(saved);
        }
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const setLocale = (next: Locale) => {
    setLocaleState(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
  };

  const value = useMemo<LanguageContextValue>(() => {
    const dict = TRANSLATIONS[locale];
    return {
      locale,
      setLocale,
      t: (key) => dict[key],
    };
  }, [locale]);

  if (!ready) {
    // Podrías mostrar un loader global aquí si quisieras.
    return null;
  }

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextValue => {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
};
