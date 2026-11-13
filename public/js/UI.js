import { sounds } from './Audio.js';

/**
 * UI Manager: Hotbar, Shop Modal, Clock, Coins, and Toast Notifications
 */
export class UIManager {
  constructor(inventory, onToolChanged, onShopTransaction) {
    this.inventory = inventory;
    this.onToolChanged = onToolChanged;
    this.onShopTransaction = onShopTransaction;

    this.activeSlot = 1;
    this.activeTool = 'hoe';
    this.isShopOpen = false;

    // Seed prices & crop sell values
    this.marketCatalog = {
      carrot: { name: 'കാരറ്റ് (Carrot)', icon: '🥕', seedPrice: 10, cropPrice: 25 },
      tomato: { name: 'തക്കാളി (Tomato)', icon: '🍅', seedPrice: 15, cropPrice: 38 },
      pumpkin: { name: 'മത്തങ്ങ (Pumpkin)', icon: '🎃', seedPrice: 30, cropPrice: 85 },
      wheat: { name: 'നെല്ല് (Paddy/Wheat)', icon: '🌾', seedPrice: 12, cropPrice: 30 }
    };

    this.initHotbar();
    this.initShop();
    this.initKeyboardShortcuts();
    this.updateHUD();
  }

  initHotbar() {
    const slots = document.querySelectorAll('.hotbar-slot');
    slots.forEach((slot) => {
      slot.addEventListener('click', () => {
        const slotNum = parseInt(slot.dataset.slot);
        this.selectSlot(slotNum);
      });
    });
  }

  selectSlot(num) {
    this.activeSlot = num;
    const slots = document.querySelectorAll('.hotbar-slot');
    slots.forEach((s) => s.classList.remove('active'));

    const targetSlot = document.querySelector(`.hotbar-slot[data-slot="${num}"]`);
    if (targetSlot) {
      targetSlot.classList.add('active');
      this.activeTool = targetSlot.dataset.tool;
      this.onToolChanged(this.activeTool);
    }
  }

  initKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      if (document.activeElement && document.activeElement.tagName === 'INPUT') return;

      const num = parseInt(e.key);
      if (num >= 1 && num <= 7) {
        this.selectSlot(num);
      }
    });
  }

  initShop() {
    const modal = document.getElementById('shop-modal');
    const closeBtn = document.getElementById('close-shop-btn');
    const tabBtns = document.querySelectorAll('.tab-btn');

    closeBtn.addEventListener('click', () => this.closeShop());

    // Switch between Buy Seeds and Sell Crops
    tabBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        tabBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        const tab = btn.dataset.tab;
        const buyList = document.getElementById('shop-buy-list');
        const sellList = document.getElementById('shop-sell-list');

        if (tab === 'buy') {
          buyList.classList.remove('hidden');
          sellList.classList.add('hidden');
        } else {
          buyList.classList.add('hidden');
          sellList.classList.remove('hidden');
          this.renderSellList();
        }
      });
    });

    this.renderBuyList();
    this.renderSellList();

    // Mobile shop button
    const mobShopBtn = document.getElementById('btn-mobile-shop');
    if (mobShopBtn) {
      mobShopBtn.addEventListener('click', () => this.openShop());
    }
  }

  renderBuyList() {
    const container = document.getElementById('shop-buy-list');
    container.innerHTML = '';

    for (let [cropKey, item] of Object.entries(this.marketCatalog)) {
      const card = document.createElement('div');
      card.className = 'shop-item-card';
      card.innerHTML = `
        <div class="shop-item-info">
          <span class="shop-item-icon">${item.icon}</span>
          <div>
            <div class="shop-item-title">${item.name} വിത്ത്</div>
            <div class="shop-item-price">🪙 ${item.seedPrice} നാണയം</div>
          </div>
        </div>
        <button class="buy-sell-btn" id="buy-btn-${cropKey}">വാങ്ങുക</button>
      `;

      card.querySelector(`#buy-btn-${cropKey}`).addEventListener('click', () => {
        this.buySeeds(cropKey, item.seedPrice);
      });

      container.appendChild(card);
    }
  }

  renderSellList() {
    const container = document.getElementById('shop-sell-list');
    container.innerHTML = '';

    let hasCrops = false;
    for (let [cropKey, item] of Object.entries(this.marketCatalog)) {
      const count = this.inventory.crops[cropKey] || 0;
      if (count > 0) hasCrops = true;

      const card = document.createElement('div');
      card.className = 'shop-item-card';
      card.innerHTML = `
        <div class="shop-item-info">
          <span class="shop-item-icon">${item.icon}</span>
          <div>
            <div class="shop-item-title">${item.name}</div>
            <div class="shop-item-price">🪙 ${item.cropPrice} / എണ്ണം | കയ്യിലുള്ളത്: ${count}</div>
          </div>
        </div>
        <button class="buy-sell-btn" id="sell-btn-${cropKey}" ${count === 0 ? 'disabled' : ''}>വിൽക്കുക</button>
      `;

      card.querySelector(`#sell-btn-${cropKey}`).addEventListener('click', () => {
        this.sellCrop(cropKey, item.cropPrice);
      });

      container.appendChild(card);
    }

    if (!hasCrops) {
      const emptyNote = document.createElement('div');
      emptyNote.style.gridColumn = '1 / -1';
      emptyNote.style.textAlign = 'center';
      emptyNote.style.color = '#aaa';
      emptyNote.style.padding = '20px';
      emptyNote.innerText = 'വിൽക്കാൻ നിലവിൽ വിളവുകളൊന്നും കയ്യിലില്ല. കൃഷി ചെയ്ത് വിളവെടുക്കൂ!';
      container.appendChild(emptyNote);
    }
  }

  buySeeds(cropKey, price) {
    if (this.inventory.coins >= price) {
      this.inventory.coins -= price;
      this.inventory[cropKey] = (this.inventory[cropKey] || 0) + 1;
      sounds.playCoin();
      this.showToast(`${this.marketCatalog[cropKey].name} വിത്ത് വാങ്ങി! (-🪙${price})`);
      this.updateHUD();
    } else {
      this.showToast('പണം തികയുന്നില്ല! കൂടുതൽ വിളകൾ വിൽക്കുക');
    }
  }

  sellCrop(cropKey, price) {
    const count = this.inventory.crops[cropKey] || 0;
    if (count > 0) {
      this.inventory.crops[cropKey]--;
      this.inventory.coins += price;
      sounds.playCoin();
      this.showToast(`${this.marketCatalog[cropKey].name} വിറ്റു! (+🪙${price})`);
      this.updateHUD();
      this.renderSellList();
    }
  }

  openShop() {
    this.isShopOpen = true;
    document.getElementById('shop-modal').classList.remove('hidden');
    this.renderSellList();
  }

  closeShop() {
    this.isShopOpen = false;
    document.getElementById('shop-modal').classList.add('hidden');
  }

  updateHUD() {
    // Coins
    document.getElementById('coins-text').innerText = this.inventory.coins;

    // Badges
    document.getElementById('water-badge').innerText = `${this.inventory.water}%`;
    document.getElementById('carrot-badge').innerText = this.inventory.carrot || 0;
    document.getElementById('tomato-badge').innerText = this.inventory.tomato || 0;
    document.getElementById('pumpkin-badge').innerText = this.inventory.pumpkin || 0;
    document.getElementById('wheat-badge').innerText = this.inventory.wheat || 0;
  }

  showToast(message) {
    const toast = document.getElementById('toast');
    toast.innerText = message;
    toast.classList.remove('hidden');
    clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      toast.classList.add('hidden');
    }, 2500);
  }

  setTargetPrompt(visible, text = '') {
    const prompt = document.getElementById('target-prompt');
    const promptAction = document.getElementById('prompt-action');
    if (visible) {
      promptAction.innerText = text;
      prompt.classList.remove('hidden');
    } else {
      prompt.classList.add('hidden');
    }
  }
}
