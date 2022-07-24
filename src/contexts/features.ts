import * as React from 'react';

export interface Features {
  project: boolean;
  security: boolean;
  mqtt: boolean;
  ntp: boolean;
  ota: boolean;
  upload_firmware: boolean;
}

export interface FeaturesContextValue {
  features: Features;
}

const FeaturesContextDefaultValue = {
  features: {
    project: true,
    security: true,
    mqtt: true,
    ntp: true,
    ota: true,
    upload_firmware: true
  }
} as FeaturesContextValue;
export const FeaturesContext = React.createContext(
  FeaturesContextDefaultValue
);
