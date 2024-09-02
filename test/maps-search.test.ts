import { config } from "dotenv";
import { describe } from "@jest/globals";
import { getPlaceAutocomplete } from "../src/maps-api";
import { getAutoCompleteDetails } from "../src";
import axios from "axios";

config();

// These are end-to-end tests and need an api key
describe("Tomtom Places E2E Tests", () => {
  describe("getAutoCompleteDetails", () => {
    it("returns a promise", () => {
      const res = getAutoCompleteDetails("Charlotte Street");
      expect(res).toBeInstanceOf(Promise);
    });

    it("can fetch from the autocomplete api", async () => {
      const res = await getAutoCompleteDetails("Charlotte Street");
      const firstRes = res[0];

      expect(firstRes).toHaveProperty("placeId");
      expect(firstRes).toHaveProperty("streetNumber");
      expect(firstRes).toHaveProperty("countryCode");
      expect(firstRes).toHaveProperty("country");
      expect(firstRes).toHaveProperty("freeformAddress");
      expect(firstRes).toHaveProperty("municipality");
    });

    it("it only returns Australian address", async () => {
      const res = await getAutoCompleteDetails("Charlotte Street");
      const firstRes = res[0];

      expect(firstRes.country).toBe("Australia");
      expect(firstRes.countryCode).toBe("AU");
    });
  });

  describe("getPlaceAutocomplete", () => {
    const apiKey = process.env.TOMTOM_API_KEY ?? "";
    jest.mock("axios");

    let request, results, mockResponse;

    beforeEach(() => {
      request = {
        key: apiKey,
        address: "Charlotte Street",
      };

      results = [
        {
          id: "123456",
          address: {
            streetNumber: "789",
            countryCode: "AU",
            country: "Australia",
            freeformAddress: "89 Charlotte Street, Brisbane City QLD 4000",
            municipality: "Brisbane City, QLD",
          },
        },
      ];

      mockResponse = [
        {
          placeId: "123456",
          streetNumber: "789",
          countryCode: "AU",
          country: "Australia",
          freeformAddress: "89 Charlotte Street, Brisbane City QLD 4000",
          municipality: "Brisbane City, QLD",
        },
      ];
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it("handles results", async () => {
      axios.get = jest.fn().mockResolvedValue({ data: { results: results } });

      const response = await getPlaceAutocomplete(request);
      expect(mockResponse).toEqual(response);
    });

    it("handles no results", async () => {
      axios.get = jest.fn().mockResolvedValue({ data: { results: [] } });

      const res = await getPlaceAutocomplete(request);
      expect(res).toStrictEqual([]);
    });

    it("handles network error", async () => {
      axios.get = jest.fn().mockRejectedValue(new Error("Network Error"));

      const logSpy = jest
        .spyOn(global.console, "error")
        .mockImplementation(() => {});

      await getPlaceAutocomplete(request);
      expect(logSpy).toHaveBeenCalledWith(
        "Error fetching autocomplete data: Network Error",
      );
    });

    it("handles invalid API key", async () => {
      await expect(
        getPlaceAutocomplete({ key: "", address: "Charlotte Street" }),
      ).rejects.toThrow("API key field is undefined");
    });

    it("handles invalid address", async () => {
      await expect(
        getPlaceAutocomplete({ key: apiKey, address: "" }),
      ).rejects.toThrow("Address field is undefined");
    });
  });
});
