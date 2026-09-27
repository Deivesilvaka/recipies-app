import { api, getToken, setToken, getBaseUrl, setBaseUrl } from './api.js';
import { escapeHtml, toast, messageFromError, dateInputToBrDate, brDateToDateInput } from './ui.js';
import { attachDragReorder, nextUid } from './sortable.js';

const RECIPE_BADGES = ['PROTEICO', 'CONGELÁVEL', 'AIR FRYER', 'VEGETARIANO', 'SEM GLÚTEN'];

const app = document.getElementById('app');
const nav = document.getElementById('nav');

let currentUser = null;
let pendingVerificationUserId = sessionStorage.getItem('pendingVerificationUserId') || null;
let lastSearch = { q: '', category: '', page: 1, limit: 12 };
let selectedRecipeIds = new Set();

// Bumped on every navigation so an async render (search/getRecipe/profile fetch) that
// resolves after the user has already navigated elsewhere can detect it's stale and bail
// out instead of overwriting the page that's on screen now with outdated content.
let currentNavId = 0;
function isStaleNav(navId) {
  return navId !== currentNavId;
}

// ---------- helpers ----------

function isLoggedIn() {
  return Boolean(getToken());
}

function requireAuthOrRedirect() {
  if (!isLoggedIn()) {
    toast('Faça login para continuar.', 'error');
    navigate('/login');
    return false;
  }
  return true;
}

function navigate(hash) {
  if (location.hash === `#${hash}`) {
    router();
  } else {
    location.hash = hash;
  }
}

function logout() {
  setToken(null);
  currentUser = null;
  toast('Você saiu da sua conta.', 'info');
  navigate('/recipes');
}

async function ensureCurrentUser() {
  if (currentUser || !isLoggedIn()) return currentUser;
  try {
    currentUser = await api.getProfile();
  } catch {
    setToken(null);
  }
  return currentUser;
}

function renderNav() {
  if (isLoggedIn()) {
    nav.innerHTML = `
      <a href="#/recipes">Receitas</a>
      <a href="#/recipes/new">Nova receita</a>
      <a href="#/profile">Perfil</a>
      <button id="logout-btn" class="secondary small">Sair</button>
    `;
    document.getElementById('logout-btn').addEventListener('click', logout);
  } else {
    nav.innerHTML = `
      <a href="#/recipes">Receitas</a>
      <a href="#/login">Entrar</a>
      <a href="#/signup">Cadastrar</a>
    `;
  }
}

function imageSrc(recipe) {
  if (!recipe.mainImageUrl) return null;
  return `${getBaseUrl()}${recipe.mainImageUrl}?t=${Date.now()}`;
}

// ---------- router ----------

async function router() {
  const navId = ++currentNavId;

  renderNav();
  const hash = location.hash.replace(/^#/, '') || '/recipes';
  const parts = hash.split('/').filter(Boolean);

  app.innerHTML = '<p class="muted">Carregando...</p>';

  try {
    if (parts.length === 0 || (parts[0] === 'recipes' && parts.length === 1)) {
      return await renderRecipeList(navId);
    }
    if (parts[0] === 'login') return renderLogin();
    if (parts[0] === 'signup') return renderSignup();
    if (parts[0] === 'verify') return renderVerify();
    if (parts[0] === 'forgot') return renderForgot();
    if (parts[0] === 'profile') return await renderProfile(navId);
    if (parts[0] === 'recipes' && parts[1] === 'new') return await renderRecipeForm(null, navId);
    if (parts[0] === 'recipes' && parts[2] === 'edit') return await renderRecipeForm(parts[1], navId);
    if (parts[0] === 'recipes' && parts.length === 2) return await renderRecipeDetail(parts[1], navId);

    app.innerHTML = '<p>Página não encontrada. <a href="#/recipes">Voltar</a></p>';
  } catch (error) {
    if (isStaleNav(navId)) return;
    app.innerHTML = `<p class="empty-state">${escapeHtml(messageFromError(error))}</p>`;
  }
}

window.addEventListener('hashchange', router);

// ---------- recipe list ----------

async function renderRecipeList(navId = currentNavId) {
  const result = await api.searchRecipes(lastSearch);
  if (isStaleNav(navId)) return;
  const totalPages = Math.max(1, Math.ceil(result.total / result.limit));
  selectedRecipeIds.clear();
  const canDelete = isLoggedIn();

  app.innerHTML = `
    <h1>Receitas</h1>
    <form id="search-form" class="search-bar">
      <input id="search-q" type="text" placeholder="Buscar por título..." value="${escapeHtml(lastSearch.q)}" />
      <input id="search-category" type="text" placeholder="Categoria exata (opcional)" value="${escapeHtml(lastSearch.category)}" />
      <button type="submit">Buscar</button>
    </form>
    ${canDelete ? `
      <div id="bulk-actions" class="bulk-actions">
        <span id="selected-count" class="muted">Nenhuma selecionada</span>
        <button type="button" id="delete-selected-btn" class="danger small" disabled>Excluir selecionadas</button>
      </div>
    ` : ''}
    <div id="results"></div>
    <div class="pagination">
      <button id="prev-page" class="secondary small" ${result.page <= 1 ? 'disabled' : ''}>← Anterior</button>
      <span class="muted">Página ${result.page} de ${totalPages} (${result.total} receitas)</span>
      <button id="next-page" class="secondary small" ${result.page >= totalPages ? 'disabled' : ''}>Próxima →</button>
    </div>
  `;

  const resultsEl = document.getElementById('results');
  if (result.items.length === 0) {
    resultsEl.innerHTML = '<p class="empty-state">Nenhuma receita encontrada.</p>';
  } else {
    resultsEl.innerHTML = `<div class="grid">${result.items.map((r) => recipeCardHtml(r, canDelete)).join('')}</div>`;
  }

  document.getElementById('search-form').addEventListener('submit', (event) => {
    event.preventDefault();
    lastSearch.q = document.getElementById('search-q').value.trim();
    lastSearch.category = document.getElementById('search-category').value.trim();
    lastSearch.page = 1;
    renderRecipeList();
  });

  document.getElementById('prev-page').addEventListener('click', () => {
    lastSearch.page = Math.max(1, lastSearch.page - 1);
    renderRecipeList();
  });

  document.getElementById('next-page').addEventListener('click', () => {
    lastSearch.page += 1;
    renderRecipeList();
  });

  if (canDelete) {
    const deleteSelectedBtn = document.getElementById('delete-selected-btn');
    const selectedCountEl = document.getElementById('selected-count');

    function updateBulkActionsUi() {
      const count = selectedRecipeIds.size;
      selectedCountEl.textContent = count === 0 ? 'Nenhuma selecionada' : `${count} selecionada(s)`;
      deleteSelectedBtn.disabled = count === 0;
    }

    resultsEl.querySelectorAll('.card-select').forEach((checkbox) => {
      checkbox.addEventListener('click', (event) => {
        // Só interrompe a propagação para o <a>.card (evitando navegar para o detalhe);
        // preventDefault aqui bloquearia o próprio toggle do checkbox.
        event.stopPropagation();
      });
      checkbox.addEventListener('change', () => {
        const id = checkbox.value;
        if (checkbox.checked) {
          selectedRecipeIds.add(id);
        } else {
          selectedRecipeIds.delete(id);
        }
        updateBulkActionsUi();
      });
    });

    deleteSelectedBtn.addEventListener('click', async () => {
      const ids = Array.from(selectedRecipeIds);
      if (ids.length === 0) return;
      const confirmed = window.confirm(
        `Excluir ${ids.length} receita(s) selecionada(s)? Essa ação não pode ser desfeita.`,
      );
      if (!confirmed) return;

      try {
        await api.deleteRecipes(ids);
        toast('Receita(s) excluída(s)!', 'success');
        renderRecipeList();
      } catch (error) {
        toast(messageFromError(error), 'error');
      }
    });
  }
}

function recipeCardHtml(recipe, canDelete = false) {
  const image = imageSrc(recipe);
  const imageHtml = image
    ? `<img src="${escapeHtml(image)}" alt="${escapeHtml(recipe.title)}" />`
    : '<div class="card-image-placeholder">🍽️</div>';

  return `
    <a class="card" href="#/recipes/${recipe.id}">
      ${canDelete ? `
        <label class="card-select-wrap">
          <input type="checkbox" class="card-select" value="${recipe.id}" title="Selecionar para excluir" />
        </label>
      ` : ''}
      ${imageHtml}
      <div class="card-body">
        <div class="card-title">${escapeHtml(recipe.title)}</div>
        <div class="card-meta">${escapeHtml(recipe.category || 'Sem categoria')}</div>
        <div class="card-meta">⏱ ${recipe.prepTimeMinutes} min · 🍽 ${recipe.servings} porções</div>
        <div>${(recipe.badges || []).map((b) => `<span class="badge">${escapeHtml(b)}</span>`).join('')}</div>
      </div>
    </a>
  `;
}

// ---------- recipe detail ----------

async function renderRecipeDetail(id, navId = currentNavId) {
  const recipe = await api.getRecipe(id);
  if (isStaleNav(navId)) return;
  const image = imageSrc(recipe);

  app.innerHTML = `
    <p><a href="#/recipes">← Voltar para receitas</a></p>
    <div class="detail-hero">
      ${image ? `<img src="${escapeHtml(image)}" alt="${escapeHtml(recipe.title)}" />` : '<div class="card-image-placeholder">🍽️</div>'}
    </div>
    <h1>${escapeHtml(recipe.title)}</h1>
    ${recipe.subtitle ? `<p class="muted">${escapeHtml(recipe.subtitle)}</p>` : ''}
    <div>${(recipe.badges || []).map((b) => `<span class="badge">${escapeHtml(b)}</span>`).join('')}</div>
    <div class="meta-row">
      <span>📂 ${escapeHtml(recipe.category || 'Sem categoria')}</span>
      <span>⏱ ${recipe.prepTimeMinutes} min</span>
      <span>🍽 ${recipe.servings} porções${recipe.portionReference ? ` (${escapeHtml(recipe.portionReference)})` : ''}</span>
    </div>

    ${recipe.nutritionalInfo ? `
      <h2>Informação nutricional (por porção)</h2>
      <div class="table-scroll">
        <table class="nutrition-table">
          <tr><td>Calorias</td><td><strong>${recipe.nutritionalInfo.caloriesKcal} kcal</strong></td></tr>
          <tr><td>Proteínas</td><td>${recipe.nutritionalInfo.proteinsGrams} g</td></tr>
          <tr><td>Carboidratos</td><td>${recipe.nutritionalInfo.carbohydratesGrams} g</td></tr>
          <tr><td>Gorduras</td><td>${recipe.nutritionalInfo.fatsGrams} g</td></tr>
          <tr><td>Fibras</td><td>${recipe.nutritionalInfo.fibersGrams} g</td></tr>
          <tr><td>Sódio</td><td>${recipe.nutritionalInfo.sodiumMg} mg</td></tr>
        </table>
      </div>
    ` : ''}

    <h2>Ingredientes</h2>
    <ul>${recipe.ingredients.map((i) => `<li>${escapeHtml(i.description)}</li>`).join('')}</ul>

    ${recipe.visualSteps && recipe.visualSteps.length ? `
      <h2>Passo a passo</h2>
      <ol>${recipe.visualSteps
        .slice()
        .sort((a, b) => a.stepNumber - b.stepNumber)
        .map((s) => `<li>${escapeHtml(s.description)}</li>`)
        .join('')}</ol>
    ` : ''}

    <h2>Modo de preparo</h2>
    <ol>${recipe.instructions.map((i) => `<li>${escapeHtml(i.description)}</li>`).join('')}</ol>

    ${recipe.chefTips && recipe.chefTips.length ? `
      <h2>Dicas do chef</h2>
      <ul>${recipe.chefTips.map((t) => `<li>${escapeHtml(t.tip)}</li>`).join('')}</ul>
    ` : ''}

    <hr class="divider" />
    <div class="detail-actions">
      <button id="edit-btn" class="secondary">Editar esta receita</button>
      <button id="delete-btn" class="danger">Excluir esta receita</button>
    </div>
  `;

  document.getElementById('edit-btn').addEventListener('click', () => {
    if (!requireAuthOrRedirect()) return;
    navigate(`/recipes/${id}/edit`);
  });

  document.getElementById('delete-btn').addEventListener('click', async () => {
    if (!requireAuthOrRedirect()) return;
    const confirmed = window.confirm('Excluir esta receita? Essa ação não pode ser desfeita.');
    if (!confirmed) return;

    try {
      await api.deleteRecipe(id);
      toast('Receita excluída!', 'success');
      navigate('/recipes');
    } catch (error) {
      toast(messageFromError(error), 'error');
    }
  });
}

// ---------- recipe form (create/edit) ----------

function emptyTextList(values = []) {
  return values.map((value) => ({ id: undefined, _uid: nextUid(), value }));
}

const dragHandleHtml =
  '<span class="drag-handle" data-drag-handle title="Arraste para reordenar">⠿</span>';

function createListEditor(container, items, { placeholder, multiline = false }) {
  items.forEach((item) => {
    if (!item._uid) item._uid = nextUid();
  });

  function render() {
    container.innerHTML = items
      .map(
        (item, index) => `
          <div class="list-row" data-uid="${item._uid}">
            ${dragHandleHtml}
            <span class="row-index">${index + 1}.</span>
            ${multiline
              ? `<textarea rows="2" placeholder="${escapeHtml(placeholder)}">${escapeHtml(item.value)}</textarea>`
              : `<input type="text" placeholder="${escapeHtml(placeholder)}" value="${escapeHtml(item.value)}" />`}
            <button type="button" class="secondary small remove-btn">Remover</button>
          </div>
        `,
      )
      .join('');

    container.querySelectorAll('.list-row').forEach((row) => {
      const uid = row.dataset.uid;
      const item = items.find((it) => it._uid === uid);
      const input = row.querySelector('input, textarea');
      input.addEventListener('input', () => {
        item.value = input.value;
      });
      row.querySelector('.remove-btn').addEventListener('click', () => {
        const index = items.findIndex((it) => it._uid === uid);
        items.splice(index, 1);
        render();
      });
    });
  }

  render();
  attachDragReorder(container, items, (item) => item._uid);

  return {
    add() {
      items.push({ id: undefined, _uid: nextUid(), value: '' });
      render();
    },
    values() {
      return items
        .map((item) => ({ id: item.id, value: item.value.trim() }))
        .filter((item) => item.value.length > 0);
    },
  };
}

function createVisualStepEditor(container, steps) {
  steps.forEach((step) => {
    if (!step._uid) step._uid = nextUid();
  });

  function render() {
    container.innerHTML = steps
      .map(
        (step, index) => `
          <div class="list-row" data-uid="${step._uid}">
            ${dragHandleHtml}
            <span class="row-index">${index + 1}.</span>
            <input type="text" placeholder="Descrição do passo" value="${escapeHtml(step.description || '')}" />
            <button type="button" class="secondary small remove-btn">Remover</button>
          </div>
        `,
      )
      .join('');

    container.querySelectorAll('.list-row').forEach((row) => {
      const uid = row.dataset.uid;
      const step = steps.find((s) => s._uid === uid);
      const input = row.querySelector('input');
      input.addEventListener('input', () => {
        step.description = input.value;
      });
      row.querySelector('.remove-btn').addEventListener('click', () => {
        const index = steps.findIndex((s) => s._uid === uid);
        steps.splice(index, 1);
        render();
      });
    });
  }

  render();
  attachDragReorder(container, steps, (step) => step._uid);

  return {
    add() {
      steps.push({ id: undefined, _uid: nextUid(), stepNumber: steps.length + 1, description: '' });
      render();
    },
    values() {
      return steps
        .filter((step) => (step.description || '').trim().length > 0)
        .map((step, index) => ({
          id: step.id,
          stepNumber: index + 1,
          description: step.description.trim(),
        }));
    },
  };
}

async function renderRecipeForm(id, navId = currentNavId) {
  if (!requireAuthOrRedirect()) return;

  const isEditing = Boolean(id);
  let recipe = null;

  if (isEditing) {
    recipe = await api.getRecipe(id);
    if (isStaleNav(navId)) return;
  }

  const ingredientItems = recipe
    ? recipe.ingredients.map((i) => ({ id: i.id, value: i.description }))
    : emptyTextList(['']);
  const instructionItems = recipe
    ? recipe.instructions.map((i) => ({ id: i.id, value: i.description }))
    : emptyTextList(['']);
  const chefTipItems = recipe ? recipe.chefTips.map((t) => ({ id: t.id, value: t.tip })) : [];
  const visualStepItems = recipe
    ? recipe.visualSteps.map((s) => ({ id: s.id, stepNumber: s.stepNumber, description: s.description }))
    : [];

  app.innerHTML = `
    <h1>${isEditing ? 'Editar receita' : 'Nova receita'}</h1>
    <form id="recipe-form" class="wide">
      <div class="row">
        <div class="field">
          <label for="title">Título *</label>
          <input id="title" type="text" required value="${escapeHtml(recipe?.title || '')}" />
        </div>
        <div class="field">
          <label for="category">Categoria</label>
          <input id="category" type="text" value="${escapeHtml(recipe?.category || '')}" />
        </div>
      </div>

      <div class="field">
        <label for="subtitle">Subtítulo</label>
        <input id="subtitle" type="text" value="${escapeHtml(recipe?.subtitle || '')}" />
      </div>

      <div class="row">
        <div class="field">
          <label for="prepTimeMinutes">Tempo de preparo (min) *</label>
          <input id="prepTimeMinutes" type="number" min="1" required value="${recipe?.prepTimeMinutes ?? ''}" />
        </div>
        <div class="field">
          <label for="servings">Porções *</label>
          <input id="servings" type="number" min="1" required value="${recipe?.servings ?? ''}" />
        </div>
        <div class="field">
          <label for="portionReference">Porção de referência</label>
          <input id="portionReference" type="text" value="${escapeHtml(recipe?.portionReference || '')}" />
        </div>
      </div>

      <label>Selos</label>
      <div class="badge-picker">
        ${RECIPE_BADGES.map(
          (badge) => `
            <label>
              <input type="checkbox" value="${escapeHtml(badge)}" ${recipe?.badges?.includes(badge) ? 'checked' : ''} />
              ${escapeHtml(badge)}
            </label>
          `,
        ).join('')}
      </div>

      <div class="checkbox-row">
        <input type="checkbox" id="has-nutrition" ${recipe?.nutritionalInfo ? 'checked' : ''} />
        <label for="has-nutrition" style="margin:0">Incluir informações nutricionais</label>
      </div>
      <div id="nutrition-fields" class="row" style="${recipe?.nutritionalInfo ? '' : 'display:none'}">
        <div class="field"><label for="caloriesKcal">Calorias (kcal)</label><input id="caloriesKcal" type="number" min="0" value="${recipe?.nutritionalInfo?.caloriesKcal ?? ''}" /></div>
        <div class="field"><label for="proteinsGrams">Proteínas (g)</label><input id="proteinsGrams" type="number" min="0" value="${recipe?.nutritionalInfo?.proteinsGrams ?? ''}" /></div>
        <div class="field"><label for="carbohydratesGrams">Carboidratos (g)</label><input id="carbohydratesGrams" type="number" min="0" value="${recipe?.nutritionalInfo?.carbohydratesGrams ?? ''}" /></div>
        <div class="field"><label for="fatsGrams">Gorduras (g)</label><input id="fatsGrams" type="number" min="0" value="${recipe?.nutritionalInfo?.fatsGrams ?? ''}" /></div>
        <div class="field"><label for="fibersGrams">Fibras (g)</label><input id="fibersGrams" type="number" min="0" value="${recipe?.nutritionalInfo?.fibersGrams ?? ''}" /></div>
        <div class="field"><label for="sodiumMg">Sódio (mg)</label><input id="sodiumMg" type="number" min="0" value="${recipe?.nutritionalInfo?.sodiumMg ?? ''}" /></div>
      </div>

      <h2>Ingredientes *</h2>
      <div id="ingredients-list" class="list-editor"></div>
      <button type="button" id="add-ingredient" class="secondary small">+ Ingrediente</button>

      <h2>Modo de preparo *</h2>
      <div id="instructions-list" class="list-editor"></div>
      <button type="button" id="add-instruction" class="secondary small">+ Passo</button>

      <h2>Passo a passo (opcional)</h2>
      <div id="visual-steps-list" class="list-editor"></div>
      <button type="button" id="add-visual-step" class="secondary small">+ Passo visual</button>

      <h2>Dicas do chef (opcional)</h2>
      <div id="chef-tips-list" class="list-editor"></div>
      <button type="button" id="add-chef-tip" class="secondary small">+ Dica</button>

      <hr class="divider" />
      <button type="submit">${isEditing ? 'Salvar alterações' : 'Criar receita'}</button>
    </form>

    ${isEditing ? `
      <h2>Imagem principal</h2>
      <div id="image-preview">${
        recipe.mainImageUrl
          ? `<img src="${escapeHtml(imageSrc(recipe))}" alt="Imagem da receita" style="max-width:280px;border-radius:8px" />`
          : '<p class="muted">Nenhuma imagem enviada ainda.</p>'
      }</div>
      <form id="image-form">
        <div class="field">
          <label for="image-input">Enviar/substituir imagem (JPEG, PNG ou WEBP, até 5MB)</label>
          <input id="image-input" type="file" accept="image/jpeg,image/png,image/webp" required />
        </div>
        <button type="submit">Enviar imagem</button>
      </form>
    ` : ''}
  `;

  const ingredientsEditor = createListEditor(document.getElementById('ingredients-list'), ingredientItems, {
    placeholder: 'Ex: 500 g de peito de frango em cubos',
  });
  const instructionsEditor = createListEditor(document.getElementById('instructions-list'), instructionItems, {
    placeholder: 'Ex: Tempere o frango com sal e pimenta.',
    multiline: true,
  });
  const chefTipsEditor = createListEditor(document.getElementById('chef-tips-list'), chefTipItems, {
    placeholder: 'Ex: Pode ser congelado por até 3 meses.',
    multiline: true,
  });
  const visualStepsEditor = createVisualStepEditor(document.getElementById('visual-steps-list'), visualStepItems);

  document.getElementById('add-ingredient').addEventListener('click', () => ingredientsEditor.add());
  document.getElementById('add-instruction').addEventListener('click', () => instructionsEditor.add());
  document.getElementById('add-chef-tip').addEventListener('click', () => chefTipsEditor.add());
  document.getElementById('add-visual-step').addEventListener('click', () => visualStepsEditor.add());

  document.getElementById('has-nutrition').addEventListener('change', (event) => {
    document.getElementById('nutrition-fields').style.display = event.target.checked ? '' : 'none';
  });

  document.getElementById('recipe-form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const badges = Array.from(document.querySelectorAll('.badge-picker input:checked')).map((el) => el.value);

    const payload = {
      id: isEditing ? id : undefined,
      title: document.getElementById('title').value.trim(),
      subtitle: document.getElementById('subtitle').value.trim() || undefined,
      category: document.getElementById('category').value.trim() || undefined,
      prepTimeMinutes: Number(document.getElementById('prepTimeMinutes').value),
      servings: Number(document.getElementById('servings').value),
      portionReference: document.getElementById('portionReference').value.trim() || undefined,
      badges,
      ingredients: ingredientsEditor.values().map((item) => ({ id: item.id, description: item.value })),
      instructions: instructionsEditor.values().map((item) => ({ id: item.id, description: item.value })),
      chefTips: chefTipsEditor.values().map((item) => ({ id: item.id, tip: item.value })),
      visualSteps: visualStepsEditor.values(),
    };

    if (document.getElementById('has-nutrition').checked) {
      payload.nutritionalInfo = {
        caloriesKcal: Number(document.getElementById('caloriesKcal').value) || 0,
        proteinsGrams: Number(document.getElementById('proteinsGrams').value) || 0,
        carbohydratesGrams: Number(document.getElementById('carbohydratesGrams').value) || 0,
        fatsGrams: Number(document.getElementById('fatsGrams').value) || 0,
        fibersGrams: Number(document.getElementById('fibersGrams').value) || 0,
        sodiumMg: Number(document.getElementById('sodiumMg').value) || 0,
      };
    }

    if (payload.ingredients.length === 0 || payload.instructions.length === 0) {
      toast('Inclua pelo menos um ingrediente e um passo de preparo.', 'error');
      return;
    }

    try {
      const saved = await api.upsertRecipe(payload);
      toast(isEditing ? 'Receita atualizada!' : 'Receita criada! Envie uma imagem se quiser.', 'success');
      navigate(isEditing ? `/recipes/${saved.id}` : `/recipes/${saved.id}/edit`);
    } catch (error) {
      toast(messageFromError(error), 'error');
    }
  });

  const imageForm = document.getElementById('image-form');
  if (imageForm) {
    imageForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const file = document.getElementById('image-input').files[0];
      if (!file) return;

      try {
        await api.uploadRecipeImage(id, file);
        toast('Imagem enviada!', 'success');
        renderRecipeForm(id);
      } catch (error) {
        toast(messageFromError(error), 'error');
      }
    });
  }
}

// ---------- auth views ----------

function renderLogin() {
  app.innerHTML = `
    <h1>Entrar</h1>
    <form id="login-form">
      <div class="field"><label for="email">E-mail</label><input id="email" type="email" required /></div>
      <div class="field"><label for="password">Senha</label><input id="password" type="password" required /></div>
      <button type="submit">Entrar</button>
      <p class="muted">Não tem conta? <a href="#/signup">Cadastre-se</a> · <a href="#/forgot">Esqueci minha senha</a></p>
    </form>
  `;

  document.getElementById('login-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    try {
      const { access_token } = await api.login(email, password);
      setToken(access_token);
      await ensureCurrentUser();
      toast('Login realizado!', 'success');
      navigate('/recipes');
    } catch (error) {
      toast(messageFromError(error), 'error');
    }
  });
}

function renderSignup() {
  app.innerHTML = `
    <h1>Criar conta</h1>
    <form id="signup-form">
      <div class="field"><label for="name">Nome</label><input id="name" type="text" required /></div>
      <div class="field"><label for="email">E-mail</label><input id="email" type="email" required /></div>
      <div class="row">
        <div class="field"><label for="password">Senha</label><input id="password" type="password" required /></div>
        <div class="field"><label for="confirmPassword">Confirmar senha</label><input id="confirmPassword" type="password" required /></div>
      </div>
      <div class="row">
        <div class="field"><label for="birthdate">Data de nascimento</label><input id="birthdate" type="date" required /></div>
        <div class="field"><label for="phoneNumber">Telefone (com DDD)</label><input id="phoneNumber" type="text" placeholder="(11) 99999-9999" required /></div>
      </div>
      <div class="checkbox-row">
        <input type="checkbox" id="isTermsAccepted" required />
        <label for="isTermsAccepted" style="margin:0">Aceito os termos de uso</label>
      </div>
      <button type="submit">Cadastrar</button>
      <p class="muted">Já tem conta? <a href="#/login">Entrar</a></p>
    </form>
  `;

  document.getElementById('signup-form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const payload = {
      name: document.getElementById('name').value.trim(),
      email: document.getElementById('email').value.trim(),
      password: document.getElementById('password').value,
      confirmPassword: document.getElementById('confirmPassword').value,
      birthdate: dateInputToBrDate(document.getElementById('birthdate').value),
      phoneNumber: document.getElementById('phoneNumber').value.trim(),
      isTermsAccepted: String(document.getElementById('isTermsAccepted').checked),
    };

    try {
      const created = await api.createUser(payload);
      pendingVerificationUserId = created.id;
      sessionStorage.setItem('pendingVerificationUserId', created.id);
      toast('Conta criada! Verifique seu e-mail para o código.', 'success');
      navigate('/verify');
    } catch (error) {
      toast(messageFromError(error), 'error');
    }
  });
}

function renderVerify() {
  app.innerHTML = `
    <h1>Verificar e-mail</h1>
    <p class="muted">Confira o código (OTP) enviado por e-mail (Mailtrap, no ambiente local).</p>
    <form id="verify-form">
      <div class="field"><label for="userId">ID do usuário</label><input id="userId" type="text" required value="${escapeHtml(pendingVerificationUserId || '')}" /></div>
      <div class="field"><label for="otp">Código (OTP)</label><input id="otp" type="text" required /></div>
      <button type="submit">Verificar</button>
      <button type="button" id="resend-btn" class="secondary">Reenviar código</button>
    </form>
  `;

  document.getElementById('verify-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const userId = document.getElementById('userId').value.trim();
    const otp = document.getElementById('otp').value.trim();

    try {
      const result = await api.verifyEmail(userId, otp);
      if (result.status === 'sucess') {
        toast('E-mail verificado! Você já pode entrar.', 'success');
        sessionStorage.removeItem('pendingVerificationUserId');
        navigate('/login');
      } else {
        toast('Código inválido.', 'error');
      }
    } catch (error) {
      toast(messageFromError(error), 'error');
    }
  });

  document.getElementById('resend-btn').addEventListener('click', async () => {
    const userId = document.getElementById('userId').value.trim();
    if (!userId) {
      toast('Informe o ID do usuário primeiro.', 'error');
      return;
    }
    try {
      await api.resendVerificationOtp(userId);
      toast('Código reenviado por e-mail.', 'success');
    } catch (error) {
      toast(messageFromError(error), 'error');
    }
  });
}

function renderForgot() {
  app.innerHTML = `
    <h1>Esqueci minha senha</h1>
    <h2>1. Solicitar redefinição</h2>
    <form id="request-form">
      <div class="field"><label for="request-email">E-mail</label><input id="request-email" type="email" required /></div>
      <button type="submit">Enviar instruções</button>
    </form>

    <h2>2. Definir nova senha</h2>
    <p class="muted">Depois de confirmar pelo e-mail, defina a nova senha aqui.</p>
    <form id="reset-form">
      <div class="field"><label for="reset-email">E-mail</label><input id="reset-email" type="email" required /></div>
      <div class="row">
        <div class="field"><label for="new-password">Nova senha</label><input id="new-password" type="password" required /></div>
        <div class="field"><label for="confirm-password">Confirmar nova senha</label><input id="confirm-password" type="password" required /></div>
      </div>
      <button type="submit">Redefinir senha</button>
    </form>
  `;

  document.getElementById('request-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = document.getElementById('request-email').value.trim();
    try {
      await api.requestForgetPassword(email);
      toast('Se o e-mail existir, as instruções foram enviadas.', 'success');
    } catch (error) {
      toast(messageFromError(error), 'error');
    }
  });

  document.getElementById('reset-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = document.getElementById('reset-email').value.trim();
    const password = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    try {
      await api.resetPasswordWithEmail(email, password, confirmPassword);
      toast('Senha redefinida! Faça login.', 'success');
      navigate('/login');
    } catch (error) {
      toast(messageFromError(error), 'error');
    }
  });
}

async function renderProfile(navId = currentNavId) {
  if (!requireAuthOrRedirect()) return;

  const profile = await ensureCurrentUser();
  if (isStaleNav(navId)) return;

  app.innerHTML = `
    <h1>Meu perfil</h1>
    <form id="profile-form">
      <div class="field"><label>E-mail</label><input type="email" value="${escapeHtml(profile.email)}" disabled /></div>
      <div class="field"><label for="name">Nome</label><input id="name" type="text" value="${escapeHtml(profile.name)}" /></div>
      <div class="field"><label for="phoneNumber">Telefone</label><input id="phoneNumber" type="text" value="${escapeHtml(profile.phoneNumber || '')}" /></div>
      <button type="submit">Salvar</button>
    </form>

    <h2>Alterar senha</h2>
    <form id="password-form">
      <div class="field"><label for="password">Nova senha</label><input id="password" type="password" required /></div>
      <div class="field"><label for="confirmPassword">Confirmar nova senha</label><input id="confirmPassword" type="password" required /></div>
      <button type="submit">Atualizar senha</button>
    </form>
  `;

  document.getElementById('profile-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      await api.updateUser({
        name: document.getElementById('name').value.trim(),
        phoneNumber: document.getElementById('phoneNumber').value.trim(),
      });
      currentUser = null;
      await ensureCurrentUser();
      toast('Perfil atualizado!', 'success');
    } catch (error) {
      toast(messageFromError(error), 'error');
    }
  });

  document.getElementById('password-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    try {
      await api.updatePassword(password, confirmPassword);
      toast('Senha atualizada!', 'success');
      event.target.reset();
    } catch (error) {
      toast(messageFromError(error), 'error');
    }
  });
}

// ---------- boot ----------

document.getElementById('settings-toggle').addEventListener('click', () => {
  document.getElementById('settings-panel').classList.toggle('settings-panel--hidden');
});

document.getElementById('base-url-input').value = getBaseUrl();
document.getElementById('base-url-form').addEventListener('submit', (event) => {
  event.preventDefault();
  setBaseUrl(document.getElementById('base-url-input').value.trim());
  toast('URL da API atualizada.', 'success');
  router();
});

ensureCurrentUser().finally(router);
