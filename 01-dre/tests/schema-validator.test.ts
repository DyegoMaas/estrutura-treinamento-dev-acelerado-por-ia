import { describe, expect, it } from "vitest";
import { validateDreSchema } from "../src/validation/schemaValidator.js";

const createValidInput = () => ({
  schemaVersion: 1,
  periodo: "2025-01",
  moeda: "BRL",
  totais: {
    receitaBruta: 100000,
    deducoes: 10000
  },
  porConta: [
    { id: "R1", nome: "Receita A", grupo: "receita", valor: 100000 },
    { id: "D1", nome: "Imposto", grupo: "deducao", valor: -10000 },
    { id: "C1", nome: "Custo", grupo: "custo", valor: -20000 },
    { id: "E1", nome: "Marketing", grupo: "despesa", valor: -5000 },
    { id: "O1", nome: "Outras receitas/despesas", grupo: "outras", valor: 2000 },
    { id: "I1", nome: "IR", grupo: "imposto", valor: -3000 }
  ]
});

describe("validateDreSchema", () => {
  it("returns ok for a minimal valid payload", () => {
    const result = validateDreSchema(createValidInput());
    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("accepts valores monetarios como string com sinal consistente", () => {
    const input = createValidInput();
    input.porConta[1] = {
      id: "D1",
      nome: "Impostos sobre vendas",
      grupo: "deducao",
      valor: "R$ -10.000,00"
    } as any;

    const result = validateDreSchema(input);

    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("reports missing mandatory fields", () => {
    const invalid: any = { ...createValidInput() };
    delete invalid.moeda;

    const result = validateDreSchema(invalid);
    expect(result.ok).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({
        path: "moeda",
        code: "missing_field"
      })
    );
  });

  it("rejects periodo that does not match YYYY-MM", () => {
    const invalid = { ...createValidInput(), periodo: "202501" };
    const result = validateDreSchema(invalid);

    expect(result.ok).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({
        path: "periodo",
        code: "invalid_format"
      })
    );
  });

  it("rejects moeda that is not ISO-4217", () => {
    const invalid = { ...createValidInput(), moeda: "BR" };
    const result = validateDreSchema(invalid);

    expect(result.ok).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({
        path: "moeda",
        code: "invalid_format"
      })
    );
  });

  it("rejects porConta with invalid grupo", () => {
    const invalid: any = createValidInput();
    invalid.porConta[0] = { ...invalid.porConta[0], grupo: "foo" };

    const result = validateDreSchema(invalid);

    expect(result.ok).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({
        path: "porConta[0].grupo",
        code: "invalid_enum"
      })
    );
  });

  it("rejects valores com sinais inconsistentes para grupo receita", () => {
    const invalid: any = createValidInput();
    invalid.porConta[0] = { ...invalid.porConta[0], valor: -1000 };

    const result = validateDreSchema(invalid);

    expect(result.ok).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({
        path: "porConta[0].valor",
        code: "invalid_value"
      })
    );
  });

  it("rejects valores com sinais inconsistentes para grupos negativos", () => {
    const invalid: any = createValidInput();
    invalid.porConta[1] = { ...invalid.porConta[1], valor: 500 };

    const result = validateDreSchema(invalid);

    expect(result.ok).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({
        path: "porConta[1].valor",
        code: "invalid_value"
      })
    );
  });

  it("rejects unknown top-level properties", () => {
    const invalid: any = { ...createValidInput(), extra: true };
    const result = validateDreSchema(invalid);

    expect(result.ok).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({
        path: "extra",
        code: "extra_field"
      })
    );
  });

  it("rejects unknown properties inside porConta items", () => {
    const invalid: any = createValidInput();
    invalid.porConta[0] = { ...invalid.porConta[0], extra: "x" };

    const result = validateDreSchema(invalid);

    expect(result.ok).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({
        path: "porConta[0].extra",
        code: "extra_field"
      })
    );
  });

  it("rejects payload when porConta is not an array", () => {
    const invalid: any = { ...createValidInput(), porConta: {} };
    const result = validateDreSchema(invalid);

    expect(result.ok).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({
        path: "porConta",
        code: "invalid_type"
      })
    );
  });

  it("rejects porConta items missing required fields", () => {
    const invalid: any = createValidInput();
    delete invalid.porConta[0].id;

    const result = validateDreSchema(invalid);

    expect(result.ok).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({
        path: "porConta[0].id",
        code: "missing_field"
      })
    );
  });

  it("rejects string valores positivos para grupos que exigem negativo", () => {
    const invalid: any = createValidInput();
    invalid.porConta[1] = {
      ...invalid.porConta[1],
      valor: "10.000,00"
    };

    const result = validateDreSchema(invalid);

    expect(result.ok).toBe(false);
    expect(result.errors).toContainEqual(
      expect.objectContaining({
        path: "porConta[1].valor",
        code: "invalid_value"
      })
    );
  });
});
