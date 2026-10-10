export type TabId = 'analysis' | 'stats' | 'probability' | 'oxyz';

export type FunctionType = 'cubic' | 'rational11' | 'rational21';

export interface CubicParams {
  a: number;
  b: number;
  c: number;
  d: number;
}

export interface Rational11Params {
  a: number;
  b: number;
  c: number;
  d: number;
}

export interface Rational21Params {
  a: number;
  b: number;
  c: number;
  p: number;
  q: number;
}

export interface CriticalPoint {
  x: number;
  y: number;
  type: 'max' | 'min' | 'inflection' | 'stationery';
  label?: string;
}

export interface Asymptotes {
  vertical?: number; // x = value
  horizontal?: number; // y = value
  slant?: {
    // y = mx + n
    m: number;
    n: number;
    remainder: number;
  };
}

export interface TableColumnPoint {
  xVal: number;
  xLabel: string;
  isInfinity?: boolean;
  isDiscontinuity?: boolean;
  // Derivative y' values
  yPrimeVal?: number; // 0 or undefined
  yPrimeSignLeft?: '+' | '-';
  yPrimeSignRight?: '+' | '-';
  // Function y values
  yVal?: number;
  yLabel?: string;
  // If discontinuity:
  yLeftLabel?: string; // limit as x -> x_0^-
  yRightLabel?: string; // limit as x -> x_0^+
}

export interface FunctionAnalysisResult {
  fnType: FunctionType;
  latexEquation: string;
  plainEquation: string;
  domain: string;
  derivativeLatex: string;
  derivativeRoots: number[];
  derivativeDelta?: number;
  criticalPoints: CriticalPoint[];
  asymptotes: Asymptotes;
  symmetryCenter?: { x: number; y: number; label: string };
  intervals: {
    increasing: string[];
    decreasing: string[];
  };
  tablePoints: TableColumnPoint[];
  specialPoints: { x: number; y: number; note: string }[];
  polynomialDivisionSteps?: {
    quotient: string;
    remainder: string;
    formula: string;
  };
  evaluate: (x: number) => number | null;
  evaluateDerivative: (x: number) => number | null;
}
