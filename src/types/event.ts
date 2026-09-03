export type DistanceTierKey = '3k' | '5k' | '7k' | '10k';

export interface DistanceInfo {
  id: DistanceTierKey;
  label: string;
  name: string;
  distanceKm: number;
  time: string;
  categoryDesc?: string;
  isCompetitive: boolean;
}

export interface AwardPosition {
  place: string;
  womenAmount: string;
  menAmount: string;
}

export interface AwardCardData {
  distance: DistanceTierKey;
  label: string;
  bgColor: string;
  textColor: string;
  badge?: string;
  positions: AwardPosition[];
  totalPerGender: string;
  glowColor: string;
}

export interface PresaleRow {
  distanceKey: DistanceTierKey;
  label: string;
  subtitle: string;
  presale1: string;
  presale2: string;
  presale3: string;
}

export interface RunnerKitItem {
  id: string;
  name: string;
  iconSrc: string;
}

export interface LocationScheduleItem {
  distance: string;
  time: string;
}
