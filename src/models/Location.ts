import {
  CreateLocation,
  DeleteLocation,
  GetLocations,
  UpdateLocation,
} from '@/services/LocationService/LocationService';
import type {
  CreateLocationParam,
  GetLocationParam,
} from '@/services/LocationService/LocationService';
import { Effect, Reducer } from 'umi';
import moment from 'moment';

export type Location = {
  key: string;
  id: string;
  name: string;
  description: string;
  isApprove: boolean;
  longitude: string;
  latitude: string;
  modifyTime?: string;
  modifyBy?: string;
  createBy?: string;
  createTime?: string;
  matchingCode: string;
  isActive: boolean;
  type?: {
    id: string;
    typeName: string;
  };
  typeId: string;
  typeName: string;
  address: string;
  isSelected: boolean;
  totalDevices: number;
};

export type LocationModelState = {
  listLocations?: Location[];
  totalItem?: number;
  locationTableLoading?: boolean;

  selectedLocation?: Location;

  getListLocationParam?: GetLocationParam;

  createLocationParam?: CreateLocationParam;

  addNewLocationModal?: {
    visible: boolean;
    isLoading: boolean;
    addressSearchBoxLoading: boolean;
  };

  editLocationModal?: {
    visible: boolean;
    isLoading: boolean;
  };

  viewLocationDetailComponent?: {
    visible: boolean;
    isLoading: boolean;
  };
  addressSuggestList?: any[];

  mapComponent?: {
    map?: L.Map;
    marker?: L.Marker;
    circle?: L.Circle;
    layer?: L.TileLayer;
  };
};

export type LocationStoreModel = {
  namespace: string;

  state: LocationModelState;

  effects: {
    getListLocation: Effect;
    createLocation: Effect;
    updateLocation: Effect;
    deleteLocation: Effect;
  };

  reducers: {
    setListLocationsReducer: Reducer<LocationModelState>;
    setGetListLocationParamReducer: Reducer<LocationModelState>;

    setTotalItemReducer: Reducer<LocationModelState>;
    setLocationTableLoadingReducer: Reducer<LocationModelState>;
    setSelectedLocationReducer: Reducer<LocationModelState>;
    clearSelectedLocationReducer: Reducer<LocationModelState>; //

    setCreateLocationParamReducer: Reducer<LocationModelState>;
    clearCreateLocationParamReducer: Reducer<LocationModelState>;

    setAddNewLocationModalReducer: Reducer<LocationModelState>;

    setEditLocationModalReduder: Reducer<LocationModelState>;

    setAddressSearchListReducer: Reducer<LocationModelState>;

    setMapComponentReducer: Reducer<LocationModelState>;

    setViewLocationDetailComponentReducer: Reducer<LocationModelState>;
  };
};

const LocationStore: LocationStoreModel = {
  namespace: 'location',

  state: {
    listLocations: [],
    locationTableLoading: false,
    totalItem: 0,
    // selectedLocation: {
    //   key: "",
    //   id: "",
    //   description: "",
    //   isActive: true,
    //   isApprove: false,
    //   latitude: "",
    //   longitude: "",
    //   matchingCode: "",
    //   name: "",
    //   type: {
    //     id: "",
    //     typeName: ""
    //   },
    //   typeName: "",
    //   typeId: "",
    //   address: "",
    //   isSelected: false
    // },

    createLocationParam: {
      description: '',
      latitude: '',
      longitude: '',
      name: '',
      typeId: '',
      address: '',
    },

    getListLocationParam: {
      isDescending: false,
      isPaging: true,
      isSort: false,
      pageLimitItem: 10,
      pageNumber: 0,
    },

    addNewLocationModal: {
      isLoading: false,
      visible: false,
      addressSearchBoxLoading: false,
    },

    editLocationModal: {
      isLoading: false,
      visible: false,
    },

    addressSuggestList: [],

    mapComponent: {
      map: undefined,
      marker: undefined,
      circle: undefined,
      layer: undefined,
    },

    viewLocationDetailComponent: {
      isLoading: false,
      visible: false,
    },
  },

  effects: {
    *getListLocation({ payload }, { call, put }) {
      const { data } = yield call(GetLocations, payload);

      yield put({
        type: 'setListLocationsReducer',
        payload: data.result.data.map((item: any) => {
          return {
            key: item.id,
            ...item,
            typeId: item.type.id,
            typeName: item.type.typeName,
            isSelected: false,
            createTime: moment(data.createTime).format('YYYY-MM-DD'),
          };
        }),
      });

      yield put({
        type: 'setTotalItemReducer',
        payload: data.result.totalItem,
      });

      yield put({
        type: 'setGetListLocationParamReducer',
        payload,
      });
    },

    *createLocation({ payload }, { call }) {
      try {
        return yield call(CreateLocation, payload);
      } catch (error) {
        // console.log('====================================');
        // console.log(error, error.message);
        // console.log('====================================');
        return Promise.reject(error.message);
      }
    },

    *updateLocation({ payload }, { call }) {
      try {
        return yield call(UpdateLocation, payload);
      } catch (error) {
        return Promise.reject(error);
      }
    },

    *deleteLocation({ payload }, { call }) {
      try {
        return yield call(DeleteLocation, payload);
      } catch (error) {
        return Promise.reject(error);
      }
    },
  },

  reducers: {
    setListLocationsReducer(state, { payload }) {
      return {
        ...state,
        listLocations: payload,
      };
    },

    setGetListLocationParamReducer(state, { payload }) {
      return {
        ...state,
        getListLocationParam: {
          ...state?.getListLocationParam,
          ...payload,
        },
      };
    },

    setTotalItemReducer(state, { payload }) {
      return {
        ...state,
        totalItem: payload,
      };
    },

    setLocationTableLoadingReducer(state, { payload }) {
      return {
        ...state,
        locationTableLoading: payload,
      };
    },

    setSelectedLocationReducer(state, { payload }) {
      return {
        ...state,
        selectedLocation: {
          ...state?.selectedLocation,
          ...payload,
        },
      };
    },
    setCreateLocationParamReducer(state, { payload }) {
      return {
        ...state,
        createLocationParam: {
          ...state?.createLocationParam,
          ...payload,
        },
      };
    },

    setAddNewLocationModalReducer(state, { payload }) {
      return {
        ...state,
        addNewLocationModal: {
          ...state?.addNewLocationModal,
          ...payload,
        },
      };
    },

    clearCreateLocationParamReducer(state) {
      return {
        ...state,
        createLocationParam: {
          brandId: '',
          description: '',
          latitude: '',
          longitude: '',
          name: '',
          typeId: '',
          address: '',
        },
      };
    },

    setEditLocationModalReduder(state, { payload }) {
      return {
        ...state,
        editLocationModal: {
          ...state?.editLocationModal,
          ...payload,
        },
      };
    },

    setAddressSearchListReducer(state, { payload }) {
      return {
        ...state,
        addressSuggestList: payload,
      };
    },

    setMapComponentReducer(state, { payload }) {
      return {
        ...state,
        mapComponent: {
          ...state?.mapComponent,
          ...payload,
        },
      };
    },

    clearSelectedLocationReducer(state) {
      return {
        ...state,
        selectedLocation: {
          key: '',
          id: '',
          description: '',
          isActive: true,
          isApprove: false,
          latitude: '',
          longitude: '',
          matchingCode: '',
          name: '',
          type: {
            id: '',
            typeName: '',
          },
          typeName: '',
          typeId: '',

          brand: {
            id: '',
            name: '',
          },

          brandId: '',
          brandName: '',
          address: '',
          isSelected: false,
          totalDevices: 0,
        },
      };
    },

    setViewLocationDetailComponentReducer(state, { payload }) {
      return {
        ...state,
        viewLocationDetailComponent: payload,
      };
    },
  },
};

export default LocationStore;
