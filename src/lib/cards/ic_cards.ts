import { Card, GameState } from '../../types';
import { dealDamage, gainBlock, drawCards, applyStatus } from '../cardUtils';

export const IC_CARDS: Card[] = [
    // RARE (10 kártya)
    {
        id: 'ic-1', name: 'Barikád Döntés', type: 'Attack', cost: 2, rarity: 'Rare', characterClass: 'Diáktüntető',
        needsTarget: true,
        description: 'Okozz sebzést, ami megegyezik a jelenlegi Cenzúrád (Blokkod) számával. Elveszíted az összes Cenzúrádat.',
        effect: (s, targetId) => {
            if (!s.player) return s;
            const dmg = s.player.block;
            let ns = dealDamage(s, dmg, 1, targetId);
            if (ns.player) ns = { ...ns, player: { ...ns.player, block: 0 } };
            return ns;
        }
    },
    {
        id: 'ic-2', name: 'Egyetemfoglalás', type: 'Power', cost: 3, rarity: 'Rare', characterClass: 'Diáktüntető',
        description: 'Nyerj 3 Ügyességet és 1 Erőt.',
        effect: (s) => applyStatus(applyStatus(s, 'Dexterity', 3, 'PLAYER'), 'Strength', 1, 'PLAYER')
    },
    {
        id: 'ic-3', name: 'Zavargás', type: 'Attack', cost: 3, rarity: 'Rare', characterClass: 'Diáktüntető',
        needsTarget: false,
        description: 'Okozz 20 sebzést MINDEN ellenfélnek. Adj 2 Gyengeséget MINDEN ellenfélnek.',
        effect: (s) => {
            let ns = dealDamage(s, 20, 1, 'ALL');
            ns.enemies.forEach(e => {
                ns = applyStatus(ns, 'Weak', 2, e.id);
            });
            return ns;
        }
    },
    {
        id: 'ic-4', name: 'Ellenállhatatlan Tömeg', type: 'Power', cost: 3, rarity: 'Rare', characterClass: 'Diáktüntető',
        description: 'Nyerj 3 Erőt (Befolyást) és 2 Késleltetett Lendületet.',
        effect: (s) => applyStatus(applyStatus(s, 'Strength', 3, 'PLAYER'), 'NextTurnEnergy', 2, 'PLAYER')
    },
    {
        id: 'ic-5', name: 'Mindannyian Együtt', type: 'Skill', cost: 0, rarity: 'Rare', characterClass: 'Diáktüntető',
        description: 'Húzz 3 kártyát. Nyerj 2 Késleltetett Lendületet. Kimerül.',
        exhaust: true,
        effect: (s) => applyStatus(drawCards(s, 3), 'NextTurnEnergy', 2, 'PLAYER')
    },
    {
        id: 'ic-6', name: 'Megtorolhatatlan', type: 'Skill', cost: 2, rarity: 'Rare', characterClass: 'Diáktüntető',
        description: 'Nyerj 20 Cenzúrát (Blokkot). Kimerül.',
        exhaust: true,
        effect: (s) => gainBlock(s, 20)
    },
    {
        id: 'ic-7', name: 'Radikális Nyilatkozat', type: 'Skill', cost: 1, rarity: 'Rare', characterClass: 'Diáktüntető',
        needsTarget: false,
        description: 'Adj 3 Sebezhetőséget és 3 Gyengeséget MINDEN ellenfélnek. Kimerül.',
        exhaust: true,
        effect: (s) => {
            let ns = { ...s };
            ns.enemies.forEach(e => {
                ns = applyStatus(ns, 'Vulnerable', 3, e.id);
                ns = applyStatus(ns, 'Weak', 3, e.id);
            });
            return ns;
        }
    },
    {
        id: 'ic-8', name: 'Megtörhetetlen Akarat', type: 'Skill', cost: 2, rarity: 'Rare', characterClass: 'Diáktüntető',
        retain: true,
        description: 'Nyerj 15 Cenzúrát. Megtartható (Retain).',
        effect: (s) => gainBlock(s, 15)
    },
    {
        id: 'ic-9', name: 'Forradalmi Lendület', type: 'Skill', cost: 0, rarity: 'Rare', characterClass: 'Diáktüntető',
        description: 'Nyerj 3 Lendületet. Kimerül.',
        exhaust: true,
        effect: (s) => {
            if (!s.player) return s;
            return { ...s, player: { ...s.player, energy: s.player.energy + 3 } };
        }
    },
    {
        id: 'ic-10', name: 'Végső Csapás', type: 'Attack', cost: 3, rarity: 'Rare', characterClass: 'Diáktüntető',
        needsTarget: true,
        description: 'Okozz 35 sebzést. Kimerül.',
        exhaust: true,
        effect: (s, targetId) => dealDamage(s, 35, 1, targetId)
    },

    // UNCOMMON (15 kártya)
    {
        id: 'ic-11', name: 'Padokból Barikád', type: 'Skill', cost: 2, rarity: 'Uncommon', characterClass: 'Diáktüntető',
        description: 'Nyerj 12 Cenzúrát. Nyerj 2 Késleltetett Cenzúrát.',
        effect: (s) => applyStatus(gainBlock(s, 12), 'NextTurnBlock', 2, 'PLAYER')
    },
    {
        id: 'ic-12', name: 'Hanggránát', type: 'Attack', cost: 2, rarity: 'Uncommon', characterClass: 'Diáktüntető',
        needsTarget: false,
        description: 'Okozz 8 sebzést MINDEN ellenfélnek. Adj 1 Gyengeséget MINDEN ellenfélnek.',
        effect: (s) => {
            let ns = dealDamage(s, 8, 1, 'ALL');
            ns.enemies.forEach(e => {
                ns = applyStatus(ns, 'Weak', 1, e.id);
            });
            return ns;
        }
    },
    {
        id: 'ic-13', name: 'Élőlánc', type: 'Skill', cost: 1, rarity: 'Uncommon', characterClass: 'Diáktüntető',
        retain: true,
        description: 'Nyerj 8 Cenzúrát. Megtartható (Retain).',
        effect: (s) => gainBlock(s, 8)
    },
    {
        id: 'ic-14', name: 'Tüntetés', type: 'Attack', cost: 2, rarity: 'Uncommon', characterClass: 'Diáktüntető',
        needsTarget: false,
        description: 'Okozz 10 sebzést MINDEN ellenfélnek.',
        effect: (s) => dealDamage(s, 10, 1, 'ALL')
    },
    {
        id: 'ic-15', name: 'Sztrájk Bizottság', type: 'Power', cost: 1, rarity: 'Uncommon', characterClass: 'Diáktüntető',
        description: 'Nyerj 2 Ügyességet.',
        effect: (s) => applyStatus(s, 'Dexterity', 2, 'PLAYER')
    },
    {
        id: 'ic-16', name: 'Hangosbemondó', type: 'Skill', cost: 1, rarity: 'Uncommon', characterClass: 'Diáktüntető',
        needsTarget: false,
        description: 'Adj 2 Sebezhetőséget MINDEN ellenfélnek.',
        effect: (s) => {
            let ns = { ...s };
            ns.enemies.forEach(e => {
                ns = applyStatus(ns, 'Vulnerable', 2, e.id);
            });
            return ns;
        }
    },
    {
        id: 'ic-17', name: 'Lefegyverző Szavak', type: 'Skill', cost: 1, rarity: 'Uncommon', characterClass: 'Diáktüntető',
        needsTarget: false,
        description: 'Adj 2 Gyengeséget MINDEN ellenfélnek.',
        effect: (s) => {
            let ns = { ...s };
            ns.enemies.forEach(e => {
                ns = applyStatus(ns, 'Weak', 2, e.id);
            });
            return ns;
        }
    },
    {
        id: 'ic-18', name: 'Folytatjuk!', type: 'Attack', cost: 1, rarity: 'Uncommon', characterClass: 'Diáktüntető',
        needsTarget: true,
        retain: true,
        description: 'Okozz 8 sebzést. Megtartható (Retain).',
        effect: (s, targetId) => dealDamage(s, 8, 1, targetId) // Damage scaling with retain can't be easily done without card state, so just retainable attack
    },
    {
        id: 'ic-19', name: 'Diákgyűlés', type: 'Skill', cost: 0, rarity: 'Uncommon', characterClass: 'Diáktüntető',
        description: 'Húzz 2 kártyát. Nyerj 1 Késleltetett Lendületet. Kimerül.',
        exhaust: true,
        effect: (s) => applyStatus(drawCards(s, 2), 'NextTurnEnergy', 1, 'PLAYER')
    },
    {
        id: 'ic-20', name: 'Lökéshullám', type: 'Attack', cost: 2, rarity: 'Uncommon', characterClass: 'Diáktüntető',
        needsTarget: true,
        description: 'Okozz 10 sebzést. Adj 2 Sebezhetőséget.',
        effect: (s, targetId) => applyStatus(dealDamage(s, 10, 1, targetId), 'Vulnerable', 2, targetId)
    },
    {
        id: 'ic-21', name: 'Szimpatizánsok', type: 'Skill', cost: 1, rarity: 'Uncommon', characterClass: 'Diáktüntető',
        description: 'Nyerj 2 Késleltetett Húzást és 1 Késleltetett Lendületet.',
        effect: (s) => applyStatus(applyStatus(s, 'NextTurnDraw', 2, 'PLAYER'), 'NextTurnEnergy', 1, 'PLAYER')
    },
    {
        id: 'ic-22', name: 'Ellenállás', type: 'Skill', cost: 1, rarity: 'Uncommon', characterClass: 'Diáktüntető',
        description: 'Nyerj 10 Cenzúrát.',
        effect: (s) => gainBlock(s, 10)
    },
    {
        id: 'ic-23', name: 'Követelések', type: 'Skill', cost: 0, rarity: 'Uncommon', characterClass: 'Diáktüntető',
        needsTarget: true,
        description: 'Adj 1 Gyengeséget és 1 Sebezhetőséget. Kimerül.',
        exhaust: true,
        effect: (s, targetId) => applyStatus(applyStatus(s, 'Weak', 1, targetId), 'Vulnerable', 1, targetId)
    },
    {
        id: 'ic-24', name: 'Megingathatatlan', type: 'Skill', cost: 0, rarity: 'Uncommon', characterClass: 'Diáktüntető',
        description: 'Nyerj 5 Cenzúrát. Nyerj 5 Késleltetett Cenzúrát.',
        effect: (s) => applyStatus(gainBlock(s, 5), 'NextTurnBlock', 5, 'PLAYER')
    },
    {
        id: 'ic-25', name: 'Félelem Nélkül', type: 'Attack', cost: 1, rarity: 'Uncommon', characterClass: 'Diáktüntető',
        needsTarget: true,
        description: 'Okozz 6 sebzést. Ha az ellenfél Sebezhető, húzz 1 kártyát.',
        effect: (s, targetId) => {
            const target = s.enemies.find(e => e.id === targetId);
            let ns = dealDamage(s, 6, 1, targetId);
            if (target && target.statusEffects.some(st => st.type === 'Vulnerable')) {
                ns = drawCards(ns, 1);
            }
            return ns;
        }
    },

    // COMMON (25 kártya)
    {
        id: 'ic-26', name: 'Röplap Osztás', type: 'Skill', cost: 1, rarity: 'Common', characterClass: 'Diáktüntető',
        description: 'Nyerj 6 Cenzúrát és 1 Késleltetett Húzást.',
        effect: (s) => applyStatus(gainBlock(s, 6), 'NextTurnDraw', 1, 'PLAYER')
    },
    {
        id: 'ic-27', name: 'Gyors Barikád', type: 'Skill', cost: 1, rarity: 'Common', characterClass: 'Diáktüntető',
        description: 'Nyerj 8 Cenzúrát.',
        effect: (s) => gainBlock(s, 8)
    },
    {
        id: 'ic-28', name: 'Lendületes Ütés', type: 'Attack', cost: 1, rarity: 'Common', characterClass: 'Diáktüntető',
        needsTarget: true,
        description: 'Okozz 9 sebzést.',
        effect: (s, targetId) => dealDamage(s, 9, 1, targetId)
    },
    {
        id: 'ic-29', name: 'Védő Falanx', type: 'Skill', cost: 1, rarity: 'Common', characterClass: 'Diáktüntető',
        description: 'Nyerj 5 Cenzúrát. Adj magadnak 1 Ügyességet ebben a körben.',
        effect: (s) => applyStatus(gainBlock(s, 5), 'Dexterity', 1, 'PLAYER') // Ügyesség marad a csata végéig
    },
    {
        id: 'ic-30', name: 'Megfélemlítő Lépés', type: 'Skill', cost: 0, rarity: 'Common', characterClass: 'Diáktüntető',
        needsTarget: true,
        description: 'Adj 1 Gyengeséget.',
        effect: (s, targetId) => applyStatus(s, 'Weak', 1, targetId)
    },
    {
        id: 'ic-31', name: 'Pajzs Lökés', type: 'Attack', cost: 2, rarity: 'Common', characterClass: 'Diáktüntető',
        needsTarget: true,
        description: 'Okozz 5 sebzést. +1 sebzés minden Cenzúrád után. (Nem veszítesz Cenzúrát).',
        effect: (s, targetId) => {
            if (!s.player) return s;
            const dmg = 5 + s.player.block;
            return dealDamage(s, dmg, 1, targetId);
        }
    },
    {
        id: 'ic-32', name: 'Hangzavar', type: 'Skill', cost: 1, rarity: 'Common', characterClass: 'Diáktüntető',
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
        id: 'ic-33', name: 'Esernyős Védelem', type: 'Skill', cost: 1, rarity: 'Common', characterClass: 'Diáktüntető',
        description: 'Nyerj 7 Cenzúrát.',
        effect: (s) => gainBlock(s, 7)
    },
    {
        id: 'ic-34', name: 'Kritika', type: 'Attack', cost: 1, rarity: 'Common', characterClass: 'Diáktüntető',
        needsTarget: true,
        description: 'Okozz 6 sebzést. Adj 1 Sebezhetőséget.',
        effect: (s, targetId) => applyStatus(dealDamage(s, 6, 1, targetId), 'Vulnerable', 1, targetId)
    },
    {
        id: 'ic-35', name: 'Készenlét', type: 'Skill', cost: 0, rarity: 'Common', characterClass: 'Diáktüntető',
        description: 'Nyerj 4 Cenzúrát. Húzz 1 kártyát.',
        effect: (s) => drawCards(gainBlock(s, 4), 1)
    },
    {
        id: 'ic-36', name: 'Önvédelem', type: 'Attack', cost: 1, rarity: 'Common', characterClass: 'Diáktüntető',
        needsTarget: true,
        description: 'Okozz 5 sebzést. Nyerj 5 Cenzúrát.',
        effect: (s, targetId) => gainBlock(dealDamage(s, 5, 1, targetId), 5)
    },
    {
        id: 'ic-37', name: 'Szórólap', type: 'Skill', cost: 0, rarity: 'Common', characterClass: 'Diáktüntető',
        description: 'Nyerj 1 Késleltetett Húzást.',
        effect: (s) => applyStatus(s, 'NextTurnDraw', 1, 'PLAYER')
    },
    {
        id: 'ic-38', name: 'Megtorlás', type: 'Attack', cost: 2, rarity: 'Common', characterClass: 'Diáktüntető',
        needsTarget: true,
        description: 'Okozz 16 sebzést.',
        effect: (s, targetId) => dealDamage(s, 16, 1, targetId)
    },
    {
        id: 'ic-39', name: 'Taktikai Lépés', type: 'Skill', cost: 1, rarity: 'Common', characterClass: 'Diáktüntető',
        description: 'Nyerj 6 Cenzúrát. Nyerj 1 Késleltetett Lendületet. Kimerül.',
        exhaust: true,
        effect: (s) => applyStatus(gainBlock(s, 6), 'NextTurnEnergy', 1, 'PLAYER')
    },
    {
        id: 'ic-40', name: 'Figyelemfelhívás', type: 'Attack', cost: 1, rarity: 'Common', characterClass: 'Diáktüntető',
        needsTarget: false,
        description: 'Okozz 5 sebzést MINDEN ellenfélnek.',
        effect: (s) => dealDamage(s, 5, 1, 'ALL')
    },
    {
        id: 'ic-41', name: 'Megafon Szóló', type: 'Skill', cost: 2, rarity: 'Uncommon', characterClass: 'Diáktüntető',
        description: 'Adj 3 Sebezhetőséget és 3 Gyengeséget MINDEN ellenfélnek. Kimerül.',
        exhaust: true,
        effect: (s) => {
            let ns = { ...s };
            ns.enemies.forEach(e => {
                ns = applyStatus(ns, 'Vulnerable', 3, e.id);
                ns = applyStatus(ns, 'Weak', 3, e.id);
            });
            return ns;
        }
    },
    {
        id: 'ic-42', name: 'Kitartás', type: 'Skill', cost: 1, rarity: 'Uncommon', characterClass: 'Diáktüntető',
        retain: true,
        description: 'Nyerj 10 Cenzúrát. Megtartható (Retain).',
        effect: (s) => gainBlock(s, 10)
    },
    {
        id: 'ic-43', name: 'Dühödt Lendület', type: 'Power', cost: 1, rarity: 'Rare', characterClass: 'Diáktüntető',
        description: 'Nyerj 2 Erőt és 1 Lendületet ebben a körben.',
        effect: (s) => {
            let ns = applyStatus(s, 'Strength', 2, 'PLAYER');
            if (ns.player) ns.player.energy += 1;
            return ns;
        }
    },
    {
        id: 'ic-44', name: 'Transzparens', type: 'Skill', cost: 1, rarity: 'Common', characterClass: 'Diáktüntető',
        description: 'Nyerj 7 Cenzúrát. Ha van Cenzúrád, nyerj 1 Erőt.',
        effect: (s) => {
            let ns = gainBlock(s, 7);
            if (ns.player && ns.player.block > 0) ns = applyStatus(ns, 'Strength', 1, 'PLAYER');
            return ns;
        }
    },
    {
        id: 'ic-45', name: 'Kukaborogatás', type: 'Attack', cost: 1, rarity: 'Common', characterClass: 'Diáktüntető',
        needsTarget: true,
        description: 'Okozz 8 sebzést. Adj 1 Gyengeséget.',
        effect: (s, targetId) => applyStatus(dealDamage(s, 8, 1, targetId), 'Weak', 1, targetId)
    },
    {
        id: 'ic-46', name: 'Éjszakai Virrasztás', type: 'Skill', cost: 1, rarity: 'Uncommon', characterClass: 'Diáktüntető',
        description: 'Nyerj 10 Cenzúrát. Következő körben húzz 1 kártyát.',
        effect: (s) => applyStatus(gainBlock(s, 10), 'NextTurnDraw', 1, 'PLAYER')
    },
    {
        id: 'ic-47', name: 'Füttykoncert', type: 'Skill', cost: 1, rarity: 'Uncommon', characterClass: 'Diáktüntető',
        needsTarget: false,
        description: 'Adj 2 Gyengeséget MINDEN ellenfélnek.',
        effect: (s) => {
            let ns = { ...s };
            ns.enemies.forEach(e => {
                ns = applyStatus(ns, 'Weak', 2, e.id);
            });
            return ns;
        }
    },
    {
        id: 'ic-48', name: 'Tanári Szolidaritás', type: 'Power', cost: 2, rarity: 'Rare', characterClass: 'Diáktüntető',
        description: 'Nyerj 2 Ügyességet és 1 Erőt.',
        effect: (s) => applyStatus(applyStatus(s, 'Dexterity', 2, 'PLAYER'), 'Strength', 1, 'PLAYER')
    },
    {
        id: 'ic-49', name: 'Utolsó Figyelmeztetés', type: 'Attack', cost: 2, rarity: 'Rare', characterClass: 'Diáktüntető',
        needsTarget: true,
        description: 'Okozz 18 sebzést. Adj 2 Sebezhetőséget.',
        effect: (s, targetId) => applyStatus(dealDamage(s, 18, 1, targetId), 'Vulnerable', 2, targetId)
    },
    {
        id: 'ic-50', name: 'Forradalmi Hevület', type: 'Skill', cost: 0, rarity: 'Rare', characterClass: 'Diáktüntető',
        description: 'Nyerj 2 Lendületet. Kimerül.',
        exhaust: true,
        effect: (s) => {
            if (!s.player) return s;
            return { ...s, player: { ...s.player, energy: s.player.energy + 2 } };
        }
    }
];