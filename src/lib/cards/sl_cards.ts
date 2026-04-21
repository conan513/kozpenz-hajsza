import { Card, GameState } from '../../types';
import { dealDamage, gainBlock, drawCards, applyStatus } from '../cardUtils';

export const SL_CARDS: Card[] = [
    // RARE (10 cards)
    {
        id: 'sl-1', name: 'Katalizátor', type: 'Skill', cost: 1, rarity: 'Rare', characterClass: 'Oknyomozó',
        needsTarget: true,
        description: 'Duplázd meg az ellenfélen lévő Botrányt (Mérget). Kimerül.',
        exhaust: true,
        effect: (s, targetId) => {
            const target = s.enemies.find(e => e.id === targetId);
            if (!target) return s;
            const poison = target.statusEffects.find(st => st.type === 'Poison')?.stacks || 0;
            if (poison > 0) {
                return applyStatus(s, 'Poison', poison, targetId);
            }
            return s;
        }
    },
    {
        id: 'sl-2', name: 'Oknyomozó Portál', type: 'Power', cost: 3, rarity: 'Rare', characterClass: 'Oknyomozó',
        description: 'Minden ellenfél kör elején kap 2 Botrányt. (Megj: Kapsz 3 Késleltetett Lendületet, amivel fedezed a költséget).',
        // Since we don't have "start of turn" global powers yet, we'll give them massive energy next turn as a "Power" investment, and 5 Poison to all enemies now.
        effect: (s) => applyStatus(applyStatus(s, 'NextTurnEnergy', 3, 'PLAYER'), 'Poison', 5, 'ALL')
    },
    {
        id: 'sl-3', name: 'Megsemmisítő Cikk', type: 'Attack', cost: 2, rarity: 'Rare', characterClass: 'Oknyomozó',
        needsTarget: true,
        description: 'Okozz sebzést, ami megegyezik a célponton lévő Botrány KÉTSZERESÉVEL.',
        effect: (s, targetId) => {
            const target = s.enemies.find(e => e.id === targetId);
            if (!target) return s;
            const poison = target.statusEffects.find(st => st.type === 'Poison')?.stacks || 0;
            return dealDamage(s, poison * 2, 1, targetId);
        }
    },
    {
        id: 'sl-4', name: 'Sötét Titok', type: 'Skill', cost: 2, rarity: 'Rare', characterClass: 'Oknyomozó',
        needsTarget: false,
        description: 'Adj 7 Botrányt MINDEN ellenfélnek.',
        effect: (s) => applyStatus(s, 'Poison', 7, 'ALL')
    },
    {
        id: 'sl-5', name: 'Belsős Informátor', type: 'Skill', cost: 0, rarity: 'Rare', characterClass: 'Oknyomozó',
        needsTarget: true,
        description: 'Adj 3 Botrányt és 3 Sebezhetőséget. Kimerül.',
        exhaust: true,
        effect: (s, targetId) => applyStatus(applyStatus(s, 'Poison', 3, targetId), 'Vulnerable', 3, targetId)
    },
    {
        id: 'sl-6', name: 'Vesztegetési Pénz', type: 'Skill', cost: 0, rarity: 'Rare', characterClass: 'Oknyomozó',
        description: 'Nyerj 2 Lendületet. Kimerül.',
        exhaust: true,
        effect: (s) => {
            if (!s.player) return s;
            return { ...s, player: { ...s.player, energy: s.player.energy + 2 } };
        }
    },
    {
        id: 'sl-7', name: 'Fantomcég', type: 'Power', cost: 1, rarity: 'Rare', characterClass: 'Oknyomozó',
        description: 'Nyerj 3 Ügyességet. Kimerül.',
        exhaust: true,
        effect: (s) => applyStatus(s, 'Dexterity', 3, 'PLAYER')
    },
    {
        id: 'sl-8', name: 'Tényfeltárás', type: 'Skill', cost: 2, rarity: 'Rare', characterClass: 'Oknyomozó',
        description: 'Húzz 4 kártyát. Nyerj 10 Cenzúrát (Blokkot).',
        effect: (s) => drawCards(gainBlock(s, 10), 4)
    },
    {
        id: 'sl-9', name: 'Hangfelvétel', type: 'Skill', cost: 3, rarity: 'Rare', characterClass: 'Oknyomozó',
        needsTarget: true,
        description: 'Adj 12 Botrányt. Nyerj 2 Késleltetett Húzást.',
        effect: (s, targetId) => applyStatus(applyStatus(s, 'Poison', 12, targetId), 'NextTurnDraw', 2, 'PLAYER')
    },
    {
        id: 'sl-10', name: 'Tökéletes Bűntény', type: 'Attack', cost: 3, rarity: 'Rare', characterClass: 'Oknyomozó',
        needsTarget: false,
        description: 'Okozz 15 sebzést MINDEN ellenfélnek. Adj nekik 5 Botrányt.',
        effect: (s) => applyStatus(dealDamage(s, 15, 1, 'ALL'), 'Poison', 5, 'ALL')
    },

    // UNCOMMON (15 cards)
    {
        id: 'sl-11', name: 'Célzott Nyomozás', type: 'Skill', cost: 1, rarity: 'Uncommon', characterClass: 'Oknyomozó',
        needsTarget: true,
        description: 'Adj 5 Botrányt.',
        effect: (s, targetId) => applyStatus(s, 'Poison', 5, targetId)
    },
    {
        id: 'sl-12', name: 'Kiszivárogtatás', type: 'Skill', cost: 1, rarity: 'Uncommon', characterClass: 'Oknyomozó',
        needsTarget: false,
        description: 'Adj 4 Botrányt MINDEN ellenfélnek.',
        effect: (s) => applyStatus(s, 'Poison', 4, 'ALL')
    },
    {
        id: 'sl-13', name: 'Zsarolás', type: 'Attack', cost: 1, rarity: 'Uncommon', characterClass: 'Oknyomozó',
        needsTarget: true,
        description: 'Okozz 5 sebzést. Ha a célponton van Botrány, okozz még 7 sebzést.',
        effect: (s, targetId) => {
            const target = s.enemies.find(e => e.id === targetId);
            let dmg = 5;
            if (target && target.statusEffects.some(st => st.type === 'Poison' && st.stacks > 0)) {
                dmg += 7;
            }
            return dealDamage(s, dmg, 1, targetId);
        }
    },
    {
        id: 'sl-14', name: 'Gyorsjegyzet', type: 'Skill', cost: 0, rarity: 'Uncommon', characterClass: 'Oknyomozó',
        description: 'Húzz 2 kártyát. Kimerül.',
        exhaust: true,
        effect: (s) => drawCards(s, 2)
    },
    {
        id: 'sl-15', name: 'Alibi', type: 'Skill', cost: 2, rarity: 'Uncommon', characterClass: 'Oknyomozó',
        description: 'Nyerj 14 Cenzúrát.',
        effect: (s) => gainBlock(s, 14)
    },
    {
        id: 'sl-16', name: 'Adatmentés', type: 'Skill', cost: 1, rarity: 'Uncommon', characterClass: 'Oknyomozó',
        retain: true,
        description: 'Nyerj 8 Cenzúrát. Megtartható (Retain).',
        effect: (s) => gainBlock(s, 8)
    },
    {
        id: 'sl-17', name: 'Kompromat', type: 'Skill', cost: 1, rarity: 'Uncommon', characterClass: 'Oknyomozó',
        needsTarget: true,
        description: 'Adj 3 Botrányt és 1 Gyengeséget.',
        effect: (s, targetId) => applyStatus(applyStatus(s, 'Poison', 3, targetId), 'Weak', 1, targetId)
    },
    {
        id: 'sl-18', name: 'Nyomeltüntetés', type: 'Skill', cost: 1, rarity: 'Uncommon', characterClass: 'Oknyomozó',
        description: 'Nyerj 6 Cenzúrát és 1 Késleltetett Lendületet.',
        effect: (s) => applyStatus(gainBlock(s, 6), 'NextTurnEnergy', 1, 'PLAYER')
    },
    {
        id: 'sl-19', name: 'Halálos Toll', type: 'Attack', cost: 1, rarity: 'Uncommon', characterClass: 'Oknyomozó',
        needsTarget: true,
        description: 'Okozz 4 sebzést kétszer. Adj 2 Botrányt.',
        effect: (s, targetId) => applyStatus(dealDamage(s, 4, 2, targetId), 'Poison', 2, targetId)
    },
    {
        id: 'sl-20', name: 'Forrásvédelem', type: 'Skill', cost: 1, rarity: 'Uncommon', characterClass: 'Oknyomozó',
        description: 'Nyerj 5 Cenzúrát és 2 Késleltetett Húzást.',
        effect: (s) => applyStatus(gainBlock(s, 5), 'NextTurnDraw', 2, 'PLAYER')
    },
    {
        id: 'sl-21', name: 'Vakfolt', type: 'Skill', cost: 0, rarity: 'Uncommon', characterClass: 'Oknyomozó',
        needsTarget: true,
        description: 'Adj 2 Sebezhetőséget.',
        effect: (s, targetId) => applyStatus(s, 'Vulnerable', 2, targetId)
    },
    {
        id: 'sl-22', name: 'Orgyilkosság', type: 'Attack', cost: 2, rarity: 'Uncommon', characterClass: 'Oknyomozó',
        needsTarget: true,
        description: 'Okozz 12 sebzést. Adj 3 Botrányt.',
        effect: (s, targetId) => applyStatus(dealDamage(s, 12, 1, targetId), 'Poison', 3, targetId)
    },
    {
        id: 'sl-23', name: 'Figyelmeztetés', type: 'Skill', cost: 0, rarity: 'Uncommon', characterClass: 'Oknyomozó',
        needsTarget: true,
        description: 'Adj 1 Gyengeséget és 1 Botrányt.',
        effect: (s, targetId) => applyStatus(applyStatus(s, 'Weak', 1, targetId), 'Poison', 1, targetId)
    },
    {
        id: 'sl-24', name: 'Kockázatos Lépés', type: 'Attack', cost: 1, rarity: 'Uncommon', characterClass: 'Oknyomozó',
        needsTarget: true,
        description: 'Okozz 10 sebzést. Adj magadnak 1 Sebezhetőséget.',
        effect: (s, targetId) => applyStatus(dealDamage(s, 10, 1, targetId), 'Vulnerable', 1, 'PLAYER')
    },
    {
        id: 'sl-25', name: 'Manipuláció', type: 'Skill', cost: 2, rarity: 'Uncommon', characterClass: 'Oknyomozó',
        needsTarget: true,
        description: 'Adj 4 Botrányt. Ha a célpont Sebezhető, adj még 4-et.',
        effect: (s, targetId) => {
            const target = s.enemies.find(e => e.id === targetId);
            let p = 4;
            if (target && target.statusEffects.some(st => st.type === 'Vulnerable')) p += 4;
            return applyStatus(s, 'Poison', p, targetId);
        }
    },

    // COMMON (25 cards)
    {
        id: 'sl-26', name: 'Gyors Riport', type: 'Attack', cost: 1, rarity: 'Common', characterClass: 'Oknyomozó',
        needsTarget: true,
        description: 'Okozz 5 sebzést. Adj 2 Botrányt.',
        effect: (s, targetId) => applyStatus(dealDamage(s, 5, 1, targetId), 'Poison', 2, targetId)
    },
    {
        id: 'sl-27', name: 'Mélyinterjú', type: 'Skill', cost: 1, rarity: 'Common', characterClass: 'Oknyomozó',
        needsTarget: true,
        description: 'Adj 4 Botrányt.',
        effect: (s, targetId) => applyStatus(s, 'Poison', 4, targetId)
    },
    {
        id: 'sl-28', name: 'Fedezék', type: 'Skill', cost: 1, rarity: 'Common', characterClass: 'Oknyomozó',
        description: 'Nyerj 5 Cenzúrát. Húzz 1 kártyát.',
        effect: (s) => drawCards(gainBlock(s, 5), 1)
    },
    {
        id: 'sl-29', name: 'Titkosítás', type: 'Skill', cost: 1, rarity: 'Common', characterClass: 'Oknyomozó',
        description: 'Nyerj 8 Cenzúrát.',
        effect: (s) => gainBlock(s, 8)
    },
    {
        id: 'sl-30', name: 'Tőr', type: 'Attack', cost: 0, rarity: 'Common', characterClass: 'Oknyomozó',
        needsTarget: true,
        description: 'Okozz 4 sebzést.',
        effect: (s, targetId) => dealDamage(s, 4, 1, targetId)
    },
    {
        id: 'sl-31', name: 'Vakító Vaku', type: 'Skill', cost: 0, rarity: 'Common', characterClass: 'Oknyomozó',
        needsTarget: true,
        description: 'Adj 1 Gyengeséget.',
        effect: (s, targetId) => applyStatus(s, 'Weak', 1, targetId)
    },
    {
        id: 'sl-32', name: 'Pletyka', type: 'Skill', cost: 0, rarity: 'Common', characterClass: 'Oknyomozó',
        needsTarget: false,
        description: 'Adj 2 Botrányt MINDEN ellenfélnek. Kimerül.',
        exhaust: true,
        effect: (s) => applyStatus(s, 'Poison', 2, 'ALL')
    },
    {
        id: 'sl-33', name: 'Felkészülés', type: 'Skill', cost: 1, rarity: 'Common', characterClass: 'Oknyomozó',
        description: 'Nyerj 1 Késleltetett Húzást és 1 Késleltetett Lendületet. Kimerül.',
        exhaust: true,
        effect: (s) => applyStatus(applyStatus(s, 'NextTurnDraw', 1, 'PLAYER'), 'NextTurnEnergy', 1, 'PLAYER')
    },
    {
        id: 'sl-34', name: 'Rajtaütés', type: 'Attack', cost: 1, rarity: 'Common', characterClass: 'Oknyomozó',
        needsTarget: true,
        description: 'Okozz 9 sebzést.',
        effect: (s, targetId) => dealDamage(s, 9, 1, targetId)
    },
    {
        id: 'sl-35', name: 'Bujkálás', type: 'Skill', cost: 1, rarity: 'Common', characterClass: 'Oknyomozó',
        description: 'Nyerj 6 Cenzúrát és 1 Késleltetett Cenzúrát.',
        effect: (s) => applyStatus(gainBlock(s, 6), 'NextTurnBlock', 1, 'PLAYER')
    },
    {
        id: 'sl-36', name: 'Fotó Bizonyíték', type: 'Attack', cost: 1, rarity: 'Common', characterClass: 'Oknyomozó',
        needsTarget: true,
        description: 'Okozz 6 sebzést. Adj 1 Sebezhetőséget.',
        effect: (s, targetId) => applyStatus(dealDamage(s, 6, 1, targetId), 'Vulnerable', 1, targetId)
    },
    {
        id: 'sl-37', name: 'Rejtett Mikrofon', type: 'Skill', cost: 0, rarity: 'Common', characterClass: 'Oknyomozó',
        needsTarget: true,
        description: 'Adj 2 Botrányt.',
        effect: (s, targetId) => applyStatus(s, 'Poison', 2, targetId)
    },
    {
        id: 'sl-38', name: 'Alattomos Ütés', type: 'Attack', cost: 2, rarity: 'Common', characterClass: 'Oknyomozó',
        needsTarget: true,
        description: 'Okozz 10 sebzést. Adj 3 Botrányt.',
        effect: (s, targetId) => applyStatus(dealDamage(s, 10, 1, targetId), 'Poison', 3, targetId)
    },
    {
        id: 'sl-39', name: 'Távolságtartás', type: 'Skill', cost: 2, rarity: 'Common', characterClass: 'Oknyomozó',
        description: 'Nyerj 11 Cenzúrát.',
        effect: (s) => gainBlock(s, 11)
    },
    {
        id: 'sl-40', name: 'Sorozatos Cikkek', type: 'Attack', cost: 1, rarity: 'Common', characterClass: 'Oknyomozó',
        needsTarget: true,
        description: 'Okozz 3 sebzést 3 alkalommal.',
        effect: (s, targetId) => dealDamage(s, 3, 3, targetId)
    },
    {
        id: 'sl-41', name: 'Oknyomozó Riport', type: 'Attack', cost: 1, rarity: 'Common', characterClass: 'Oknyomozó',
        needsTarget: true,
        description: 'Okozz 7 sebzést. Adj 2 Botrányt.',
        effect: (s, targetId) => applyStatus(dealDamage(s, 7, 1, targetId), 'Poison', 2, targetId)
    },
    {
        id: 'sl-42', name: 'Szerkesztőségi Üzenet', type: 'Skill', cost: 1, rarity: 'Common', characterClass: 'Oknyomozó',
        description: 'Nyerj 8 Cenzúrát. Ha az ellenfélen van Botrány, nyerj 1 Ügyességet.',
        effect: (s) => {
            let ns = gainBlock(s, 8);
            const anyPoison = ns.enemies.some(e => e.statusEffects.some(st => st.type === 'Poison'));
            if (anyPoison) ns = applyStatus(ns, 'Dexterity', 1, 'PLAYER');
            return ns;
        }
    },
    {
        id: 'sl-43', name: 'Titkos Hangfelvétel', type: 'Skill', cost: 1, rarity: 'Uncommon', characterClass: 'Oknyomozó',
        needsTarget: false,
        description: 'Adj 4 Botrányt MINDEN ellenfélnek.',
        effect: (s) => applyStatus(s, 'Poison', 4, 'ALL')
    },
    {
        id: 'sl-44', name: 'Címlapsztori', type: 'Attack', cost: 2, rarity: 'Rare', characterClass: 'Oknyomozó',
        needsTarget: true,
        description: 'Okozz 14 sebzést. Adj 5 Botrányt.',
        effect: (s, targetId) => applyStatus(dealDamage(s, 14, 1, targetId), 'Poison', 5, targetId)
    },
    {
        id: 'sl-45', name: 'Oknyomozó Portyázás', type: 'Skill', cost: 0, rarity: 'Common', characterClass: 'Oknyomozó',
        needsTarget: true,
        description: 'Húzz 1 kártyát. Adj 2 Botrányt.',
        effect: (s, targetId) => applyStatus(drawCards(s, 1), 'Poison', 2, targetId)
    },
    {
        id: 'sl-46', name: 'Médiafigyelem', type: 'Power', cost: 1, rarity: 'Uncommon', characterClass: 'Oknyomozó',
        description: 'Nyerj 2 Ügyességet.',
        effect: (s) => applyStatus(s, 'Dexterity', 2, 'PLAYER')
    },
    {
        id: 'sl-47', name: 'Helyreigazítás', type: 'Skill', cost: 1, rarity: 'Common', characterClass: 'Oknyomozó',
        description: 'Nyerj 7 Cenzúrát. Adj 1 Gyengeséget.',
        effect: (s, targetId) => applyStatus(gainBlock(s, 7), 'Weak', 1, targetId)
    },
    {
        id: 'sl-48', name: 'Szenzációhajhászás', type: 'Skill', cost: 0, rarity: 'Rare', characterClass: 'Oknyomozó',
        description: 'Húzz 2 kártyát. Nyerj 1 Lendületet. Kimerül.',
        exhaust: true,
        effect: (s) => {
            let ns = drawCards(s, 2);
            if (ns.player) ns = { ...ns, player: { ...ns.player, energy: ns.player.energy + 1 } };
            return ns;
        }
    },
    {
        id: 'sl-49', name: 'Újságírói Etika', type: 'Skill', cost: 1, rarity: 'Uncommon', characterClass: 'Oknyomozó',
        description: 'Nyerj 10 Cenzúrát. Következő körben húzz 1 kártyát.',
        effect: (s) => applyStatus(gainBlock(s, 10), 'NextTurnDraw', 1, 'PLAYER')
    },
    {
        id: 'sl-50', name: 'Végső Leleplezés', type: 'Attack', cost: 3, rarity: 'Rare', characterClass: 'Oknyomozó',
        needsTarget: true,
        description: 'Okozz 20 sebzést. Adj 10 Botrányt.',
        effect: (s, targetId) => applyStatus(dealDamage(s, 20, 1, targetId), 'Poison', 10, targetId)
    }
];