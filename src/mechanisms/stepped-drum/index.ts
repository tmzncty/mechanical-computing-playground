export interface SteppedDrumOperation { mechanism:'stepped-drum'; digit:number; crankCount:number; carriageShift:number; effectiveSteps:number; }
/** One actuation at the selected effective digit; operator repetition is separate. */
export const steppedDrum=(digit:number, carriageShift:number):SteppedDrumOperation=>({mechanism:'stepped-drum',digit,crankCount:1,carriageShift,effectiveSteps:digit});
