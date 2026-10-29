/**
 * Dyslexia Screening Game Battery - Stimuli Library
 * Generates inline SVG visual cues across all required categories:
 * - symbols, shapes, Z-like shapes, rectangles, faces, fruits,
 *   kitchen objects, plants, animals
 * Plus symmetry transformations (mirrored horizontal/vertical, rotated 90/180, visually similar)
 */

const StimuliLibrary = (() => {
  // Helper to wrap SVG markup
  const svg = (inner, viewBox = "0 0 100 100", extraClass = "") => `
    <svg class="stimulus-svg ${extraClass}" viewBox="${viewBox}" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      ${inner}
    </svg>
  `;

  // Item definitions grouped by required paper categories
  const CATALOG = {
    symbols: [
      {
        id: 'sym_star',
        name: 'Golden Star',
        category: 'symbols',
        render: () => svg(`
          <polygon points="50,8 62,38 95,38 67,58 78,90 50,70 22,90 33,58 5,38 38,38" fill="#FBBF24" stroke="#D97706" stroke-width="4" stroke-linejoin="round"/>
          <circle cx="50" cy="50" r="12" fill="#FEF08A"/>
        `)
      },
      {
        id: 'sym_sun',
        name: 'Sun',
        category: 'symbols',
        render: () => svg(`
          <circle cx="50" cy="50" r="26" fill="#F59E0B" stroke="#D97706" stroke-width="4"/>
          <g stroke="#F59E0B" stroke-width="6" stroke-linecap="round">
            <line x1="50" y1="8" x2="50" y2="18"/>
            <line x1="50" y1="82" x2="50" y2="92"/>
            <line x1="8" y1="50" x2="18" y2="50"/>
            <line x1="82" y1="50" x2="92" y2="50"/>
            <line x1="20" y1="20" x2="28" y2="28"/>
            <line x1="72" y1="72" x2="80" y2="80"/>
            <line x1="80" y1="20" x2="72" y2="28"/>
            <line x1="20" y1="80" x2="28" y2="72"/>
          </g>
        `)
      },
      {
        id: 'sym_crescent',
        name: 'Moon Crescent',
        category: 'symbols',
        render: () => svg(`
          <path d="M60,15 A35,35 0 1,0 80,68 A32,32 0 0,1 60,15 Z" fill="#6366F1" stroke="#4338CA" stroke-width="4"/>
          <circle cx="62" cy="38" r="4" fill="#E0E7FF"/>
        `)
      },
      {
        id: 'sym_lightning',
        name: 'Lightning',
        category: 'symbols',
        render: () => svg(`
          <polygon points="56,8 24,52 48,52 38,92 78,44 54,44" fill="#EAB308" stroke="#CA8A04" stroke-width="4" stroke-linejoin="round"/>
        `)
      },
      {
        id: 'sym_diamond',
        name: 'Diamond Sparkle',
        category: 'symbols',
        render: () => svg(`
          <polygon points="50,10 88,50 50,90 12,50" fill="#06B6D4" stroke="#0891B2" stroke-width="4"/>
          <polygon points="50,25 75,50 50,75 25,50" fill="#67E8F9"/>
        `)
      }
    ],

    shapes: [
      {
        id: 'shape_triangle',
        name: 'Triangle',
        category: 'shapes',
        render: () => svg(`
          <polygon points="50,14 90,86 10,86" fill="#EC4899" stroke="#BE185D" stroke-width="5" stroke-linejoin="round"/>
          <circle cx="50" cy="62" r="10" fill="#FBCFE8"/>
        `)
      },
      {
        id: 'shape_hexagon',
        name: 'Hexagon',
        category: 'shapes',
        render: () => svg(`
          <polygon points="50,12 86,32 86,70 50,90 14,70 14,32" fill="#8B5CF6" stroke="#6D28D9" stroke-width="5" stroke-linejoin="round"/>
          <polygon points="50,28 72,40 72,62 50,74 28,62 28,40" fill="#C4B5FD"/>
        `)
      },
      {
        id: 'shape_pentagon',
        name: 'Pentagon',
        category: 'shapes',
        render: () => svg(`
          <polygon points="50,12 88,40 73,88 27,88 12,40" fill="#10B981" stroke="#047857" stroke-width="5" stroke-linejoin="round"/>
          <circle cx="50" cy="55" r="12" fill="#A7F3D0"/>
        `)
      },
      {
        id: 'shape_circle_ring',
        name: 'Concentric Circles',
        category: 'shapes',
        render: () => svg(`
          <circle cx="50" cy="50" r="38" fill="#3B82F6" stroke="#1D4ED8" stroke-width="5"/>
          <circle cx="50" cy="50" r="24" fill="#DBEAFE"/>
          <circle cx="50" cy="50" r="10" fill="#1D4ED8"/>
        `)
      },
      {
        id: 'shape_cross',
        name: 'Plus Cross',
        category: 'shapes',
        render: () => svg(`
          <path d="M36,12 H64 V36 H88 V64 H64 V88 H36 V64 H12 V36 H36 Z" fill="#F97316" stroke="#C2410C" stroke-width="5" stroke-linejoin="round"/>
        `)
      }
    ],

    z_shapes: [
      {
        id: 'z_classic',
        name: 'Classic Z',
        category: 'z_shapes',
        render: () => svg(`
          <path d="M20,20 H80 L20,80 H80" fill="none" stroke="#6366F1" stroke-width="14" stroke-linecap="round" stroke-linejoin="miter"/>
        `)
      },
      {
        id: 'z_block',
        name: 'Block Z-Shape',
        category: 'z_shapes',
        render: () => svg(`
          <polygon points="20,16 82,16 82,34 44,70 82,70 82,88 18,88 18,70 56,34 20,34" fill="#3B82F6" stroke="#1E40AF" stroke-width="3"/>
        `)
      },
      {
        id: 'z_zigzag',
        name: 'Zigzag Z',
        category: 'z_shapes',
        render: () => svg(`
          <polyline points="20,22 80,22 20,50 80,78 20,78" fill="none" stroke="#EC4899" stroke-width="12" stroke-linecap="round" stroke-linejoin="bevel"/>
        `)
      },
      {
        id: 'z_curved',
        name: 'Curved Z-Glyph',
        category: 'z_shapes',
        render: () => svg(`
          <path d="M22,25 C45,15 75,25 78,25 L24,75 C24,75 55,85 78,75" fill="none" stroke="#059669" stroke-width="12" stroke-linecap="round"/>
        `)
      }
    ],

    rectangles: [
      {
        id: 'rect_vertical',
        name: 'Vertical Pillar',
        category: 'rectangles',
        render: () => svg(`
          <rect x="32" y="12" width="36" height="76" rx="8" fill="#14B8A6" stroke="#0F766E" stroke-width="4"/>
          <line x1="50" y1="20" x2="50" y2="80" stroke="#CCFBF1" stroke-width="4" stroke-linecap="round"/>
        `)
      },
      {
        id: 'rect_horizontal',
        name: 'Horizontal Bar',
        category: 'rectangles',
        render: () => svg(`
          <rect x="12" y="32" width="76" height="36" rx="8" fill="#F59E0B" stroke="#B45309" stroke-width="4"/>
          <line x1="20" y1="50" x2="80" y2="50" stroke="#FEF3C7" stroke-width="4" stroke-linecap="round"/>
        `)
      },
      {
        id: 'rect_split',
        name: 'Split Rectangle',
        category: 'rectangles',
        render: () => svg(`
          <g>
            <rect x="18" y="20" width="32" height="60" rx="4" fill="#3B82F6"/>
            <rect x="50" y="20" width="32" height="60" rx="4" fill="#F43F5E"/>
            <rect x="18" y="20" width="64" height="60" rx="4" fill="none" stroke="#1E293B" stroke-width="4"/>
          </g>
        `)
      },
      {
        id: 'rect_striped',
        name: 'Striped Rectangle',
        category: 'rectangles',
        render: () => svg(`
          <rect x="16" y="22" width="68" height="56" rx="6" fill="#8B5CF6" stroke="#5B21B6" stroke-width="4"/>
          <rect x="26" y="22" width="12" height="56" fill="#DDD6FE"/>
          <rect x="52" y="22" width="12" height="56" fill="#DDD6FE"/>
        `)
      }
    ],

    faces: [
      {
        id: 'face_happy',
        name: 'Happy Face',
        category: 'faces',
        render: () => svg(`
          <circle cx="50" cy="50" r="40" fill="#FCD34D" stroke="#D97706" stroke-width="4"/>
          <circle cx="36" cy="40" r="5" fill="#78350F"/>
          <circle cx="64" cy="40" r="5" fill="#78350F"/>
          <path d="M34,58 Q50,78 66,58" fill="none" stroke="#78350F" stroke-width="5" stroke-linecap="round"/>
          <circle cx="28" cy="54" r="5" fill="#F87171" opacity="0.6"/>
          <circle cx="72" cy="54" r="5" fill="#F87171" opacity="0.6"/>
        `)
      },
      {
        id: 'face_wink',
        name: 'Winking Face',
        category: 'faces',
        render: () => svg(`
          <circle cx="50" cy="50" r="40" fill="#FDE047" stroke="#CA8A04" stroke-width="4"/>
          <circle cx="36" cy="40" r="5" fill="#713F12"/>
          <path d="M58,40 Q64,34 70,40" fill="none" stroke="#713F12" stroke-width="5" stroke-linecap="round"/>
          <path d="M34,60 Q50,76 66,60" fill="none" stroke="#713F12" stroke-width="5" stroke-linecap="round"/>
        `)
      },
      {
        id: 'face_star',
        name: 'Star Eyes Face',
        category: 'faces',
        render: () => svg(`
          <circle cx="50" cy="50" r="40" fill="#FDE68A" stroke="#B45309" stroke-width="4"/>
          <polygon points="36,32 39,40 47,40 40,45 43,53 36,48 29,53 32,45 25,40 33,40" fill="#D97706"/>
          <polygon points="64,32 67,40 75,40 68,45 71,53 64,48 57,53 60,45 53,40 61,40" fill="#D97706"/>
          <path d="M36,66 Q50,78 64,66" fill="#B45309" stroke="#B45309" stroke-width="2"/>
        `)
      },
      {
        id: 'face_glasses',
        name: 'Cool Sunglasses Face',
        category: 'faces',
        render: () => svg(`
          <circle cx="50" cy="50" r="40" fill="#FCD34D" stroke="#D97706" stroke-width="4"/>
          <rect x="22" y="34" width="24" height="18" rx="4" fill="#1E293B"/>
          <rect x="54" y="34" width="24" height="18" rx="4" fill="#1E293B"/>
          <line x1="46" y1="42" x2="54" y2="42" stroke="#1E293B" stroke-width="4"/>
          <path d="M38,65 Q50,75 62,65" fill="none" stroke="#78350F" stroke-width="4" stroke-linecap="round"/>
        `)
      }
    ],

    fruits: [
      {
        id: 'fruit_apple',
        name: 'Red Apple',
        category: 'fruits',
        render: () => svg(`
          <path d="M50,28 C42,16 20,20 18,45 C16,70 38,88 50,88 C62,88 84,70 82,45 C80,20 58,16 50,28 Z" fill="#EF4444" stroke="#B91C1C" stroke-width="4"/>
          <path d="M50,28 C50,16 56,10 60,8" fill="none" stroke="#78350F" stroke-width="4" stroke-linecap="round"/>
          <path d="M54,16 Q66,12 66,22 C60,24 54,20 54,16 Z" fill="#22C55E"/>
        `)
      },
      {
        id: 'fruit_strawberry',
        name: 'Strawberry',
        category: 'fruits',
        render: () => svg(`
          <path d="M50,88 C25,75 18,45 26,28 C34,16 66,16 74,28 C82,45 75,75 50,88 Z" fill="#F43F5E" stroke="#BE123C" stroke-width="4"/>
          <!-- seeds -->
          <circle cx="40" cy="40" r="2" fill="#FEF08A"/>
          <circle cx="60" cy="40" r="2" fill="#FEF08A"/>
          <circle cx="50" cy="54" r="2" fill="#FEF08A"/>
          <circle cx="42" cy="68" r="2" fill="#FEF08A"/>
          <circle cx="58" cy="68" r="2" fill="#FEF08A"/>
          <!-- leaves -->
          <path d="M50,24 L38,14 L44,24 L50,12 L56,24 L62,14 Z" fill="#10B981" stroke="#047857" stroke-width="2"/>
        `)
      },
      {
        id: 'fruit_banana',
        name: 'Banana',
        category: 'fruits',
        render: () => svg(`
          <path d="M78,16 C78,16 58,26 40,48 C24,68 20,84 20,84 C20,84 34,84 54,66 C72,50 82,24 82,20 Z" fill="#FACC15" stroke="#CA8A04" stroke-width="4" stroke-linejoin="round"/>
          <path d="M78,16 L84,12" stroke="#78350F" stroke-width="4" stroke-linecap="round"/>
        `)
      },
      {
        id: 'fruit_orange',
        name: 'Orange',
        category: 'fruits',
        render: () => svg(`
          <circle cx="50" cy="52" r="38" fill="#F97316" stroke="#C2410C" stroke-width="4"/>
          <circle cx="50" cy="20" r="3" fill="#65A30D"/>
          <path d="M50,20 Q64,12 62,24 Z" fill="#84CC16"/>
        `)
      }
    ],

    kitchen: [
      {
        id: 'kit_cup',
        name: 'Tea Cup',
        category: 'kitchen objects',
        render: () => svg(`
          <path d="M22,30 H68 V58 C68,72 58,80 45,80 C32,80 22,72 22,58 Z" fill="#0EA5E9" stroke="#0369A1" stroke-width="4"/>
          <path d="M68,38 C80,38 82,60 68,62" fill="none" stroke="#0369A1" stroke-width="5" stroke-linecap="round"/>
          <line x1="16" y1="84" x2="74" y2="84" stroke="#0369A1" stroke-width="5" stroke-linecap="round"/>
        `)
      },
      {
        id: 'kit_teapot',
        name: 'Teapot',
        category: 'kitchen objects',
        render: () => svg(`
          <circle cx="48" cy="54" r="28" fill="#A855F7" stroke="#7E22CE" stroke-width="4"/>
          <!-- spout -->
          <path d="M24,52 C14,50 12,36 20,34" fill="none" stroke="#7E22CE" stroke-width="6" stroke-linecap="round"/>
          <!-- handle -->
          <path d="M72,42 C86,42 86,66 72,66" fill="none" stroke="#7E22CE" stroke-width="5" stroke-linecap="round"/>
          <!-- lid -->
          <ellipse cx="48" cy="26" rx="14" ry="4" fill="#C084FC" stroke="#7E22CE" stroke-width="3"/>
          <circle cx="48" cy="18" r="4" fill="#F59E0B"/>
        `)
      },
      {
        id: 'kit_bowl',
        name: 'Soup Bowl & Spoon',
        category: 'kitchen objects',
        render: () => svg(`
          <path d="M14,44 H86 C86,76 68,84 50,84 C32,84 14,76 14,44 Z" fill="#F59E0B" stroke="#D97706" stroke-width="4"/>
          <line x1="30" y1="84" x2="70" y2="84" stroke="#D97706" stroke-width="6" stroke-linecap="round"/>
          <!-- spoon -->
          <path d="M65,20 L50,48" stroke="#64748B" stroke-width="4" stroke-linecap="round"/>
        `)
      },
      {
        id: 'kit_rollingpin',
        name: 'Rolling Pin',
        category: 'kitchen objects',
        render: () => svg(`
          <rect x="22" y="40" width="56" height="20" rx="3" fill="#D97706" stroke="#92400E" stroke-width="3"/>
          <rect x="10" y="46" width="12" height="8" rx="2" fill="#B45309"/>
          <rect x="78" y="46" width="12" height="8" rx="2" fill="#B45309"/>
        `)
      }
    ],

    plants: [
      {
        id: 'plant_flower',
        name: 'Flower',
        category: 'plants',
        render: () => svg(`
          <g fill="#F43F5E" opacity="0.95">
            <circle cx="50" cy="30" r="14"/>
            <circle cx="70" cy="50" r="14"/>
            <circle cx="50" cy="70" r="14"/>
            <circle cx="30" cy="50" r="14"/>
          </g>
          <circle cx="50" cy="50" r="13" fill="#FBBF24" stroke="#D97706" stroke-width="3"/>
        `)
      },
      {
        id: 'plant_cactus',
        name: 'Cactus in Pot',
        category: 'plants',
        render: () => svg(`
          <!-- pot -->
          <polygon points="32,68 68,68 64,88 36,88" fill="#F97316" stroke="#C2410C" stroke-width="3"/>
          <!-- body -->
          <rect x="42" y="24" width="16" height="44" rx="8" fill="#10B981" stroke="#047857" stroke-width="3"/>
          <!-- arms -->
          <path d="M42,42 H30 V32" fill="none" stroke="#047857" stroke-width="4" stroke-linecap="round"/>
          <path d="M58,50 H70 V40" fill="none" stroke="#047857" stroke-width="4" stroke-linecap="round"/>
        `)
      },
      {
        id: 'plant_tree',
        name: 'Happy Tree',
        category: 'plants',
        render: () => svg(`
          <rect x="44" y="60" width="12" height="28" rx="2" fill="#78350F"/>
          <polygon points="50,14 78,42 66,42 82,64 18,64 34,42 22,42" fill="#22C55E" stroke="#15803D" stroke-width="4" stroke-linejoin="round"/>
        `)
      },
      {
        id: 'plant_mushroom',
        name: 'Mushroom',
        category: 'plants',
        render: () => svg(`
          <!-- stalk -->
          <path d="M38,55 Q50,50 62,55 L60,86 Q50,88 40,86 Z" fill="#F1F5F9" stroke="#94A3B8" stroke-width="3"/>
          <!-- cap -->
          <path d="M16,55 Q50,14 84,55 C70,60 30,60 16,55 Z" fill="#EF4444" stroke="#B91C1C" stroke-width="4"/>
          <circle cx="36" cy="38" r="4" fill="#FFFFFF"/>
          <circle cx="60" cy="36" r="5" fill="#FFFFFF"/>
          <circle cx="50" cy="48" r="3" fill="#FFFFFF"/>
        `)
      }
    ],

    animals: [
      {
        id: 'animal_cat',
        name: 'Cat',
        category: 'animals',
        render: () => svg(`
          <!-- ears -->
          <polygon points="26,44 20,18 42,32" fill="#F59E0B" stroke="#B45309" stroke-width="3"/>
          <polygon points="74,44 80,18 58,32" fill="#F59E0B" stroke="#B45309" stroke-width="3"/>
          <!-- head -->
          <circle cx="50" cy="54" r="32" fill="#FBBF24" stroke="#B45309" stroke-width="4"/>
          <circle cx="38" cy="50" r="4" fill="#1E293B"/>
          <circle cx="62" cy="50" r="4" fill="#1E293B"/>
          <polygon points="48,60 52,60 50,64" fill="#F43F5E"/>
          <line x1="26" y1="58" x2="14" y2="56" stroke="#78350F" stroke-width="2"/>
          <line x1="26" y1="62" x2="14" y2="64" stroke="#78350F" stroke-width="2"/>
          <line x1="74" y1="58" x2="86" y2="56" stroke="#78350F" stroke-width="2"/>
          <line x1="74" y1="62" x2="86" y2="64" stroke="#78350F" stroke-width="2"/>
        `)
      },
      {
        id: 'animal_bunny',
        name: 'Bunny',
        category: 'animals',
        render: () => svg(`
          <!-- ears -->
          <ellipse cx="36" cy="24" rx="8" ry="18" fill="#FBCFE8" stroke="#DB2777" stroke-width="3"/>
          <ellipse cx="64" cy="24" rx="8" ry="18" fill="#FBCFE8" stroke="#DB2777" stroke-width="3"/>
          <!-- head -->
          <circle cx="50" cy="58" r="28" fill="#FDF2F8" stroke="#DB2777" stroke-width="4"/>
          <circle cx="40" cy="55" r="4" fill="#1E293B"/>
          <circle cx="60" cy="55" r="4" fill="#1E293B"/>
          <ellipse cx="50" cy="64" rx="3" ry="2" fill="#F43F5E"/>
        `)
      },
      {
        id: 'animal_frog',
        name: 'Frog',
        category: 'animals',
        render: () => svg(`
          <!-- eye bumps -->
          <circle cx="32" cy="34" r="14" fill="#86EFAC" stroke="#16A34A" stroke-width="3"/>
          <circle cx="68" cy="34" r="14" fill="#86EFAC" stroke="#16A34A" stroke-width="3"/>
          <circle cx="32" cy="34" r="5" fill="#1E293B"/>
          <circle cx="68" cy="34" r="5" fill="#1E293B"/>
          <!-- head -->
          <ellipse cx="50" cy="58" rx="36" ry="26" fill="#4ADE80" stroke="#16A34A" stroke-width="4"/>
          <path d="M36,66 Q50,76 64,66" fill="none" stroke="#14532D" stroke-width="3" stroke-linecap="round"/>
        `)
      },
      {
        id: 'animal_bird',
        name: 'Bluebird',
        category: 'animals',
        render: () => svg(`
          <circle cx="48" cy="50" r="30" fill="#38BDF8" stroke="#0284C7" stroke-width="4"/>
          <circle cx="58" cy="44" r="4" fill="#0F172A"/>
          <polygon points="68,44 86,48 68,54" fill="#F59E0B" stroke="#D97706" stroke-width="2"/>
          <path d="M26,50 Q40,64 30,76" fill="none" stroke="#0284C7" stroke-width="4" stroke-linecap="round"/>
        `)
      }
    ]
  };

  // Flattened array of all general visual items
  const ALL_ITEMS = [];
  Object.keys(CATALOG).forEach(cat => {
    CATALOG[cat].forEach(item => ALL_ITEMS.push(item));
  });

  // ==========================================
  // SYMMETRY / DISCRIMINATION TEMPLATES (GAME 3)
  // Asymmetric test glyphs designed to test horizontal/vertical mirroring,
  // 90/180 rotations, and subtle feature alterations.
  // ==========================================
  const SYMMETRY_TEMPLATES = [
    {
      id: 'sym_flag',
      name: 'Asymmetric Flag Glyph',
      baseColor: '#6366F1',
      strokeColor: '#4338CA',
      // Base path is asymmetrical
      svgPath: 'M25,85 L25,18 L70,32 L25,48 Z',
      accent: '<circle cx="65" cy="32" r="5" fill="#F43F5E"/>',
      // Altered version has double notch / extra circle
      alteredSvg: `
        <path d="M25,85 L25,18 L70,32 L40,40 L70,48 L25,56 Z" fill="#6366F1" stroke="#4338CA" stroke-width="4" stroke-linejoin="round"/>
        <circle cx="65" cy="32" r="5" fill="#F43F5E"/>
      `
    },
    {
      id: 'sym_hook',
      name: 'Notched Angular L-Hook',
      baseColor: '#0EA5E9',
      strokeColor: '#0369A1',
      svgPath: 'M25,20 H55 V50 H80 V80 H25 Z',
      accent: '<polygon points="70,70 76,70 76,76" fill="#FBBF24"/>',
      alteredSvg: `
        <path d="M25,20 H55 V42 H72 V58 H55 V80 H25 Z" fill="#0EA5E9" stroke="#0369A1" stroke-width="4" stroke-linejoin="round"/>
        <circle cx="65" cy="50" r="4" fill="#FBBF24"/>
      `
    },
    {
      id: 'sym_z_asym',
      name: 'Asymmetric Z-Crest',
      baseColor: '#EC4899',
      strokeColor: '#BE185D',
      svgPath: 'M20,24 H80 L35,55 H80 V78 H20 L65,47 H20 Z',
      accent: '<circle cx="75" cy="24" r="5" fill="#F59E0B"/>',
      alteredSvg: `
        <path d="M20,24 H80 L35,55 H65 V66 H80 V78 H20 L65,47 H20 Z" fill="#EC4899" stroke="#BE185D" stroke-width="4" stroke-linejoin="round"/>
        <circle cx="75" cy="24" r="5" fill="#F59E0B"/>
      `
    },
    {
      id: 'sym_key',
      name: 'Key Shape',
      baseColor: '#10B981',
      strokeColor: '#047857',
      svgPath: 'M25,44 H70 V32 H80 V68 H70 V56 H25 Z',
      accent: '<circle cx="34" cy="50" r="5" fill="#FEF08A"/>',
      alteredSvg: `
        <path d="M25,44 H62 V32 H72 V44 H82 V68 H72 V56 H25 Z" fill="#10B981" stroke="#047857" stroke-width="4" stroke-linejoin="round"/>
        <circle cx="34" cy="50" r="5" fill="#FEF08A"/>
      `
    },
    {
      id: 'sym_pointer',
      name: 'Directional Crest',
      baseColor: '#F59E0B',
      strokeColor: '#B45309',
      svgPath: 'M20,30 L60,18 L80,50 L40,82 L20,70 Z',
      accent: '<circle cx="68" cy="46" r="6" fill="#6366F1"/>',
      alteredSvg: `
        <path d="M20,30 L60,18 L70,40 L82,50 L40,82 L20,70 Z" fill="#F59E0B" stroke="#B45309" stroke-width="4" stroke-linejoin="round"/>
        <circle cx="72" cy="46" r="6" fill="#6366F1"/>
      `
    }
  ];

  /**
   * Helper to build SVG for symmetry test variations:
   * - 'original': exact target
   * - 'mirrored_horizontal': flipped across X (left-right reflection)
   * - 'mirrored_vertical': flipped across Y (upside-down inversion)
   * - 'rotated_90': 90 deg clockwise
   * - 'rotated_180': 180 deg
   * - 'visually_similar': subtle geometric mutation
   */
  function renderSymmetryVariant(template, transformType) {
    if (transformType === 'visually_similar') {
      return svg(template.alteredSvg, "0 0 100 100", "stimulus-symmetry");
    }

    let transformAttr = '';
    switch (transformType) {
      case 'mirrored_horizontal':
        // Flip horizontally around center 50,50
        transformAttr = 'transform="translate(100, 0) scale(-1, 1)"';
        break;
      case 'mirrored_vertical':
        // Flip vertically around center 50,50
        transformAttr = 'transform="translate(0, 100) scale(1, -1)"';
        break;
      case 'rotated_90':
        transformAttr = 'transform="rotate(90 50 50)"';
        break;
      case 'rotated_180':
        transformAttr = 'transform="rotate(180 50 50)"';
        break;
      case 'original':
      default:
        transformAttr = '';
        break;
    }

    const content = `
      <g ${transformAttr}>
        <path d="${template.svgPath}" fill="${template.baseColor}" stroke="${template.strokeColor}" stroke-width="4" stroke-linejoin="round"/>
        ${template.accent || ''}
      </g>
    `;

    return svg(content, "0 0 100 100", "stimulus-symmetry");
  }

  // Public API
  return {
    CATALOG,
    ALL_ITEMS,
    SYMMETRY_TEMPLATES,

    // Get a random stimulus from all categories or a specific category
    getRandomStimulus(category = null) {
      if (category && CATALOG[category]) {
        const pool = CATALOG[category];
        return pool[Math.floor(Math.random() * pool.length)];
      }
      return ALL_ITEMS[Math.floor(Math.random() * ALL_ITEMS.length)];
    },

    // Get N distinct random stimuli from the catalog
    getDistinctStimuli(count = 4, excludeId = null) {
      const available = ALL_ITEMS.filter(item => item.id !== excludeId);
      // Fisher-Yates shuffle
      const shuffled = [...available];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled.slice(0, count);
    },

    // Render symmetry variant
    renderSymmetryVariant,

    // Get a random symmetry challenge round configuration
    getSymmetryChallenge(difficulty = 1) {
      const template = SYMMETRY_TEMPLATES[Math.floor(Math.random() * SYMMETRY_TEMPLATES.length)];

      // Build distractors based on difficulty
      // Distractor 1: Mirrored horizontal
      // Distractor 2: Mirrored vertical OR rotated
      // Distractor 3: Visually similar shape
      const candidateDistractors = [
        { type: 'mirrored_horizontal', label: 'Horizontal Mirror', category: 'distractor_1' },
        { type: difficulty > 2 ? 'rotated_90' : 'mirrored_vertical', label: 'Vertical / Rotated', category: 'distractor_2' },
        { type: 'visually_similar', label: 'Visually Similar Shape', category: 'distractor_3' }
      ];

      return {
        template,
        targetVariant: { type: 'original', label: 'Exact Match', isTarget: true },
        distractors: candidateDistractors.map(d => ({
          ...d,
          isTarget: false
        }))
      };
    }
  };
})();

if (typeof window !== 'undefined') {
  window.StimuliLibrary = StimuliLibrary;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = StimuliLibrary;
}

