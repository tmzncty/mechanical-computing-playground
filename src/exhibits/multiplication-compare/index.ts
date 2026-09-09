import { traceDirectMultiplication, type DirectMultiplicationTrace } from '../../mechanisms/direct-multiplier';
import { pinwheel } from '../../mechanisms/pinwheel';
import { steppedDrum } from '../../mechanisms/stepped-drum';
import { createRepeatedCrankTrace, REPEATED_SETTING_DIGITS, type RepeatedCrankTrace } from '../repeated-crank-multiplication';

export interface MultiplicationPathSummary {
  finalResult: number;
  operatorRepetitions: number;
  operationCycles: number;
  carriageShifts: number;
  multiplicationTableWork: string;
  claimType: 'M/P' | 'P';
  evidenceLabel: string;
}

export interface HistoricalProtocolEvidence {
  patent: {
    source: string;
    claimType: 'H';
    evidenceStrength: 'E1';
    supports: string;
    notEstablished: string;
  };
  survivingControls: {
    source: string;
    claimType: 'H';
    evidenceStrength: 'E1';
    supports: string;
    notEstablished: string;
  };
  repositoryModel: {
    claimType: 'P/M';
    supports: string;
    notEstablished: string;
  };
}

export interface MultiplicationComparison {
  value: number;
  repeatedCrankTrace: RepeatedCrankTrace;
  historicalProtocolEvidence: HistoricalProtocolEvidence;
  repeatedAddition: MultiplicationPathSummary & { cranks: number; shifts: number };
  steppedDrum: (ReturnType<typeof steppedDrum> & { settingColumn: number })[];
  pinwheel: (ReturnType<typeof pinwheel> & { settingColumn: number })[];
  directMultiplication: MultiplicationPathSummary & { trace: DirectMultiplicationTrace };
  paths: {
    repeatedAddition: MultiplicationPathSummary;
    steppedDrum: MultiplicationPathSummary;
    pinwheel: MultiplicationPathSummary;
    directMultiplication: MultiplicationPathSummary;
  };
}

export const compare314x27 = (): MultiplicationComparison => {
  const multiplicand = 314;
  const multiplier = 27;
  const repeatedCrankTrace = createRepeatedCrankTrace();
  const value = repeatedCrankTrace.finalState.accumulator;
  // These objects describe the fixed setting columns, not multiplier repetitions.
  const steppedDrumOperations = REPEATED_SETTING_DIGITS.map((digit, settingColumn) => ({ ...steppedDrum(digit, 0), settingColumn }));
  const pinwheelOperations = REPEATED_SETTING_DIGITS.map((digit, settingColumn) => ({ ...pinwheel(digit, 0), settingColumn }));
  const trace = traceDirectMultiplication(multiplicand, multiplier);

  const repeatedAddition: MultiplicationPathSummary & { cranks: number; shifts: number } = {
    finalResult: value,
    operatorRepetitions: 27,
    operationCycles: 27,
    carriageShifts: 0,
    multiplicationTableWork: 'operator repeats addition for the whole multiplier',
    claimType: 'M/P',
    evidenceLabel: 'arithmetic baseline; pedagogical operation model',
    cranks: 27,
    shifts: 0,
  };
  const steppedDrumSummary: MultiplicationPathSummary = {
    finalResult: value,
    operatorRepetitions: repeatedCrankTrace.finalState.completedCranks,
    operationCycles: repeatedCrankTrace.finalState.completedCranks,
    carriageShifts: repeatedCrankTrace.finalState.shiftCount,
    multiplicationTableWork: 'operator supplies repetition; stepped geometry encodes the set multiplicand digits',
    claimType: 'P',
    evidenceLabel: 'pedagogical functional model, not source-specific geometry',
  };
  const pinwheelSummary: MultiplicationPathSummary = {
    finalResult: value,
    operatorRepetitions: repeatedCrankTrace.finalState.completedCranks,
    operationCycles: repeatedCrankTrace.finalState.completedCranks,
    carriageShifts: repeatedCrankTrace.finalState.shiftCount,
    multiplicationTableWork: 'operator supplies repetition; active pins encode the set multiplicand digits',
    claimType: 'P',
    evidenceLabel: 'pedagogical functional model, not source-specific geometry',
  };
  const directSummary: MultiplicationPathSummary = {
    finalResult: trace.finalState.accumulator,
    operatorRepetitions: trace.finalState.operationCycleCount,
    operationCycles: trace.finalState.operationCycleCount,
    carriageShifts: trace.finalState.shiftCount,
    multiplicationTableWork: 'machine/control model selects a pre-encoded multiple for each multiplier digit',
    claimType: 'P',
    evidenceLabel: 'Steiger/Millionaire-informed functional model; no historical geometry claimed',
  };

  const historicalProtocolEvidence: HistoricalProtocolEvidence = {
    patent: {
      source: 'Otto Steiger, US 558,913 (1896), specification pp. 1–2, 5–6, 9',
      claimType: 'H',
      evidenceStrength: 'E1',
      supports: 'multiplier lever/scale selects a figure represented by multiplication-table control plates; one complete crank rotation follows each multiplier figure; the described left-starting arrangement is expressly a convenience',
      notEstablished: 'production-wide geometry, timing, force, speed, or one universal multiplier-digit direction/carriage protocol',
    },
    survivingControls: {
      source: 'Smithsonian NMAH MA.328619, MA.323594, MA.333940',
      claimType: 'H',
      evidenceStrength: 'E1',
      supports: 'identified lever-set machines expose 0–9 multiplier control, A/M/D/S selector, operating crank, set-number/divisor windows, multiplier-or-quotient and result-or-dividend registers, zeroing knobs, and carriage-shift control',
      notEstablished: 'hidden linkage/control-plate geometry, exact operation timing, or unchanged controls across every production revision',
    },
    repositoryModel: {
      claimType: 'P/M',
      supports: '314 × 27 is deterministically modeled as select 7, operate, shift one decimal place, select 2, operate',
      notEstablished: 'historical production digit order, automatic/manual shift semantics, physical timing, or identity of the generated 0–9 lookup table with patented or production control plates',
    },
  };

  return {
    value,
    repeatedCrankTrace,
    historicalProtocolEvidence,
    repeatedAddition,
    steppedDrum: steppedDrumOperations,
    pinwheel: pinwheelOperations,
    directMultiplication: { ...directSummary, trace },
    paths: {
      repeatedAddition,
      steppedDrum: steppedDrumSummary,
      pinwheel: pinwheelSummary,
      directMultiplication: directSummary,
    },
  };
};
