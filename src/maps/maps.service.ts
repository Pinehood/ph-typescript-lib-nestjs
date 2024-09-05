import { Injectable } from "@nestjs/common";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";
import {
  Client,
  FindPlaceFromTextResponse,
  FindPlaceFromTextResponseData,
  GeocodeResult,
  LatLng,
  LatLngLiteral,
  PlaceData,
  PlaceInputType,
  PlacesNearbyResponse,
  PlacesNearbyResponseData,
  Status,
  TextSearchResponse,
  TextSearchResponseData,
} from "@googlemaps/google-maps-services-js";

enum MapsConstants {
  DEFAULT_RADIUS_KM = 3,
  DEFAULT_REQUEST_DELAY_S = 5,
}

@Injectable()
export class MapsService {
  constructor(
    @InjectPinoLogger(MapsService.name)
    private readonly logger: PinoLogger,
  ) {}

  async getAllPlacesDataByName(
    key: string,
    name: string,
    mode: "search" | "find" | "nearby",
    region: string,
    location?: LatLngLiteral | null,
  ): Promise<Partial<PlaceData>[]> {
    return this.getAll<PlaceData>((token: string) =>
      this.getPlacesDataByName(key, name, mode, region, location, token),
    );
  }

  async getPlaceDetails(
    key: string,
    placeId: string,
  ): Promise<Partial<PlaceData>> {
    try {
      const response = await new Client().placeDetails({
        params: { key, place_id: placeId },
      });
      if (
        response &&
        response.status === 200 &&
        response.data &&
        response.data.status === Status.OK
      ) {
        this.logger.info(
          "Found Google Maps place details for place with ID '%s'",
          placeId,
        );
        return response.data.result;
      } else {
        this.logger.error(
          "Failed to fetch Google Maps place details for place with ID '%s', response: %s",
          placeId,
          JSON.stringify(response),
        );
      }
    } catch (error: any) {
      this.logger.error(JSON.stringify(error));
    }
    return null;
  }

  async geocodeAddress(key: string, address: string): Promise<GeocodeResult[]> {
    try {
      const response = await new Client().geocode({
        params: { key, region: "us", address },
      });
      if (
        response &&
        response.status === 200 &&
        response.data &&
        response.data.results &&
        response.data.status === Status.OK
      ) {
        this.logger.info(
          "Total of '%d' results for geocoding of address '%s' in Google Maps",
          response.data.results.length,
          address,
        );
        return response.data.results;
      } else {
        this.logger.error(
          "Failed to geocode an address '%s' in Google Maps, response: %s",
          address,
          JSON.stringify(response),
        );
      }
    } catch (error: any) {
      this.logger.error(JSON.stringify(error));
    }
    return null;
  }

  async reverseGeocodeLocation(
    key: string,
    location: LatLngLiteral,
  ): Promise<GeocodeResult[]> {
    try {
      const response = await new Client().reverseGeocode({
        params: { key, latlng: location },
      });
      if (
        response &&
        response.status === 200 &&
        response.data &&
        response.data.results &&
        response.data.status === Status.OK
      ) {
        this.logger.info(
          "Total of '%d' results for reverse geocoding of lat '%d' and lng '%d' in Google Maps",
          response.data.results.length,
          location.lat,
          location.lng,
        );
        return response.data.results;
      } else {
        this.logger.error(
          "Failed to reverse geocode a location at lat '%d' and lng '%d' in Google Maps, response: %s",
          location.lat,
          location.lng,
          JSON.stringify(response),
        );
      }
    } catch (error: any) {
      this.logger.error(JSON.stringify(error));
    }
    return null;
  }

  async isPlaceInCircle(
    place: LatLngLiteral,
    circleCenter: LatLngLiteral,
    circleRadiusMeters: number,
  ): Promise<boolean> {
    try {
      const dLat = ((place.lat - circleCenter.lat) * Math.PI) / 180;
      const dLon = ((place.lng - circleCenter.lng) * Math.PI) / 180;
      const a =
        0.5 -
        Math.cos(dLat) / 2 +
        (Math.cos((circleCenter.lat * Math.PI) / 180) *
          Math.cos((place.lat * Math.PI) / 180) *
          (1 - Math.cos(dLon))) /
          2;
      const distance = Math.abs(
        Math.round(6371000 * 2 * Math.asin(Math.sqrt(a))),
      );
      return distance <= circleRadiusMeters;
    } catch (error: any) {
      this.logger.error(error);
      return false;
    }
  }

  private async getPlacesDataByName(
    key: string,
    name: string,
    mode: "search" | "find" | "nearby",
    region: string,
    location?: LatLng | null,
    pagetoken?: string | null,
  ): Promise<{ data: Partial<PlaceData>[]; token: string }> {
    try {
      let response:
        | TextSearchResponse
        | FindPlaceFromTextResponse
        | PlacesNearbyResponse = null;
      if (mode === "search") {
        response = await new Client().textSearch({
          params: {
            key,
            query: name,
            region: "us",
            pagetoken,
          },
        });
      } else if (mode === "find") {
        response = await new Client().findPlaceFromText({
          params: {
            key,
            input: name,
            inputtype: PlaceInputType.textQuery,
            fields: [
              "address_component",
              "adr_address",
              "formatted_address",
              "name",
            ],
          },
        });
      } else if (mode === "nearby") {
        response = await new Client().placesNearby({
          params: {
            key,
            name,
            location,
            radius: MapsConstants.DEFAULT_RADIUS_KM * 1000,
            pagetoken,
          },
        });
      }
      if (
        response &&
        response.status === 200 &&
        response.data &&
        (response.data.status === Status.OK ||
          response.data.status === Status.ZERO_RESULTS)
      ) {
        let results: Partial<PlaceData>[] = [];
        if (mode === "search") {
          const data = response.data as TextSearchResponseData;
          if (data.results && data.results.length > 0) {
            results = data.results;
          }
        } else if (mode === "find") {
          const data = response.data as FindPlaceFromTextResponseData;
          if (data.candidates && data.candidates.length > 0) {
            results = data.candidates;
          }
        } else if (mode === "nearby") {
          const data = response.data as PlacesNearbyResponseData;
          if (data.results && data.results.length > 0) {
            results = data.results;
          }
        }
        return { data: results, token: response.data.next_page_token };
      } else {
        this.logger.error(
          "Error response for Google Maps place search for name '%s' in mode '%s', response: %s",
          name,
          mode,
          JSON.stringify(response),
        );
      }
    } catch (error: any) {
      this.logger.error(JSON.stringify(error));
    }
    return null;
  }

  private async getAll<T>(
    method: (token: string) => Promise<{ data: Partial<T>[]; token: string }>,
  ): Promise<Partial<T>[]> {
    return new Promise(async (resolve, reject) => {
      try {
        let token: string = null;
        let results: Partial<T>[] = [];
        const inner = async () => {
          const result = await method(token);
          if (result) {
            if (result.data) {
              results = results.concat(result.data);
            }
            if (result.token) {
              token = result.token;
              setTimeout(async () => {
                await inner();
              }, MapsConstants.DEFAULT_REQUEST_DELAY_S * 1000);
            } else {
              resolve(results);
            }
          }
        };
        await inner();
      } catch (error: any) {
        this.logger.error(error);
        reject();
      }
    });
  }
}
