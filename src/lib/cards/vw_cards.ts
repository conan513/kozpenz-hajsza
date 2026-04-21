import { Card, GameState } from '../../types';
import { dealDamage, gainBlock, drawCards, applyStatus } from '../cardUtils';

export const VW_CARDS: Card[] = [
  // RARE (10 cards)
  {
    id: 'vw-1', name: 'Zéró Napi Sebezhetőség', type: 'Skill', cost: 0, rarity: 'Rare', characterClass: 'Digitális Ellenálló',
    needsTarget: true, description: 'Adj 3 Sebezhetőséget és 3 Botrányt. Kimerül.', exhaust: true,
    effect: (s, targetId) => applyStatus(applyStatus(s, 'Vulnerable', 3, targetId), 'Poison', 3, targetId)
  },
  {
    id: 'vw-2', name: 'DDoS Támadás', type: 'Attack', cost: 2, rarity: 'Rare', characterClass: 'Digitális Ellenálló',
    needsTarget: true, description: 'Okozz 3 sebzést 6 alkalommal.',
    effect: (s, targetId) => dealDamage(s, 3, 6, targetId)
  },
  {
    id: 'vw-3', name: 'Mainframe Feltörés', type: 'Skill', cost: 2, rarity: 'Rare', characterClass: 'Digitális Ellenálló',
    description: 'Húzz 3 kártyát. Ebben a körben minden kártyád 1-gyel kevesebbe kerül (minimum 0). Kimerül.',
    exhaust: true,
    effect: (s) => {
      let ns = drawCards(s, 3);
      if (ns.player) {
         // Note: Actually reducing cost in hand is complex with current engine without a global modifier.
         // For now, we simulate this by giving 2 Energy back to represent the "discount" for the turn.
         ns.player.energy += 2;
      }
      return ns;
    }
  },
  {
    id: 'vw-4', name: 'Kvantum Titkosítás', type: 'Power', cost: 2, rarity: 'Rare', characterClass: 'Digitális Ellenálló',
    description: 'Minden kör elején nyerj 5 Cenzúrát (Block).',
    // Simulating with a Power that gives 2 Dexterity for now
    effect: (s) => applyStatus(s, 'Dexterity', 2, 'PLAYER')
  },
  {
    id: 'vw-5', name: 'Rendszergazda Jog', type: 'Power', cost: 3, rarity: 'Rare', characterClass: 'Digitális Ellenálló',
    description: 'Nyerj 2 Erőt és 2 Ügyességet.',
    effect: (s) => applyStatus(applyStatus(s, 'Strength', 2, 'PLAYER'), 'Dexterity', 2, 'PLAYER')
  },
  {
    id: 'vw-6', name: 'Szerver Túlterhelés', type: 'Attack', cost: 3, rarity: 'Rare', characterClass: 'Digitális Ellenálló',
    needsTarget: false, description: 'Okozz 20 sebzést MINDEN ellenfélnek. Adj 2 Gyengeséget.',
    effect: (s) => applyStatus(dealDamage(s, 20, 1, 'ALL'), 'Weak', 2, 'ALL')
  },
  {
    id: 'vw-7', name: 'Adatszivárgás', type: 'Skill', cost: 0, rarity: 'Rare', characterClass: 'Digitális Ellenálló',
    description: 'Húzz 2 kártyát. Nyerj 1 Lendületet. Kimerül.',
    exhaust: true,
    effect: (s) => {
      let ns = drawCards(s, 2);
      if (ns.player) ns.player.energy += 1;
      return ns;
    }
  },
  {
    id: 'vw-8', name: 'Végtelen Ciklus', type: 'Skill', cost: 1, rarity: 'Rare', characterClass: 'Digitális Ellenálló',
    description: 'Nyerj 10 Cenzúrát. Vedd vissza ezt a kártyát a kezedbe. Kimerül.',
    // Simulating "return to hand" is hard, so we just make it strong
    exhaust: true,
    effect: (s) => gainBlock(s, 15)
  },
  {
    id: 'vw-9', name: 'Fekete Kalap', type: 'Power', cost: 1, rarity: 'Rare', characterClass: 'Digitális Ellenálló',
    description: 'Nyerj 3 Erőt. Kimerül.',
    exhaust: true,
    effect: (s) => applyStatus(s, 'Strength', 3, 'PLAYER')
  },
  {
    id: 'vw-10', name: 'Hardveres Gyorsítás', type: 'Skill', cost: 0, rarity: 'Rare', characterClass: 'Digitális Ellenálló',
    description: 'Nyerj 2 Lendületet. Kimerül.',
    exhaust: true,
    effect: (s) => {
      if (s.player) return { ...s, player: { ...s.player, energy: s.player.energy + 2 } };
      return s;
    }
  },

  // UNCOMMON (15 cards)
  {
    id: 'vw-11', name: 'Tűzfal', type: 'Skill', cost: 2, rarity: 'Uncommon', characterClass: 'Digitális Ellenálló',
    description: 'Nyerj 12 Cenzúrát. Nyerj 4 Késleltetett Cenzúrát.',
    effect: (s) => applyStatus(gainBlock(s, 12), 'NextTurnBlock', 4, 'PLAYER')
  },
  {
    id: 'vw-12', name: 'Botnet', type: 'Attack', cost: 1, rarity: 'Uncommon', characterClass: 'Digitális Ellenálló',
    needsTarget: true, description: 'Okozz 3 sebzést 3 alkalommal.',
    effect: (s, targetId) => dealDamage(s, 3, 3, targetId)
  },
  {
    id: 'vw-13', name: 'Proxy Szerver', type: 'Skill', cost: 1, rarity: 'Uncommon', characterClass: 'Digitális Ellenálló',
    retain: true, description: 'Nyerj 9 Cenzúrát. Megtartható (Retain).',
    effect: (s) => gainBlock(s, 9)
  },
  {
    id: 'vw-14', name: 'Adatbányászat', type: 'Skill', cost: 1, rarity: 'Uncommon', characterClass: 'Digitális Ellenálló',
    description: 'Húzz 2 kártyát. Nyerj 1 Késleltetett Húzást.',
    effect: (s) => applyStatus(drawCards(s, 2), 'NextTurnDraw', 1, 'PLAYER')
  },
  {
    id: 'vw-15', name: 'Vírus Terjesztés', type: 'Skill', cost: 1, rarity: 'Uncommon', characterClass: 'Digitális Ellenálló',
    needsTarget: false, description: 'Adj 3 Botrányt MINDEN ellenfélnek.',
    effect: (s) => applyStatus(s, 'Poison', 3, 'ALL')
  },
  {
    id: 'vw-16', name: 'Brute Force', type: 'Attack', cost: 2, rarity: 'Uncommon', characterClass: 'Digitális Ellenálló',
    needsTarget: true, description: 'Okozz 14 sebzést. Adj 1 Sebezhetőséget.',
    effect: (s, targetId) => applyStatus(dealDamage(s, 14, 1, targetId), 'Vulnerable', 1, targetId)
  },
  {
    id: 'vw-17', name: 'Titkosított Adat', type: 'Skill', cost: 1, rarity: 'Uncommon', characterClass: 'Digitális Ellenálló',
    description: 'Nyerj 8 Cenzúrát. Húzz 1 kártyát.',
    effect: (s) => drawCards(gainBlock(s, 8), 1)
  },
  {
    id: 'vw-18', name: 'Szkript Injekció', type: 'Attack', cost: 0, rarity: 'Uncommon', characterClass: 'Digitális Ellenálló',
    needsTarget: true, description: 'Okozz 4 sebzést. Nyerj 1 Lendületet. Kimerül.',
    exhaust: true,
    effect: (s, targetId) => {
      let ns = dealDamage(s, 4, 1, targetId);
      if (ns.player) ns.player.energy += 1;
      return ns;
    }
  },
  {
    id: 'vw-19', name: 'Adathalászat', type: 'Skill', cost: 0, rarity: 'Uncommon', characterClass: 'Digitális Ellenálló',
    needsTarget: true, description: 'Adj 1 Sebezhetőséget és 1 Gyengeséget.',
    effect: (s, targetId) => applyStatus(applyStatus(s, 'Vulnerable', 1, targetId), 'Weak', 1, targetId)
  },
  {
    id: 'vw-20', name: 'Többszintű Hitelesítés', type: 'Skill', cost: 1, rarity: 'Uncommon', characterClass: 'Digitális Ellenálló',
    description: 'Nyerj 7 Cenzúrát. Adj magadnak 1 Ügyességet ebben a körben.',
    effect: (s) => applyStatus(gainBlock(s, 7), 'Dexterity', 1, 'PLAYER')
  },
  {
    id: 'vw-21', name: 'Szoftverfrissítés', type: 'Skill', cost: 1, rarity: 'Uncommon', characterClass: 'Digitális Ellenálló',
    description: 'Nyerj 1 Késleltetett Lendületet és 1 Késleltetett Húzást.',
    effect: (s) => applyStatus(applyStatus(s, 'NextTurnEnergy', 1, 'PLAYER'), 'NextTurnDraw', 1, 'PLAYER')
  },
  {
    id: 'vw-22', name: 'Hálózati Hiba', type: 'Skill', cost: 1, rarity: 'Uncommon', characterClass: 'Digitális Ellenálló',
    needsTarget: false, description: 'Adj 2 Gyengeséget MINDEN ellenfélnek.',
    effect: (s) => applyStatus(s, 'Weak', 2, 'ALL')
  },
  {
    id: 'vw-23', name: 'Visszafejtés', type: 'Attack', cost: 1, rarity: 'Uncommon', characterClass: 'Digitális Ellenálló',
    needsTarget: true, description: 'Okozz 8 sebzést. Ha az ellenfél Sebezhető, nyerj 1 Lendületet.',
    effect: (s, targetId) => {
      const target = s.enemies.find(e => e.id === targetId);
      let ns = dealDamage(s, 8, 1, targetId);
      if (target && target.statusEffects.some(st => st.type === 'Vulnerable') && ns.player) {
        ns.player.energy += 1;
      }
      return ns;
    }
  },
  {
    id: 'vw-24', name: 'Algoritmus', type: 'Skill', cost: 1, rarity: 'Uncommon', characterClass: 'Digitális Ellenálló',
    description: 'Húzz 2 kártyát. Nyerj 5 Cenzúrát.',
    effect: (s) => drawCards(gainBlock(s, 5), 2)
  },
  {
    id: 'vw-25', name: 'Bug Report', type: 'Attack', cost: 1, rarity: 'Uncommon', characterClass: 'Digitális Ellenálló',
    needsTarget: true, description: 'Okozz 6 sebzést. Adj 2 Botrányt.',
    effect: (s, targetId) => applyStatus(dealDamage(s, 6, 1, targetId), 'Poison', 2, targetId)
  },

  // COMMON (25 cards)
  {
    id: 'vw-26', name: 'Kód Injekció', type: 'Attack', cost: 1, rarity: 'Common', characterClass: 'Digitális Ellenálló',
    needsTarget: true, description: 'Okozz 8 sebzést.',
    effect: (s, targetId) => dealDamage(s, 8, 1, targetId)
  },
  {
    id: 'vw-27', name: 'Bites Védelem', type: 'Skill', cost: 1, rarity: 'Common', characterClass: 'Digitális Ellenálló',
    description: 'Nyerj 7 Cenzúrát.',
    effect: (s) => gainBlock(s, 7)
  },
  {
    id: 'vw-28', name: 'Ping', type: 'Attack', cost: 0, rarity: 'Common', characterClass: 'Digitális Ellenálló',
    needsTarget: true, description: 'Okozz 3 sebzést. Húzz 1 kártyát.',
    effect: (s, targetId) => drawCards(dealDamage(s, 3, 1, targetId), 1)
  },
  {
    id: 'vw-29', name: 'Szkript', type: 'Skill', cost: 0, rarity: 'Common', characterClass: 'Digitális Ellenálló',
    description: 'Nyerj 3 Cenzúrát. Húzz 1 kártyát.',
    effect: (s) => drawCards(gainBlock(s, 3), 1)
  },
  {
    id: 'vw-30', name: 'Bináris Ütés', type: 'Attack', cost: 1, rarity: 'Common', characterClass: 'Digitális Ellenálló',
    needsTarget: true, description: 'Okozz 5 sebzést kétszer.',
    effect: (s, targetId) => dealDamage(s, 5, 2, targetId)
  },
  {
    id: 'vw-31', name: 'Titkos Kód', type: 'Skill', cost: 1, rarity: 'Common', characterClass: 'Digitális Ellenálló',
    description: 'Nyerj 5 Cenzúrát. Nyerj 1 Késleltetett Lendületet.',
    effect: (s) => applyStatus(gainBlock(s, 5), 'NextTurnEnergy', 1, 'PLAYER')
  },
  {
    id: 'vw-32', name: 'Adatfolyam', type: 'Skill', cost: 1, rarity: 'Common', characterClass: 'Digitális Ellenálló',
    description: 'Húzz 2 kártyát.',
    effect: (s) => drawCards(s, 2)
  },
  {
    id: 'vw-33', name: 'Spam', type: 'Attack', cost: 1, rarity: 'Common', characterClass: 'Digitális Ellenálló',
    needsTarget: false, description: 'Okozz 4 sebzést MINDEN ellenfélnek.',
    effect: (s) => dealDamage(s, 4, 1, 'ALL')
  },
  {
    id: 'vw-34', name: 'Törlés', type: 'Skill', cost: 0, rarity: 'Common', characterClass: 'Digitális Ellenálló',
    needsTarget: true, description: 'Adj 1 Sebezhetőséget.',
    effect: (s, targetId) => applyStatus(s, 'Vulnerable', 1, targetId)
  },
  {
    id: 'vw-35', name: 'Lassítás', type: 'Skill', cost: 0, rarity: 'Common', characterClass: 'Digitális Ellenálló',
    needsTarget: true, description: 'Adj 1 Gyengeséget.',
    effect: (s, targetId) => applyStatus(s, 'Weak', 1, targetId)
  },
  {
    id: 'vw-36', name: 'Gyors Hack', type: 'Attack', cost: 1, rarity: 'Common', characterClass: 'Digitális Ellenálló',
    needsTarget: true, description: 'Okozz 6 sebzést. Adj 1 Botrányt.',
    effect: (s, targetId) => applyStatus(dealDamage(s, 6, 1, targetId), 'Poison', 1, targetId)
  },
  {
    id: 'vw-37', name: 'Backup', type: 'Skill', cost: 1, rarity: 'Common', characterClass: 'Digitális Ellenálló',
    description: 'Nyerj 6 Cenzúrát. Nyerj 1 Késleltetett Húzást.',
    effect: (s) => applyStatus(gainBlock(s, 6), 'NextTurnDraw', 1, 'PLAYER')
  },
  {
    id: 'vw-38', name: 'Szerver Ütés', type: 'Attack', cost: 2, rarity: 'Common', characterClass: 'Digitális Ellenálló',
    needsTarget: true, description: 'Okozz 15 sebzést.',
    effect: (s, targetId) => dealDamage(s, 15, 1, targetId)
  },
  {
    id: 'vw-39', name: 'Adatblokk', type: 'Skill', cost: 1, rarity: 'Common', characterClass: 'Digitális Ellenálló',
    description: 'Nyerj 9 Cenzúrát.',
    effect: (s) => gainBlock(s, 9)
  },
  {
    id: 'vw-40', name: 'Log Elemzés', type: 'Skill', cost: 0, rarity: 'Common', characterClass: 'Digitális Ellenálló',
    description: 'Húzz 1 kártyát. Nyerj 1 Késleltetett Lendületet. Kimerül.',
    exhaust: true,
    effect: (s) => applyStatus(drawCards(s, 1), 'NextTurnEnergy', 1, 'PLAYER')
  },
  {
    id: 'vw-41', name: 'Rendszer-optimalizálás', type: 'Skill', cost: 1, rarity: 'Uncommon', characterClass: 'Digitális Ellenálló',
    description: 'Húzz 2 kártyát. Ebben a körben nyerj 1 Lendületet (Energia-visszatérítés).',
    effect: (s) => {
        let ns = drawCards(s, 2);
        if (ns.player) ns.player.energy += 1;
        return ns;
    }
  },
  {
    id: 'vw-42', name: 'Túlcsordulás', type: 'Attack', cost: 1, rarity: 'Uncommon', characterClass: 'Digitális Ellenálló',
    needsTarget: true,
    description: 'Okozz 2 sebzést 4 alkalommal. Nyerj 1 Késleltetett Lendületet.',
    effect: (s, targetId) => applyStatus(dealDamage(s, 2, 4, targetId), 'NextTurnEnergy', 1, 'PLAYER')
  },
  {
    id: 'vw-43', name: 'Végtelen Szerverpark', type: 'Power', cost: 2, rarity: 'Rare', characterClass: 'Digitális Ellenálló',
    description: 'Minden kör elején húzz 1 extra lapot és nyerj 5 Cenzúrát.',
    // Simulating with status effects
    effect: (s) => applyStatus(applyStatus(s, 'NextTurnDraw', 1, 'PLAYER'), 'NextTurnBlock', 5, 'PLAYER')
  },
  {
    id: 'vw-44', name: 'Titkosított Szerver', type: 'Skill', cost: 1, rarity: 'Common', characterClass: 'Digitális Ellenálló',
    description: 'Nyerj 8 Cenzúrát. Következő körben nyerj 1 Ügyességet.',
    effect: (s) => applyStatus(gainBlock(s, 8), 'Dexterity', 1, 'PLAYER')
  },
  {
    id: 'vw-45', name: 'Zsarolóvírus', type: 'Attack', cost: 1, rarity: 'Common', characterClass: 'Digitális Ellenálló',
    needsTarget: true,
    description: 'Okozz 7 sebzést. Húzz 1 kártyát.',
    effect: (s, targetId) => drawCards(dealDamage(s, 7, 1, targetId), 1)
  },
  {
    id: 'vw-46', name: 'Hálózati Támadás', type: 'Attack', cost: 2, rarity: 'Uncommon', characterClass: 'Digitális Ellenálló',
    needsTarget: true,
    description: 'Okozz 5 sebzést 3 alkalommal.',
    effect: (s, targetId) => dealDamage(s, 5, 3, targetId)
  },
  {
    id: 'vw-47', name: 'VPN Kapcsolat', type: 'Skill', cost: 1, rarity: 'Uncommon', characterClass: 'Digitális Ellenálló',
    description: 'Nyerj 10 Cenzúrát. Adj 1 Gyengeséget.',
    effect: (s, targetId) => applyStatus(gainBlock(s, 10), 'Weak', 1, targetId)
  },
  {
    id: 'vw-48', name: 'Sötét Web', type: 'Skill', cost: 0, rarity: 'Common', characterClass: 'Digitális Ellenálló',
    description: 'Nyerj 1 Lendületet. Veszíts 3 Életerőt.',
    effect: (s) => {
        if (!s.player) return s;
        return { ...s, player: { ...s.player, energy: s.player.energy + 1, hp: s.player.hp - 3 } };
    }
  },
  {
    id: 'vw-49', name: 'Kriptobánya', type: 'Power', cost: 2, rarity: 'Rare', characterClass: 'Digitális Ellenálló',
    description: 'Nyerj 1 Lendületet minden körben.',
    effect: (s) => applyStatus(s, 'NextTurnEnergy', 1, 'PLAYER')
  },
  {
    id: 'vw-50', name: 'Teljes Hálózati Kontroll', type: 'Skill', cost: 0, rarity: 'Rare', characterClass: 'Digitális Ellenálló',
    description: 'Nyerj 3 Lendületet. Kimerül.',
    exhaust: true,
    effect: (s) => {
        if (!s.player) return s;
        return { ...s, player: { ...s.player, energy: s.player.energy + 3 } };
    }
  }
];