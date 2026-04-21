import { Card, GameState } from '../../types';
import { dealDamage, gainBlock, drawCards, applyStatus } from '../cardUtils';

export const WT_CARDS: Card[] = [
    // RARE (10 cards)
    {
        id: 'wt-1', name: 'Végtelen Vita', type: 'Skill', cost: 3, rarity: 'Rare', characterClass: 'Független Politikus',
        description: 'Nyerj 1 Lendületet és húzz 1 kártyát minden ebben a körben kijátszott kártyád után. Kimerül.',
        exhaust: true,
        effect: (s) => {
            if (!s.player) return s;
            const played = s.cardsPlayedThisTurn.length;
            let ns = { ...s, player: { ...s.player, energy: s.player.energy + played } };
            return drawCards(ns, played);
        }
    },
    {
        id: 'wt-2', name: 'Elsöprő Beszéd', type: 'Attack', cost: 3, rarity: 'Rare', characterClass: 'Független Politikus',
        needsTarget: false,
        description: 'Okozz 25 sebzést MINDEN ellenfélnek. Kimerül.',
        exhaust: true,
        effect: (s) => dealDamage(s, 25, 1, 'ALL')
    },
    {
        id: 'wt-3', name: 'Felszólalás', type: 'Attack', cost: 2, rarity: 'Rare', characterClass: 'Független Politikus',
        needsTarget: true,
        description: 'Okozz 5 sebzést X alkalommal, ahol X az ebben a körben kijátszott kártyáid száma.',
        effect: (s, targetId) => {
            const played = Math.max(1, s.cardsPlayedThisTurn.length);
            return dealDamage(s, 5, played, targetId);
        }
    },
    {
        id: 'wt-4', name: 'Lobbitevékenység', type: 'Power', cost: 2, rarity: 'Rare', characterClass: 'Független Politikus',
        description: 'Nyerj 2 Erőt és 2 Ügyességet.',
        effect: (s) => applyStatus(applyStatus(s, 'Strength', 2, 'PLAYER'), 'Dexterity', 2, 'PLAYER')
    },
    {
        id: 'wt-5', name: 'Paktum', type: 'Skill', cost: 0, rarity: 'Rare', characterClass: 'Független Politikus',
        description: 'Húzz 2 kártyát. Nyerj 2 Lendületet. Kimerül.',
        exhaust: true,
        effect: (s) => {
            let ns = drawCards(s, 2);
            if (ns.player) ns.player.energy += 2;
            return ns;
        }
    },
    {
        id: 'wt-6', name: 'Háttéralku', type: 'Skill', cost: 1, rarity: 'Rare', characterClass: 'Független Politikus',
        description: 'Nyerj 2 Késleltetett Húzást és 1 Késleltetett Lendületet. Kimerül.',
        exhaust: true,
        effect: (s) => applyStatus(applyStatus(s, 'NextTurnDraw', 2, 'PLAYER'), 'NextTurnEnergy', 1, 'PLAYER')
    },
    {
        id: 'wt-7', name: 'Tárgyalás', type: 'Skill', cost: 0, rarity: 'Rare', characterClass: 'Független Politikus',
        description: 'Húzz 1 kártyát. Nyerj 1 Késleltetett Lendületet.',
        effect: (s) => applyStatus(drawCards(s, 1), 'NextTurnEnergy', 1, 'PLAYER')
    },
    {
        id: 'wt-8', name: 'Diplomácia', type: 'Skill', cost: 2, rarity: 'Rare', characterClass: 'Független Politikus',
        needsTarget: false,
        description: 'Adj 3 Gyengeséget és 3 Sebezhetőséget MINDEN ellenfélnek. Kimerül.',
        exhaust: true,
        effect: (s) => {
            let ns = { ...s };
            ns.enemies.forEach(e => {
                ns = applyStatus(ns, 'Weak', 3, e.id);
                ns = applyStatus(ns, 'Vulnerable', 3, e.id);
            });
            return ns;
        }
    },
    {
        id: 'wt-9', name: 'Karizma', type: 'Power', cost: 1, rarity: 'Rare', characterClass: 'Független Politikus',
        description: 'Nyerj 3 Erőt. Kimerül.',
        exhaust: true,
        effect: (s) => applyStatus(s, 'Strength', 3, 'PLAYER')
    },
    {
        id: 'wt-10', name: 'Médiamegjelenés', type: 'Skill', cost: 1, rarity: 'Rare', characterClass: 'Független Politikus',
        description: 'Nyerj 15 Cenzúrát. Kimerül.',
        exhaust: true,
        effect: (s) => gainBlock(s, 15)
    },

    // UNCOMMON (15 cards)
    {
        id: 'wt-11', name: 'Érvelés', type: 'Attack', cost: 1, rarity: 'Uncommon', characterClass: 'Független Politikus',
        needsTarget: true,
        description: 'Okozz 5 sebzést. Húzz 1 kártyát.',
        effect: (s, targetId) => drawCards(dealDamage(s, 5, 1, targetId), 1)
    },
    {
        id: 'wt-12', name: 'Viszontválasz', type: 'Skill', cost: 0, rarity: 'Uncommon', characterClass: 'Független Politikus',
        description: 'Nyerj 4 Cenzúrát. Húzz 1 kártyát.',
        effect: (s) => drawCards(gainBlock(s, 4), 1)
    },
    {
        id: 'wt-13', name: 'Támogatói Bázis', type: 'Skill', cost: 1, rarity: 'Uncommon', characterClass: 'Független Politikus',
        description: 'Húzz 2 kártyát.',
        effect: (s) => drawCards(s, 2)
    },
    {
        id: 'wt-14', name: 'Határozat', type: 'Attack', cost: 1, rarity: 'Uncommon', characterClass: 'Független Politikus',
        needsTarget: true,
        description: 'Okozz 7 sebzést. Ha játszottál már ki kártyát ebben a körben, nyerj 1 Lendületet.',
        effect: (s, targetId) => {
            let ns = dealDamage(s, 7, 1, targetId);
            // cardsPlayedThisTurn includes this card if it's already added, usually it's added before effect. 
            // So we check if length > 1
            if (ns.cardsPlayedThisTurn.length > 1 && ns.player) {
                ns.player.energy += 1;
            }
            return ns;
        }
    },
    {
        id: 'wt-15', name: 'Törvénymódosítás', type: 'Skill', cost: 0, rarity: 'Uncommon', characterClass: 'Független Politikus',
        description: 'Nyerj 1 Lendületet. Kimerül.',
        exhaust: true,
        effect: (s) => {
            if (!s.player) return s;
            return { ...s, player: { ...s.player, energy: s.player.energy + 1 } };
        }
    },
    {
        id: 'wt-16', name: 'Egyeztetés', type: 'Skill', cost: 0, rarity: 'Uncommon', characterClass: 'Független Politikus',
        description: 'Húzz 1 kártyát. Nyerj 1 Lendületet. Kimerül.',
        exhaust: true,
        effect: (s) => {
            let ns = drawCards(s, 1);
            if (ns.player) ns.player.energy += 1;
            return ns;
        }
    },
    {
        id: 'wt-17', name: 'Politikai Tőke', type: 'Skill', cost: 2, rarity: 'Uncommon', characterClass: 'Független Politikus',
        description: 'Nyerj 10 Cenzúrát és 1 Késleltetett Húzást.',
        effect: (s) => applyStatus(gainBlock(s, 10), 'NextTurnDraw', 1, 'PLAYER')
    },
    {
        id: 'wt-18', name: 'Felszólító Levél', type: 'Attack', cost: 1, rarity: 'Uncommon', characterClass: 'Független Politikus',
        needsTarget: true,
        description: 'Okozz 4 sebzést. Adj 1 Sebezhetőséget. Húzz 1 kártyát.',
        effect: (s, targetId) => drawCards(applyStatus(dealDamage(s, 4, 1, targetId), 'Vulnerable', 1, targetId), 1)
    },
    {
        id: 'wt-19', name: 'Bizottsági Ülés', type: 'Skill', cost: 1, rarity: 'Uncommon', characterClass: 'Független Politikus',
        description: 'Nyerj 5 Cenzúrát minden ellenfél után.',
        effect: (s) => gainBlock(s, 5 * s.enemies.length)
    },
    {
        id: 'wt-20', name: 'Elterelés', type: 'Skill', cost: 1, rarity: 'Uncommon', characterClass: 'Független Politikus',
        needsTarget: true,
        description: 'Nyerj 6 Cenzúrát. Adj 1 Gyengeséget.',
        effect: (s, targetId) => applyStatus(gainBlock(s, 6), 'Weak', 1, targetId)
    },
    {
        id: 'wt-21', name: 'Közvélemény-kutatás', type: 'Skill', cost: 0, rarity: 'Uncommon', characterClass: 'Független Politikus',
        description: 'Húzz 1 kártyát. Nyerj 1 Késleltetett Húzást.',
        effect: (s) => applyStatus(drawCards(s, 1), 'NextTurnDraw', 1, 'PLAYER')
    },
    {
        id: 'wt-22', name: 'Módosító Indítvány', type: 'Attack', cost: 2, rarity: 'Uncommon', characterClass: 'Független Politikus',
        needsTarget: true,
        description: 'Okozz 10 sebzést. Húzz 2 kártyát.',
        effect: (s, targetId) => drawCards(dealDamage(s, 10, 1, targetId), 2)
    },
    {
        id: 'wt-23', name: 'Választási Ígéret', type: 'Skill', cost: 2, rarity: 'Uncommon', characterClass: 'Független Politikus',
        description: 'Nyerj 2 Késleltetett Lendületet.',
        effect: (s) => applyStatus(s, 'NextTurnEnergy', 2, 'PLAYER')
    },
    {
        id: 'wt-24', name: 'Személyes Találkozó', type: 'Attack', cost: 1, rarity: 'Uncommon', characterClass: 'Független Politikus',
        needsTarget: true,
        description: 'Okozz 3 sebzést 2 alkalommal. Húzz 1 kártyát.',
        effect: (s, targetId) => drawCards(dealDamage(s, 3, 2, targetId), 1)
    },
    {
        id: 'wt-25', name: 'Sajtótájékoztató', type: 'Skill', cost: 1, rarity: 'Uncommon', characterClass: 'Független Politikus',
        description: 'Nyerj 8 Cenzúrát. Ha van Sebezhető ellenfél, húzz 1 kártyát.',
        effect: (s) => {
            let ns = gainBlock(s, 8);
            if (ns.enemies.some(e => e.statusEffects.some(st => st.type === 'Vulnerable'))) {
                ns = drawCards(ns, 1);
            }
            return ns;
        }
    },

    // COMMON (25 cards)
    {
        id: 'wt-26', name: 'Vita', type: 'Attack', cost: 0, rarity: 'Common', characterClass: 'Független Politikus',
        needsTarget: true,
        description: 'Okozz 3 sebzést. Húzz 1 kártyát.',
        effect: (s, targetId) => drawCards(dealDamage(s, 3, 1, targetId), 1)
    },
    {
        id: 'wt-27', name: 'Kampány', type: 'Skill', cost: 1, rarity: 'Common', characterClass: 'Független Politikus',
        description: 'Nyerj 5 Cenzúrát. Húzz 1 kártyát.',
        effect: (s) => drawCards(gainBlock(s, 5), 1)
    },
    {
        id: 'wt-28', name: 'Kompromisszum', type: 'Skill', cost: 0, rarity: 'Common', characterClass: 'Független Politikus',
        description: 'Nyerj 3 Cenzúrát. Húzz 1 kártyát.',
        effect: (s) => drawCards(gainBlock(s, 3), 1)
    },
    {
        id: 'wt-29', name: 'Nyilatkozat', type: 'Attack', cost: 1, rarity: 'Common', characterClass: 'Független Politikus',
        needsTarget: true,
        description: 'Okozz 7 sebzést.',
        effect: (s, targetId) => dealDamage(s, 7, 1, targetId)
    },
    {
        id: 'wt-30', name: 'Sajtóközlemény', type: 'Skill', cost: 1, rarity: 'Common', characterClass: 'Független Politikus',
        description: 'Nyerj 7 Cenzúrát.',
        effect: (s) => gainBlock(s, 7)
    },
    {
        id: 'wt-31', name: 'Megszólítás', type: 'Attack', cost: 1, rarity: 'Common', characterClass: 'Független Politikus',
        needsTarget: true,
        description: 'Okozz 5 sebzést.',
        effect: (s, targetId) => dealDamage(s, 5, 1, targetId)
    },
    {
        id: 'wt-32', name: 'Kérdés', type: 'Skill', cost: 0, rarity: 'Common', characterClass: 'Független Politikus',
        needsTarget: true,
        description: 'Adj 1 Sebezhetőséget.',
        effect: (s, targetId) => applyStatus(s, 'Vulnerable', 1, targetId)
    },
    {
        id: 'wt-33', name: 'Válasz', type: 'Skill', cost: 0, rarity: 'Common', characterClass: 'Független Politikus',
        needsTarget: true,
        description: 'Adj 1 Gyengeséget.',
        effect: (s, targetId) => applyStatus(s, 'Weak', 1, targetId)
    },
    {
        id: 'wt-34', name: 'Reflexió', type: 'Attack', cost: 1, rarity: 'Common', characterClass: 'Független Politikus',
        needsTarget: true,
        description: 'Okozz 4 sebzést. Nyerj 4 Cenzúrát.',
        effect: (s, targetId) => gainBlock(dealDamage(s, 4, 1, targetId), 4)
    },
    {
        id: 'wt-35', name: 'Interpelláció', type: 'Attack', cost: 2, rarity: 'Common', characterClass: 'Független Politikus',
        needsTarget: true,
        description: 'Okozz 12 sebzést.',
        effect: (s, targetId) => dealDamage(s, 12, 1, targetId)
    },
    {
        id: 'wt-36', name: 'Napirend', type: 'Skill', cost: 1, rarity: 'Common', characterClass: 'Független Politikus',
        description: 'Nyerj 6 Cenzúrát. Nyerj 1 Késleltet Lendületet.',
        effect: (s) => applyStatus(gainBlock(s, 6), 'NextTurnEnergy', 1, 'PLAYER')
    },
    {
        id: 'wt-37', name: 'Jegyzőkönyv', type: 'Skill', cost: 0, rarity: 'Common', characterClass: 'Független Politikus',
        description: 'Nyerj 1 Késleltetett Húzást.',
        effect: (s) => applyStatus(s, 'NextTurnDraw', 1, 'PLAYER')
    },
    {
        id: 'wt-38', name: 'Gyors Beszéd', type: 'Attack', cost: 1, rarity: 'Common', characterClass: 'Független Politikus',
        needsTarget: true,
        description: 'Okozz 2 sebzést 3 alkalommal.',
        effect: (s, targetId) => dealDamage(s, 2, 3, targetId)
    },
    {
        id: 'wt-39', name: 'Érvrendszer', type: 'Attack', cost: 1, rarity: 'Common', characterClass: 'Független Politikus',
        needsTarget: true,
        description: 'Okozz 6 sebzést. Adj 1 Gyengeséget.',
        effect: (s, targetId) => applyStatus(dealDamage(s, 6, 1, targetId), 'Weak', 1, targetId)
    },
    {
        id: 'wt-40', name: 'Ellenérv', type: 'Skill', cost: 1, rarity: 'Common', characterClass: 'Független Politikus',
        description: 'Nyerj 8 Cenzúrát.',
        effect: (s) => gainBlock(s, 8)
    },
    {
        id: 'wt-41', name: 'Láncfelszólalás', type: 'Attack', cost: 1, rarity: 'Uncommon', characterClass: 'Független Politikus',
        needsTarget: true,
        description: 'Okozz 3 sebzést. Ha ez a 3. vagy későbbi kártyád ebben a körben, húzz 1 lapot és nyerj 1 Lendületet.',
        effect: (s, targetId) => {
            let ns = dealDamage(s, 3, 1, targetId);
            if (ns.cardsPlayedThisTurn.length >= 3 && ns.player) {
                ns = drawCards(ns, 1);
                ns.player.energy += 1;
            }
            return ns;
        }
    },
    {
        id: 'wt-42', name: 'Zárszó', type: 'Attack', cost: 2, rarity: 'Uncommon', characterClass: 'Független Politikus',
        needsTarget: true,
        description: 'Okozz 10 sebzést. Ha nem maradt kártya a kezedben, okozz még 20-at.',
        effect: (s, targetId) => {
            const emptyHand = s.player && s.player.hand.length === 0;
            const dmg = emptyHand ? 30 : 10;
            return dealDamage(s, dmg, 1, targetId);
        }
    },
    {
        id: 'wt-43', name: 'Politikai Tőkehalmozás', type: 'Skill', cost: 2, rarity: 'Rare', characterClass: 'Független Politikus',
        description: 'Nyerj 2 Késleltetett Lendületet és 2 Késleltetett Húzást. Kimerül.',
        exhaust: true,
        effect: (s) => applyStatus(applyStatus(s, 'NextTurnEnergy', 2, 'PLAYER'), 'NextTurnDraw', 2, 'PLAYER')
    },
    {
        id: 'wt-44', name: 'Kampányfinanszírozás', type: 'Skill', cost: 1, rarity: 'Common', characterClass: 'Független Politikus',
        description: 'Nyerj 8 Cenzúrát. Nyerj 1 Erőt.',
        effect: (s) => applyStatus(gainBlock(s, 8), 'Strength', 1, 'PLAYER')
    },
    {
        id: 'wt-45', name: 'Választási Program', type: 'Skill', cost: 1, rarity: 'Uncommon', characterClass: 'Független Politikus',
        description: 'Nyerj 10 Cenzúrát. Következő körben nyerj 1 Lendületet.',
        effect: (s) => applyStatus(gainBlock(s, 10), 'NextTurnEnergy', 1, 'PLAYER')
    },
    {
        id: 'wt-46', name: 'Koalícióépítés', type: 'Power', cost: 2, rarity: 'Uncommon', characterClass: 'Független Politikus',
        description: 'Nyerj 2 Erőt.',
        effect: (s) => applyStatus(s, 'Strength', 2, 'PLAYER')
    },
    {
        id: 'wt-47', name: 'Ellenpropaganda', type: 'Skill', cost: 0, rarity: 'Common', characterClass: 'Független Politikus',
        needsTarget: true,
        description: 'Adj 1 Gyengeséget és 1 Sebezhetőséget.',
        effect: (s, targetId) => applyStatus(applyStatus(s, 'Weak', 1, targetId), 'Vulnerable', 1, targetId)
    },
    {
        id: 'wt-48', name: 'Kormányváltó Hangulat', type: 'Power', cost: 3, rarity: 'Rare', characterClass: 'Független Politikus',
        description: 'Nyerj 2 Erőt és 2 Ügyességet.',
        effect: (s) => applyStatus(applyStatus(s, 'Strength', 2, 'PLAYER'), 'Dexterity', 2, 'PLAYER')
    },
    {
        id: 'wt-49', name: 'Abszolút Többség', type: 'Attack', cost: 3, rarity: 'Rare', characterClass: 'Független Politikus',
        needsTarget: true,
        description: 'Okozz 35 sebzést.',
        effect: (s, targetId) => dealDamage(s, 35, 1, targetId)
    },
    {
        id: 'wt-50', name: 'Politikai Karrier', type: 'Skill', cost: 0, rarity: 'Rare', characterClass: 'Független Politikus',
        description: 'Húzz 3 kártyát. Nyerj 1 Lendületet. Kimerül.',
        exhaust: true,
        effect: (s) => {
            let ns = drawCards(s, 3);
            if (ns.player) ns = { ...ns, player: { ...ns.player, energy: ns.player.energy + 1 } };
            return ns;
        }
    }
];