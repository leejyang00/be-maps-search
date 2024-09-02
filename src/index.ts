import { getPlaceAutocomplete } from "./maps-api";

export interface AutoCompleteResult {
  placeId: string;
  streetNumber: string | undefined;
  countryCode: string;
  country: string;
  freeformAddress: string;
  municipality: string | undefined;
}

export async function getAutoCompleteDetails(
  address: string,
): Promise<AutoCompleteResult[]> {
  const apiKey = process.env.TOMTOM_API_KEY ?? "";

  const results: AutoCompleteResult[] =
    (await getPlaceAutocomplete({ key: apiKey, address })) ?? [];

  if (results) {
    const filteredResult = results.filter(
      (result) => result.countryCode === "AU",
    );
    return filteredResult;
  }

  return [];
}
