import { CAMPAIGN } from '@/pages/Campaign';
import { reverseGeocoding } from '@/services/MapService/LocationIQService';
import L from 'leaflet';
import * as React from 'react';

import type { CampaignModelState, Dispatch, LocationModelState } from 'umi';
import { connect } from 'umi';
import { LOCATION_DISPATCHER } from '..';
import type { Location } from '@/models/Location';

export type LeafletMapComponentProps = {
  dispatch: Dispatch;
  location: LocationModelState;
  campaign: CampaignModelState;
  disabledClick?: boolean;
  showLocations?: boolean;
  onClick?: (data: any, e: L.LatLng) => any;
};

export class LeafletMapComponent extends React.Component<LeafletMapComponentProps> {
  componentDidMount = () => {
    // if (this.props.location.mapComponent?.map) {
    //   this.props.location.mapComponent.map.eachLayer((l) => {
    //     l.remove();
    //   });
    // }
    const mymap = L.map('mapid');
    console.log('====================================');
    console.log('Map');
    console.log('====================================');
    mymap.setView([10.8414846, 106.8100464], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      // attribution:
      //   'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 18,
      id: 'mapbox/streets-v11',
      tileSize: 512,
      zoomOffset: -1,
    }).addTo(mymap);

    // setTimeout(() => {
    //   mymap.invalidateSize(true);
    // }, 500);
    if (mymap) {
      if (this.props.showLocations) {
        this.handleOnDragEvent(mymap);
      }
      this.setMapComponent({
        map: mymap,
      });
    }
    mymap.on('dragstart', () => {
      if (this.props.showLocations) {
        this.handleOnDragStartEvent(mymap);
      }
    });
    mymap.on('dragend', () => {
      if (this.props.showLocations) {
        this.handleOnDragEvent(mymap);
      }
    });

    mymap.on('zoomstart', () => {
      if (this.props.showLocations) {
        this.handleOnDragStartEvent(mymap);
      }
    });

    mymap.on('zoomend', () => {
      if (this.props.showLocations) {
        this.handleOnDragEvent(mymap);
      }
    });

    mymap.on('click', async (e: any) => {
      // console.log('====================================');
      // console.log('Map Click >>>>', e);
      // console.log('====================================');
      if (this.props.disabledClick !== true) {
        const { mapComponent } = this.props.location;
        // const { addNewCampaignModal } = this.props.campaign;

        mymap.setView([e.latlng.lat, e.latlng.lng]);

        if (mapComponent && mapComponent.map) {
          if (mapComponent.marker !== undefined) {
            // mapComponent.marker.setLatLng(e.latlng);
            // mapComponent.marker.remove();
            // mapComponent.marker.removeFrom(mymap);
            // const marker = L.marker(e.latlng);
            mapComponent.marker.setLatLng(e.latlng);
            // marker.addTo(mymap);
            // this.setMapComponent({
            //   marker,
            // });
          } else {
            const marker = L.marker(e.latlng);
            // const icon = L.icon({
            //   iconUrl: ,
            // });
            marker.addTo(mymap);
            this.setMapComponent({
              marker,
            });
          }
          const { data } = await reverseGeocoding(e.latlng.lat, e.latlng.lng);

          if (this.props.onClick) {
            this.props.onClick(data, e.latlng);
          }

          // if (addNewLocationModal?.visible) {
          //   await this.setCreateLocationParam({
          //     address: data.display_name,
          //     longitude: data.lon,
          //     latitude: data.lat,
          //   });
          // }

          // if (editLocationModal?.visible) {
          //   await this.setSelectedLocation({
          //     address: data.display_name,
          //     longitude: data.lon,
          //     latitude: data.lat,
          //   });
          // }

          // if (addNewCampaignModal?.visible) {
          // const { createCampaignParam } = this.props.campaign;

          // if (createCampaignParam && createCampaignParam.radius > 0) {
          //   if (mapComponent.map) {
          //     if (!mapComponent.circle && createCampaignParam.radius !== 0) {
          //       const circle = L.circle(e.latlng, {
          //         radius: createCampaignParam.radius,
          //       });
          //       circle.addTo(mapComponent.map);
          //       await this.setMapComponent({
          //         circle,
          //       });
          //     } else if (mapComponent.circle) {
          //       mapComponent.circle.setLatLng(e.latlng).setRadius(createCampaignParam.radius);
          //       // mapComponent.circle?.remove();
          //       // const circle = L.circle(e.latlng, {
          //       //   radius: createCampaignParam.radius,
          //       // });
          //       // circle.addTo(mapComponent.map);
          //       // await this.setMapComponent({
          //       //   circle,
          //       // });
          //     }
          //   }
          // }
          //   await this.setCreateNewCampaignParam({
          //     location: `${data.lat}-${data.lon}`,
          //     address: data.display_name,
          //   });
          // }
          // await this.setAddNewCampaignModal({
          //   address: data.display_name,
          // });
        }
      }
    });
  };

  callGetListLocationsInMapBound = async (nw: L.LatLng, se: L.LatLng) => {
    const data = await this.props.dispatch({
      type: `${CAMPAIGN}/getListLocationInBound`,
      payload: {
        northWestLatitude: nw.lat,
        northWestLongitude: nw.lng,
        southEastLatitude: se.lat,
        southEastLongitude: se.lng,
      },
    });
    return data;
  };

  handleOnDragStartEvent = (map: L.Map) => {
    const { mapComponent } = this.props.location;
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        layer.remove();
      }
    });
    if (mapComponent?.marker) {
      // mapComponent?.marker.removeFrom(mymap);
      const marker = L.marker(mapComponent.marker.getLatLng()).addTo(map);
      this.setMapComponent({
        marker,
      });
    }
  };

  handleOnDragEvent = (map: L.Map) => {
    const bound = map.getBounds();
    const nw = bound.getNorthWest();
    const se = bound.getSouthEast();
    this.callGetListLocationsInMapBound(nw, se).then((data) => {
      console.log('====================================');
      console.log(bound);
      console.log('====================================');
      const locations = data.result.data;
      locations.forEach((location: Location) => {
        const lat = Number.parseFloat(location.latitude);
        const lng = Number.parseFloat(location.longitude);
        L.marker([lat, lng]).bindPopup(`<b>${location.name}!</b><br>`).addTo(map);
      });
    });
  };

  setAddNewCampaignModal = async (modal: any) => {
    await this.props.dispatch({
      type: `${CAMPAIGN}/setAddNewCampaignModalReducer`,
      payload: {
        ...this.props.campaign.addNewCampaignModal,
        ...modal,
      },
    });
  };

  setSelectedLocation = async (item: any) => {
    await this.props.dispatch({
      type: `${LOCATION_DISPATCHER}/setSelectedLocationReducer`,
      payload: {
        ...this.props.location.selectedLocation,
        ...item,
      },
    });
  };

  setCreateNewCampaignParam = async (param: any) => {
    await this.props.dispatch({
      type: `${CAMPAIGN}/setCreateCampaignParamReducer`,
      payload: {
        ...this.props.campaign.createCampaignParam,
        ...param,
      },
    });
  };

  setCreateLocationParam = async (param: any) => {
    await this.props.dispatch({
      type: `${LOCATION_DISPATCHER}/setCreateLocationParamReducer`,
      payload: {
        ...this.props.location.createLocationParam,
        ...param,
      },
    });
  };

  setMapComponent = async (payload: any) => {
    await this.props.dispatch({
      type: `${LOCATION_DISPATCHER}/setMapComponentReducer`,
      payload: {
        ...this.props.location.mapComponent,
        ...payload,
      },
    });
  };
  render() {
    return <div id="mapid" style={{ height: '300px' }}></div>;
  }
}

export default connect((state: any) => ({ ...state }))(LeafletMapComponent);
