/**
 * Tests pour la configuration
 */

const agentsConfig = require("../config/agents.config");
const apiKeysConfig = require("../config/api-keys.config");

describe("Tests de Configuration", () => {
  
  test("La configuration des agents doit être chargée", () => {
    expect(agentsConfig).toBeDefined();
    expect(agentsConfig.agents).toBeDefined();
    expect(Array.isArray(agentsConfig.agents)).toBe(true);
    expect(agentsConfig.agents.length).toBe(2);
  });

  test("Les clés API doivent être configurables", () => {
    expect(apiKeysConfig).toBeDefined();
    expect(apiKeysConfig.agents).toBeDefined();
    expect(apiKeysConfig.agents["agent-1"]).toBeDefined();
    expect(apiKeysConfig.agents["agent-2"]).toBeDefined();
  });

  test("La configuration OpenAI doit être présente", () => {
    expect(apiKeysConfig.openai).toBeDefined();
    expect(apiKeysConfig.openai.model).toBeDefined();
    expect(apiKeysConfig.openai.apiUrl).toBeDefined();
  });

  test("La configuration Gemini doit être présente", () => {
    expect(apiKeysConfig.gemini).toBeDefined();
    expect(apiKeysConfig.gemini.model).toBeDefined();
    expect(apiKeysConfig.gemini.apiUrl).toBeDefined();
  });

  test("Les endpoints doivent être configurés", () => {
    const agent1 = agentsConfig.agents.find(a => a.id === "agent-1");
    const agent2 = agentsConfig.agents.find(a => a.id === "agent-2");
    
    expect(agent1.endpoints).toBeDefined();
    expect(agent2.endpoints).toBeDefined();
    expect(agent1.endpoints.baseUrl).toContain("openai.com");
    expect(agent2.endpoints.baseUrl).toContain("googleapis.com");
  });
});




