/**
 * Tests pour les services
 */

const analyze = require("../services/analyze");
const OpenAIService = require("../services/openai-service");
const GeminiService = require("../services/gemini-service");

describe("Tests des Services", () => {
  
  test("Le service OpenAI doit être instanciable", () => {
    const service = new OpenAIService("test-key");
    expect(service).toBeDefined();
    expect(service.model).toBeDefined();
  });

  test("Le service Gemini doit être instanciable", () => {
    const service = new GeminiService("test-key");
    expect(service).toBeDefined();
    expect(service.model).toBeDefined();
  });

  test("OpenAI sans clé doit retourner non configuré", () => {
    const service = new OpenAIService(null);
    expect(service.isConfigured()).toBe(false);
  });

  test("Gemini sans clé doit retourner non configuré", () => {
    const service = new GeminiService(null);
    expect(service.isConfigured()).toBe(false);
  });

  test("Le service d'analyse doit être une fonction", () => {
    expect(typeof analyze).toBe("function");
  });
});




