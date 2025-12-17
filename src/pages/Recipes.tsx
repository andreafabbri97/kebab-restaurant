import { useEffect, useState } from 'react';
import {
  Plus,
  Trash2,
  ChefHat,
  Package,
  Search,
  Save,
} from 'lucide-react';
import {
  getMenuItems,
  getIngredients,
  getMenuItemIngredients,
  addMenuItemIngredient,
  updateMenuItemIngredient,
  deleteMenuItemIngredient,
} from '../lib/database';
import { showToast } from '../components/ui/Toast';
import type { MenuItem, Ingredient, MenuItemIngredient } from '../types';

export function Recipes() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [recipes, setRecipes] = useState<MenuItemIngredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMenuItem, setSelectedMenuItem] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Form per nuovo ingrediente nella ricetta
  const [newIngredientId, setNewIngredientId] = useState<number | ''>('');
  const [newQuantity, setNewQuantity] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [items, ings, recs] = await Promise.all([
        getMenuItems(),
        getIngredients(),
        getMenuItemIngredients(),
      ]);
      setMenuItems(items);
      setIngredients(ings);
      setRecipes(recs);
      if (items.length > 0 && !selectedMenuItem) {
        setSelectedMenuItem(items[0].id);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      showToast('Errore nel caricamento dati', 'error');
    } finally {
      setLoading(false);
    }
  }

  const filteredMenuItems = menuItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedItemRecipe = recipes.filter(r => r.menu_item_id === selectedMenuItem);
  const selectedItem = menuItems.find(m => m.id === selectedMenuItem);

  // Ingredienti non ancora nella ricetta
  const availableIngredients = ingredients.filter(
    ing => !selectedItemRecipe.some(r => r.ingredient_id === ing.id)
  );

  async function handleAddIngredient() {
    if (!selectedMenuItem || !newIngredientId || !newQuantity) {
      showToast('Seleziona ingrediente e quantità', 'warning');
      return;
    }

    try {
      await addMenuItemIngredient({
        menu_item_id: selectedMenuItem,
        ingredient_id: Number(newIngredientId),
        quantity: parseFloat(newQuantity),
      });
      showToast('Ingrediente aggiunto alla ricetta', 'success');
      setNewIngredientId('');
      setNewQuantity('');
      loadData();
    } catch (error) {
      console.error('Error adding ingredient:', error);
      showToast('Errore nell\'aggiunta', 'error');
    }
  }

  async function handleUpdateQuantity(recipeId: number, quantity: number) {
    try {
      await updateMenuItemIngredient(recipeId, { quantity });
      showToast('Quantità aggiornata', 'success');
      loadData();
    } catch (error) {
      console.error('Error updating quantity:', error);
      showToast('Errore nell\'aggiornamento', 'error');
    }
  }

  async function handleRemoveIngredient(recipeId: number) {
    try {
      await deleteMenuItemIngredient(recipeId);
      showToast('Ingrediente rimosso', 'success');
      loadData();
    } catch (error) {
      console.error('Error removing ingredient:', error);
      showToast('Errore nella rimozione', 'error');
    }
  }

  // Calcola costo totale ingredienti per il piatto selezionato
  const recipeCost = selectedItemRecipe.reduce((sum, r) => {
    const ing = ingredients.find(i => i.id === r.ingredient_id);
    return sum + (ing ? ing.cost * r.quantity : 0);
  }, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Gestione Ricette</h1>
        <p className="text-dark-400 text-sm">
          Collega gli ingredienti ai piatti per il calcolo automatico delle scorte
        </p>
      </div>

      <div className="grid grid-cols-12 gap-4 h-[calc(100vh-160px)]">
        {/* Left: Menu Items List */}
        <div className="col-span-4 bg-dark-800 rounded-xl border border-dark-700 flex flex-col">
          <div className="p-3 border-b border-dark-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
              <input
                type="text"
                placeholder="Cerca piatto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-9 py-2 text-sm"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredMenuItems.map((item) => {
              const itemRecipe = recipes.filter(r => r.menu_item_id === item.id);
              const hasRecipe = itemRecipe.length > 0;

              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedMenuItem(item.id)}
                  className={`w-full p-3 text-left border-b border-dark-700 transition-colors ${
                    selectedMenuItem === item.id
                      ? 'bg-primary-500/20 border-l-2 border-l-primary-500'
                      : 'hover:bg-dark-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white text-sm">{item.name}</p>
                      <p className="text-xs text-dark-400">€{item.price.toFixed(2)}</p>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${hasRecipe ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  </div>
                </button>
              );
            })}
          </div>
          <div className="p-3 border-t border-dark-700 text-xs text-dark-400">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Con ricetta</span>
              <div className="w-2 h-2 rounded-full bg-amber-500 ml-2" />
              <span>Senza ricetta</span>
            </div>
          </div>
        </div>

        {/* Right: Recipe Editor */}
        <div className="col-span-8 bg-dark-800 rounded-xl border border-dark-700 flex flex-col">
          {selectedItem ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-dark-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center">
                      <ChefHat className="w-6 h-6 text-primary-400" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white">{selectedItem.name}</h2>
                      <p className="text-sm text-dark-400">
                        Prezzo: €{selectedItem.price.toFixed(2)} | Costo ingredienti: €{recipeCost.toFixed(2)} |{' '}
                        <span className={recipeCost > 0 ? (selectedItem.price - recipeCost > 0 ? 'text-emerald-400' : 'text-red-400') : 'text-dark-400'}>
                          Margine: €{(selectedItem.price - recipeCost).toFixed(2)}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ingredients List */}
              <div className="flex-1 overflow-y-auto p-4">
                <h3 className="text-sm font-medium text-dark-300 mb-3">Ingredienti nella ricetta</h3>

                {selectedItemRecipe.length === 0 ? (
                  <div className="text-center py-8 text-dark-400">
                    <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Nessun ingrediente configurato</p>
                    <p className="text-sm">Aggiungi ingredienti qui sotto</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedItemRecipe.map((recipe) => {
                      const ing = ingredients.find(i => i.id === recipe.ingredient_id);
                      const cost = ing ? ing.cost * recipe.quantity : 0;

                      return (
                        <div
                          key={recipe.id}
                          className="flex items-center justify-between p-3 bg-dark-900 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <Package className="w-5 h-5 text-dark-400" />
                            <div>
                              <p className="font-medium text-white">{recipe.ingredient_name}</p>
                              <p className="text-xs text-dark-400">
                                €{ing?.cost.toFixed(2)}/{recipe.unit} → Costo: €{cost.toFixed(3)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={recipe.quantity}
                              onChange={(e) => handleUpdateQuantity(recipe.id, parseFloat(e.target.value) || 0)}
                              className="w-20 bg-dark-800 border border-dark-600 rounded px-2 py-1 text-sm text-center"
                            />
                            <span className="text-sm text-dark-400 w-8">{recipe.unit}</span>
                            <button
                              onClick={() => handleRemoveIngredient(recipe.id)}
                              className="p-1.5 text-red-400 hover:bg-red-500/20 rounded transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Add Ingredient */}
              <div className="p-4 border-t border-dark-700 bg-dark-900/50">
                <h3 className="text-sm font-medium text-dark-300 mb-2">Aggiungi ingrediente</h3>
                <div className="flex gap-2">
                  <select
                    value={newIngredientId}
                    onChange={(e) => setNewIngredientId(e.target.value ? Number(e.target.value) : '')}
                    className="input flex-1 py-2 text-sm"
                  >
                    <option value="">Seleziona ingrediente...</option>
                    {availableIngredients.map((ing) => (
                      <option key={ing.id} value={ing.id}>
                        {ing.name} ({ing.unit})
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Qtà"
                    value={newQuantity}
                    onChange={(e) => setNewQuantity(e.target.value)}
                    className="input w-24 py-2 text-sm"
                  />
                  <button
                    onClick={handleAddIngredient}
                    disabled={!newIngredientId || !newQuantity}
                    className="btn-primary px-4 py-2"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-dark-400">
              <div className="text-center">
                <ChefHat className="w-16 h-16 mx-auto mb-3 opacity-50" />
                <p>Seleziona un piatto dalla lista</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
