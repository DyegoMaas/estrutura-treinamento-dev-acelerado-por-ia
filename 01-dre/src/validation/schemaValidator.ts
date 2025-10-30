export type ValidationErrorCode =
  | "missing_field"
  | "invalid_type"
  | "invalid_format"
  | "invalid_enum"
  | "invalid_value"
  | "extra_field";

export interface ValidationError {
  path: string;
  code: ValidationErrorCode;
  message: string;
}

export interface ValidationResult {
  ok: boolean;
  errors: ValidationError[];
}

type DreInput = Record<string, unknown>;

const ROOT_ALLOWED_FIELDS = new Set([
  "schemaVersion",
  "periodo",
  "moeda",
  "totais",
  "porConta"
]);

const POR_CONTA_ALLOWED_FIELDS = new Set(["id", "nome", "grupo", "valor"]);

const POSITIVE_GROUPS = new Set(["receita"]);
const NEGATIVE_GROUPS = new Set(["deducao", "custo", "despesa", "imposto"]);
const FLEX_GROUPS = new Set(["outras"]);

const REQUIRED_ROOT_FIELDS: Array<{ key: keyof DreInput; type: "string" | "object" | "array" }> =
  [
    { key: "periodo", type: "string" },
    { key: "moeda", type: "string" },
    { key: "totais", type: "object" },
    { key: "porConta", type: "array" }
  ];

export function validateDreSchema(input: unknown): ValidationResult {
  const errors: ValidationError[] = [];

  if (!isPlainObject(input)) {
    return {
      ok: false,
      errors: [
        {
          path: "root",
          code: "invalid_type",
          message: "Estrutura raiz inválida: esperado objeto JSON."
        }
      ]
    };
  }

  const data = input as DreInput;

  for (const key of Object.keys(data)) {
    if (!ROOT_ALLOWED_FIELDS.has(key)) {
      errors.push({
        path: key,
        code: "extra_field",
        message: `Campo não suportado na raiz: "${key}". Remova para continuar.`
      });
    }
  }

  for (const field of REQUIRED_ROOT_FIELDS) {
    if (!(field.key in data)) {
      errors.push({
        path: String(field.key),
        code: "missing_field",
        message: `Campo obrigatório ausente: "${String(field.key)}".`
      });
      continue;
    }

    const value = data[field.key];
    if (!isOfType(value, field.type)) {
      errors.push({
        path: String(field.key),
        code: "invalid_type",
        message: `Tipo inválido para "${String(field.key)}": esperado ${expectedLabel(
          field.type
        )}.`
      });
    }
  }

  if ("schemaVersion" in data && typeof data.schemaVersion !== "number") {
    errors.push({
      path: "schemaVersion",
      code: "invalid_type",
      message: 'Campo opcional "schemaVersion" deve ser numérico.'
    });
  }

  if (typeof data.periodo === "string" && !isValidPeriodo(data.periodo)) {
    errors.push({
      path: "periodo",
      code: "invalid_format",
      message: 'Formato inválido para "periodo"; utilize "YYYY-MM".'
    });
  }

  if (typeof data.moeda === "string" && !isValidCurrency(data.moeda)) {
    errors.push({
      path: "moeda",
      code: "invalid_format",
      message: 'Código de moeda inválido; informe um ISO-4217 (ex.: "BRL").'
    });
  }

  if (isPlainObject(data.totais)) {
    // Por enquanto apenas garantimos que seja objeto; demais regras virão nos recálculos.
  } else if (data.totais !== undefined) {
    errors.push({
      path: "totais",
      code: "invalid_type",
      message: 'Campo "totais" deve ser um objeto com valores numéricos.'
    });
  }

  if (Array.isArray(data.porConta)) {
    data.porConta.forEach((entry, index) => {
      validatePorContaEntry(entry, index, errors);
    });
  } else if (data.porConta !== undefined) {
    errors.push({
      path: "porConta",
      code: "invalid_type",
      message: 'Campo "porConta" deve ser uma lista de lançamentos.'
    });
  }

  return {
    ok: errors.length === 0,
    errors
  };
}

function validatePorContaEntry(
  entry: unknown,
  index: number,
  errors: ValidationError[]
): void {
  const basePath = `porConta[${index}]`;

  if (!isPlainObject(entry)) {
    errors.push({
      path: basePath,
      code: "invalid_type",
      message: `Entrada ${basePath} inválida: esperado objeto com { id, nome, grupo, valor }.`
    });
    return;
  }

  const record = entry as DreInput;

  for (const key of Object.keys(entry)) {
    if (!POR_CONTA_ALLOWED_FIELDS.has(key)) {
      errors.push({
        path: `${basePath}.${key}`,
        code: "extra_field",
        message: `Campo não suportado em ${basePath}: "${key}".`
      });
    }
  }

  const requiredFields: Array<{ key: string; validator: (value: unknown) => boolean; message: string }> =
    [
      {
        key: "id",
        validator: (value) => typeof value === "string" && value.trim().length > 0,
        message: 'Campo "id" deve ser string não vazia.'
      },
      {
        key: "nome",
        validator: (value) => typeof value === "string" && value.trim().length > 0,
        message: 'Campo "nome" deve ser string não vazia.'
      },
      {
        key: "grupo",
        validator: (value) => typeof value === "string" && isValidGroup(value),
        message: 'Campo "grupo" inválido. Valores permitidos: receita, deducao, custo, despesa, outras, imposto.'
      },
      {
        key: "valor",
        validator: (value) => typeof value === "number" || typeof value === "string",
        message: 'Campo "valor" deve ser número ou string monetária.'
      }
    ];

  for (const field of requiredFields) {
    if (!(field.key in record)) {
      errors.push({
        path: `${basePath}.${String(field.key)}`,
        code: "missing_field",
        message: `Campo obrigatório ausente em ${basePath}: "${String(field.key)}".`
      });
      continue;
    }

    const value = record[field.key];
    if (!field.validator(value)) {
      errors.push({
        path: `${basePath}.${String(field.key)}`,
        code: field.key === "grupo" ? "invalid_enum" : "invalid_type",
        message: field.message
      });
    }
  }

  if (!("grupo" in record) || !("valor" in record)) {
    return;
  }

  const grupo = String(record.grupo);
  if (!isValidGroup(grupo)) {
    return;
  }
  const valor = record.valor as string | number;

  const sign = determineValueSign(valor);

  if (sign === "invalid") {
    errors.push({
      path: `${basePath}.valor`,
      code: "invalid_value",
      message: `Valor inválido em ${basePath}.valor; informe número ou string monetária com dígitos.`
    });
    return;
  }

  if (NEGATIVE_GROUPS.has(grupo) && sign === "positive") {
    errors.push({
      path: `${basePath}.valor`,
      code: "invalid_value",
      message: `Valores do grupo "${grupo}" devem ser negativos.`
    });
  }

  if (POSITIVE_GROUPS.has(grupo) && sign === "negative") {
    errors.push({
      path: `${basePath}.valor`,
      code: "invalid_value",
      message: `Valores do grupo "${grupo}" devem ser positivos.`
    });
  }
}

function isPlainObject(value: unknown): value is DreInput {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isOfType(value: unknown, type: "string" | "object" | "array"): boolean {
  if (type === "array") {
    return Array.isArray(value);
  }
  if (type === "object") {
    return isPlainObject(value);
  }
  return typeof value === type;
}

function expectedLabel(type: "string" | "object" | "array"): string {
  switch (type) {
    case "string":
      return "uma string";
    case "object":
      return "um objeto";
    case "array":
      return "uma lista";
  }
}

function isValidPeriodo(periodo: string): boolean {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(periodo);
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

function isValidGroup(value: string): boolean {
  return POSITIVE_GROUPS.has(value) || NEGATIVE_GROUPS.has(value) || FLEX_GROUPS.has(value);
}

type ValueSign = "positive" | "negative" | "zero" | "invalid";

function determineValueSign(value: string | number): ValueSign {
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      return "invalid";
    }
    if (value === 0) {
      return "zero";
    }
    return value > 0 ? "positive" : "negative";
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return "invalid";
  }

  const digits = trimmed.replace(/[^0-9]/g, "");
  if (!digits) {
    return "invalid";
  }

  const allZeros = /^0+$/.test(digits);

  const hasParentheses = trimmed.startsWith("(") && trimmed.endsWith(")");
  const hasMinus = trimmed.includes("-");

  if (allZeros) {
    return "zero";
  }

  if (hasMinus || hasParentheses) {
    return "negative";
  }

  return "positive";
}
