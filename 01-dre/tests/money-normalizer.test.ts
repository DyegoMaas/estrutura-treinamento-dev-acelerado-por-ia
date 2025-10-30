import { describe, expect, it } from "vitest";
import {
  NormalizationError,
  normalizeDreInput
} from "../src/normalization/moneyNormalizer.js";

type DreInput = ReturnType<typeof createBaseInput>;

function createBaseInput(): {
  schemaVersion: number;
  periodo: string;
  moeda: string;
  totais: Record<string, number>;
  porConta: Array<{ id: string; nome: string; grupo: string; valor: string | number }>;
} {
  return {
    schemaVersion: 1,
    periodo: "2025-01",
    moeda: "BRL",
    totais: {},
    porConta: [
      { id: "R1", nome: "Vendas", grupo: "receita", valor: "R$ 10.000,00" },
      { id: "D1", nome: "Impostos", grupo: "deducao", valor: "-2.500,00" }
    ]
  };
}

describe("MoneyNormalizer.normalizeDreInput", () => {
  it("normalizes BR formatted monetary strings into numbers", () => {
    const input: DreInput = createBaseInput();

    const result = normalizeDreInput(input);

    expect(result.data.porConta[0].valor).toBe(10000);
    expect(result.warnings).toContainEqual(
      expect.objectContaining({
        code: "normalized_value",
        path: "porConta[0].valor"
      })
    );
  });

  it("normalizes EN formatted monetary strings into numbers", () => {
    const input: DreInput = createBaseInput();
    input.porConta[0] = {
      id: "R1",
      nome: "Revenue",
      grupo: "receita",
      valor: "10,000.00"
    };

    const result = normalizeDreInput(input);

    expect(result.data.porConta[0].valor).toBe(10000);
    expect(result.warnings).toContainEqual(
      expect.objectContaining({
        code: "normalized_value",
        path: "porConta[0].valor"
      })
    );
  });

  it("interprets parentheses and minus signs as negatives", () => {
    const input: DreInput = createBaseInput();
    input.porConta[1] = {
      id: "D1",
      nome: "Impostos",
      grupo: "deducao",
      valor: "(2.500,00)"
    };

    const result = normalizeDreInput(input);

    expect(result.data.porConta[1].valor).toBe(-2500);
  });

  it("does not add warnings when values are already numeric", () => {
    const input: DreInput = createBaseInput();
    input.porConta[0] = { ...input.porConta[0], valor: 1234.56 };
    input.porConta[1] = { ...input.porConta[1], valor: -2500 };

    const result = normalizeDreInput(input);

    expect(result.data.porConta[0].valor).toBe(1234.56);
    expect(result.data.porConta[1].valor).toBe(-2500);
    expect(result.warnings).toEqual([]);
  });

  it("throws NormalizationError when periodo does not match YYYY-MM", () => {
    const input: DreInput = createBaseInput();
    input.periodo = "2025/01";

    expect(() => normalizeDreInput(input)).toThrow(NormalizationError);

    try {
      normalizeDreInput(input);
    } catch (error) {
      const normalizationError = error as NormalizationError;
      expect(normalizationError.errors).toContainEqual(
        expect.objectContaining({
          path: "periodo",
          code: "invalid_format"
        })
      );
    }
  });
});
