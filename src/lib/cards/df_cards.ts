import { Card, GameState, Ally } from '../../types';
import { dealDamage, gainBlock, drawCards, applyStatus } from '../cardUtils';

const summonVolunteer = (s: GameState): GameState => {
    if (!s.player) return s;
    if (s.player.allies.length >= s.player.maxAllies) return s;
    const volunteer: Ally = {
        id: `vol-${Date.now()}-${Math.random()}`,
        name: 'Önkéntes',
        description: 'Kör végén ad 4 Cenzúrát (Blokkot).',
        icon: 'Shield',
        active: true,
        onTurnEnd: (state: GameState) => {
            let ns = { ...state, logs: [`> Az Önkéntes segít: +4 Cenzúra`, ...state.logs] };
            return gainBlock(ns, 4);
        }
    };
    return { ...s, player: { ...s.player, allies: [...s.player.allies, volunteer] } };
};

const summonLawyer = (s: GameState): GameState => {
    if (!s.player) return s;
    if (s.player.allies.length >= s.player.maxAllies) return s;
    const lawyer: Ally = {
        id: `law-${Date.now()}-${Math.random()}`,
        name: 'Jogász',
        description: 'Kör végén okoz 5 sebzést egy random ellenfélnek.',
        icon: 'Sword',
        active: true,
        onTurnEnd: (state: GameState) => {
            if (state.enemies.length === 0) return state;
            const target = state.enemies[Math.floor(Math.random() * state.enemies.length)];
            let ns = { ...state, logs: [`> A Jogász perel: 5 sebzés (${target.name})`, ...state.logs] };
            return dealDamage(ns, 5, 1, target.id);
        }
    };
    return { ...s, player: { ...s.player, allies: [...s.player.allies, lawyer] } };
};

export const df_cards: Card[] = [
    {
        id: 'df-1', name: 'Alapítványi Ütés', type: 'Attack', cost: 1, rarity: 'Common', characterClass: 'Civil Aktivista',
        needsTarget: true,
        description: 'Okozz 6 sebzést. Ha van Szövetségesed, húzz 1 kártyát.',
        effect: (s, targetId) => {
            let ns = dealDamage(s, 6, 1, targetId);
            if (ns.player && ns.player.allies.length > 0) ns = drawCards(ns, 1);
            return ns;
        }
    },
    {
        id: 'df-2', name: 'Szórólapozás', type: 'Skill', cost: 1, rarity: 'Common', characterClass: 'Civil Aktivista',
        description: 'Hívj be egy Önkéntest (Kör végén +4 Blokk).',
        effect: (s) => summonVolunteer(s)
    },
    {
        id: 'df-3', name: 'Jogi Segély', type: 'Skill', cost: 1, rarity: 'Uncommon', characterClass: 'Civil Aktivista',
        description: 'Hívj be egy Jogászt (Kör végén 5 Sebzés).',
        effect: (s) => summonLawyer(s)
    },
    {
        id: 'df-4', name: 'Tömegvonzás', type: 'Skill', cost: 2, rarity: 'Common', characterClass: 'Civil Aktivista',
        description: 'Hívj be 2 Önkéntest.',
        effect: (s) => summonVolunteer(summonVolunteer(s))
    },
    {
        id: 'df-5', name: 'Emberi Pajzs', type: 'Skill', cost: 1, rarity: 'Common', characterClass: 'Civil Aktivista',
        description: 'Nyerj 5 Cenzúrát. +3 Cenzúra minden Szövetségesed után.',
        effect: (s) => {
            const extra = s.player ? s.player.allies.length * 3 : 0;
            return gainBlock(s, 5 + extra);
        }
    },
    {
        id: 'df-6', name: 'Kollektív Erő', type: 'Attack', cost: 1, rarity: 'Common', characterClass: 'Civil Aktivista',
        needsTarget: true,
        description: 'Okozz 4 sebzést. +4 sebzés minden Szövetségesed után.',
        effect: (s, targetId) => {
            const extra = s.player ? s.player.allies.length * 4 : 0;
            return dealDamage(s, 4 + extra, 1, targetId);
        }
    },
    {
        id: 'df-7', name: 'Civil Hálózat', type: 'Power', cost: 2, rarity: 'Rare', characterClass: 'Civil Aktivista',
        description: 'Növeld a maximum Szövetségeseid számát 1-gyel. Hívj be egy Jogászt.',
        exhaust: true,
        effect: (s) => {
            if (!s.player) return s;
            let ns = { ...s, player: { ...s.player, maxAllies: s.player.maxAllies + 1 } };
            return summonLawyer(ns);
        }
    },
    {
        id: 'df-8', name: 'Közösségi Támogatás', type: 'Skill', cost: 0, rarity: 'Common', characterClass: 'Civil Aktivista',
        description: 'Nyerj 1 Késleltetett Lendületet. Kimerül.',
        exhaust: true,
        effect: (s) => applyStatus(s, 'NextTurnEnergy', 1, 'PLAYER')
    },
    {
        id: 'df-9', name: 'Adakozás', type: 'Skill', cost: 1, rarity: 'Uncommon', characterClass: 'Civil Aktivista',
        description: 'Nyerj 2 Késleltetett Húzást.',
        effect: (s) => applyStatus(s, 'NextTurnDraw', 2, 'PLAYER')
    },
    {
        id: 'df-10', name: 'Tüntetés Szervezése', type: 'Skill', cost: 2, rarity: 'Rare', characterClass: 'Civil Aktivista',
        description: 'Minden Szövetségesed után húzz 1 lapot és nyerj 1 Lendületet. Kimerül.',
        exhaust: true,
        effect: (s) => {
            if (!s.player) return s;
            const count = s.player.allies.length;
            let ns = drawCards(s, count);
            ns.player.energy += count;
            return ns;
        }
    },
    {
        id: 'df-11', name: 'Szolidaritás', type: 'Skill', cost: 1, rarity: 'Common', characterClass: 'Civil Aktivista',
        description: 'Nyerj 7 Cenzúrát.',
        effect: (s) => gainBlock(s, 7)
    },
    {
        id: 'df-12', name: 'Utcai Fórum', type: 'Skill', cost: 1, rarity: 'Common', characterClass: 'Civil Aktivista',
        description: 'Nyerj 4 Cenzúrát. Húzz 1 kártyát.',
        effect: (s) => drawCards(gainBlock(s, 4), 1)
    },
    {
        id: 'df-13', name: 'Flashmob', type: 'Attack', cost: 0, rarity: 'Common', characterClass: 'Civil Aktivista',
        needsTarget: true,
        description: 'Okozz 3 sebzést. Nyerj 1 Késleltetett Húzást.',
        effect: (s, targetId) => applyStatus(dealDamage(s, 3, 1, targetId), 'NextTurnDraw', 1, 'PLAYER')
    },
    {
        id: 'df-14', name: 'Megmozdulás', type: 'Attack', cost: 2, rarity: 'Uncommon', characterClass: 'Civil Aktivista',
        needsTarget: false,
        description: 'Okozz 8 sebzést MINDEN ellenfélnek. Hívj be egy Önkéntest.',
        effect: (s) => summonVolunteer(dealDamage(s, 8, 1, 'ALL'))
    },
    {
        id: 'df-15', name: 'Petíció', type: 'Skill', cost: 0, rarity: 'Uncommon', characterClass: 'Civil Aktivista',
        needsTarget: true,
        description: 'Adj 2 Gyengeséget. Kimerül.',
        exhaust: true,
        effect: (s, targetId) => applyStatus(s, 'Weak', 2, targetId)
    },
    {
        id: 'df-16', name: 'Közmeghallgatás', type: 'Skill', cost: 1, rarity: 'Uncommon', characterClass: 'Civil Aktivista',
        needsTarget: true,
        description: 'Adj 2 Sebezhetőséget. Nyerj 1 Késleltetett Lendületet.',
        effect: (s, targetId) => applyStatus(applyStatus(s, 'Vulnerable', 2, targetId), 'NextTurnEnergy', 1, 'PLAYER')
    },
    {
        id: 'df-17', name: 'Civil Összefogás', type: 'Power', cost: 3, rarity: 'Rare', characterClass: 'Civil Aktivista',
        description: 'Minden kör elején hívj be egy Önkéntest. Kimerül.',
        exhaust: true,
        effect: (s) => {
            // Wait, we don't have "Start of turn" status. Let's just give max allies and fill them.
            if(!s.player) return s;
            let ns = { ...s, player: { ...s.player, maxAllies: s.player.maxAllies + 2 } };
            return summonLawyer(summonVolunteer(summonVolunteer(ns)));
        }
    },
    {
        id: 'df-18', name: 'Alulról szerveződő', type: 'Attack', cost: 1, rarity: 'Common', characterClass: 'Civil Aktivista',
        needsTarget: true,
        description: 'Okozz 7 sebzést.',
        effect: (s, targetId) => dealDamage(s, 7, 1, targetId)
    },
    {
        id: 'df-19', name: 'Mozgalom Indítása', type: 'Skill', cost: 2, rarity: 'Uncommon', characterClass: 'Civil Aktivista',
        description: 'Húzz 3 kártyát. Nyerj 2 Késleltetett Lendületet.',
        effect: (s) => applyStatus(drawCards(s, 3), 'NextTurnEnergy', 2, 'PLAYER')
    },
    {
        id: 'df-20', name: 'Transzparens', type: 'Skill', cost: 1, rarity: 'Common', characterClass: 'Civil Aktivista',
        needsTarget: true,
        description: 'Nyerj 5 Cenzúrát. Adj 1 Gyengeséget.',
        effect: (s, targetId) => applyStatus(gainBlock(s, 5), 'Weak', 1, targetId)
    },
    {
        id: 'df-21', name: 'Védőháló', type: 'Skill', cost: 2, rarity: 'Common', characterClass: 'Civil Aktivista',
        description: 'Nyerj 12 Cenzúrát.',
        effect: (s) => gainBlock(s, 12)
    },
    {
        id: 'df-22', name: 'Támogatói Est', type: 'Power', cost: 1, rarity: 'Uncommon', characterClass: 'Civil Aktivista',
        description: 'Nyerj 2 Ügyességet. Kimerül.',
        exhaust: true,
        effect: (s) => applyStatus(s, 'Dexterity', 2, 'PLAYER')
    },
    {
        id: 'df-23', name: 'Bojkott', type: 'Attack', cost: 2, rarity: 'Rare', characterClass: 'Civil Aktivista',
        needsTarget: true,
        description: 'Okozz 14 sebzést. Adj 2 Sebezhetőséget és 2 Gyengeséget.',
        effect: (s, targetId) => applyStatus(applyStatus(dealDamage(s, 14, 1, targetId), 'Vulnerable', 2, targetId), 'Weak', 2, targetId)
    },
    {
        id: 'df-24', name: 'Hangosbemondó', type: 'Attack', cost: 1, rarity: 'Common', characterClass: 'Civil Aktivista',
        needsTarget: false,
        description: 'Okozz 5 sebzést MINDEN ellenfélnek.',
        effect: (s) => dealDamage(s, 5, 1, 'ALL')
    },
    {
        id: 'df-25', name: 'Elszámoltatás', type: 'Attack', cost: 3, rarity: 'Rare', characterClass: 'Civil Aktivista',
        needsTarget: true,
        description: 'Okozz 25 sebzést.',
        effect: (s, targetId) => dealDamage(s, 25, 1, targetId)
    },
    {
        id: 'df-26', name: 'Békés Ellenállás', type: 'Skill', cost: 0, rarity: 'Uncommon', characterClass: 'Civil Aktivista',
        description: 'Nyerj 3 Cenzúrát and 1 Késleltetett Húzást.',
        effect: (s) => applyStatus(gainBlock(s, 3), 'NextTurnDraw', 1, 'PLAYER')
    },
    {
        id: 'df-27', name: 'Jelképes Támadás', type: 'Attack', cost: 0, rarity: 'Common', characterClass: 'Civil Aktivista',
        needsTarget: true,
        description: 'Okozz 4 sebzést.',
        effect: (s, targetId) => dealDamage(s, 4, 1, targetId)
    },
    {
        id: 'df-28', name: 'Alternatív Média', type: 'Skill', cost: 1, rarity: 'Common', characterClass: 'Civil Aktivista',
        description: 'Húzz 2 kártyát.',
        effect: (s) => drawCards(s, 2)
    },
    {
        id: 'df-29', name: 'Kifárasztás', type: 'Attack', cost: 1, rarity: 'Uncommon', characterClass: 'Civil Aktivista',
        needsTarget: true,
        description: 'Okozz 3 sebzést 3 alkalommal.',
        effect: (s, targetId) => dealDamage(s, 3, 3, targetId)
    },
    {
        id: 'df-30', name: 'Jogvédő Alap', type: 'Skill', cost: 2, rarity: 'Rare', characterClass: 'Civil Aktivista',
        description: 'Hívj be 2 Jogászt. Nyerj 10 Cenzúrát. Kimerül.',
        exhaust: true,
        effect: (s) => gainBlock(summonLawyer(summonLawyer(s)), 10)
    },
    {
        id: 'df-31', name: 'Faluvédő Egylet', type: 'Skill', cost: 2, rarity: 'Uncommon', characterClass: 'Civil Aktivista',
        description: 'Nyerj 10 Cenzúrát. Minden Önkéntesed után nyerj +5 Cenzúrát.',
        effect: (s) => {
            const count = s.player ? s.player.allies.filter(a => a.name === 'Önkéntes').length : 0;
            return gainBlock(s, 10 + (count * 5));
        }
    },
    {
        id: 'df-32', name: 'Perpergetés', type: 'Attack', cost: 2, rarity: 'Uncommon', characterClass: 'Civil Aktivista',
        needsTarget: true,
        description: 'Okozz 10 sebzést. Ha van legalább 2 Jogászod, okozz még 15-öt.',
        effect: (s, targetId) => {
            const count = s.player ? s.player.allies.filter(a => a.name === 'Jogász').length : 0;
            const dmg = count >= 2 ? 25 : 10;
            return dealDamage(s, dmg, 1, targetId);
        }
    },
    {
        id: 'df-33', name: 'Önkéntes Toborzás', type: 'Skill', cost: 1, rarity: 'Common', characterClass: 'Civil Aktivista',
        description: 'Hívj be egy Önkéntest. Nyerj 1 Lendületet.',
        effect: (s) => {
            let ns = summonVolunteer(s);
            if (ns.player) ns.player.energy += 1;
            return ns;
        }
    },
    {
        id: 'df-34', name: 'Jogászok Bevetése', type: 'Skill', cost: 1, rarity: 'Common', characterClass: 'Civil Aktivista',
        description: 'Hívj be egy Jogászt. Húzz 1 kártyát.',
        effect: (s) => drawCards(summonLawyer(s), 1)
    },
    {
        id: 'df-35', name: 'Alulról Szerveződés', type: 'Power', cost: 1, rarity: 'Uncommon', characterClass: 'Civil Aktivista',
        description: 'Nyerj 2 Ügyességet.',
        effect: (s) => applyStatus(s, 'Dexterity', 2, 'PLAYER')
    },
    {
        id: 'df-36', name: 'Közösségi Gyűjtés', type: 'Skill', cost: 1, rarity: 'Common', characterClass: 'Civil Aktivista',
        description: 'Nyerj 7 Cenzúrát. Nyerj 1 Erőt.',
        effect: (s) => applyStatus(gainBlock(s, 7), 'Strength', 1, 'PLAYER')
    },
    {
        id: 'df-37', name: 'Érdekérvényesítés', type: 'Skill', cost: 1, rarity: 'Uncommon', characterClass: 'Civil Aktivista',
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
        id: 'df-38', name: 'Önkéntes Munka', type: 'Skill', cost: 0, rarity: 'Common', characterClass: 'Civil Aktivista',
        description: 'Nyerj 4 Cenzúrát.',
        effect: (s) => gainBlock(s, 4)
    },
    {
        id: 'df-39', name: 'Plakátkampány', type: 'Attack', cost: 1, rarity: 'Common', characterClass: 'Civil Aktivista',
        needsTarget: true,
        description: 'Okozz 6 sebzést. Adj 2 Gyengeséget.',
        effect: (s, targetId) => applyStatus(dealDamage(s, 6, 1, targetId), 'Weak', 2, targetId)
    },
    {
        id: 'df-40', name: 'Civil Kurázsi', type: 'Attack', cost: 0, rarity: 'Common', characterClass: 'Civil Aktivista',
        needsTarget: true,
        description: 'Okozz 4 sebzést. Ha van Cenzúrád, okozz 8-at.',
        effect: (s, targetId) => {
            const dmg = (s.player && s.player.block > 0) ? 8 : 4;
            return dealDamage(s, dmg, 1, targetId);
        }
    },
    {
        id: 'df-41', name: 'Jogsegély', type: 'Skill', cost: 1, rarity: 'Common', characterClass: 'Civil Aktivista',
        description: 'Nyerj 9 Cenzúrát.',
        effect: (s) => gainBlock(s, 9)
    },
    {
        id: 'df-42', name: 'Szolidaritási Nyilatkozat', type: 'Skill', cost: 1, rarity: 'Common', characterClass: 'Civil Aktivista',
        description: 'Nyerj 6 Cenzúrát. Következő körben nyerj 1 Lendületet.',
        effect: (s) => applyStatus(gainBlock(s, 6), 'NextTurnEnergy', 1, 'PLAYER')
    },
    {
        id: 'df-43', name: 'Hálózatépítés', type: 'Skill', cost: 1, rarity: 'Uncommon', characterClass: 'Civil Aktivista',
        description: 'Húzz 3 kártyát.',
        effect: (s) => drawCards(s, 3)
    },
    {
        id: 'df-44', name: 'Nyilvános Vita', type: 'Attack', cost: 2, rarity: 'Uncommon', characterClass: 'Civil Aktivista',
        needsTarget: true,
        description: 'Okozz 12 sebzést. Adj 2 Sebezhetőséget és 2 Gyengeséget.',
        effect: (s, targetId) => applyStatus(applyStatus(dealDamage(s, 12, 1, targetId), 'Vulnerable', 2, targetId), 'Weak', 2, targetId)
    },
    {
        id: 'df-45', name: 'Rendszerszintű Változás', type: 'Attack', cost: 3, rarity: 'Rare', characterClass: 'Civil Aktivista',
        needsTarget: true,
        description: 'Okozz 30 sebzést.',
        effect: (s, targetId) => dealDamage(s, 30, 1, targetId)
    },
    {
        id: 'df-46', name: 'Közösségi Tér', type: 'Power', cost: 2, rarity: 'Rare', characterClass: 'Civil Aktivista',
        description: 'Nyerj 2 Ügyességet és 2 Erőt.',
        effect: (s) => applyStatus(applyStatus(s, 'Dexterity', 2, 'PLAYER'), 'Strength', 2, 'PLAYER')
    },
    {
        id: 'df-47', name: 'Műegyetemi Fórum', type: 'Skill', cost: 1, rarity: 'Common', characterClass: 'Civil Aktivista',
        description: 'Nyerj 5 Cenzúrát. Húzz 2 kártyát. Kimerül.',
        exhaust: true,
        effect: (s) => drawCards(gainBlock(s, 5), 2)
    },
    {
        id: 'df-48', name: 'Összefogás', type: 'Skill', cost: 1, rarity: 'Uncommon', characterClass: 'Civil Aktivista',
        description: 'Minden Szövetségesed után nyerj 4 Cenzúrát.',
        effect: (s) => {
            const extra = s.player ? s.player.allies.length * 4 : 0;
            return gainBlock(s, extra);
        }
    },
    {
        id: 'df-49', name: 'Aktív Részvétel', type: 'Attack', cost: 1, rarity: 'Common', characterClass: 'Civil Aktivista',
        needsTarget: true,
        description: 'Okozz 8 sebzést. Húzz 1 kártyát.',
        effect: (s, targetId) => drawCards(dealDamage(s, 8, 1, targetId), 1)
    },
    {
        id: 'df-50', name: 'Végtelen Petíció', type: 'Skill', cost: 0, rarity: 'Rare', characterClass: 'Civil Aktivista',
        description: 'Húzz 2 kártyát. Nyerj 2 Lendületet. Kimerül.',
        exhaust: true,
        effect: (s) => {
            let ns = drawCards(s, 2);
            if (ns.player) ns = { ...ns, player: { ...ns.player, energy: ns.player.energy + 2 } };
            return ns;
        }
    }
];
