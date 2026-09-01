export type PlaceResolutionCandidate = {
  id: string;
  provider: "nominatim";
  displayName: string;
  latitude: number;
  longitude: number;
  category: string;
  type: string;
  address: Record<string, string>;
  attribution: string;
};

export type PlaceResolutionSelection = {
  query: string;
  status: "candidate";
  selected: PlaceResolutionCandidate;
};
