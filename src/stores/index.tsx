import { Component, createContext, useContext } from 'solid-js';
import { createStore } from 'solid-js/store';
import { Viewport } from 'solid-map-gl';

interface StoreParameters {
  locationsId: number | undefined;
  mapParameter: string;
  listsId: number | undefined;
  listLocationsId: number | undefined;
  listParametersId: number | undefined;
  listParameter: string | undefined;
  deleteListModalOpen: boolean;
  deleteListLocationModalOpen: boolean;
  newListModalOpen: boolean;
  editListModalOpen: boolean;
  deleteLocationModalOpen: boolean;
  showProvidersCard: boolean;
  viewport: Viewport;
  showAirSensors: boolean;
  showMonitors: boolean;
  showOnlyActiveLocations: boolean;
  totalProviders: number;
  providers: any[];
  recentMeasurements: any[];
  toastOpen: boolean;
  apiKeyRegenerateModalOpen: boolean;
  passwordChangeModalOpen: boolean;
  bounds: number[];
  mapBbox: number[];
  showNotificationCard: boolean;
  showHelpCard: boolean;
  helpContent: string;
  // Environmental overlay controls
  showAirQualityOverlay: boolean;
  airQualityOpacity: number;
  // Air quality data point overlay
  selectedAirQualityPoint: any | null;
  showAirQualityDetails: boolean;
  // Map pin functionality
  mapPin: { latitude: number; longitude: number } | null;
  showMapPinDetails: boolean;
}

type Store = [
  StoreParameters,
  {
    setSelectedLocationsId: (locationsId: number) => void;
    clearLocationsId: () => void;
    setSelectedMapParameter: (mapParameter: string) => void;
    setDeleteListsId: (listsId: number) => void;
    setDeleteListLocationsId: (listLocationsId: number) => void;
    setListParametersId: (parametersId: number) => void;
    setListParameter: (parameter: string) => void;
    clearDeleteListsId: () => void;
    toggleDeleteListModalOpen: () => void;
    toggleNewListModalOpen: () => void;
    toggleEditListModalOpen: () => void;
    toggleShowProvidersCard: () => void;
    toggleRegenerateKeyModalOpen: () => void;
    toggleDeleteListLocationModalOpen: () => void;
    setViewport: (viewport: Viewport) => void;
    toggleMonitor: () => void;
    toggleAirSensor: () => void;
    toggleMapIsActive: () => void;
    setProviders: (providers: any[]) => void;
    setRecentMeasurements: (measurements: any[]) => void;
    addRecentMeasurements: (measurements: any) => void;
    updateRecentMeasurements: (parameter: string, measurements: any) => void;
    setTotalProviders: (totalProviders: number) => void;
    openToast: () => void;
    setBounds: (bounds: number[]) => void;
    setMapBbox: (mapBbox: number[]) => void;
    toggleShowNotificationCard: (value: boolean) => void;
    toggleShowHelpCard: (value: boolean) => void;
    setHelpContent: (content: string) => void;
    // Environmental overlay actions
    toggleAirQualityOverlay: () => void;
    setAirQualityOpacity: (opacity: number) => void;
    // Air quality data point actions
    setSelectedAirQualityPoint: (point: any | null) => void;
    toggleAirQualityDetails: (show?: boolean) => void;
    // Map pin actions
    setMapPin: (pin: { latitude: number; longitude: number } | null) => void;
    toggleMapPinDetails: (show?: boolean) => void;
  },
];

const StoreContext = createContext<Store>();

export const StoreProvider: Component<{ children: any }> = (props) => {
  const [state, setState] = createStore<StoreParameters>({
    locationsId: undefined,
    mapParameter: 'all',
    listsId: undefined,
    listLocationsId: undefined,
    listParametersId: undefined,
    listParameter: undefined,
    newListModalOpen: false,
    deleteListModalOpen: false,
    deleteLocationModalOpen: false,
    deleteListLocationModalOpen: false,
    editListModalOpen: false,
    showProvidersCard: false,
    viewport: {
      zoom: 1.2,
      center: [40, 20],
    } as Viewport,
    showOnlyActiveLocations: true,
    showAirSensors: true,
    showMonitors: true,
    totalProviders: 0,
    providers: [] as any[],
    recentMeasurements: [] as any[],
    toastOpen: false,
    apiKeyRegenerateModalOpen: false,
    passwordChangeModalOpen: false,
    bounds: [] as number[],
    mapBbox: [] as number[],
    showNotificationCard: false,
    showHelpCard: false,
    helpContent: '',
    // Environmental overlay initial state
    showAirQualityOverlay: false,
    airQualityOpacity: 0.7,
    // Air quality data point overlay
    selectedAirQualityPoint: null,
    showAirQualityDetails: false,
    // Map pin functionality
    mapPin: null,
    showMapPinDetails: false,
  });

  const store = [
    state,
    {
      setSelectedLocationsId(locationsId: number) {
        setState({ locationsId: locationsId });
      },
      setBounds(bounds: number[]) {
        setState({ bounds: bounds });
      },
      setMapBbox(mapBbox: number[]) {
        setState({ mapBbox: mapBbox });
      },
      clearLocationsId() {
        setState({ locationsId: undefined });
      },
      setSelectedMapParameter(parameter: string) {
        setState({ mapParameter: parameter });
      },
      setDeleteListsId(listsId: number) {
        setState({ listsId: listsId });
      },
      clearDeleteListsId() {
        setState({ listsId: undefined });
      },
      toggleDeleteListModalOpen() {
        setState({ deleteListModalOpen: !state.deleteListModalOpen });
      },
      toggleNewListModalOpen() {
        setState({ newListModalOpen: !state.newListModalOpen });
      },
      toggleEditListModalOpen() {
        setState({ editListModalOpen: !state.editListModalOpen });
      },
      toggleShowProvidersCard() {
        setState({ showProvidersCard: !state.showProvidersCard });
      },
      setViewport(viewport: Viewport) {
        setState({ viewport: viewport });
      },
      toggleMonitor() {
        setState({ showMonitors: !state.showMonitors });
      },
      toggleAirSensor() {
        setState({ showAirSensors: !state.showAirSensors });
      },
      toggleMapIsActive() {
        setState({
          showOnlyActiveLocations: !state.showOnlyActiveLocations,
        });
      },
      setProviders(providers: any[]) {
        setState({ providers: providers });
      },
      setTotalProviders(totalProviders: number) {
        setState({ totalProviders: totalProviders });
      },
      setRecentMeasurements(measurements: any[]) {
        setState({ recentMeasurements: measurements });
      },
      addRecentMeasurements(measurements: any) {
        setState('recentMeasurements', (prevList: any[]) => [
          ...prevList,
          measurements,
        ]);
      },
      updateRecentMeasurements(parameter: string, measurements: any) {
        const idx = state.recentMeasurements.findIndex(
          (p) => p.parameter == parameter
        );
        const p = state.recentMeasurements[idx];
        p.setLoading(false);
        p.setSeries(measurements.series);
      },
      openToast() {
        setState({ toastOpen: true });
        setTimeout(() => setState({ toastOpen: false }), 5000);
      },
      toggleRegenerateKeyModalOpen() {
        setState({
          apiKeyRegenerateModalOpen: !state.apiKeyRegenerateModalOpen,
        });
      },
      toggleDeleteListLocationModalOpen() {
        setState({
          deleteListLocationModalOpen: !state.deleteListLocationModalOpen,
        });
      },
      setDeleteListLocationsId(listLocationsId: number) {
        setState({ listLocationsId: listLocationsId });
      },
      setListParametersId(parametersId: number) {
        setState({ listParametersId: parametersId });
      },
      setListParameter(parameter: string) {
        setState({ listParameter: parameter });
      },
      toggleShowNotificationCard(value: boolean) {
        setState({ showNotificationCard: value });
      },
      toggleShowHelpCard(value: boolean) {
        setState({ showHelpCard: value });
      },
      setHelpContent(content: string) {
        setState({ helpContent: content });
      },
      // Environmental overlay actions
      toggleAirQualityOverlay() {
        setState({ showAirQualityOverlay: !state.showAirQualityOverlay });
      },
      setAirQualityOpacity(opacity: number) {
        setState({ airQualityOpacity: opacity });
      },
      // Air quality data point actions
      setSelectedAirQualityPoint(point: any | null) {
        setState({ selectedAirQualityPoint: point });
      },
      toggleAirQualityDetails(show?: boolean) {
        setState({
          showAirQualityDetails:
            show !== undefined ? show : !state.showAirQualityDetails,
        });
      },
      // Map pin actions
      setMapPin(pin: { latitude: number; longitude: number } | null) {
        setState({ mapPin: pin });
      },
      toggleMapPinDetails(show?: boolean) {
        setState({
          showMapPinDetails:
            show !== undefined ? show : !state.showMapPinDetails,
        });
      },
    },
  ];

  return (
    <StoreContext.Provider value={store as Store}>
      {props.children}
    </StoreContext.Provider>
  );
};

function useStoreContext() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStoreContext: cannot find a StoreContext');
  }
  return context;
}

export function useStore(): Store {
  return useStoreContext();
}
