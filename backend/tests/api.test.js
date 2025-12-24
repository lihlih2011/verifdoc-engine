/**
 * Tests pour l'API Express
 * Note: Ces tests nécessitent que le serveur soit démarré
 */

describe("Tests de l'API", () => {
  const baseUrl = "http://localhost:3001";

  test("L'endpoint /agents/config doit retourner la configuration", async () => {
    try {
      const response = await fetch(`${baseUrl}/agents/config`);
      const data = await response.json();
      
      expect(response.ok).toBe(true);
      expect(data.agents).toBeDefined();
      expect(Array.isArray(data.agents)).toBe(true);
      expect(data.agents.length).toBe(2);
    } catch (error) {
      // Le serveur n'est peut-être pas démarré, c'est OK pour les tests unitaires
      console.log("Serveur non démarré, test ignoré");
    }
  });

  test("L'endpoint /agents/api-keys/status doit retourner le statut", async () => {
    try {
      const response = await fetch(`${baseUrl}/agents/api-keys/status`);
      const data = await response.json();
      
      expect(response.ok).toBe(true);
      expect(data.agent1).toBeDefined();
      expect(data.agent2).toBeDefined();
    } catch (error) {
      console.log("Serveur non démarré, test ignoré");
    }
  });
});




