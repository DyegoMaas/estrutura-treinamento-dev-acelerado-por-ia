import type { ValidationErrorCode } from "../validation/schemaValidator.js";

export type NormalizationWarningCode =
  | "normalized_value"
  | "normalized_periodo"
  | "normalized_moeda";

export interface NormalizationWarning {
  path: string;
  code: NormalizationWarningCode;
  message: string;
}

export interface NormalizationErrorDetail {
  path: string;
  code: ValidationErrorCode;
  message: string;
}

export class NormalizationError extends Error {
  constructor(public readonly errors: NormalizationErrorDetail[]) {
    super("Normalization failed");
    this.name = "NormalizationError";
  }
}

export interface DreInput {
  schemaVersion?: number;
  periodo: string;
  moeda: string;
  totais: Record<string, unknown>;
  porConta: Array<{
    id: string;
    nome: string;
    grupo: string;
    valor: string | number;
  }>;
}

export interface NormalizedPorContaItem extends Omit<DreInput["porConta"][number], "valor"> {
  valor: number;
}

export interface NormalizedDreData {
  schemaVersion?: number;
  periodo: string;
  moeda: string;
  totais: DreInput["totais"];
  porConta: NormalizedPorContaItem[];
}

export interface NormalizationResult {
  data: NormalizedDreData;
  warnings: NormalizationWarning[];
}

const PERIODO_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/;

export function normalizeDreInput(input: DreInput): NormalizationResult {
  const errors: NormalizationErrorDetail[] = [];
  const warnings: NormalizationWarning[] = [];

  const periodoResult = normalizePeriodo(input.periodo);
  if (!periodoResult.ok) {
    errors.push(periodoResult.error);
  } else if (periodoResult.changed) {
    warnings.push({
      path: "periodo",
      code: "normalized_periodo",
      message: `Periodo ajustado para ${periodoResult.value}.`
    });
  }

  const currencyResult = normalizeCurrency(input.moeda);
  if (!currencyResult.ok) {
    errors.push(currencyResult.error);
  } else if (currencyResult.changed) {
    warnings.push({
      path: "moeda",
      code: "normalized_moeda",
      message: `Moeda normalizada para ${currencyResult.value}.`
    });
  }

  const normalizedPorConta: NormalizedPorContaItem[] = [];
  input.porConta.forEach((item, index) => {
    const valorResult = normalizeMonetaryValue(item.valor);
    if (!valorResult.ok) {
      errors.push({
        path: `porConta[${index}].valor`,
        code: "invalid_value",
        message: valorResult.message
      });
      return;
    }

    if (valorResult.changed) {
      warnings.push({
        path: `porConta[${index}].valor`,
        code: "normalized_value",
        message: `Valor monetário normalizado de "${valorResult.original}" para ${valorResult.value.toFixed(
          2
        )}.`
      });
    }

    normalizedPorConta.push({
      id: item.id,
      nome: item.nome,
      grupo: item.grupo,
      valor: valorResult.value
    });
  });

  if (errors.length > 0) {
    throw new NormalizationError(errors);
  }

  return {
    data: {
      schemaVersion: input.schemaVersion,
      periodo: periodoResult.value,
      moeda: currencyResult.value,
      totais: input.totais,
      porConta: normalizedPorConta
    },
    warnings
  };
}

function normalizePeriodo(periodo: string): {
  ok: boolean;
  value: string;
  changed: boolean;
  error?: NormalizationErrorDetail;
} {
  const trimmed = periodo.trim();

  if (!PERIODO_REGEX.test(trimmed)) {
    return {
      ok: false,
      value: trimmed,
      changed: false,
      error: {
        path: "periodo",
        code: "invalid_format",
        message: 'Formato inválido para "periodo"; utilize "YYYY-MM".'
      }
    };
  }

  return {
    ok: true,
    value: trimmed,
    changed: trimmed !== periodo
  };
}

const CURRENCY_REGEX = /^[A-Za-z]{3}$/;

function normalizeCurrency(moeda: string): {
  ok: boolean;
  value: string;
  changed: boolean;
  error?: NormalizationErrorDetail;
} {
  const trimmed = moeda.trim();
  if (!CURRENCY_REGEX.test(trimmed)) {
    return {
      ok: false,
      value: trimmed,
      changed: false,
      error: {
        path: "moeda",
        code: "invalid_format",
        message: 'Código de moeda inválido; informe um ISO-4217 (ex.: "BRL").'
      }
    };
  }

  const upper = trimmed.toUpperCase();

  if (!isValidCurrency(upper)) {
    return {
      ok: false,
      value: upper,
      changed: false,
      error: {
        path: "moeda",
        code: "invalid_enum",
        message: `Moeda desconhecida "${trimmed}". Verifique o código ISO-4217.`
      }
    };
  }

  return {
    ok: true,
    value: upper,
    changed: upper !== moeda
  };
}

function isValidCurrency(code: string): boolean {
  if (!/^[A-Z]{3}$/.test(code)) {
    return false;
  }

  try {
    new Intl.NumberFormat("en", { style: "currency", currency: code }).format(1);
    return true;
  } catch {
    return false;
  }
}

interface MonetaryNormalizationResult {
  ok: boolean;
  value: number;
  changed: boolean;
  original?: string;
  message: string;
}

function normalizeMonetaryValue(value: string | number): MonetaryNormalizationResult {
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      return {
        ok: false,
        value: 0,
        changed: false,
        message: "Valor numérico inválido; informe número finito."
      };
    }

    return {
      ok: true,
      value,
      changed: false,
      message: "",
      original: undefined
    };
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return {
      ok: false,
      value: 0,
      changed: false,
      original: value,
      message: "Valor monetário vazio; informe dígitos numéricos."
    };
  }

  const { sign, sanitized } = extractNumericPortion(trimmed);

  if (!sanitized) {
    return {
      ok: false,
      value: 0,
      changed: false,
      original: value,
      message: `Não foi possível interpretar o valor monetário "${value}".`
    };
  }

  const parsed = Number.parseFloat(sanitized);

  if (!Number.isFinite(parsed)) {
    return {
      ok: false,
      value: 0,
      changed: false,
      original: value,
      message: `Não foi possível interpretar o valor monetário "${value}".`
    };
  }

  const normalized = Number((sign * parsed).toFixed(2));

  return {
    ok: true,
    value: normalized,
    changed: true,
    original: value,
    message: ""
  };
}

function extractNumericPortion(raw: string): { sign: number; sanitized: string } {
  let sign = 1;
  let working = raw;

  if (working.startsWith("(") && working.endsWith(")")) {
    sign = -1;
    working = working.slice(1, -1);
  }

  if (working.includes("-")) {
    const minusCount = (working.match(/-/g) ?? []).length;
    if (minusCount % 2 === 1) {
      sign *= -1;
    }
    working = working.replace(/-/g, "");
  }

  working = working.replace(/[+\s]/g, "");
  working = working.replace(/[A-Za-z\$€£¥R$]/g, "");

  const decimalChar = detectDecimalSeparator(working);
  const decimalIndex = decimalChar ? working.lastIndexOf(decimalChar) : -1;

  let result = "";
  for (let i = 0; i < working.length; i += 1) {
    const char = working[i];
    if (char >= "0" && char <= "9") {
      result += char;
    } else if ((char === "." || char === ",") && i === decimalIndex) {
      result += ".";
    }
  }

  result = result.replace(/^\./, "0.");
  result = result.replace(/\.$/, "");

  return {
    sign,
    sanitized: result
  };
}

function detectDecimalSeparator(raw: string): "," | "." | null {
  const lastComma = raw.lastIndexOf(",");
  const lastDot = raw.lastIndexOf(".");

  if (lastComma !== -1 && lastDot !== -1) {
    return lastComma > lastDot ? "," : ".";
  }

  if (lastComma !== -1) {
    const fractionalLength = raw.length - lastComma - 1;
    return fractionalLength > 0 && fractionalLength <= 2 ? "," : null;
  }

  if (lastDot !== -1) {
    const fractionalLength = raw.length - lastDot - 1;
    return fractionalLength > 0 && fractionalLength <= 2 ? "." : null;
  }

  return null;
}
