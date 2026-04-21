import { Card, GameState } from '../../types';
import { dealDamage, gainBlock, drawCards, applyStatus } from '../cardUtils';

export const cl_cards: Card[] = [
    // RARE (10 cards) - Extreme Effects
    {
        id: 'cl-1', name: 'Apotheosis', type: 'Skill', cost: 0, rarity: 'Rare', characterClass: 'Colorless',
        description: 'Gyógyulj 5 Életerőt (HP). Kimerül.',
        exhaust: true,
        effect: (s) => {
            if (!s.player) return s;
            return { ...s, player: { ...s.player, hp: Math.min(s.player.maxHp, s.player.hp + 5) } };
        }
    },
    {
        id: 'cl-2', name: 'Teljes Rendszerváltás', type: 'Attack', cost: 3, rarity: 'Rare', characterClass: 'Colorless',
        needsTarget: false,
        description: 'Okozz 30 sebzést MINDEN ellenfélnek. Kimerül.',
        exhaust: true,
        effect: (s) => dealDamage(s, 30, 1, 'ALL')
    },
    {
        id: 'cl-3', name: 'Végtelen Alap', type: 'Power', cost: 3, rarity: 'Rare', characterClass: 'Colorless',
        description: 'Nyerj 3 Erőt (Befolyást) és 3 Ügyességet. Kimerül.',
        exhaust: true,
        effect: (s) => applyStatus(applyStatus(s, 'Strength', 3, 'PLAYER'), 'Dexterity', 3, 'PLAYER')
    },
    {
        id: 'cl-4', name: 'Mindent Vagy Semmit', type: 'Skill', cost: 0, rarity: 'Rare', characterClass: 'Colorless',
        description: 'Nyerj 3 Lendületet. Kimerül.',
        exhaust: true,
        effect: (s) => {
            if (!s.player) return s;
            return { ...s, player: { ...s.player, energy: s.player.energy + 3 } };
        }
    },
    {
        id: 'cl-5', name: 'Mentőöv', type: 'Skill', cost: 3, rarity: 'Rare', characterClass: 'Colorless',
        description: 'Nyerj 30 Cenzúrát (Blokkot). Húzz 2 kártyát.',
        effect: (s) => drawCards(gainBlock(s, 30), 2)
    },
    {
        id: 'cl-6', name: 'Szupertitkos Akta', type: 'Skill', cost: 0, rarity: 'Rare', characterClass: 'Colorless',
        description: 'Húzz 4 kártyát. Nyerj 2 Késleltetett Lendületet. Kimerül.',
        exhaust: true,
        effect: (s) => applyStatus(drawCards(s, 4), 'NextTurnEnergy', 2, 'PLAYER')
    },
    {
        id: 'cl-7', name: 'Pegasus Hálózat', type: 'Skill', cost: 0, rarity: 'Rare', characterClass: 'Colorless',
        needsTarget: true,
        description: 'Adj 5 Sebezhetőséget. Kimerül.',
        exhaust: true,
        effect: (s, targetId) => applyStatus(s, 'Vulnerable', 5, targetId)
    },
    {
        id: 'cl-8', name: 'Korlátlan Hatalom', type: 'Power', cost: 3, rarity: 'Rare', characterClass: 'Colorless',
        description: 'Nyerj 5 Erőt (Befolyást).',
        effect: (s) => applyStatus(s, 'Strength', 5, 'PLAYER')
    },
    {
        id: 'cl-9', name: 'Titkos Alap', type: 'Skill', cost: 0, rarity: 'Rare', characterClass: 'Colorless',
        description: 'Gyógyulj 3 Életerőt (HP). Nyerj 3 Késleltetett Húzást. Kimerül.',
        exhaust: true,
        effect: (s) => {
            let ns = s.player ? { ...s, player: { ...s.player, hp: Math.min(s.player.maxHp, s.player.hp + 3) } } : s;
            return applyStatus(ns, 'NextTurnDraw', 3, 'PLAYER');
        }
    },
    {
        id: 'cl-10', name: 'Összeomlás', type: 'Attack', cost: 3, rarity: 'Rare', characterClass: 'Colorless',
        needsTarget: true,
        description: 'Okozz 10 sebzést 4 alkalommal.',
        effect: (s, targetId) => dealDamage(s, 10, 4, targetId)
    },

    // UNCOMMON (15 cards)
    {
        id: 'cl-11', name: 'Hírszerzés', type: 'Skill', cost: 0, rarity: 'Uncommon', characterClass: 'Colorless',
        description: 'Húzz 2 kártyát. Kimerül.',
        exhaust: true,
        effect: (s) => drawCards(s, 2)
    },
    {
        id: 'cl-12', name: 'Kiskapu', type: 'Skill', cost: 0, rarity: 'Uncommon', characterClass: 'Colorless',
        description: 'Nyerj 2 Lendületet. Kimerül.',
        exhaust: true,
        effect: (s) => {
            if (!s.player) return s;
            return { ...s, player: { ...s.player, energy: s.player.energy + 2 } };
        }
    },
    {
        id: 'cl-13', name: 'Rejtett Tranzakció', type: 'Power', cost: 1, rarity: 'Uncommon', characterClass: 'Colorless',
        description: 'Nyerj 2 Ügyességet.',
        effect: (s) => applyStatus(s, 'Dexterity', 2, 'PLAYER')
    },
    {
        id: 'cl-14', name: 'Megvesztegetés', type: 'Power', cost: 1, rarity: 'Uncommon', characterClass: 'Colorless',
        description: 'Nyerj 2 Erőt.',
        effect: (s) => applyStatus(s, 'Strength', 2, 'PLAYER')
    },
    {
        id: 'cl-15', name: 'Botrány', type: 'Skill', cost: 1, rarity: 'Uncommon', characterClass: 'Colorless',
        needsTarget: false,
        description: 'Adj 2 Gyengeséget és 2 Sebezhetőséget MINDEN ellenfélnek. Kimerül.',
        exhaust: true,
        effect: (s) => {
            let ns = { ...s };
            ns.enemies.forEach(e => {
                ns = applyStatus(ns, 'Weak', 2, e.id);
                ns = applyStatus(ns, 'Vulnerable', 2, e.id);
            });
            return ns;
        }
    },
    {
        id: 'cl-16', name: 'Taktikai Visszavonulás', type: 'Skill', cost: 1, rarity: 'Uncommon', characterClass: 'Colorless',
        description: 'Nyerj 10 Cenzúrát. Nyerj 1 Késleltetett Lendületet.',
        effect: (s) => applyStatus(gainBlock(s, 10), 'NextTurnEnergy', 1, 'PLAYER')
    },
    {
        id: 'cl-17', name: 'Bennfentes Információ', type: 'Skill', cost: 0, rarity: 'Uncommon', characterClass: 'Colorless',
        description: 'Nyerj 2 Késleltetett Húzást és 1 Késleltetett Lendületet.',
        effect: (s) => applyStatus(applyStatus(s, 'NextTurnDraw', 2, 'PLAYER'), 'NextTurnEnergy', 1, 'PLAYER')
    },
    {
        id: 'cl-18', name: 'Pánik', type: 'Attack', cost: 1, rarity: 'Uncommon', characterClass: 'Colorless',
        needsTarget: false,
        description: 'Okozz 8 sebzést MINDEN ellenfélnek. Nyerj 8 Cenzúrát.',
        effect: (s) => gainBlock(dealDamage(s, 8, 1, 'ALL'), 8)
    },
    {
        id: 'cl-19', name: 'Gyors Döntés', type: 'Skill', cost: 0, rarity: 'Uncommon', characterClass: 'Colorless',
        description: 'Nyerj 5 Cenzúrát. Húzz 1 kártyát.',
        effect: (s) => drawCards(gainBlock(s, 5), 1)
    },
    {
        id: 'cl-20', name: 'Zsarolás', type: 'Attack', cost: 1, rarity: 'Uncommon', characterClass: 'Colorless',
        needsTarget: true,
        description: 'Okozz 12 sebzést. Kimerül.',
        exhaust: true,
        effect: (s, targetId) => dealDamage(s, 12, 1, targetId)
    },
    {
        id: 'cl-21', name: 'Kimenekítés', type: 'Skill', cost: 1, rarity: 'Uncommon', characterClass: 'Colorless',
        description: 'Húzz 3 kártyát. Kimerül.',
        exhaust: true,
        effect: (s) => drawCards(s, 3)
    },
    {
        id: 'cl-22', name: 'Offshore Számla', type: 'Skill', cost: 0, rarity: 'Uncommon', characterClass: 'Colorless',
        description: 'Nyerj 3 Késleltetett Lendületet. Kimerül.',
        exhaust: true,
        effect: (s) => applyStatus(s, 'NextTurnEnergy', 3, 'PLAYER')
    },
    {
        id: 'cl-23', name: 'Médiahekk', type: 'Attack', cost: 1, rarity: 'Uncommon', characterClass: 'Colorless',
        needsTarget: true,
        description: 'Okozz 5 sebzést. Adj 3 Sebezhetőséget.',
        effect: (s, targetId) => applyStatus(dealDamage(s, 5, 1, targetId), 'Vulnerable', 3, targetId)
    },
    {
        id: 'cl-24', name: 'Alibi', type: 'Skill', cost: 1, rarity: 'Uncommon', characterClass: 'Colorless',
        description: 'Nyerj 15 Cenzúrát. Kimerül.',
        exhaust: true,
        effect: (s) => gainBlock(s, 15)
    },
    {
        id: 'cl-25', name: 'Álcázás', type: 'Power', cost: 1, rarity: 'Uncommon', characterClass: 'Colorless',
        description: 'Nyerj 1 Erőt és 1 Ügyességet.',
        effect: (s) => applyStatus(applyStatus(s, 'Strength', 1, 'PLAYER'), 'Dexterity', 1, 'PLAYER')
    },

    // COMMON (25 cards)
    {
        id: 'cl-26', name: 'Alap Lépés', type: 'Attack', cost: 0, rarity: 'Common', characterClass: 'Colorless',
        needsTarget: true,
        description: 'Okozz 4 sebzést.',
        effect: (s, targetId) => dealDamage(s, 4, 1, targetId)
    },
    {
        id: 'cl-27', name: 'Kivárás', type: 'Skill', cost: 0, rarity: 'Common', characterClass: 'Colorless',
        description: 'Nyerj 4 Cenzúrát.',
        effect: (s) => gainBlock(s, 4)
    },
    {
        id: 'cl-28', name: 'Felkészülés', type: 'Skill', cost: 1, rarity: 'Common', characterClass: 'Colorless',
        description: 'Nyerj 6 Cenzúrát. Nyerj 1 Késleltetett Húzást.',
        effect: (s) => applyStatus(gainBlock(s, 6), 'NextTurnDraw', 1, 'PLAYER')
    },
    {
        id: 'cl-29', name: 'Óvatos Ütés', type: 'Attack', cost: 1, rarity: 'Common', characterClass: 'Colorless',
        needsTarget: true,
        description: 'Okozz 5 sebzést. Nyerj 5 Cenzúrát.',
        effect: (s, targetId) => gainBlock(dealDamage(s, 5, 1, targetId), 5)
    },
    {
        id: 'cl-30', name: 'Figyelemelterelés', type: 'Skill', cost: 0, rarity: 'Common', characterClass: 'Colorless',
        needsTarget: true,
        description: 'Adj 1 Gyengeséget.',
        effect: (s, targetId) => applyStatus(s, 'Weak', 1, targetId)
    },
    {
        id: 'cl-31', name: 'Löket', type: 'Attack', cost: 1, rarity: 'Common', characterClass: 'Colorless',
        needsTarget: true,
        description: 'Okozz 8 sebzést.',
        effect: (s, targetId) => dealDamage(s, 8, 1, targetId)
    },
    {
        id: 'cl-32', name: 'Tartalék', type: 'Skill', cost: 1, rarity: 'Common', characterClass: 'Colorless',
        description: 'Nyerj 2 Késleltetett Cenzúrát és 1 Késleltetett Lendületet.',
        effect: (s) => applyStatus(applyStatus(s, 'NextTurnBlock', 2, 'PLAYER'), 'NextTurnEnergy', 1, 'PLAYER')
    },
    {
        id: 'cl-33', name: 'Gyorsító', type: 'Skill', cost: 0, rarity: 'Common', characterClass: 'Colorless',
        description: 'Húzz 1 kártyát.',
        effect: (s) => drawCards(s, 1)
    },
    {
        id: 'cl-34', name: 'Alacsony Ütés', type: 'Attack', cost: 0, rarity: 'Common', characterClass: 'Colorless',
        needsTarget: true,
        description: 'Okozz 3 sebzést. Adj 1 Sebezhetőséget.',
        effect: (s, targetId) => applyStatus(dealDamage(s, 3, 1, targetId), 'Vulnerable', 1, targetId)
    },
    {
        id: 'cl-35', name: 'Védekező Állás', type: 'Skill', cost: 1, rarity: 'Common', characterClass: 'Colorless',
        description: 'Nyerj 8 Cenzúrát.',
        effect: (s) => gainBlock(s, 8)
    },
    {
        id: 'cl-36', name: 'Semleges Csapás', type: 'Attack', cost: 1, rarity: 'Common', characterClass: 'Colorless',
        needsTarget: true,
        description: 'Okozz 7 sebzést.',
        effect: (s, targetId) => dealDamage(s, 7, 1, targetId)
    },
    {
        id: 'cl-37', name: 'Általános Védelem', type: 'Skill', cost: 1, rarity: 'Common', characterClass: 'Colorless',
        description: 'Nyerj 7 Cenzúrát.',
        effect: (s) => gainBlock(s, 7)
    },
    {
        id: 'cl-38', name: 'Helyi Érdek', type: 'Skill', cost: 0, rarity: 'Common', characterClass: 'Colorless',
        description: 'Nyerj 4 Cenzúrát. Húzz 1 kártyát. Kimerül.',
        exhaust: true,
        effect: (s) => drawCards(gainBlock(s, 4), 1)
    },
    {
        id: 'cl-39', name: 'Nyilvánosság', type: 'Skill', cost: 1, rarity: 'Common', characterClass: 'Colorless',
        needsTarget: false,
        description: 'Adj 1 Sebezhetőséget MINDEN ellenfélnek.',
        effect: (s) => {
            let ns = { ...s };
            ns.enemies.forEach(e => {
                ns = applyStatus(ns, 'Vulnerable', 1, e.id);
            });
            return ns;
        }
    },
    {
        id: 'cl-40', name: 'Összpontosítás', type: 'Skill', cost: 1, rarity: 'Common', characterClass: 'Colorless',
        description: 'Nyerj 1 Erőt.',
        effect: (s) => applyStatus(s, 'Strength', 1, 'PLAYER')
    },
    {
        id: 'cl-41', name: 'Kitartás', type: 'Skill', cost: 1, rarity: 'Common', characterClass: 'Colorless',
        description: 'Nyerj 5 Cenzúrát. Következő körben nyerj 1 Lendületet.',
        effect: (s) => applyStatus(gainBlock(s, 5), 'NextTurnEnergy', 1, 'PLAYER')
    },
    {
        id: 'cl-42', name: 'Közvetítés', type: 'Skill', cost: 1, rarity: 'Uncommon', characterClass: 'Colorless',
        description: 'Húzz 2 kártyát.',
        effect: (s) => drawCards(s, 2)
    },
    {
        id: 'cl-43', name: 'Egyensúly', type: 'Skill', cost: 1, rarity: 'Uncommon', characterClass: 'Colorless',
        description: 'Nyerj 6 Cenzúrát. Nyerj 1 Ügyességet.',
        effect: (s) => applyStatus(gainBlock(s, 6), 'Dexterity', 1, 'PLAYER')
    },
    {
        id: 'cl-44', name: 'Hálózat', type: 'Power', cost: 2, rarity: 'Uncommon', characterClass: 'Colorless',
        description: 'Nyerj 2 Ügyességet.',
        effect: (s) => applyStatus(s, 'Dexterity', 2, 'PLAYER')
    },
    {
        id: 'cl-45', name: 'Befolyás', type: 'Power', cost: 2, rarity: 'Uncommon', characterClass: 'Colorless',
        description: 'Nyerj 2 Erőt.',
        effect: (s) => applyStatus(s, 'Strength', 2, 'PLAYER')
    },
    {
        id: 'cl-46', name: 'Végső Érv', type: 'Attack', cost: 2, rarity: 'Rare', characterClass: 'Colorless',
        needsTarget: true,
        description: 'Okozz 18 sebzést.',
        effect: (s, targetId) => dealDamage(s, 18, 1, targetId)
    },
    {
        id: 'cl-47', name: 'Szupercella', type: 'Attack', cost: 1, rarity: 'Rare', characterClass: 'Colorless',
        needsTarget: false,
        description: 'Okozz 10 sebzést MINDEN ellenfélnek. Kimerül.',
        exhaust: true,
        effect: (s) => dealDamage(s, 10, 1, 'ALL')
    },
    {
        id: 'cl-48', name: 'Milliárdos Támogatás', type: 'Skill', cost: 0, rarity: 'Rare', characterClass: 'Colorless',
        description: 'Nyerj 3 Lendületet. Kimerül.',
        exhaust: true,
        effect: (s) => {
            if (!s.player) return s;
            return { ...s, player: { ...s.player, energy: s.player.energy + 3 } };
        }
    },
    {
        id: 'cl-49', name: 'Globális Hálózat', type: 'Power', cost: 3, rarity: 'Rare', characterClass: 'Colorless',
        description: 'Nyerj 2 Erőt és 2 Ügyességet.',
        effect: (s) => applyStatus(applyStatus(s, 'Strength', 2, 'PLAYER'), 'Dexterity', 2, 'PLAYER')
    },
    {
        id: 'cl-50', name: 'A Kiválasztott', type: 'Skill', cost: 0, rarity: 'Rare', characterClass: 'Colorless',
        description: 'Húzz 5 kártyát. Kimerül.',
        exhaust: true,
        effect: (s) => drawCards(s, 5)
    }
];