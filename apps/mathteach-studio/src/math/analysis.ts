import {
  CubicParams,
  Rational11Params,
  Rational21Params,
  FunctionAnalysisResult,
  CriticalPoint,
  TableColumnPoint,
} from '../types';

/**
 * Approximate a float into a reduced fraction p/q
 */
export function toFraction(val: number, maxDenominator = 24): { num: number; den: number } | null {
  if (Math.abs(val - Math.round(val)) < 1e-6) {
    return { num: Math.round(val), den: 1 };
  }
  for (let d = 2; d <= maxDenominator; d++) {
    const n = Math.round(val * d);
    if (Math.abs(val - n / d) < 1e-5) {
      return { num: n, den: d };
    }
  }
  return null;
}

export function formatNum(val: number, allowFraction = true): string {
  if (Math.abs(val) < 1e-9) return '0';
  if (allowFraction) {
    const frac = toFraction(val);
    if (frac) {
      if (frac.den === 1) return `${frac.num}`;
      return `${frac.num}/${frac.den}`;
    }
  }
  // clean floating point
  const str = Number(val.toFixed(3)).toString();
  return str;
}

export function formatLatexFrac(val: number): string {
  if (Math.abs(val) < 1e-9) return '0';
  const frac = toFraction(val);
  if (frac) {
    if (frac.den === 1) return `${frac.num}`;
    if (frac.num < 0) return `-\\frac{${Math.abs(frac.num)}}{${frac.den}}`;
    return `\\frac{${frac.num}}{${frac.den}}`;
  }
  return Number(val.toFixed(2)).toString();
}

/**
 * Format polynomial term like + 3x^2, - x, + 5
 */
function term(coeff: number, power: number, isFirst = false): string {
  if (Math.abs(coeff) < 1e-9) return '';
  const sign = coeff > 0 ? (isFirst ? '' : '+ ') : (isFirst ? '-' : '- ');
  const absCoeff = Math.abs(coeff);
  const coeffStr =
    absCoeff === 1 && power > 0 ? '' : formatNum(absCoeff);

  let varStr = '';
  if (power === 1) varStr = 'x';
  else if (power > 1) varStr = `x^${power}`;

  return `${sign}${coeffStr}${varStr} `;
}

/**
 * 1. Khảo sát Hàm Bậc Ba: y = ax^3 + bx^2 + cx + d (a != 0)
 */
export function analyzeCubic(p: CubicParams): FunctionAnalysisResult {
  const { a, b, c, d } = p;
  if (a === 0) throw new Error('Hệ số a phải khác 0 đối với hàm bậc ba');

  // y' = 3ax^2 + 2bx + c
  const aPrime = 3 * a;
  const bPrime = 2 * b;
  const cPrime = c;

  // Delta' = b'^2 - a'*c' with standard quadratic y'=0
  const deltaPrime = Math.pow(b, 2) - 3 * a * c; // b^2 - 3ac

  const evaluate = (x: number) => a * Math.pow(x, 3) + b * Math.pow(x, 2) + c * x + d;
  const evaluateDerivative = (x: number) => 3 * a * Math.pow(x, 2) + 2 * b * x + c;

  const roots: number[] = [];
  const criticalPoints: CriticalPoint[] = [];

  if (deltaPrime > 1e-8) {
    // 2 distinct roots
    const sqrtD = Math.sqrt(deltaPrime);
    const x1 = (-b - sqrtD) / (3 * a);
    const x2 = (-b + sqrtD) / (3 * a);

    const sortedX = [x1, x2].sort((n1, n2) => n1 - n2);
    roots.push(sortedX[0], sortedX[1]);

    const y1 = evaluate(sortedX[0]);
    const y2 = evaluate(sortedX[1]);

    // If a > 0: + (inc) -> 0 -> - (dec) -> 0 -> + (inc) => first is Max, second is Min
    // If a < 0: - (dec) -> 0 -> + (inc) -> 0 -> - (dec) => first is Min, second is Max
    if (a > 0) {
      criticalPoints.push({ x: sortedX[0], y: y1, type: 'max', label: 'Cực đại' });
      criticalPoints.push({ x: sortedX[1], y: y2, type: 'min', label: 'Cực tiểu' });
    } else {
      criticalPoints.push({ x: sortedX[0], y: y1, type: 'min', label: 'Cực tiểu' });
      criticalPoints.push({ x: sortedX[1], y: y2, type: 'max', label: 'Cực đại' });
    }
  } else if (Math.abs(deltaPrime) <= 1e-8) {
    // 1 double root
    const x0 = -b / (3 * a);
    roots.push(x0);
    // Stationery inflection
  }

  // Inflection point: y'' = 6ax + 2b = 0 => x = -b / (3a)
  const xU = -b / (3 * a);
  const yU = evaluate(xU);
  const symmetryCenter = { x: xU, y: yU, label: 'Điểm uốn I' };

  // Intervals
  const intervals = {
    increasing: [] as string[],
    decreasing: [] as string[],
  };

  if (deltaPrime > 1e-8) {
    const [xL, xR] = [roots[0], roots[1]];
    const strL = formatNum(xL);
    const strR = formatNum(xR);
    if (a > 0) {
      intervals.increasing.push(`(-\\infty; ${strL})`, `(${strR}; +\\infty)`);
      intervals.decreasing.push(`(${strL}; ${strR})`);
    } else {
      intervals.decreasing.push(`(-\\infty; ${strL})`, `(${strR}; +\\infty)`);
      intervals.increasing.push(`(${strL}; ${strR})`);
    }
  } else {
    if (a > 0) {
      intervals.increasing.push('(-\\infty; +\\infty)');
    } else {
      intervals.decreasing.push('(-\\infty; +\\infty)');
    }
  }

  // Construct Table Column Points for BBT
  const tablePoints: TableColumnPoint[] = [];

  // Left infinity
  tablePoints.push({
    xVal: -Infinity,
    xLabel: '-\\infty',
    isInfinity: true,
    yPrimeSignRight: a > 0 ? (roots.length === 2 ? '+' : '+') : (roots.length === 2 ? '-' : '-'),
    yLabel: a > 0 ? '-\\infty' : '+\\infty',
  });

  if (roots.length === 2) {
    const pt1 = criticalPoints[0];
    const pt2 = criticalPoints[1];

    tablePoints.push({
      xVal: pt1.x,
      xLabel: formatNum(pt1.x),
      yPrimeVal: 0,
      yPrimeSignLeft: a > 0 ? '+' : '-',
      yPrimeSignRight: a > 0 ? '-' : '+',
      yVal: pt1.y,
      yLabel: formatNum(pt1.y),
    });

    tablePoints.push({
      xVal: pt2.x,
      xLabel: formatNum(pt2.x),
      yPrimeVal: 0,
      yPrimeSignLeft: a > 0 ? '-' : '+',
      yPrimeSignRight: a > 0 ? '+' : '-',
      yVal: pt2.y,
      yLabel: formatNum(pt2.y),
    });
  } else if (roots.length === 1) {
    tablePoints.push({
      xVal: roots[0],
      xLabel: formatNum(roots[0]),
      yPrimeVal: 0,
      yPrimeSignLeft: a > 0 ? '+' : '-',
      yPrimeSignRight: a > 0 ? '+' : '-',
      yVal: evaluate(roots[0]),
      yLabel: formatNum(evaluate(roots[0])),
    });
  }

  // Right infinity
  tablePoints.push({
    xVal: Infinity,
    xLabel: '+\\infty',
    isInfinity: true,
    yPrimeSignLeft: a > 0 ? '+' : '-',
    yLabel: a > 0 ? '+\\infty' : '-\\infty',
  });

  // Plain & Latex Equations
  const eqTerms = `${term(a, 3, true)}${term(b, 2)}${term(c, 1)}${term(d, 0)}`.trim();
  const derivTerms = `${term(aPrime, 2, true)}${term(bPrime, 1)}${term(cPrime, 0)}`.trim();

  // Special points (cross Ox, Oy)
  const specialPoints = [
    { x: 0, y: d, note: 'Giao Oy (0, ' + formatNum(d) + ')' },
    { x: xU, y: yU, note: 'Điểm uốn I(' + formatNum(xU) + ', ' + formatNum(yU) + ')' },
  ];

  return {
    fnType: 'cubic',
    latexEquation: `y = ${eqTerms}`,
    plainEquation: `y = ${eqTerms}`,
    domain: '\\mathcal{D} = \\mathbb{R}',
    derivativeLatex: `y' = ${derivTerms}`,
    derivativeRoots: roots,
    derivativeDelta: deltaPrime,
    criticalPoints,
    asymptotes: {}, // bậc 3 không có tiệm cận
    symmetryCenter,
    intervals,
    tablePoints,
    specialPoints,
    evaluate,
    evaluateDerivative,
  };
}

/**
 * 2. Khảo sát Hàm Phân thức bậc 1 / bậc 1: y = (ax + b) / (cx + d)
 */
export function analyzeRational11(p: Rational11Params): FunctionAnalysisResult {
  const { a, b, c, d } = p;
  if (c === 0) throw new Error('Mẫu số phải có c khác 0');
  const ad_bc = a * d - b * c;
  if (Math.abs(ad_bc) < 1e-8) {
    throw new Error('ad - bc = 0 (hàm suy biến thành đường thẳng hằng)');
  }

  const x0 = -d / c; // tiệm cận đứng
  const y0 = a / c; // tiệm cận ngang

  const evaluate = (x: number) => {
    if (Math.abs(x - x0) < 1e-9) return null;
    return (a * x + b) / (c * x + d);
  };

  const evaluateDerivative = (x: number) => {
    if (Math.abs(x - x0) < 1e-9) return null;
    return ad_bc / Math.pow(c * x + d, 2);
  };

  const isIncreasing = ad_bc > 0;
  const strX0 = formatNum(x0);
  const strY0 = formatNum(y0);

  const intervals = {
    increasing: isIncreasing ? [`(-\\infty; ${strX0})`, `(${strX0}; +\\infty)`] : [],
    decreasing: !isIncreasing ? [`(-\\infty; ${strX0})`, `(${strX0}; +\\infty)`] : [],
  };

  const asymptotes = {
    vertical: x0,
    horizontal: y0,
  };

  const symmetryCenter = {
    x: x0,
    y: y0,
    label: 'Tâm đối xứng I (giao 2 tiệm cận)',
  };

  // Limits around x0:
  // if c > 0:
  // as x -> x0^-: cx+d -> 0^-
  // numerator at x0 = a(-d/c) + b = (-ad + bc)/c = -(ad-bc)/c
  // (numerator) / (cx+d) sign depends on ad-bc and c.
  // Actually, standard: if y' > 0 (ad-bc > 0), function increases on (-inf, x0) => starts at y0, rises to +inf!
  // Then on (x0, +inf), starts at -inf, rises to y0!
  // If y' < 0 (ad-bc < 0), function decreases on (-inf, x0) => starts at y0, drops to -inf!
  // Then on (x0, +inf), starts at +inf, drops to y0!
  const leftLimit = isIncreasing ? '+\\infty' : '-\\infty';
  const rightLimit = isIncreasing ? '-\\infty' : '+\\infty';

  const tablePoints: TableColumnPoint[] = [
    {
      xVal: -Infinity,
      xLabel: '-\\infty',
      isInfinity: true,
      yPrimeSignRight: isIncreasing ? '+' : '-',
      yLabel: strY0,
    },
    {
      xVal: x0,
      xLabel: strX0,
      isDiscontinuity: true,
      yPrimeSignLeft: isIncreasing ? '+' : '-',
      yPrimeSignRight: isIncreasing ? '+' : '-',
      yLeftLabel: leftLimit,
      yRightLabel: rightLimit,
    },
    {
      xVal: Infinity,
      xLabel: '+\\infty',
      isInfinity: true,
      yPrimeSignLeft: isIncreasing ? '+' : '-',
      yLabel: strY0,
    },
  ];

  const numStr = `${term(a, 1, true)}${term(b, 0)}`.trim();
  const denStr = `${term(c, 1, true)}${term(d, 0)}`.trim();
  const derivLatex = `y' = \\frac{${formatNum(ad_bc)}}{(${denStr})^2}`;

  const specialPoints = [];
  if (Math.abs(d) > 1e-9) {
    specialPoints.push({ x: 0, y: b / d, note: 'Giao Oy (0, ' + formatNum(b / d) + ')' });
  }
  if (Math.abs(a) > 1e-9) {
    const xIntersect = -b / a;
    specialPoints.push({ x: xIntersect, y: 0, note: 'Giao Ox (' + formatNum(xIntersect) + ', 0)' });
  }
  specialPoints.push({ x: x0, y: y0, note: 'Tâm đối xứng I(' + strX0 + ', ' + strY0 + ')' });

  return {
    fnType: 'rational11',
    latexEquation: `y = \\frac{${numStr}}{${denStr}}`,
    plainEquation: `y = (${numStr}) / (${denStr})`,
    domain: `\\mathcal{D} = \\mathbb{R} \\setminus \\{${strX0}\\}`,
    derivativeLatex: derivLatex,
    derivativeRoots: [],
    criticalPoints: [], // không có cực trị
    asymptotes,
    symmetryCenter,
    intervals,
    tablePoints,
    specialPoints,
    evaluate,
    evaluateDerivative,
  };
}

/**
 * 3. Khảo sát Hàm Phân thức bậc 2 / bậc 1: y = (ax^2 + bx + c) / (px + q)
 * Kiến thức trọng tâm SGK 12 mới (Tiệm cận xiên)
 */
export function analyzeRational21(params: Rational21Params): FunctionAnalysisResult {
  const { a, b, c, p, q } = params;
  if (p === 0) throw new Error('Hệ số p ở mẫu phải khác 0');
  if (a === 0) throw new Error('Hệ số a ở tử phải khác 0 để là bậc 2 trên bậc 1');

  const x0 = -q / p; // tiệm cận đứng

  // Kiểm tra mẫu có triệt tiêu tử hay không: u(x0) = a x0^2 + b x0 + c
  const numAtX0 = a * Math.pow(x0, 2) + b * x0 + c;
  if (Math.abs(numAtX0) < 1e-7) {
    throw new Error('Nghiệm của mẫu trùng nghiệm của tử (hàm suy biến)');
  }

  // 1. Phép chia đa thức: (ax^2 + bx + c) : (px + q)
  // m = a / p
  // b - m*q = b - (a*q / p)
  // n = (b - (a*q / p)) / p = (b*p - a*q) / p^2
  // R = c - n*q
  const m = a / p;
  const n = (b * p - a * q) / Math.pow(p, 2);
  const remainder = c - n * q;

  // Slant asymptote: y = m*x + n
  const asymptotes = {
    vertical: x0,
    slant: {
      m,
      n,
      remainder,
    },
  };

  const evaluate = (x: number) => {
    if (Math.abs(x - x0) < 1e-9) return null;
    return (a * Math.pow(x, 2) + b * x + c) / (p * x + q);
  };

  // Derivative:
  // u = ax^2 + bx + c => u' = 2ax + b
  // v = px + q => v' = p
  // y' = [ (2ax + b)(px + q) - p(ax^2 + bx + c) ] / (px + q)^2
  //    = [ a*p*x^2 + 2*a*q*x + (b*q - c*p) ] / (px + q)^2
  const A1 = a * p;
  const B1 = 2 * a * q;
  const C1 = b * q - c * p;

  const evaluateDerivative = (x: number) => {
    if (Math.abs(x - x0) < 1e-9) return null;
    const num = A1 * Math.pow(x, 2) + B1 * x + C1;
    const den = Math.pow(p * x + q, 2);
    return num / den;
  };

  // Delta of y' numerator:
  const delta = Math.pow(B1, 2) - 4 * A1 * C1;

  const roots: number[] = [];
  const criticalPoints: CriticalPoint[] = [];

  if (delta > 1e-8) {
    const sqrtD = Math.sqrt(delta);
    const r1 = (-B1 - sqrtD) / (2 * A1);
    const r2 = (-B1 + sqrtD) / (2 * A1);

    const sortedRoots = [r1, r2].sort((n1, n2) => n1 - n2);
    roots.push(sortedRoots[0], sortedRoots[1]);

    // Note: In y = (ax^2+bx+c)/(px+q), at critical point x_k:
    // y(x_k) = (2a x_k + b) / p
    sortedRoots.forEach((rx) => {
      const ry = (2 * a * rx + b) / p; // exact shortcut
      // Determine max or min:
      // Since denominator is squared > 0, sign of y' is sign of A1 * x^2 + B1 * x + C1.
      // Outside roots has sign of A1 = a*p. Inside roots has opposite sign.
      let type: 'max' | 'min' = 'max';
      if (A1 > 0) {
        // Outside is +, inside is -
        // root 0 is changing + to - => MAX
        // root 1 is changing - to + => MIN
        type = rx === sortedRoots[0] ? 'max' : 'min';
      } else {
        // Outside is -, inside is +
        type = rx === sortedRoots[0] ? 'min' : 'max';
      }
      criticalPoints.push({
        x: rx,
        y: ry,
        type,
        label: type === 'max' ? 'Cực đại' : 'Cực tiểu',
      });
    });
  }

  // Symmetry Center I: intersection of vertical asymptote x = x0 and slant asymptote y = m*x0 + n
  const yI = m * x0 + n;
  const symmetryCenter = {
    x: x0,
    y: yI,
    label: 'Tâm đối xứng I (giao TCĐ và TCX)',
  };

  const strX0 = formatNum(x0);
  const intervals = {
    increasing: [] as string[],
    decreasing: [] as string[],
  };

  // Build Table Points for BBT
  // The points ordered on real axis:
  // We have x0 (discontinuity) and possibly roots x1, x2.
  // Note: Since x0 cannot be a root, roots are separated by x0:
  // If delta > 0, one root is < x0 and one is > x0 (standard geometry of rational 2/1).
  const tablePoints: TableColumnPoint[] = [];

  // Left infinity
  tablePoints.push({
    xVal: -Infinity,
    xLabel: '-\\infty',
    isInfinity: true,
    yPrimeSignRight: A1 > 0 ? '+' : '-',
    yLabel: m > 0 ? '-\\infty' : '+\\infty',
  });

  if (roots.length === 2) {
    const rL = roots[0];
    const rR = roots[1];
    const ptL = criticalPoints.find((cp) => Math.abs(cp.x - rL) < 1e-5)!;
    const ptR = criticalPoints.find((cp) => Math.abs(cp.x - rR) < 1e-5)!;

    // rL point
    tablePoints.push({
      xVal: rL,
      xLabel: formatNum(rL),
      yPrimeVal: 0,
      yPrimeSignLeft: A1 > 0 ? '+' : '-',
      yPrimeSignRight: A1 > 0 ? '-' : '+',
      yVal: ptL.y,
      yLabel: formatNum(ptL.y),
    });

    // Discontinuity point x0
    // Sign of limit:
    // When approaching x0 from left, denominator -> 0
    // If y' is decreasing (negative), it goes down to -inf, or if increasing goes up to +inf
    const leftLim = A1 > 0 ? '-\\infty' : '+\\infty';
    const rightLim = A1 > 0 ? '+\\infty' : '-\\infty';

    tablePoints.push({
      xVal: x0,
      xLabel: strX0,
      isDiscontinuity: true,
      yPrimeSignLeft: A1 > 0 ? '-' : '+',
      yPrimeSignRight: A1 > 0 ? '-' : '+',
      yLeftLabel: leftLim,
      yRightLabel: rightLim,
    });

    // rR point
    tablePoints.push({
      xVal: rR,
      xLabel: formatNum(rR),
      yPrimeVal: 0,
      yPrimeSignLeft: A1 > 0 ? '-' : '+',
      yPrimeSignRight: A1 > 0 ? '+' : '-',
      yVal: ptR.y,
      yLabel: formatNum(ptR.y),
    });

    const strL = formatNum(rL);
    const strR = formatNum(rR);
    if (A1 > 0) {
      intervals.increasing.push(`(-\\infty; ${strL})`, `(${strR}; +\\infty)`);
      intervals.decreasing.push(`(${strL}; ${strX0})`, `(${strX0}; ${strR})`);
    } else {
      intervals.decreasing.push(`(-\\infty; ${strL})`, `(${strR}; +\\infty)`);
      intervals.increasing.push(`(${strL}; ${strX0})`, `(${strX0}; ${strR})`);
    }
  } else {
    // No extrema
    const leftLim = A1 > 0 ? '+\\infty' : '-\\infty';
    const rightLim = A1 > 0 ? '-\\infty' : '+\\infty';

    tablePoints.push({
      xVal: x0,
      xLabel: strX0,
      isDiscontinuity: true,
      yPrimeSignLeft: A1 > 0 ? '+' : '-',
      yPrimeSignRight: A1 > 0 ? '+' : '-',
      yLeftLabel: leftLim,
      yRightLabel: rightLim,
    });

    if (A1 > 0) {
      intervals.increasing.push(`(-\\infty; ${strX0})`, `(${strX0}; +\\infty)`);
    } else {
      intervals.decreasing.push(`(-\\infty; ${strX0})`, `(${strX0}; +\\infty)`);
    }
  }

  // Right infinity
  tablePoints.push({
    xVal: Infinity,
    xLabel: '+\\infty',
    isInfinity: true,
    yPrimeSignLeft: A1 > 0 ? '+' : '-',
    yLabel: m > 0 ? '+\\infty' : '-\\infty',
  });

  const numStr = `${term(a, 2, true)}${term(b, 1)}${term(c, 0)}`.trim();
  const denStr = `${term(p, 1, true)}${term(q, 0)}`.trim();
  const quotientStr = `${term(m, 1, true)}${term(n, 0)}`.trim();
  const remainderStr = formatNum(remainder);

  const polySteps = {
    quotient: quotientStr,
    remainder: remainderStr,
    formula: `y = (${quotientStr}) + \\frac{${remainderStr}}{${denStr}}`,
  };

  const specialPoints = [
    { x: x0, y: yI, note: 'Tâm đối xứng I(' + strX0 + ', ' + formatNum(yI) + ')' },
  ];
  if (Math.abs(q) > 1e-9) {
    specialPoints.push({ x: 0, y: c / q, note: 'Giao Oy (0, ' + formatNum(c / q) + ')' });
  }

  return {
    fnType: 'rational21',
    latexEquation: `y = \\frac{${numStr}}{${denStr}}`,
    plainEquation: `y = (${numStr}) / (${denStr})`,
    domain: `\\mathcal{D} = \\mathbb{R} \\setminus \\{${strX0}\\}`,
    derivativeLatex: `y' = \\frac{${term(A1, 2, true)}${term(B1, 1)}${term(C1, 0)}}{(${denStr})^2}`,
    derivativeRoots: roots,
    criticalPoints,
    asymptotes,
    symmetryCenter,
    intervals,
    tablePoints,
    specialPoints,
    polynomialDivisionSteps: polySteps,
    evaluate,
    evaluateDerivative,
  };
}
