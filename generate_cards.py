import json
import random
import os

CLASSES = [
    {"id": "ic", "name": "Diáktüntető", "class": "Diáktüntető"},
    {"id": "sl", "name": "Oknyomozó", "class": "Oknyomozó"},
    {"id": "df", "name": "Civil Aktivista", "class": "Civil Aktivista"},
    {"id": "wt", "name": "Független Politikus", "class": "Független Politikus"},
    {"id": "vw", "name": "Digitális Ellenálló", "class": "Digitális Ellenálló"},
]

ADJECTIVES = {
    "ic": ["Hangos", "Dühös", "Elszánt", "Békés", "Kreatív", "Lelkes", "Radikális", "Kitartó", "Szolidáris", "Lázadó", "Szervezett", "Spontán", "Váratlan", "Erőteljes"],
    "sl": ["Titkos", "Bizalmas", "Leleplező", "Sokkoló", "Szenzációs", "Anonim", "Rejtett", "Sötét", "Tényszerű", "Alapos", "Kiszivárgott", "Szerkesztői", "Kritikus"],
    "df": ["Közösségi", "Önkéntes", "Alulról Jövő", "Támogató", "Segítő", "Zöld", "Emberi", "Szociális", "Helyi", "Bátor", "Független", "Adományozó", "Védelmező"],
    "wt": ["Módosító", "Parlamenti", "Bizottsági", "Plenáris", "Kisebbségi", "Többségi", "Törvényes", "Alkotmányos", "Rendeleti", "Szavazati", "Mentelmi", "Interpellációs"],
    "vw": ["Digitális", "Kriptografikus", "Titkosított", "Decentralizált", "Virtuális", "Elosztott", "Kiber", "Online", "Hálózati", "Automatizált", "Programozott", "Kódolt", "Feltört"]
}

NOUNS = {
    "ic": ["Skandálás", "Kordon", "Plakát", "Tüntetés", "Felszólalás", "Petíció", "Sztrájk", "Élőlánc", "Megafon", "Transzparens", "Ellenállás", "Menet", "Sátor", "Fórum", "Szimpátia"],
    "sl": ["Cikk", "Riport", "Interjú", "Dosszié", "Forrás", "Nyomozás", "Adat", "Dokumentum", "Bizonyíték", "Felvétel", "Fotó", "Hanganyag", "Jelentés", "Tény", "Akták"],
    "df": ["Alapítvány", "Egyesület", "Mozgalom", "Gyűjtés", "Adomány", "Konyha", "Menhely", "Segély", "Kampány", "Kezdeményezés", "Pályázat", "Hálózat", "Workshop", "Petíció"],
    "wt": ["Törvényjavaslat", "Felszólalás", "Napirend", "Szavazás", "Vétó", "Frakció", "Mandátum", "Nyilatkozat", "Alku", "Koalíció", "Párt", "Ellenzék", "Hivatal", "Képviselet"],
    "vw": ["Szerver", "Adatbázis", "Hálózat", "Kód", "Támadás", "Vírus", "Tűzfal", "Proxy", "VPN", "Szkript", "Exploit", "Jelszó", "Botnet", "Algoritmus", "Kripto"]
}

COLORLESS_NAMES = [
    "Közpénz Jelleg Elvesztése", "Európai Uniós Támogatás", "Alaptörvény Módosítás", "Közbeszerzési Győzelem",
    "Állami Hirdetés", "Sürgősségi Rendelet", "Inflációs Hullám", "Konzultációs Ív", "Nemzeti Italbolt",
    "Gázszerelői Bölcsesség", "Jachtos Pihenés", "Békemenet", "Soros-Terv", "Brüsszeli Szankciók",
    "Vagyonnyilatkozat", "Családi Adókedvezmény", "Rezsicsökkentés", "Hatósági Ár", "Kilakoltatási Moratórium",
    "Alapítványi Kiszervezés", "Magántőkealap", "Megafon Tréning", "Plakátkampány", "Karaktergyilkosság",
    "Államtitkári Utasítás", "Miniszteri Keret", "Rendkívüli Jogrend", "Titkosított Szerződés", "Közérdekű Adat",
    "Nemzetbiztonsági Kockázat", "Lehallgatási Botrány", "Pegasus Szoftver", "Trollfarm", "Fake News",
    "Dezinformáció", "Álhír", "Pártfinanszírozás", "Kampánypénz", "Választási Törvény", "Körzetátrajzolás",
    "Szavazatvásárlás", "Láncszavazás", "Krumpliosztás", "Közmunkaprogram", "Kastélyfelújítás",
    "Stadionépítés", "Lombkoronasétány", "Kilátó a Gödörben", "Műfű", "Térkő"
]

def generate_effects(card_type, rarity, cls_id):
    cost = random.choices([0, 1, 2, 3], weights=[20, 50, 20, 10])[0]
    exhaust = "true" if random.random() < 0.2 else "false"
    retain = "true" if random.random() < 0.1 else "false"
    needsTarget = "false"
    
    effects = []
    desc = []
    
    rarity_dmg_bonus = random.randint(2, 4) if rarity == "Uncommon" else (random.randint(4, 8) if rarity == "Rare" else 0)
    rarity_blk_bonus = random.randint(1, 3) if rarity == "Uncommon" else (random.randint(3, 6) if rarity == "Rare" else 0)
    
    if card_type == "Attack":
        needsTarget = "true" if random.random() < 0.7 else "false"
        is_hybrid = random.random() < 0.25
        is_aoe = needsTarget == "false"
        
        base_dmg = random.randint(2, 9) + (cost * random.randint(4, 8)) + rarity_dmg_bonus
        if is_aoe: base_dmg = int(base_dmg * random.uniform(0.6, 0.8)) # AoE penalty
        if is_hybrid: base_dmg = int(base_dmg * random.uniform(0.65, 0.85)) # Hybrid penalty
        base_dmg = max(1, base_dmg)
        
        hits = 1
        if random.random() < 0.2:
            hits = random.randint(2, 5)
            base_dmg = max(1, base_dmg // hits)
            
        if needsTarget == "true":
            desc.append(f"Okozz {base_dmg} sebzést" + (f" {hits} alkalommal." if hits > 1 else "."))
            effects.append(f"s = dealDamage(s, {base_dmg}, {hits}, targetId);")
        else:
            desc.append(f"Okozz {base_dmg} sebzést MINDEN ellenfélnek" + (f" {hits} alkalommal." if hits > 1 else "."))
            effects.append(f"s = dealDamage(s, {base_dmg}, {hits}, 'ALL');")
            
        if is_hybrid:
            block = max(2, random.randint(2, 6) + (cost * random.randint(3, 6)) + rarity_blk_bonus)
            block = int(block * random.uniform(0.65, 0.85)) # Hybrid penalty
            desc.append(f"Nyerj {block} Cenzúrát (Block).")
            effects.append(f"s = gainBlock(s, {block});")
            
    elif card_type == "Skill":
        needsTarget = "true" if random.random() < 0.3 else "false"
        
        has_energy = random.random() < 0.15
        if has_energy:
            energy = 1 if cost < 2 else random.randint(1, 3)
            if rarity == "Rare": energy += random.randint(0, 1)
            desc.append(f"Nyerj {energy} Lendületet (Energiát).")
            effects.append(f"if (s.player) s.player.energy += {energy};")
            exhaust = "true" # Energy cards should exhaust
            
        if needsTarget == "true" and random.random() < 0.5:
            # Debuff
            debuff_type = random.choice(["Weak", "Vulnerable", "Poison"])
            amt = random.randint(1, 3) + cost + (random.randint(0, 2) if rarity != "Common" else 0)
            if debuff_type == "Poison": amt = random.randint(2, 6) + (cost * random.randint(2, 4)) + rarity_blk_bonus
            desc.append(f"Adj {amt} {debuff_type}t a célpontnak.")
            effects.append(f"s = applyStatus(s, '{debuff_type}', {amt}, targetId);")
        else:
            # Block or Draw
            if random.random() < 0.6:
                block = random.randint(3, 9) + (cost * random.randint(4, 8)) + rarity_blk_bonus
                if has_energy: block = int(block * random.uniform(0.4, 0.6)) # Penalty if gives energy
                desc.append(f"Nyerj {block} Cenzúrát.")
                effects.append(f"s = gainBlock(s, {block});")
            else:
                draw = random.randint(1, 3) + (cost // 2) + (random.randint(0, 2) if rarity == "Rare" else 0)
                desc.append(f"Húzz {draw} kártyát.")
                effects.append(f"s = drawCards(s, {draw});")
            
    elif card_type == "Power":
        buff_type = random.choice(["Strength", "Dexterity"])
        amt = random.randint(1, 2) + (cost // 2) + (random.randint(0, 1) if rarity != "Common" else 0)
        desc.append(f"Nyerj {amt} {buff_type}t.")
        effects.append(f"s = applyStatus(s, '{buff_type}', {amt}, 'PLAYER');")
        exhaust = "true" 
        
    description = " ".join(desc)
    effect_body = " ".join(effects)
    
    if not description:
        description = "Semmi sem történik."
        effect_body = ""
        
    return {
        "cost": cost,
        "description": description,
        "effect_body": f"return (() => {{ let s = gameState; {effect_body} return s; }})();",
        "exhaust": exhaust,
        "retain": retain,
        "needsTarget": needsTarget
    }

def generate_class_cards(cls):
    cards = []
    # Requirements: 50 Common, 35 Uncommon, 15 Rare
    # 45 Attack, 45 Skill, 10 Power
    
    pool = []
    # Generate distribution
    # Attack: 24 C, 15 U, 6 R
    # Skill: 23 C, 16 U, 6 R
    # Power: 3 C, 4 U, 3 R
    
    for _ in range(24): pool.append(("Attack", "Common"))
    for _ in range(15): pool.append(("Attack", "Uncommon"))
    for _ in range(6): pool.append(("Attack", "Rare"))
    
    for _ in range(23): pool.append(("Skill", "Common"))
    for _ in range(16): pool.append(("Skill", "Uncommon"))
    for _ in range(6): pool.append(("Skill", "Rare"))
    
    for _ in range(3): pool.append(("Power", "Common"))
    for _ in range(4): pool.append(("Power", "Uncommon"))
    for _ in range(3): pool.append(("Power", "Rare"))
    
    random.shuffle(pool)
    
    used_names = set()
    
    for i, (ctype, rarity) in enumerate(pool):
        adj = random.choice(ADJECTIVES[cls["id"]])
        noun = random.choice(NOUNS[cls["id"]])
        name = f"{adj} {noun}"
        if name in used_names:
            name = f"{adj} {noun} {i}"
        used_names.add(name)
        
        eff = generate_effects(ctype, rarity, cls["id"])
        
        cards.append({
            "id": f"{cls['id']}-{i+1}",
            "name": name,
            "type": ctype,
            "cost": eff["cost"],
            "rarity": rarity,
            "description": eff["description"],
            "effect_body": eff["effect_body"],
            "needsTarget": eff["needsTarget"],
            "exhaust": eff["exhaust"],
            "retain": eff["retain"],
            "characterClass": cls["class"]
        })
        
    return cards

def generate_colorless_cards():
    cards = []
    # 50 cards
    # 25 Common, 15 Uncommon, 10 Rare
    pool = []
    for _ in range(25): pool.append(("Skill", "Common"))
    for _ in range(10): pool.append(("Attack", "Uncommon"))
    for _ in range(5): pool.append(("Skill", "Uncommon"))
    for _ in range(5): pool.append(("Power", "Rare"))
    for _ in range(5): pool.append(("Attack", "Rare"))
    
    random.shuffle(pool)
    
    for i, (ctype, rarity) in enumerate(pool):
        name = COLORLESS_NAMES[i]
        eff = generate_effects(ctype, rarity, "cl")
        
        cards.append({
            "id": f"cl-{i+1}",
            "name": name,
            "type": ctype,
            "cost": eff["cost"],
            "rarity": rarity,
            "description": eff["description"],
            "effect_body": eff["effect_body"],
            "needsTarget": eff["needsTarget"],
            "exhaust": eff["exhaust"],
            "retain": eff["retain"],
            "characterClass": "Colorless"
        })
        
    return cards

def format_ts_file(cards, export_name):
    lines = [
        "import { Card, GameState } from '../../types';",
        "import { applyStatus, dealDamage, drawCards, gainBlock } from '../cardUtils';",
        "",
        f"export const {export_name}: Card[] = ["
    ]
    
    for c in cards:
        lines.append(f"  {{")
        lines.append(f"    id: '{c['id']}', name: '{c['name']}', type: '{c['type']}', cost: {c['cost']}, rarity: '{c['rarity']}', characterClass: '{c['characterClass']}',")
        lines.append(f"    needsTarget: {c['needsTarget']}, exhaust: {c['exhaust']}, retain: {c['retain']},")
        lines.append(f"    description: '{c['description']}',")
        lines.append(f"    effect: (gameState: GameState, targetId?: string): GameState => {{ {c['effect_body']} }}")
        lines.append(f"  }},")
        
    lines.append("];")
    return "\n".join(lines)


# Write common utils for the cards
os.makedirs("/mnt/raid/Source/kozpenz-hajsza/src/lib/cards", exist_ok=True)

with open("/mnt/raid/Source/kozpenz-hajsza/src/lib/cardUtils.ts", "w", encoding="utf-8") as f:
    f.write("""
import { GameState, StatusEffect, Card } from '../types';

export const dealDamage = (state: GameState, baseDamage: number, hits: number = 1, targetId?: string): GameState => {
  if (!state.player || state.enemies.length === 0) return state;
  let newEnemies = [...state.enemies];
  const strength = state.player.statusEffects.find(s => s.type === 'Strength')?.stacks || 0;
  const isAoE = targetId === 'ALL';
  const targets = isAoE ? newEnemies : targetId ? newEnemies.filter(e => e.id === targetId) : [newEnemies[0]];
  
  targets.forEach(target => {
    const isVuln = !!target.statusEffects.find(s => s.type === 'Vulnerable');
    const isWeak = !!state.player!.statusEffects.find(s => s.type === 'Weak');
    let finalDamage = baseDamage + strength;
    if (isWeak) finalDamage = Math.floor(finalDamage * 0.75);
    if (isVuln) finalDamage = Math.floor(finalDamage * 1.5);
    finalDamage *= hits;
    const actualDmg = Math.max(0, finalDamage - target.block);
    const targetIndex = newEnemies.findIndex(e => e.id === target.id);
    if (targetIndex !== -1) {
        newEnemies[targetIndex] = { ...target, hp: Math.max(0, target.hp - actualDmg), block: Math.max(0, target.block - finalDamage) };
    }
  });
  return { ...state, enemies: newEnemies };
};

export const gainBlock = (state: GameState, baseBlock: number): GameState => {
  if (!state.player) return state;
  const dex = state.player.statusEffects.find(s => s.type === 'Dexterity')?.stacks || 0;
  return { ...state, player: { ...state.player, block: state.player.block + baseBlock + dex } };
};

export const applyStatus = (state: GameState, type: StatusEffect['type'], stacks: number, targetId?: string): GameState => {
  if (!state.player) return state;
  let newEnemies = [...state.enemies];
  if (targetId === 'PLAYER') {
    const existing = state.player.statusEffects.find(s => s.type === type);
    return { ...state, player: { ...state.player, statusEffects: existing ? state.player.statusEffects.map(s => s.type === type ? { ...s, stacks: s.stacks + stacks } : s) : [...state.player.statusEffects, { type, stacks }] } };
  }
  const targets = targetId === 'ALL' ? newEnemies : targetId ? newEnemies.filter(e => e.id === targetId) : [newEnemies[0]];
  targets.forEach(target => {
    const targetIdx = newEnemies.findIndex(e => e.id === target.id);
    if (targetIdx !== -1) {
      const existing = target.statusEffects.find(s => s.type === type);
      newEnemies[targetIdx] = { ...target, statusEffects: existing ? target.statusEffects.map(s => s.type === type ? { ...s, stacks: s.stacks + stacks } : s) : [...target.statusEffects, { type, stacks }] };
    }
  });
  return { ...state, enemies: newEnemies };
};

export const drawCards = (state: GameState, amount: number): GameState => {
  if (!state.player) return state;
  let newDrawPile = [...state.player.drawPile];
  let newDiscardPile = [...state.player.discardPile];
  let newHand = [...state.player.hand];
  for (let i = 0; i < amount; i++) {
    if (newDrawPile.length === 0) {
      if (newDiscardPile.length === 0) break;
      newDrawPile = [...newDiscardPile].sort(() => Math.random() - 0.5);
      newDiscardPile = [];
    }
    const card = newDrawPile.pop();
    if (card) newHand.push(card);
  }
  return { ...state, player: { ...state.player, drawPile: newDrawPile, discardPile: newDiscardPile, hand: newHand } };
};
""")

all_exports = []
for cls in CLASSES:
    cards = generate_class_cards(cls)
    file_name = f"{cls['id']}_cards.ts"
    export_name = f"{cls['id'].upper()}_CARDS"
    with open(f"/mnt/raid/Source/kozpenz-hajsza/src/lib/cards/{file_name}", "w", encoding="utf-8") as f:
        f.write(format_ts_file(cards, export_name))
    all_exports.append((file_name, export_name))
    print(f"Generated {len(cards)} cards for {cls['name']}")

colorless_cards = generate_colorless_cards()
with open("/mnt/raid/Source/kozpenz-hajsza/src/lib/cards/cl_cards.ts", "w", encoding="utf-8") as f:
    f.write(format_ts_file(colorless_cards, "CL_CARDS"))
all_exports.append(("cl_cards.ts", "CL_CARDS"))

# Now generate the updated cardLibrary.ts
lib_lines = [
    "import { Card, GameState, CharacterClass, StatusEffect } from '../types';",
]

for file_name, export_name in all_exports:
    lib_lines.append(f"import {{ {export_name} }} from './cards/{file_name.replace('.ts', '')}';")

lib_lines.append("""

// Legacy Hex cards that are still needed for events
export const HEX_CARDS: Card[] = [
  {
    id: 'hx-debt', name: 'Államadósság', type: 'Hex', cost: -1, rarity: 'Common', characterClass: 'Colorless',
    description: 'Kijátszhatatlan. (Csak foglalja a helyet a kezedben)',
    effect: (s) => s
  },
  {
    id: 'hx-bureaucracy', name: 'Bürokrácia', type: 'Hex', cost: -1, rarity: 'Uncommon', characterClass: 'Colorless',
    description: 'Kijátszhatatlan. Ha eldobod, veszíts 3 HP-t.',
    effect: (s) => s
  }
];

export const UNIQUE_CARDS: Card[] = [
  ...IC_CARDS,
  ...SL_CARDS,
  ...DF_CARDS,
  ...WT_CARDS,
  ...VW_CARDS,
  ...CL_CARDS,
  ...HEX_CARDS
];

export const getStartingDeck = (cls: CharacterClass): Card[] => {
  const strike: Card = {
    id: `${cls}-strike`, name: 'Beadvány', type: 'Attack', cost: 1, rarity: 'Common', needsTarget: true,
    description: 'Okozz 6 sebzést.', effect: (s, targetId) => {
        // Simple inline dealDamage to avoid circular imports just for starter deck
        if (!s.player || s.enemies.length === 0) return s;
        let newEnemies = [...s.enemies];
        const strength = s.player.statusEffects.find(st => st.type === 'Strength')?.stacks || 0;
        const targets = targetId ? newEnemies.filter(e => e.id === targetId) : [newEnemies[0]];
        targets.forEach(target => {
            const isVuln = !!target.statusEffects.find(st => st.type === 'Vulnerable');
            const isWeak = !!s.player!.statusEffects.find(st => st.type === 'Weak');
            let finalDamage = 6 + strength;
            if (isWeak) finalDamage = Math.floor(finalDamage * 0.75);
            if (isVuln) finalDamage = Math.floor(finalDamage * 1.5);
            const actualDmg = Math.max(0, finalDamage - target.block);
            const targetIndex = newEnemies.findIndex(e => e.id === target.id);
            if (targetIndex !== -1) {
                newEnemies[targetIndex] = { ...target, hp: Math.max(0, target.hp - actualDmg), block: Math.max(0, target.block - finalDamage) };
            }
        });
        return { ...s, enemies: newEnemies };
    }
  };
  const defend: Card = {
    id: `${cls}-defend`, name: 'Védekezés', type: 'Skill', cost: 1, rarity: 'Common',
    description: 'Nyerj 5 Cenzúrát.', effect: (s) => {
        if (!s.player) return s;
        const dex = s.player.statusEffects.find(st => st.type === 'Dexterity')?.stacks || 0;
        return { ...s, player: { ...s.player, block: s.player.block + 5 + dex } };
    }
  };
  
  const clsPfx = cls === 'Diáktüntető' ? 'ic' : cls === 'Oknyomozó' ? 'sl' : cls === 'Civil Aktivista' ? 'df' : cls === 'Független Politikus' ? 'wt' : 'vw';

  const classUniques = UNIQUE_CARDS.filter(c => c.id.startsWith(clsPfx));
  const firstUnique = classUniques.length > 0 ? { ...classUniques[0], id: `${classUniques[0].id}-base` } : { ...strike, id: `${cls}-strike-uniq` };
  const secondUnique = classUniques.length > 1 ? { ...classUniques[1], id: `${classUniques[1].id}-base` } : { ...defend, id: `${cls}-defend-uniq` };

  return [
    {...strike, id: `${cls}-strike-1`}, {...strike, id: `${cls}-strike-2`},
    {...strike, id: `${cls}-strike-3`}, {...strike, id: `${cls}-strike-4`},
    {...defend, id: `${cls}-defend-1`}, {...defend, id: `${cls}-defend-2`},
    {...defend, id: `${cls}-defend-3`}, {...defend, id: `${cls}-defend-4`},
    firstUnique,
    secondUnique,
  ];
};

export const getRewardPool = (cls: CharacterClass): Card[] => {
  return UNIQUE_CARDS
    .filter(card => card.type !== 'Hex' && card.characterClass === cls)
    .map(card => ({ ...card, id: `${card.id}-${Math.random()}` }));
};

export const getColorlessPool = (): Card[] => {
  return UNIQUE_CARDS
    .filter(card => card.type !== 'Hex' && card.characterClass === 'Colorless')
    .map(card => ({ ...card, id: `${card.id}-${Math.random()}` }));
};
""")

with open("/mnt/raid/Source/kozpenz-hajsza/src/lib/cardLibrary.ts", "w", encoding="utf-8") as f:
    f.write("\n".join(lib_lines))

print("All done!")
