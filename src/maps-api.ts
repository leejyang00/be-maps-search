import axios from "axios";
import { AutoCompleteResult } from ".";

interface Request {
  key: string;
  address: string;
}

interface FullAddress {
  // from API
  streetNumber: string;
  streetName: string;
  municipalitySubdivision: string;
  municipality: string;
  countrySecondarySubdivision: string;
  countrySubdivision: string;
  countrySubdivisionName: string;
  countrySubdivisionCode: string;
  postalCode: string;
  extendedPostalCode: string;
  countryCode: string;
  country: string;
  countryCodeISO3: string;
  freeformAddress: string;
  localName: string;
}

type Address = Pick<
  FullAddress,
  | "streetNumber"
  | "countryCode"
  | "country"
  | "freeformAddress"
  | "municipality"
>;

interface Results {
  id: string;
  address: Address;
  /* eslint-disable @typescript-eslint/no-explicit-any */
  [key: string]: any;
}

// https://developer.tomtom.com/search-api/documentation/search-service/fuzzy-search
export async function getPlaceAutocomplete(
  request: Request,
): Promise<AutoCompleteResult[] | undefined> {
  const { key, address } = request;

  if (key === "") {
    throw new Error("API key field is undefined");
  }

  if (address === "") {
    throw new Error("Address field is undefined");
  }
  const autocomplete = await axios
    .get(`https://api.tomtom.com/search/2/search/${address}.json'`, {
      params: {
        key,
        limit: 100,
      },
    })
    .then((response) => {
      const results: Results[] = response.data.results;
      if (results) {
        const data = results.map((result) => {
          return {
            placeId: result.id,
            streetNumber: result.address.streetNumber,
            countryCode: result.address.countryCode,
            country: result.address.country,
            freeformAddress: result.address.freeformAddress,
            municipality: result.address.municipality,
          };
        });

        return data;
      }
      return [];
    })
    .catch((error) => {
      console.error(`Error fetching autocomplete data: ${error.message}`);
      return [];
    });

  return autocomplete;
}
