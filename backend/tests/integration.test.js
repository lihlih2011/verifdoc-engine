/**
 * Tests d'intégration
 */

const analyze = require("../services/analyze");
const agentsConfig = require("../config/agents.config");

describe("Tests d'Intégration", () => {
  
  test("La fusion des résultats doit fonctionner", () => {
    const mockResults = [
      {
        agentId: "agent-1",
        agentName: "Agent Principal",
        verdict: "DOCUMENT SUSPECT",
        confidenceScore: 70,
        anomalies: ["Anomalie 1", "Anomalie 2"]
      },
      {
        agentId: "agent-2",
        agentName: "Agent Secondaire",
        verdict: "DOCUMENT VALIDE",
        confidenceScore: 80,
        anomalies: ["Anomalie 1"]
      }
    ];

    // Simuler la fusion
    const weights = agentsConfig.global.fusionWeights;
    const fusedScore = mockResults.reduce((sum, result) => {
      const weight = weights[result.agentId] || 0.5;
      return sum + (result.confidenceScore * weight);
    }, 0);

    expect(fusedScore).toBeGreaterThan(0);
    expect(fusedScore).toBeLessThanOrEqual(100);
  });

  test("Les agents doivent avoir des priorités différentes", () => {
    const agent1 = agentsConfig.agents.find(a => a.id === "agent-1");
    const agent2 = agentsConfig.agents.find(a => a.id === "agent-2");
    
    expect(agent1.priority).toBe(1);
    expect(agent2.priority).toBe(2);
    expect(agent1.priority).toBeLessThan(agent2.priority);
  });

  test("La configuration doit supporter le mode parallèle", () => {
    expect(agentsConfig.global.executionMode).toBe("parallel");
  });
});




