export const useMyGarden = () => {
  const STORAGE_KEY = "petflora_my_garden";

  const getSavedPlants = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error("Erro ao carregar My Garden:", error);
      return [];
    }
  };

  const addPlant = (plant) => {
    try {
      const saved = getSavedPlants();

      if (saved.some((p) => p.id === plant.id)) {
        return saved;
      }

      const updated = [
        ...saved,
        { ...plant, addedAt: new Date().toISOString() },
      ];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    } catch (error) {
      console.error("Erro ao adicionar planta:", error);
      return getSavedPlants();
    }
  };

  const removePlant = (plantId) => {
    try {
      const saved = getSavedPlants();
      const updated = saved.filter((p) => p.id !== plantId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    } catch (error) {
      console.error("Erro ao remover planta:", error);
      return getSavedPlants();
    }
  };

  const clearGarden = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      return [];
    } catch (error) {
      console.error("Erro ao limpar garden:", error);
      return [];
    }
  };

  const isInGarden = (plantId) => {
    return getSavedPlants().some((p) => p.id === plantId);
  };

  return {
    getSavedPlants,
    addPlant,
    removePlant,
    clearGarden,
    isInGarden,
  };
};
