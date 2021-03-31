import { CAMPAIGN } from '@/pages/Campaign';
import { reverseGeocoding } from '@/services/MapService/LocationIQService';
import L from 'leaflet';
import * as React from 'react';

import type { CampaignModelState, Dispatch, LocationModelState } from 'umi';
import { connect } from 'umi';
import { LOCATION_DISPATCHER } from '..';

export type LeafletMapComponentProps = {
  dispatch: Dispatch;
  location: LocationModelState;
  campaign: CampaignModelState;
  disabled?: boolean;
};

export class LeafletMapComponent extends React.Component<LeafletMapComponentProps> {
  componentDidMount = async () => {
    const mymap = L.map('mapid').setView([10.8414846, 106.8100464], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      // attribution:
      //   'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 18,
      id: 'mapbox/streets-v11',
      tileSize: 512,
      zoomOffset: -1,
    }).addTo(mymap);

    console.log('====================================');
    console.log('My map >>>', mymap);
    console.log('====================================');
    await this.setMapComponent({
      map: mymap,
    });

    mymap.on('click', async (e: any) => {
      if (this.props.disabled !== true) {
        const { mapComponent, addNewLocationModal, editLocationModal } = this.props.location;
        const { addNewCampaignModal } = this.props.campaign;
        console.log('====================================');
        console.log(e.latlng, mapComponent);
        console.log('====================================');
        mymap.setView([e.latlng.lat, e.latlng.lng]);
        if (mapComponent && mapComponent.map) {
          console.log('====================================');
          console.log(mapComponent.marker);
          console.log('====================================');
          if (mapComponent.marker !== undefined) {
            // mapComponent.marker.setLatLng(e.latlng);

            mapComponent.marker.remove();
            // mapComponent.marker.removeFrom(mymap);
            const marker = L.marker(e.latlng);
            console.log('====================================');
            console.log('Remove Marker', marker);
            console.log('====================================');
            marker.addTo(mymap);
            this.setMapComponent({
              marker,
            });
          } else {
            const marker = L.marker(e.latlng);
            marker.addTo(mymap);
            this.setMapComponent({
              marker,
            });
            console.log('====================================');
            console.log('NewMarker >>>', marker);
            console.log('====================================');
          }
          if (mapComponent.circle) {
            mapComponent.circle.remove();
            const circle = L.circle([e.latlng.lat, e.latlng.lng]);
            circle.addTo(mymap);
            this.setMapComponent({
              circle,
            });
          }
          const { data } = await reverseGeocoding(e.latlng.lat, e.latlng.lng);

          if (addNewLocationModal?.visible) {
            await this.setCreateLocationParam({
              address: data.display_name,
              longitude: data.lon,
              latitude: data.lat,
            });
          }

          if (editLocationModal?.visible) {
            await this.setSelectedLocation({
              address: data.display_name,
              longitude: data.lon,
              latitude: data.lat,
            });
          }

          if (addNewCampaignModal.visible) {
            const { createCampaignParam } = this.props.campaign;
            if (createCampaignParam.radius > 0) {
              if (mapComponent.map) {
                if (!mapComponent.circle && createCampaignParam.radius !== 0) {
                  const circle = L.circle(e.latlng, {
                    radius: createCampaignParam.radius * 1000,
                  });
                  circle.addTo(mapComponent.map);
                  await this.setMapComponent({
                    circle,
                  });
                } else {
                  mapComponent.circle?.remove();
                  const circle = L.circle(e.latlng, {
                    radius: createCampaignParam.radius * 1000,
                  });
                  circle.addTo(mapComponent.map);
                  await this.setMapComponent({
                    circle,
                  });
                }
              }
            }
            await this.setCreateNewCampaignParam({
              location: `${data.lat}-${data.lon}`,
              address: data.display_name,
            });
          }
          // await this.setAddNewCampaignModal({
          //   address: data.display_name,
          // });
        }
      }
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
