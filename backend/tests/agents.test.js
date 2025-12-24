/**
 * Tests pour les agents VerifDoc
 */

const Agent = require("../services/agent");
const agentsConfig = require("../config/agents.config");

describe("Tests des Agents", () => {
  
  test("Agent 1 doit être configuré avec OpenAI", () => {
    const agent1Config = agentsConfig.agents.find(a => a.id === "agent-1");
    expect(agent1Config).toBeDefined();
    expect(agent1Config.provider || agentsConfig.agents["agent-1"]?.provider).toBe("openai");
    expect(agent1Config.enabled).toBe(true);
  });

  test("Agent 2 doit être configuré avec Gemini", () => {
    const agent2Config = agentsConfig.agents.find(a => a.id === "agent-2");
    expect(agent2Config).toBeDefined();
    expect(agent2Config.provider || agentsConfig.agents["agent-2"]?.provider).toBe("gemini");
    expect(agent2Config.enabled).toBe(true);
  });

  test("Les deux agents doivent être activés", () => {
    const enabledAgents = agentsConfig.agents.filter(a => a.enabled);
    expect(enabledAgents.length).toBe(2);
  });

  test("La configuration globale doit être correcte", () => {
    expect(agentsConfig.global.executionMode).toBe("parallel");
    expect(agentsConfig.global.fusionMode).toBe("weighted");
    expect(agentsConfig.global.fusionWeights["agent-1"]).toBe(0.6);
    expect(agentsConfig.global.fusionWeights["agent-2"]).toBe(0.4);
  });

  test("Agent doit être instanciable", () => {
    const agent1Config = agentsConfig.agents.find(a => a.id === "agent-1");
    const agent = new Agent(agent1Config);
    expect(agent).toBeDefined();
    expect(agent.id).toBe("agent-1");
    expect(agent.enabled).toBe(true);
  });

  test("Agent désactivé doit lever une erreur", async () => {
    const agent1Config = agentsConfig.agents.find(a => a.id === "agent-1");
    const agent = new Agent({ ...agent1Config, enabled: false });
    
    const mockFile = {
      path: "test/path",
      originalname: "test.jpg"
    };

    await expect(agent.analyze(mockFile)).rejects.toThrow();
  });
});




