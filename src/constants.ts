import { Card, Enemy, EnemyIntent, GameEvent, EventChoice, CharacterClass, Relic, Potion } from './types';
import { RELICS } from './lib/relicLibrary';
import { POTIONS } from './lib/potionLibrary';
import { getRewardPool } from './lib/cardLibrary';

// Helper for random selection within effects
const getRandom = <T>(arr: T[]): T | null => arr.length > 0 ? arr[Math.floor(Math.random() * arr.length)] : null;
const shuffleArr = <T>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export interface CharacterDefinition {
  class: CharacterClass;
  maxHp: number;
  gold: number;
  relic: Relic;
  description: string;
}

const getRelic = (id: string): Relic => {
  return RELICS.find(r => r.id === id) || { id, name: id, description: 'Unknown' };
};

export const CHARACTERS: CharacterDefinition[] = [
  {
    class: 'Diáktüntető',
    maxHp: 80,
    gold: 99,
    relic: getRelic('burning-blood'),
    description: 'Kockás ingben, teli torokból skandálva érkezik. A jövője a tét, és nem fél használni a megafont (vagy a tanárát).'
  },
  {
    class: 'Oknyomozó',
    maxHp: 70,
    gold: 99,
    relic: getRelic('ring-of-snake'),
    description: 'A sötétben bujkáló közbeszerzések és gyanús jachtozások réme. Adatokkal és tényekkel győzi le a propagandát.'
  },
  {
    class: 'Civil Aktivista',
    maxHp: 75,
    gold: 99,
    relic: getRelic('cracked-core'),
    description: 'Oda megy, ahol a baj van: ételt oszt, plakátot ragaszt vagy lánccal védi a fákat. A közösség ereje az övé.'
  },
  {
    class: 'Független Politikus',
    maxHp: 72,
    gold: 99,
    relic: getRelic('pure-water'),
    description: 'Kilépett a sorból, és most egyedül vívja szélmalomharcát a Parlamentben. Néha már ő sem tudja, melyik frakcióban ülne.'
  },
  {
    class: 'Digitális Ellenálló',
    maxHp: 65,
    gold: 150,
    relic: getRelic('void-eye'),
    description: 'VPN-en keresztül, sötét szobákból támadja a központi adatbázisokat. A chemtrail felhő nála csak egy kódnév.'
  }
];

export const INITIAL_DECK: Card[] = []; // Will be generated per class

export const ALL_CARDS: Card[] = [
  ...INITIAL_DECK,
  {
    id: 'shrug-off',
    name: 'Terelés',
    type: 'Skill',
    cost: 1,
    rarity: 'Common',
    description: 'Nyern 8 Cenzúrát (Blokkot). Húzz 1 kártyát.',
    effect: (state) => {
      // Draw logic handled in GameEngine but we can put it here if we pass draw function
      return state;
    }
  },
  {
    id: 'inflame',
    name: 'Herce-Hurca',
    type: 'Power',
    cost: 1,
    rarity: 'Uncommon',
    description: 'Nyerj 2 Befolyást (Erőt).',
    effect: (state) => {
      const existingStr = state.player.statusEffects.find(s => s.type === 'Strength');
      const newStatusEffects = existingStr 
        ? state.player.statusEffects.map(s => s.type === 'Strength' ? { ...s, stacks: s.stacks + 2 } : s)
        : [...state.player.statusEffects, { type: 'Strength' as const, stacks: 2 }];
      return {
        ...state,
        player: { ...state.player, statusEffects: newStatusEffects },
        logs: ['Kijátszottad a Herce-Hurcát. +2 Befolyás.', ...state.logs]
      };
    }
  }
];

export const ENEMIES: Omit<Enemy, 'id' | 'hp' | 'block' | 'intent' | 'statusEffects'>[] = [
  { name: 'Infláció', maxHp: 50 },
  { name: 'Megafon Troll', maxHp: 45 },
  { name: 'Plakát-mágus', maxHp: 60 },
];

export const ELITE_ENEMIES: Omit<Enemy, 'id' | 'hp' | 'block' | 'intent' | 'statusEffects'>[] = [
  { name: 'Gázszerelő', maxHp: 120 },
  { name: 'Kádervadász', maxHp: 100 },
];

export const BOSS_ENEMIES: Omit<Enemy, 'id' | 'hp' | 'block' | 'intent' | 'statusEffects'>[] = [
  { name: 'A Propagandagépezet', maxHp: 300 },
  { name: 'A Megállíthatatlan Rezsidémon', maxHp: 250 },
];

export const START_EVENTS: GameEvent[] = [
  {
    id: 'karmelita-kihallgatas',
    title: 'Idézés a Karmelitába',
    description: 'Egy éjszakai fekete autó hozott ide. A "Tóni" néven emlegetett illető eléd tol egy papírt, amit jobb lenne aláírnod...',
    choices: [
      { label: 'Beismerő vallomás', description: 'Nyerj 8 Max HP-t, de adj hálát a rendszernek.', effect: (s) => ({ ...s, player: s.player ? { ...s.player, maxHp: s.player.maxHp + 8, hp: s.player.hp + 8 } : null }) },
      { label: 'Hallgatási pénz', description: 'Nyerj 100 Közpénzt.', effect: (s) => ({ ...s, gold: s.gold + 100 }) },
      { label: 'Ellentmondás', description: 'Veszíts 10 HP-t a "véletlen" rabszállító-balesettől, nyerj egy Ritka kártyát.', effect: (s) => {
          if (!s.player) return s;
          const pool = getRewardPool(s.player.class).filter(c => c.rarity === 'Rare');
          const card = getRandom(pool);
          return card ? { ...s, player: { ...s.player, hp: Math.max(1, s.player.hp - 10), deck: [...s.player.deck, { ...card, id: `${card.id}-${Math.random()}` }] } } : s;
      } }, 
      { label: 'Hűségnyilatkozat', description: 'Nyerj 50 Goldot és 5 Max HP-t.', effect: (s) => ({ ...s, gold: s.gold + 50, player: s.player ? { ...s.player, maxHp: s.player.maxHp + 5, hp: s.player.hp + 5 } : null }) },
    ]
  },
  {
    id: 'civil-szervezet-alku',
    title: 'Találkozó egy civil szervezetnél',
    description: 'Egy eldugott irodában, kávét gőzölögve várnak az "idegen ügynököknek" bélyegzett aktivisták.',
    choices: [
      { label: 'Aláírod az összefogást', description: 'Nyerj 250 Goldot (támogatást), de veszíts 15 HP-t a támadások miatt.', effect: (s) => ({ ...s, gold: s.gold + 250, player: s.player ? { ...s.player, hp: Math.max(1, s.player.hp - 15) } : null }) },
      { label: 'Titkos akta átvétele', description: 'Veszíts 15 HP-t, nyerj egy véletlen Mutit.', effect: (s) => {
           if (!s.player) return s;
           const relic = getRandom(RELICS.filter(r => !s.player!.relics.find(pr => pr.id === r.id)));
           return relic ? { ...s, player: { ...s.player, hp: Math.max(1, s.player.hp - 15), relics: [...s.player.relics, relic] } } : s;
      } },
      { label: 'Kiszivárogtatás', description: 'Veszíts 30 Goldot a védelemre, nyerj 2 kártyát.', effect: (s) => {
          if (!s.player) return s;
          const cards = shuffleArr(getRewardPool(s.player.class)).slice(0, 2);
          return { ...s, gold: Math.max(0, s.gold - 30), player: { ...s.player, deck: [...s.player.deck, ...cards.map(c => ({...c, id: `${c.id}-${Math.random()}`}))] } };
      } },
    ]
  }
];

export const EVENTS: GameEvent[] = [
  {
    id: 'brusszeli-folyosok',
    title: 'Brüsszeli Folyosók',
    description: 'Útvesztő az Európai Parlamentben. Minden sarok mögött egy lobbista vár.',
    choices: [
      { label: 'Jogi kiskapu', description: 'Nyerj 120 Goldot.', effect: (s) => ({ ...s, gold: s.gold + 120 }) },
      { label: 'Diplomáciai mentesség', description: 'Nyerj 15 Max HP-t, de veszíts 40 Goldot.', effect: (s) => ({ ...s, gold: Math.max(0, s.gold - 40), player: s.player ? { ...s.player, maxHp: s.player.maxHp + 15, hp: s.player.hp + 15 } : null }) },
      { label: 'Kiszavazás', description: 'Veszíts 20 HP-t, nyerj egy Ritka kártyát.', effect: (s) => {
          if (!s.player) return s;
          const pool = getRewardPool(s.player.class).filter(c => c.rarity === 'Rare');
          const card = getRandom(pool);
          return card ? { ...s, player: { ...s.player, hp: Math.max(1, s.player.hp - 20), deck: [...s.player.deck, { ...card, id: `${card.id}-${Math.random()}` }] } } : s;
      } },
      { label: 'Kávézás a bürokratákkal', description: 'Nyerj 2 Italt.', effect: (s) => {
          if (!s.player) return s;
          const pots = shuffleArr(POTIONS).slice(0, 2);
          return { ...s, player: { ...s.player, potions: [...s.player.potions, ...pots].slice(0, s.player.maxPotions) } };
      } },
      { label: 'Szigorítás', description: 'Nyerj 50 Goldot.', effect: (s) => ({ ...s, gold: s.gold + 50 }) },
    ]
  },
  {
    id: 'nepstadion-avato',
    title: 'Népstadion Avató',
    description: 'A díszpáholyban ülsz. A gyep zöldebb, mint valaha, a kolbász pedig zsírosabb.',
    choices: [
      { label: 'VIP büfé', description: 'Nyerj 25 HP-t.', effect: (s) => ({ ...s, player: s.player ? { ...s.player, hp: Math.min(s.player.maxHp, s.player.hp + 25) } : null }) },
      { label: 'Aláírt labda', description: 'Nyerj 80 Goldot.', effect: (s) => ({ ...s, gold: s.gold + 80 }) },
      { label: 'Építési napló hamisítás', description: 'Nyerj 150 Goldot, de veszíts 15 HP-t.', effect: (s) => ({ ...s, gold: s.gold + 150, player: s.player ? { ...s.player, hp: Math.max(1, s.player.hp - 15) } : null }) },
      { label: 'Meccsnézés', description: 'Nyerj 10 Max HP-t.', effect: (s) => ({ ...s, player: s.player ? { ...s.player, maxHp: s.player.maxHp + 10, hp: s.player.hp + 10 } : null }) },
      { label: 'Szurkolói sál', description: 'Nyerj egy véletlen kártyát.', effect: (s) => {
          if (!s.player) return s;
          const card = getRandom(getRewardPool(s.player.class));
          return card ? { ...s, player: { ...s.player, deck: [...s.player.deck, { ...card, id: `${card.id}-${Math.random()}` }] } } : s;
      } },
    ]
  },
  {
    id: 'falusi-disznovagas',
    title: 'Falusi Disznóvágás',
    description: 'Hajnali 5 óra. A pálinka már fogy, a pörzsölő már süvít.',
    choices: [
      { label: 'Böllér tál', description: 'Nyerj 10 Max HP-t, de veszíts 10 HP-t a koleszterintől.', effect: (s) => ({ ...s, player: s.player ? { ...s.player, maxHp: s.player.maxHp + 10, hp: Math.max(1, s.player.hp - 10) } : null }) },
      { label: 'Pálinka kóstoló', description: 'Nyerj 30 HP-t, de veszíts 20 Goldot.', effect: (s) => ({ ...s, gold: Math.max(0, s.gold - 20), player: s.player ? { ...s.player, hp: Math.min(s.player.maxHp, s.player.hp + 30) } : null }) },
      { label: 'Húst hordasz', description: 'Nyerj 60 Goldot.', effect: (s) => ({ ...s, gold: s.gold + 60 }) },
      { label: 'Kóstoló csomag', description: 'Nyerj 2 Italt.', effect: (s) => {
          if (!s.player) return s;
          const pots = shuffleArr(POTIONS).slice(0, 2);
          return { ...s, player: { ...s.player, potions: [...s.player.potions, ...pots].slice(0, s.player.maxPotions) } };
      } },
      { label: 'Csak a hagymás vért eszed', description: 'Nyerj 5 HP-t és egy kártyát.', effect: (s) => {
          if (!s.player) return s;
          const card = getRandom(getRewardPool(s.player.class));
          const s1 = { ...s, player: { ...s.player, hp: Math.min(s.player.maxHp, s.player.hp + 5) } };
          return card ? { ...s1, player: { ...s1.player!, deck: [...s1.player!.deck, { ...card, id: `${card.id}-${Math.random()}` }] } } : s1;
      } },
    ]
  },
  {
    id: 'nemzeti-szinhaz',
    title: 'Est a Nemzetiben',
    description: 'A függöny felgördül. A darab hosszú, a székek kényelmetlenek, de a kultúra az kultúra.',
    choices: [
      { label: 'Vastaps', description: 'Nyerj 40 Goldot.', effect: (s) => ({ ...s, gold: s.gold + 40 }) },
      { label: 'Kritizálás', description: 'Veszíts 10 HP-t, nyerj egy kártyát.', effect: (s) => {
          if (!s.player) return s;
          const card = getRandom(getRewardPool(s.player.class));
          return card ? { ...s, player: { ...s.player, hp: Math.max(1, s.player.hp - 10), deck: [...s.player.deck, { ...card, id: `${card.id}-${Math.random()}` }] } } : s;
      } },
      { label: 'Elalszol a páholyban', description: 'Nyerj 20 HP-t.', effect: (s) => ({ ...s, player: s.player ? { ...s.player, hp: Math.min(s.player.maxHp, s.player.hp + 20) } : null }) },
      { label: 'Büfézés a szünetben', description: 'Veszíts 15 Goldot, nyerj 10 Max HP-t.', effect: (s) => ({ ...s, gold: Math.max(0, s.gold - 15), player: s.player ? { ...s.player, maxHp: s.player.maxHp + 10, hp: s.player.hp + 10 } : null }) },
      { label: 'Főbb szerep', description: 'Nyerj egy Mutit.', effect: (s) => {
          if (!s.player) return s;
          const relic = getRandom(RELICS.filter(r => !s.player!.relics.find(pr => pr.id === r.id)));
          return relic ? { ...s, player: { ...s.player, relics: [...s.player.relics, relic] } } : s;
      } },
    ]
  },
  {
    id: 'tokaj-dulo-seta',
    title: 'Séta a Tokaji Dűlőkön',
    description: 'A nap lebukik a hegy mögött. A szőlőfürtök aranylók, a borospince hűvös.',
    choices: [
      { label: 'Aszú kóstolás', description: 'Nyerj 40 HP-t, de veszíts 10 Max HP-t (alkohol).', effect: (s) => ({ ...s, player: s.player ? { ...s.player, maxHp: Math.max(1, s.player.maxHp - 10), hp: Math.min(s.player.maxHp - 10, s.player.hp + 40) } : null }) },
      { label: 'Szüretelés', description: 'Nyerj 70 Goldot.', effect: (s) => ({ ...s, gold: s.gold + 70 }) },
      { label: 'Dűlővásárlás', description: 'Veszíts 150 Goldot, nyerj egy Mutit.', effect: (s) => {
          if (!s.player) return s;
          const relic = getRandom(RELICS.filter(r => !s.player!.relics.find(pr => pr.id === r.id)));
          return relic ? { ...s, gold: Math.max(0, s.gold - 150), player: { ...s.player, relics: [...s.player.relics, relic] } } : s;
      } },
      { label: 'Címketervezés', description: 'Nyerj egy kártyát.', effect: (s) => {
          if (!s.player) return s;
          const card = getRandom(getRewardPool(s.player.class));
          return card ? { ...s, player: { ...s.player, deck: [...s.player.deck, { ...card, id: `${card.id}-${Math.random()}` }] } } : s;
      } },
      { label: 'Pihenés az árnyékban', description: 'Nyerj 15 HP-t.', effect: (s) => ({ ...s, player: s.player ? { ...s.player, hp: Math.min(s.player.maxHp, s.player.hp + 15) } : null }) },
    ]
  },
  {
    id: 'vadaszati-vilagkiallitas',
    title: 'Vadászati Világkiállítás',
    description: 'Kitömött állatok mindenütt. A bejáratnál egy hatalmas agancskapu fogad.',
    choices: [
      { label: 'Agancskapu alatt elhaladás', description: 'Nyerj 10 Max HP-t.', effect: (s) => ({ ...s, player: s.player ? { ...s.player, maxHp: s.player.maxHp + 10, hp: s.player.hp + 10 } : null }) },
      { label: 'Trófeamustra', description: 'Nyerj egy véletlen Italt.', effect: (s) => {
          if (!s.player) return s;
          const pot = getRandom(POTIONS);
          return pot ? { ...s, player: { ...s.player, potions: [...s.player.potions, pot].slice(0, s.player.maxPotions) } } : s;
      } },
      { label: 'Vadászpuska vásárlás', description: 'Veszíts 80 Goldot, nyerj egy kártyát.', effect: (s) => {
          if (!s.player) return s;
          const card = getRandom(getRewardPool(s.player.class));
          return card ? { ...s, gold: Math.max(0, s.gold - 80), player: { ...s.player, deck: [...s.player.deck, { ...card, id: `${card.id}-${Math.random()}` }] } } : s;
      } },
      { label: 'Tömegben elvegyülés', description: 'Nyerj 30 Goldot.', effect: (s) => ({ ...s, gold: s.gold + 30 }) },
      { label: 'Különdíj átvétele', description: 'Veszíts 15 HP-t, nyerj egy Mutit.', effect: (s) => {
          if (!s.player) return s;
          const relic = getRandom(RELICS.filter(r => !s.player!.relics.find(pr => pr.id === r.id)));
          return relic ? { ...s, player: { ...s.player, hp: Math.max(1, s.player.hp - 15), relics: [...s.player.relics, relic] } } : s;
      } },
    ]
  },
  {
    id: 'matolcsy-jegybank',
    title: 'Látogatás a Jegybankban',
    description: 'A modern épületben a pénznyomdák zúgnak. A falakon festmények, a levegőben infláció illata.',
    choices: [
      { label: 'Új bankjegyek', description: 'Nyerj 200 Goldot, de veszíts 10 Max HP-t (Infláció).', effect: (s) => ({ ...s, gold: s.gold + 200, player: s.player ? { ...s.player, maxHp: Math.max(1, s.player.maxHp - 10), hp: Math.min(s.player.maxHp - 10, s.player.hp) } : null }) },
      { label: 'Aranytartalék mustra', description: 'Nyerj 5 Max HP-t.', effect: (s) => ({ ...s, player: s.player ? { ...s.player, maxHp: s.player.maxHp + 5, hp: s.player.hp + 5 } : null }) },
      { label: 'Különleges alapítvány', description: 'Veszíts 30 Goldot, nyerj egy Mutit.', effect: (s) => {
          if (!s.player) return s;
          const relic = getRandom(RELICS.filter(r => !s.player!.relics.find(pr => pr.id === r.id)));
          return relic ? { ...s, gold: Math.max(0, s.gold - 30), player: { ...s.player, relics: [...s.player.relics, relic] } } : s;
      } },
      { label: 'Elemzés olvasása', description: 'Nyerj 1 kártyát.', effect: (s) => {
          if (!s.player) return s;
          const card = getRandom(getRewardPool(s.player.class));
          return card ? { ...s, player: { ...s.player, deck: [...s.player.deck, { ...card, id: `${card.id}-${Math.random()}` }] } } : s;
      } },
      { label: 'Pénzmosoda', description: 'Veszíts 20 HP-t, nyerj 150 Goldot.', effect: (s) => ({ ...s, gold: s.gold + 150, player: s.player ? { ...s.player, maxHp: s.player.maxHp, hp: Math.max(1, s.player.hp - 20) } : null }) },
    ]
  },
  {
    id: 'eu-palyazat',
    title: 'Az EU-s Pénzcsap',
    description: 'Találsz egy gazdátlan EU-s támogatást egy talapzaton. Nagyon csábító, de lehet, hogy az OLAF figyel...',
    choices: [
      { label: 'Lenyúlod', description: 'Nyerj 100 Közpénzt.', effect: (s) => ({ ...s, gold: s.gold + 100 }) },
      { label: 'Mosod', description: 'Nyerj 50 Közpénzt, de veszíts 5 HP-t.', effect: (s) => ({ ...s, gold: s.gold + 50, player: s.player ? { ...s.player, hp: Math.max(1, s.player.hp - 5) } : null }) },
      { label: 'Átcsoportosítod', description: 'Nyerj 150 Közpénzt, de veszíts 15 HP-t.', effect: (s) => ({ ...s, gold: s.gold + 150, player: s.player ? { ...s.player, hp: Math.max(1, s.player.hp - 15) } : null }) },
      { label: 'Becsületes maradsz', description: 'Semmi nem történik.', effect: (s) => s },
      { label: 'Bejelented az OLAF-nak', description: 'Veszíts 20 Goldot adminisztrációra, de nyerj 20 Max HP-t.', effect: (s) => ({ ...s, gold: Math.max(0, s.gold - 20), player: s.player ? { ...s.player, maxHp: s.player.maxHp + 20, hp: s.player.hp + 20 } : null }) },
    ]
  },
  {
    id: 'nemzeti-konzultacio',
    title: 'Nemzeti Konzultáció',
    description: 'Egy óriási, fénylő plakát lebeg előtted. Ha kitöltöd az ívet, kapsz valamit... vagy csak agyzsibbadást.',
    choices: [
      { label: 'Ikszelsz mindent', description: 'Nyerj 30 Goldot.', effect: (s) => ({ ...s, gold: s.gold + 30 }) },
      { label: 'Tépkeded', description: 'Veszíts 10 HP-t, de nyerj egy véletlen kártyát.', effect: (s) => s }, // Simplified for now, real logic in App.tsx handleChoice
      { label: 'Átragasztod', description: 'Nyerj 10 Max HP-t.', effect: (s) => ({ ...s, player: s.player ? { ...s.player, maxHp: s.player.maxHp + 10, hp: s.player.hp + 10 } : null }) },
      { label: 'Figyelmen kívül hagyod', description: 'Semmi nem történik.', effect: (s) => s },
      { label: 'Gúnyos kommentet írsz rá', description: 'Veszíts 5 Goldot, nyerj 5 HP-t.', effect: (s) => ({ ...s, gold: Math.max(0, s.gold - 5), player: s.player ? { ...s.player, hp: Math.min(s.player.maxHp, s.player.hp + 5) } : null }) },
    ]
  },
  {
    id: 'vadaszkastely',
    title: 'Vadászkastélyi Meghívó',
    description: 'Meghívást kaptál egy titkos vadászatra a Bakony mélyére. A pálinka folyik, a puskák dörögnek.',
    choices: [
      { label: 'Lősz egy szarvast', description: 'Nyerj 80 Goldot.', effect: (s) => ({ ...s, gold: s.gold + 80 }) },
      { label: 'Csak iszol', description: 'Veszíts 10 Goldot, nyerj 20 HP-t.', effect: (s) => ({ ...s, gold: Math.max(0, s.gold - 10), player: s.player ? { ...s.player, hp: Math.min(s.player.maxHp, s.player.hp + 20) } : null }) },
      { label: 'Titkos alkut kötsz', description: 'Veszíts 25 HP-t, nyerj egy véletlen Mutit.', effect: (s) => s },
      { label: 'Ellopod a trófeát', description: 'Nyerj 200 Goldot, de veszíts 30 HP-t.', effect: (s) => ({ ...s, gold: s.gold + 200, player: s.player ? { ...s.player, hp: Math.max(1, s.player.hp - 30) } : null }) },
      { label: 'Korán távozol', description: 'Nyerj 5 HP-t.', effect: (s) => ({ ...s, player: s.player ? { ...s.player, hp: Math.min(s.player.maxHp, s.player.hp + 5) } : null }) },
    ]
  },
  {
    id: 'kozmedia-interju',
    title: 'Közmédia Interjú',
    description: 'Behívtak a stúdióba. Az alákérdezés garantált, de a sminkednek tökéletesnek kell lennie.',
    choices: [
      { label: 'Bólogatsz', description: 'Nyerj 40 Goldot.', effect: (s) => ({ ...s, gold: s.gold + 40 }) },
      { label: 'Belekiabálsz', description: 'Veszíts 20 Goldot hírnévromlásért, de nyerj 15 HP-t önérzetből.', effect: (s) => ({ ...s, gold: Math.max(0, s.gold - 20), player: s.player ? { ...s.player, hp: Math.min(s.player.maxHp, s.player.hp + 15) } : null }) },
      { label: 'A kamera mögé mész', description: 'Nyerj egy véletlen Italt.', effect: (s) => s },
      { label: 'Felolvasod a propagandát', description: 'Nyerj 100 Goldot, de veszíts 10 Max HP-t (lelkiismeret).', effect: (s) => ({ ...s, gold: s.gold + 100, player: s.player ? { ...s.player, maxHp: Math.max(10, s.player.maxHp - 10), hp: Math.min(s.player.maxHp - 10, s.player.hp) } : null }) },
      { label: 'Nem mész el', description: 'Semmi nem történik.', effect: (s) => s },
    ]
  },
  {
    id: 'bekemenet',
    title: 'Békemenet az út közepén',
    description: 'Hatalmas tömeg vonul végig az utcán. A táblák felemelve, a hangulat forró.',
    choices: [
      { label: 'Csatlakozol az elején', description: 'Nyerj 60 Goldot.', effect: (s) => ({ ...s, gold: s.gold + 60 }) },
      { label: 'Ingyen pogácsát osztasz', description: 'Veszíts 15 Goldot, nyerj 25 HP-t.', effect: (s) => ({ ...s, gold: Math.max(0, s.gold - 15), player: s.player ? { ...s.player, hp: Math.min(s.player.maxHp, s.player.hp + 25) } : null }) },
      { label: 'Ellentüntetést szervezel', description: 'Veszíts 40 HP-t, nyerj 300 Goldot.', effect: (s) => ({ ...s, gold: s.gold + 300, player: s.player ? { ...s.player, hp: Math.max(1, s.player.hp - 40) } : null }) },
      { label: 'Elvegyülsz', description: 'Nyerj 5 Max HP-t.', effect: (s) => ({ ...s, player: s.player ? { ...s.player, maxHp: s.player.maxHp + 5, hp: s.player.hp + 5 } : null }) },
      { label: 'Megkerülöd őket', description: 'Veszíts 10 Goldot benzinre.', effect: (s) => ({ ...s, gold: Math.max(0, s.gold - 10) }) },
    ]
  },
  {
    id: 'meszaros-palyazat',
    title: 'Mészáros Álom',
    description: 'Egy titokzatos boríték kerül a kezedbe. Benne egy autópálya-koncesszió és egy új gázszerelői diploma.',
    choices: [
      { label: 'Aláírod', description: 'Nyerj 120 Goldot.', effect: (s) => ({ ...s, gold: s.gold + 120 }) },
      { label: 'Visszautasítod', description: 'Veszíts 20 Goldot a kieső bevétel miatt, nyerj 10 HP-t.', effect: (s) => ({ ...s, gold: Math.max(0, s.gold - 20), player: s.player ? { ...s.player, hp: Math.min(s.player.maxHp, s.player.hp + 10) } : null }) },
      { label: 'Továbbadod', description: 'Nyerj 40 Goldot és egy kártyát.', effect: (s) => ({ ...s, gold: s.gold + 40 }) },
      { label: 'Megirod a sajtónak', description: 'Veszíts 30 HP-t, nyerj egy véletlen Mutit.', effect: (s) => s },
      { label: 'Elégeted', description: 'Nyerj 15 HP-t.', effect: (s) => ({ ...s, player: s.player ? { ...s.player, hp: Math.min(s.player.maxHp, s.player.hp + 15) } : null }) },
    ]
  },
  {
    id: 'szuverenitas-vizsgalat',
    title: 'Szuverenitás Vizsgálat',
    description: 'Kopogtatnak az ajtón. Egy öltönyös úr érkezett, hogy átnézze a "külföldi finanszírozásaidat".',
    choices: [
      { label: 'Mutatod a papírokat', description: 'Veszíts 30 Goldot "bírságra".', effect: (s) => ({ ...s, gold: Math.max(0, s.gold - 30) }) },
      { label: 'Mindent tagadsz', description: 'Veszíts 15 HP-t a stressz miatt.', effect: (s) => ({ ...s, player: s.player ? { ...s.player, hp: Math.max(1, s.player.hp - 15) } : null }) },
      { label: 'Megkened az urat', description: 'Veszíts 100 Goldot, de nyerj 2 kártyát.', effect: (s) => ({ ...s, gold: Math.max(0, s.gold - 100) }) },
      { label: 'Svájcba menekülsz', description: 'Veszíts 50% Goldot, nyerj teljes HP-t.', effect: (s) => ({ ...s, gold: Math.floor(s.gold / 2), player: s.player ? { ...s.player, hp: s.player.maxHp } : null }) },
      { label: 'Becsukod az ajtót', description: 'Semmi nem történik.', effect: (s) => s },
    ]
  },
  {
    id: 'adria-jacht',
    title: 'Gyanús Jacht az Adrián',
    description: 'Egy luxusjachton találod magad. A távolban a horvát partok, a fedélzeten pedig a fél kormány.',
    choices: [
      { label: 'Elfogadod a koktélt', description: 'Nyerj 20 HP-t.', effect: (s) => ({ ...s, player: s.player ? { ...s.player, hp: Math.min(s.player.maxHp, s.player.hp + 20) } : null }) },
      { label: 'Fotózol', description: 'Veszíts 25 HP-t, de nyerj 200 Goldot a képekért.', effect: (s) => ({ ...s, gold: s.gold + 200, player: s.player ? { ...s.player, hp: Math.max(1, s.player.hp - 25) } : null }) },
      { label: 'Kéred a tendert', description: 'Nyerj 150 Goldot.', effect: (s) => ({ ...s, gold: s.gold + 150 }) },
      { label: 'Beugrasz a vízbe', description: 'Veszíts 10 HP-t, de nyerj egy véletlen Italt.', effect: (s) => ({ ...s, player: s.player ? { ...s.player, hp: Math.max(1, s.player.hp - 10) } : null }) },
      { label: 'Tengeri beteg leszel', description: 'Veszíts 5 HP-t és 10 Goldot.', effect: (s) => ({ ...s, gold: Math.max(0, s.gold - 10), player: s.player ? { ...s.player, hp: Math.max(1, s.player.hp - 5) } : null }) },
    ]
  },
  {
    id: 'varnegyedi-koltozes',
    title: 'Várnegyedi költözés',
    description: 'Kaptál egy bérlakást a várban, nevetségesen alacsony áron. A kilátás fantasztikus.',
    choices: [
      { label: 'Beköltözöl', description: 'Nyerj 10 Max HP-t.', effect: (s) => ({ ...s, player: s.player ? { ...s.player, maxHp: s.player.maxHp + 10, hp: s.player.hp + 10 } : null }) },
      { label: 'Kiadod Airbnb-re', description: 'Nyerj 90 Goldot.', effect: (s) => ({ ...s, gold: s.gold + 90 }) },
      { label: 'Felújítod állami pénzből', description: 'Nyerj 180 Goldot, de veszíts 20 HP-t a botrány miatt.', effect: (s) => ({ ...s, gold: s.gold + 180, player: s.player ? { ...s.player, hp: Math.max(1, s.player.hp - 20) } : null }) },
      { label: 'Továbbadod rokonnak', description: 'Nyerj egy véletlen Mutit.', effect: (s) => s },
      { label: 'Maradsz a panelben', description: 'Nyerj 5 HP-t önérzetből.', effect: (s) => ({ ...s, player: s.player ? { ...s.player, hp: Math.min(s.player.maxHp, s.player.hp + 5) } : null }) },
    ]
  },
  {
    id: 'stadion-laz',
    title: 'Stadionépítési Láz',
    description: 'A falud végébe egy 20.000 fős stadiont terveznek. A lakosság száma 300 fő.',
    choices: [
      { label: 'Alapkőletétel', description: 'Nyerj 70 Goldot.', effect: (s) => ({ ...s, gold: s.gold + 70 }) },
      { label: 'VVIP páholy', description: 'Nyerj 5 Max HP-t és 10 HP-t.', effect: (s) => ({ ...s, player: s.player ? { ...s.player, maxHp: s.player.maxHp + 5, hp: Math.min(s.player.maxHp + 5, s.player.hp + 10) } : null }) },
      { label: 'Panaszkodsz a zajra', description: 'Veszíts 10 Goldot, nyerj 5 HP-t.', effect: (s) => ({ ...s, gold: Math.max(0, s.gold - 10), player: s.player ? { ...s.player, hp: Math.min(s.player.maxHp, s.player.hp + 5) } : null }) },
      { label: 'Te leszel a gondnok', description: 'Nyerj egy véletlen Italt.', effect: (s) => s },
      { label: 'Végezd el a munkát', description: 'Veszíts 15 HP-t, nyerj 140 Goldot.', effect: (s) => ({ ...s, gold: s.gold + 140, player: s.player ? { ...s.player, hp: Math.max(1, s.player.hp - 15) } : null }) },
    ]
  }
];
