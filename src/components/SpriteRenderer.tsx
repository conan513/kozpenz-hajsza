import React from "react";

const SPRITES: Record<string, React.FC<{flip?: boolean}>> = {
  "Diáktüntető": ({flip}) => (
    <svg viewBox="0 0 60 80" style={{transform: flip?"scaleX(-1)":undefined}} xmlns="http://www.w3.org/2000/svg">
      <defs><radialGradient id="sg1" cx="50%" cy="40%" r="50%"><stop offset="0%" stopColor="#f5d0a9"/><stop offset="100%" stopColor="#d4956a"/></radialGradient></defs>
      <ellipse cx="30" cy="18" rx="11" ry="12" fill="url(#sg1)"/>
      <rect x="10" y="28" width="40" height="32" rx="5" fill="#dc2626"/>
      <rect x="5" y="30" width="12" height="22" rx="5" fill="#b91c1c"/>
      <rect x="43" y="30" width="12" height="22" rx="5" fill="#b91c1c"/>
      <rect x="14" y="60" width="12" height="20" rx="4" fill="#1e293b"/>
      <rect x="34" y="60" width="12" height="20" rx="4" fill="#1e293b"/>
      <ellipse cx="26" cy="17" rx="3" ry="3.5" fill="#7c3aed" opacity="0.8"/>
      <ellipse cx="34" cy="17" rx="3" ry="3.5" fill="#7c3aed" opacity="0.8"/>
      <path d="M26 22 Q30 25 34 22" stroke="#7c3aed" strokeWidth="1.5" fill="none"/>
      <rect x="19" y="6" width="22" height="8" rx="3" fill="#1e293b"/>
      <rect x="26" y="3" width="8" height="5" rx="2" fill="#1e293b"/>
      <rect x="52" y="28" width="6" height="16" rx="2" fill="#f59e0b" transform="rotate(15 52 28)"/>
    </svg>
  ),
  "Oknyomozó": ({flip}) => (
    <svg viewBox="0 0 60 80" style={{transform: flip?"scaleX(-1)":undefined}} xmlns="http://www.w3.org/2000/svg">
      <defs><radialGradient id="sg2" cx="50%" cy="40%" r="50%"><stop offset="0%" stopColor="#fde68a"/><stop offset="100%" stopColor="#d4a017"/></radialGradient></defs>
      <ellipse cx="30" cy="18" rx="11" ry="12" fill="url(#sg2)"/>
      <rect x="10" y="28" width="40" height="32" rx="5" fill="#374151"/>
      <rect x="5" y="30" width="12" height="22" rx="5" fill="#4b5563"/>
      <rect x="43" y="30" width="12" height="22" rx="5" fill="#4b5563"/>
      <rect x="14" y="60" width="12" height="20" rx="4" fill="#1f2937"/>
      <rect x="34" y="60" width="12" height="20" rx="4" fill="#1f2937"/>
      <ellipse cx="26" cy="17" rx="3.5" ry="3.5" fill="#e5e7eb"/><ellipse cx="26" cy="17" rx="2" ry="2" fill="#1e3a8a"/>
      <ellipse cx="34" cy="17" rx="3.5" ry="3.5" fill="#e5e7eb"/><ellipse cx="34" cy="17" rx="2" ry="2" fill="#1e3a8a"/>
      <rect x="22" y="14" width="16" height="2" rx="1" fill="#92400e" opacity="0.7"/>
      <path d="M26 23 Q30 26 34 23" stroke="#92400e" strokeWidth="1.5" fill="none"/>
      <path d="M19 8 Q30 2 41 8 L41 12 Q30 6 19 12 Z" fill="#1f2937"/>
      <rect x="22" y="29" width="16" height="10" rx="2" fill="#1e40af" opacity="0.4"/>
    </svg>
  ),
  "Civil Aktivista": ({flip}) => (
    <svg viewBox="0 0 60 80" style={{transform: flip?"scaleX(-1)":undefined}} xmlns="http://www.w3.org/2000/svg">
      <defs><radialGradient id="sg3" cx="50%" cy="40%" r="50%"><stop offset="0%" stopColor="#fca5a5"/><stop offset="100%" stopColor="#ef4444"/></radialGradient></defs>
      <ellipse cx="30" cy="18" rx="11" ry="12" fill="#fde8d0"/>
      <rect x="11" y="28" width="38" height="32" rx="5" fill="#16a34a"/>
      <rect x="5" y="30" width="11" height="20" rx="5" fill="#15803d"/>
      <rect x="44" y="30" width="11" height="20" rx="5" fill="#15803d"/>
      <rect x="15" y="60" width="11" height="20" rx="4" fill="#1e293b"/>
      <rect x="34" y="60" width="11" height="20" rx="4" fill="#1e293b"/>
      <ellipse cx="26" cy="17" rx="2.8" ry="3" fill="#1e3a8a"/>
      <ellipse cx="34" cy="17" rx="2.8" ry="3" fill="#1e3a8a"/>
      <path d="M26 23 Q30 27 34 23" stroke="#dc2626" strokeWidth="2" fill="none"/>
      <path d="M19 10 Q30 4 41 10" stroke="#7c3aed" strokeWidth="3" fill="none"/>
      <rect x="2" y="22" width="5" height="24" rx="2" fill="#92400e"/>
      <rect x="2" y="22" width="16" height="8" rx="1" fill="#fef08a" opacity="0.9"/>
      <text x="3" y="29" fontSize="4" fill="#dc2626" fontWeight="bold">NEM!</text>
    </svg>
  ),
  "Független Politikus": ({flip}) => (
    <svg viewBox="0 0 60 80" style={{transform: flip?"scaleX(-1)":undefined}} xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="30" cy="18" rx="11" ry="12" fill="#fde8d0"/>
      <rect x="10" y="28" width="40" height="32" rx="3" fill="#1e3a8a"/>
      <rect x="10" y="28" width="40" height="5" fill="#1e40af"/>
      <rect x="5" y="30" width="12" height="22" rx="5" fill="#1d4ed8"/>
      <rect x="43" y="30" width="12" height="22" rx="5" fill="#1d4ed8"/>
      <rect x="15" y="60" width="12" height="20" rx="4" fill="#111827"/>
      <rect x="33" y="60" width="12" height="20" rx="4" fill="#111827"/>
      <ellipse cx="26" cy="17" rx="3" ry="3" fill="#6b7280"/>
      <ellipse cx="34" cy="17" rx="3" ry="3" fill="#6b7280"/>
      <path d="M26 23 Q30 26 34 23" stroke="#374151" strokeWidth="1.5" fill="none"/>
      <rect x="28" y="28" width="4" height="12" fill="#fef08a"/>
      <rect x="22" y="29" width="16" height="3" fill="#fef08a"/>
      <path d="M19 8 Q30 2 41 8" stroke="#1e293b" strokeWidth="4" fill="none"/>
      <ellipse cx="30" cy="8" rx="5" ry="3" fill="#f59e0b"/>
    </svg>
  ),
  "Digitális Ellenálló": ({flip}) => (
    <svg viewBox="0 0 60 80" style={{transform: flip?"scaleX(-1)":undefined}} xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="sg5" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#06b6d4"/><stop offset="100%" stopColor="#7c3aed"/></linearGradient></defs>
      <ellipse cx="30" cy="18" rx="11" ry="12" fill="#1e293b"/>
      <ellipse cx="26" cy="16" rx="5" ry="4" fill="#06b6d4" opacity="0.9"/>
      <ellipse cx="34" cy="16" rx="5" ry="4" fill="#7c3aed" opacity="0.9"/>
      <ellipse cx="26" cy="16" rx="2.5" ry="2.5" fill="#e0f2fe"/>
      <ellipse cx="34" cy="16" rx="2.5" ry="2.5" fill="#ede9fe"/>
      <rect x="10" y="28" width="40" height="32" rx="5" fill="#0f172a"/>
      <rect x="12" y="30" width="36" height="28" rx="4" fill="url(#sg5)" opacity="0.15"/>
      <rect x="5" y="30" width="12" height="22" rx="5" fill="#1e293b"/>
      <rect x="43" y="30" width="12" height="22" rx="5" fill="#1e293b"/>
      <rect x="3" y="42" width="6" height="2" rx="1" fill="#06b6d4"/>
      <rect x="51" y="42" width="6" height="2" rx="1" fill="#7c3aed"/>
      <rect x="15" y="60" width="12" height="20" rx="4" fill="#0f172a"/>
      <rect x="33" y="60" width="12" height="20" rx="4" fill="#0f172a"/>
      <path d="M24 22 L28 22" stroke="#06b6d4" strokeWidth="1.5"/>
      <path d="M32 22 L36 22" stroke="#7c3aed" strokeWidth="1.5"/>
      <rect x="16" y="34" width="28" height="16" rx="3" fill="#06b6d4" opacity="0.1" stroke="#06b6d4" strokeWidth="0.5"/>
      <text x="18" y="45" fontSize="5" fill="#06b6d4" fontFamily="monospace">01011</text>
    </svg>
  ),
  "Infláció": ({flip}) => (
    <svg viewBox="0 0 60 80" style={{transform: flip?"scaleX(-1)":undefined}} xmlns="http://www.w3.org/2000/svg">
      <defs><radialGradient id="eg1" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#fef08a"/><stop offset="100%" stopColor="#ca8a04"/></radialGradient></defs>
      <circle cx="30" cy="30" r="24" fill="url(#eg1)"/>
      <circle cx="30" cy="30" r="18" fill="#fde047" opacity="0.5"/>
      <text x="30" y="26" textAnchor="middle" fontSize="14" fill="#92400e" fontWeight="bold">Ft</text>
      <text x="30" y="38" textAnchor="middle" fontSize="7" fill="#7c2d12">-50%</text>
      <circle cx="30" cy="30" r="24" fill="none" stroke="#ca8a04" strokeWidth="2" strokeDasharray="4 2"/>
      <path d="M20 58 Q30 50 40 58 L38 75 Q30 70 22 75 Z" fill="#92400e"/>
      <line x1="10" y1="40" x2="2" y2="55" stroke="#ca8a04" strokeWidth="3" strokeLinecap="round"/>
      <line x1="50" y1="40" x2="58" y2="55" stroke="#ca8a04" strokeWidth="3" strokeLinecap="round"/>
    </svg>
  ),
  "Plakát-mágus": ({flip}) => (
    <svg viewBox="0 0 60 80" style={{transform: flip?"scaleX(-1)":undefined}} xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="30" cy="16" rx="10" ry="11" fill="#fde8d0"/>
      <path d="M20 10 Q30 0 40 10" fill="#dc2626"/>
      <rect x="10" y="26" width="40" height="30" rx="4" fill="#7c3aed"/>
      <rect x="12" y="28" width="36" height="24" rx="3" fill="#dc2626" opacity="0.2"/>
      <rect x="5" y="28" width="11" height="20" rx="5" fill="#6d28d9"/>
      <rect x="44" y="28" width="11" height="20" rx="5" fill="#6d28d9"/>
      <rect x="15" y="56" width="11" height="22" rx="4" fill="#1e293b"/>
      <rect x="34" y="56" width="11" height="22" rx="4" fill="#1e293b"/>
      <ellipse cx="26" cy="15" rx="3" ry="3" fill="#dc2626"/>
      <ellipse cx="34" cy="15" rx="3" ry="3" fill="#dc2626"/>
      <path d="M26 21 Q30 24 34 21" stroke="#7c3aed" strokeWidth="1.5" fill="none"/>
      <rect x="44" y="18" width="12" height="16" rx="2" fill="#fef08a" transform="rotate(10 44 18)"/>
      <text x="46" y="28" fontSize="4" fill="#dc2626" fontWeight="bold" transform="rotate(10 46 28)">NER</text>
    </svg>
  ),
  "Gázszerelő": ({flip}) => (
    <svg viewBox="0 0 60 80" style={{transform: flip?"scaleX(-1)":undefined}} xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="30" cy="16" rx="11" ry="12" fill="#fde8d0"/>
      <rect x="18" y="6" width="24" height="10" rx="3" fill="#f59e0b"/>
      <rect x="9" y="27" width="42" height="30" rx="4" fill="#d97706"/>
      <rect x="15" y="29" width="30" height="24" rx="3" fill="#92400e" opacity="0.3"/>
      <rect x="4" y="29" width="12" height="22" rx="5" fill="#b45309"/>
      <rect x="44" y="29" width="12" height="22" rx="5" fill="#b45309"/>
      <rect x="15" y="57" width="12" height="22" rx="4" fill="#1c1917"/>
      <rect x="33" y="57" width="12" height="22" rx="4" fill="#1c1917"/>
      <ellipse cx="26" cy="15" rx="3" ry="3" fill="#374151"/>
      <ellipse cx="34" cy="15" rx="3" ry="3" fill="#374151"/>
      <path d="M26 21 Q30 24 34 21" stroke="#374151" strokeWidth="1.5" fill="none"/>
      <rect x="18" y="34" width="24" height="14" rx="2" fill="#fbbf24" opacity="0.3"/>
      <path d="M44 50 L52 44 L56 50 L52 56 Z" fill="#6b7280"/>
      <rect x="50" y="46" width="10" height="4" rx="1" fill="#9ca3af"/>
    </svg>
  ),
  "Kádervadász": ({flip}) => (
    <svg viewBox="0 0 60 80" style={{transform: flip?"scaleX(-1)":undefined}} xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="30" cy="16" rx="11" ry="12" fill="#fde8d0"/>
      <rect x="9" y="27" width="42" height="30" rx="3" fill="#1e293b"/>
      <rect x="9" y="27" width="42" height="5" fill="#dc2626"/>
      <rect x="4" y="29" width="12" height="22" rx="5" fill="#111827"/>
      <rect x="44" y="29" width="12" height="22" rx="5" fill="#111827"/>
      <rect x="15" y="57" width="12" height="22" rx="4" fill="#111827"/>
      <rect x="33" y="57" width="12" height="22" rx="4" fill="#111827"/>
      <ellipse cx="26" cy="15" rx="3" ry="3" fill="#1e3a8a"/>
      <ellipse cx="34" cy="15" rx="3" ry="3" fill="#1e3a8a"/>
      <path d="M26 21 Q30 23 34 21" stroke="#374151" strokeWidth="1.5" fill="none"/>
      <path d="M19 8 Q30 2 41 8 L41 14 Q30 8 19 14 Z" fill="#111827"/>
      <rect x="26" y="27" width="8" height="14" fill="#dc2626" opacity="0.8"/>
      <circle cx="50" cy="38" r="5" fill="none" stroke="#6b7280" strokeWidth="1.5"/>
      <line x1="54" y1="42" x2="58" y2="46" stroke="#6b7280" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  "A Propagandagépezet": ({flip}) => (
    <svg viewBox="0 0 60 80" style={{transform: flip?"scaleX(-1)":undefined}} xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="eg5" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#374151"/><stop offset="100%" stopColor="#111827"/></linearGradient></defs>
      <rect x="10" y="8" width="40" height="30" rx="4" fill="url(#eg5)"/>
      <rect x="12" y="10" width="36" height="22" rx="3" fill="#1e3a8a" opacity="0.6"/>
      <circle cx="20" cy="16" r="3" fill="#ef4444"/>
      <circle cx="30" cy="16" r="3" fill="#fbbf24"/>
      <circle cx="40" cy="16" r="3" fill="#22c55e"/>
      <rect x="14" y="22" width="32" height="8" rx="1" fill="#374151"/>
      <text x="30" y="29" textAnchor="middle" fontSize="5" fill="#dc2626" fontWeight="bold">PROPAGANDA</text>
      <rect x="6" y="38" width="48" height="20" rx="3" fill="#1f2937"/>
      <rect x="8" y="40" width="44" height="16" rx="2" fill="#0f172a"/>
      <path d="M15 58 L10 75 M45 58 L50 75" stroke="#374151" strokeWidth="4" strokeLinecap="round"/>
      <rect x="2" y="18" width="8" height="6" rx="2" fill="#374151"/>
      <path d="M0 15 L2 18 M0 27 L2 24" stroke="#6b7280" strokeWidth="1.5"/>
    </svg>
  ),
  "A Megállíthatatlan Rezsidémon": ({flip}) => (
    <svg viewBox="0 0 60 80" style={{transform: flip?"scaleX(-1)":undefined}} xmlns="http://www.w3.org/2000/svg">
      <defs><radialGradient id="eg6" cx="50%" cy="40%" r="60%"><stop offset="0%" stopColor="#dc2626"/><stop offset="100%" stopColor="#7f1d1d"/></radialGradient></defs>
      <ellipse cx="30" cy="20" rx="18" ry="18" fill="url(#eg6)"/>
      <path d="M12 14 L8 4 L16 12" fill="#dc2626"/>
      <path d="M48 14 L52 4 L44 12" fill="#dc2626"/>
      <path d="M20 8 L18 0 L24 8" fill="#b91c1c"/>
      <path d="M40 8 L42 0 L36 8" fill="#b91c1c"/>
      <ellipse cx="23" cy="18" rx="5" ry="5" fill="#fef08a"/>
      <ellipse cx="37" cy="18" rx="5" ry="5" fill="#fef08a"/>
      <ellipse cx="23" cy="18" rx="3" ry="3" fill="#111827"/>
      <ellipse cx="37" cy="18" rx="3" ry="3" fill="#111827"/>
      <path d="M22 26 L24 24 L27 27 L30 23 L33 27 L36 24 L38 26" stroke="#fef08a" strokeWidth="1.5" fill="none"/>
      <rect x="14" y="36" width="32" height="28" rx="4" fill="#7f1d1d"/>
      <path d="M14 52 L4 46 L4 60 Z" fill="#dc2626"/>
      <path d="M46 52 L56 46 L56 60 Z" fill="#dc2626"/>
      <rect x="18" y="64" width="10" height="16" rx="3" fill="#450a0a"/>
      <rect x="32" y="64" width="10" height="16" rx="3" fill="#450a0a"/>
    </svg>
  ),
  "Megafon Troll": ({flip}) => (
    <svg viewBox="0 0 60 80" style={{transform: flip?"scaleX(-1)":undefined}} xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="30" cy="16" rx="13" ry="13" fill="#d1fae5"/>
      <ellipse cx="26" cy="14" rx="4" ry="4" fill="#059669"/>
      <ellipse cx="34" cy="14" rx="4" ry="4" fill="#059669"/>
      <ellipse cx="26" cy="14" rx="2" ry="2" fill="#ecfdf5"/>
      <ellipse cx="34" cy="14" rx="2" ry="2" fill="#ecfdf5"/>
      <path d="M22 21 Q30 27 38 21" stroke="#065f46" strokeWidth="2" fill="none"/>
      <ellipse cx="18" cy="12" rx="4" ry="6" fill="#6ee7b7" opacity="0.7"/>
      <ellipse cx="42" cy="12" rx="4" ry="6" fill="#6ee7b7" opacity="0.7"/>
      <rect x="10" y="28" width="40" height="30" rx="5" fill="#065f46"/>
      <rect x="5" y="30" width="12" height="20" rx="5" fill="#047857"/>
      <rect x="43" y="30" width="12" height="20" rx="5" fill="#047857"/>
      <rect x="15" y="58" width="12" height="22" rx="4" fill="#1e293b"/>
      <rect x="33" y="58" width="12" height="22" rx="4" fill="#1e293b"/>
      <path d="M44 24 L52 18 L58 24 L52 30 Z" fill="#9ca3af"/>
      <path d="M58 18 L62 14" stroke="#9ca3af" strokeWidth="2"/>
      <path d="M58 24 L62 24" stroke="#9ca3af" strokeWidth="2"/>
      <path d="M58 30 L62 34" stroke="#9ca3af" strokeWidth="2"/>
    </svg>
  ),
  "Unknown": ({flip}) => (
    <svg viewBox="0 0 60 80" style={{transform: flip?"scaleX(-1)":undefined}} xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="30" cy="18" rx="12" ry="13" fill="#374151"/>
      <ellipse cx="26" cy="17" rx="4" ry="4" fill="#6b7280"/>
      <ellipse cx="34" cy="17" rx="4" ry="4" fill="#6b7280"/>
      <path d="M26 24 Q30 27 34 24" stroke="#6b7280" strokeWidth="1.5" fill="none"/>
      <rect x="10" y="30" width="40" height="30" rx="5" fill="#1f2937"/>
      <rect x="5" y="32" width="12" height="20" rx="5" fill="#374151"/>
      <rect x="43" y="32" width="12" height="20" rx="5" fill="#374151"/>
      <rect x="15" y="60" width="12" height="20" rx="4" fill="#111827"/>
      <rect x="33" y="60" width="12" height="20" rx="4" fill="#111827"/>
      <text x="30" y="48" textAnchor="middle" fontSize="14" fill="#6b7280" fontWeight="bold">?</text>
    </svg>
  ),
};

interface SpriteRendererProps {
  type: string;
  className?: string;
  isEnemy?: boolean;
  isAttacking?: boolean;
  isHurt?: boolean;
  isDead?: boolean;
}

export const SpriteRenderer: React.FC<SpriteRendererProps> = React.memo(({
  type, className = "", isEnemy = false, isAttacking = false, isHurt = false, isDead = false,
}) => {
  const SpriteComp = SPRITES[type] || SPRITES["Unknown"];
  const idleClass = isDead ? "sprite-dead" : isHurt ? "sprite-hurt" : isAttacking ? (isEnemy ? "sprite-attack-enemy" : "sprite-attack-player") : "sprite-idle";

  return (
    <div
      className={`w-full h-full flex items-center justify-center ${className} ${idleClass}`}
      style={{ willChange: "transform" }}
    >
      <SpriteComp flip={isEnemy} />
    </div>
  );
});