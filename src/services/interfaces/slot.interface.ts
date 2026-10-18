export interface Slot {
  startsAt: Date;
  endsAt: Date;
}

export interface SlotGenerationInput {
  durationMin: number;
  from: Date;
  to: Date;
  now: Date;
  takenStarts: Set<number>;
}
