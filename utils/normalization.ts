export interface NormalizedItem {
    standardName: string;
    imageQuery: string;
    confidence: number;
    isCorrection: boolean;
    localImage?: string;
}

// Dictionary mapping: All keys must be lowercase
// Value: { standard: Display Name, query: Image Prompt Context, localImage?: string }
const VEGETABLE_MAP: Record<string, { standard: string, query: string, localImage?: string }> = {
    // English Standard
    'tomato': { standard: 'Tomato', query: 'fresh red indian tomato organic vegetable', localImage: '/produce/tomatoes.jpg' },
    'tomatoes': { standard: 'Tomatoes', query: 'fresh red indian tomato organic vegetable', localImage: '/produce/tomatoes.jpg' },
    'onion': { standard: 'Onion', query: 'fresh red onion indian vegetable organic', localImage: '/produce/onions.jpg' },
    'onions': { standard: 'Onions', query: 'fresh red onion indian vegetable organic', localImage: '/produce/onions.jpg' },
    'potato': { standard: 'Potato', query: 'fresh indian potato aloo vegetable earth', localImage: '/produce/potatoes.jpg' },
    'potatoes': { standard: 'Potatoes', query: 'fresh indian potato aloo vegetable earth', localImage: '/produce/potatoes.jpg' },
    'carrot': { standard: 'Carrot', query: 'fresh orange carrot vegetable organic root', localImage: '/produce/carrots.jpg' },
    'carrots': { standard: 'Carrots', query: 'fresh orange carrot vegetable organic root', localImage: '/produce/carrots.jpg' },
    'ladies finger': { standard: 'Ladies Finger (Okra)', query: 'fresh indian ladies finger okra green vegetable bhindi', localImage: '/produce/ladies-finger.jpg' },
    'okra': { standard: 'Ladies Finger (Okra)', query: 'fresh indian ladies finger okra green vegetable bhindi', localImage: '/produce/ladies-finger.jpg' },
    'brinjal': { standard: 'Brinjal (Eggplant)', query: 'fresh purple indian brinjal eggplant baingan vegetable', localImage: '/produce/brinjal.jpg' },
    'eggplant': { standard: 'Brinjal (Eggplant)', query: 'fresh purple indian brinjal eggplant baingan vegetable', localImage: '/produce/brinjal.jpg' },
    'green chilli': { standard: 'Green Chilies', query: 'fresh spicy green chilli indian vegetable mirchi', localImage: '/produce/green-chilies.jpg' },
    'green chili': { standard: 'Green Chilies', query: 'fresh spicy green chilli indian vegetable mirchi', localImage: '/produce/green-chilies.jpg' },
    'green chilies': { standard: 'Green Chilies', query: 'fresh spicy green chilli indian vegetable mirchi', localImage: '/produce/green-chilies.jpg' },
    'coriander': { standard: 'Coriander', query: 'fresh green coriander leaves bunch indian cilantro kothimeera', localImage: '/produce/coriander.jpg' },
    'spinach': { standard: 'Spinach (Palak)', query: 'fresh green spinach palak leaves indian vegetable', localImage: '/produce/spinach.jpg' },
    'mango': { standard: 'Mango', query: 'fresh ripe juicy golden yellow alphonso mango fruit', localImage: '/produce/mango.jpg' },
    'mangoes': { standard: 'Mango', query: 'fresh ripe juicy golden yellow alphonso mango fruit', localImage: '/produce/mango.jpg' },
    'raw banana': { standard: 'Raw Banana (kachha kela)', query: 'fresh raw green banana plantain cooking vegetable', localImage: '/produce/green-banana.jpg' },
    'green banana': { standard: 'Green Banana (kachha kela)', query: 'fresh raw green banana plantain cooking vegetable', localImage: '/produce/green-banana.jpg' },
    'banana': { standard: 'Green Banana (kachha kela)', query: 'fresh raw green banana plantain cooking vegetable', localImage: '/produce/green-banana.jpg' },
    'drumstick': { standard: 'Drumstick Leaves (Munagaku)', query: 'fresh drumstick leaves moringa oleifera munagaku', localImage: '/uploads/24e862ea-975e-422b-bd4d-8fbae9aa90c1-mungaku.jpeg' },
    'drumstick leaves': { standard: 'Drumstick Leaves (Munagaku)', query: 'fresh drumstick leaves moringa oleifera munagaku', localImage: '/uploads/24e862ea-975e-422b-bd4d-8fbae9aa90c1-mungaku.jpeg' },
    'moringa': { standard: 'Drumstick Leaves (Munagaku)', query: 'fresh drumstick leaves moringa oleifera munagaku', localImage: '/uploads/24e862ea-975e-422b-bd4d-8fbae9aa90c1-mungaku.jpeg' },
    'cabbage': { standard: 'Cabbage', query: 'fresh green cabbage indian vegetable' },
    'cauliflower': { standard: 'Cauliflower', query: 'fresh white cauliflower gobi indian vegetable' },
    'ginger': { standard: 'Ginger', query: 'fresh ginger root adrak indian spice' },
    'garlic': { standard: 'Garlic', query: 'fresh garlic bulbs lahsun indian spice' },
    'capsicum': { standard: 'Capsicum', query: 'fresh green capsicum bell pepper indian vegetable' },

    // Telugu
    'tamata': { standard: 'Tomato', query: 'fresh red indian tomato organic vegetable', localImage: '/produce/tomatoes.jpg' },
    'ullipaya': { standard: 'Onion', query: 'fresh red onion indian vegetable organic', localImage: '/produce/onions.jpg' },
    'bangaladumpa': { standard: 'Potato', query: 'fresh indian potato aloo vegetable earth', localImage: '/produce/potatoes.jpg' },
    'bendakaya': { standard: 'Ladies Finger (Okra)', query: 'fresh indian ladies finger okra green vegetable bhindi', localImage: '/produce/ladies-finger.jpg' },
    'vankaya': { standard: 'Brinjal (Eggplant)', query: 'fresh purple indian brinjal eggplant baingan vegetable', localImage: '/produce/brinjal.jpg' },
    'pachi mirchi': { standard: 'Green Chilies', query: 'fresh spicy green chilli indian vegetable mirchi', localImage: '/produce/green-chilies.jpg' },
    'kothimeera': { standard: 'Coriander', query: 'fresh green coriander leaves bunch indian cilantro kothimeera', localImage: '/produce/coriander.jpg' },
    'palakura': { standard: 'Spinach (Palak)', query: 'fresh green spinach palak leaves indian vegetable', localImage: '/produce/spinach.jpg' },
    'mamidikaya': { standard: 'Mango', query: 'fresh ripe juicy golden yellow alphonso mango fruit', localImage: '/produce/mango.jpg' },
    'aratikaya': { standard: 'Raw Banana (kachha kela)', query: 'fresh raw green banana plantain cooking vegetable', localImage: '/produce/green-banana.jpg' },
    'arati kaya': { standard: 'Raw Banana (kachha kela)', query: 'fresh raw green banana plantain cooking vegetable', localImage: '/produce/green-banana.jpg' },
    'munagaku': { standard: 'Drumstick Leaves (Munagaku)', query: 'fresh drumstick leaves moringa oleifera munagaku', localImage: '/uploads/24e862ea-975e-422b-bd4d-8fbae9aa90c1-mungaku.jpeg' },
    'munaga aaku': { standard: 'Drumstick Leaves (Munagaku)', query: 'fresh drumstick leaves moringa oleifera munagaku', localImage: '/uploads/24e862ea-975e-422b-bd4d-8fbae9aa90c1-mungaku.jpeg' },
    'allam': { standard: 'Ginger', query: 'fresh ginger root adrak indian spice' },
    'vellulli': { standard: 'Garlic', query: 'fresh garlic bulbs lahsun indian spice' },

    // Hindi
    'alu': { standard: 'Potato', query: 'fresh indian potato aloo vegetable earth', localImage: '/produce/potatoes.jpg' },
    'aloo': { standard: 'Potato', query: 'fresh indian potato aloo vegetable earth', localImage: '/produce/potatoes.jpg' },
    'pyaz': { standard: 'Onion', query: 'fresh red onion indian vegetable organic', localImage: '/produce/onions.jpg' },
    'tamatar': { standard: 'Tomato', query: 'fresh red indian tomato organic vegetable', localImage: '/produce/tomatoes.jpg' },
    'bhindi': { standard: 'Ladies Finger (Okra)', query: 'fresh indian ladies finger okra green vegetable bhindi', localImage: '/produce/ladies-finger.jpg' },
    'baingan': { standard: 'Brinjal (Eggplant)', query: 'fresh purple indian brinjal eggplant baingan vegetable', localImage: '/produce/brinjal.jpg' },
    'mirch': { standard: 'Green Chilies', query: 'fresh spicy green chilli indian vegetable mirchi', localImage: '/produce/green-chilies.jpg' },
    'dhaniya': { standard: 'Coriander', query: 'fresh green coriander leaves bunch indian cilantro', localImage: '/produce/coriander.jpg' },
    'palak': { standard: 'Spinach (Palak)', query: 'fresh green spinach palak leaves indian vegetable', localImage: '/produce/spinach.jpg' },
    'aam': { standard: 'Mango', query: 'fresh ripe juicy golden yellow alphonso mango fruit', localImage: '/produce/mango.jpg' },
    'kachha kela': { standard: 'Raw Banana (kachha kela)', query: 'fresh raw green banana plantain cooking vegetable', localImage: '/produce/green-banana.jpg' },
    'kela': { standard: 'Raw Banana (kachha kela)', query: 'fresh raw green banana plantain cooking vegetable', localImage: '/produce/green-banana.jpg' },
    'gobi': { standard: 'Cauliflower', query: 'fresh white cauliflower gobi indian vegetable' },
    'patta gobi': { standard: 'Cabbage', query: 'fresh green cabbage indian vegetable' },
    'adrak': { standard: 'Ginger', query: 'fresh ginger root adrak indian spice' },
    'lahsun': { standard: 'Garlic', query: 'fresh garlic bulbs lahsun indian spice' },
    'gajar': { standard: 'Carrot', query: 'fresh orange carrot vegetable organic root', localImage: '/produce/carrots.jpg' },
    'brinjal (eggplant)': { standard: 'Brinjal (Eggplant)', query: 'fresh purple indian brinjal eggplant baingan vegetable', localImage: '/produce/brinjal.jpg' },
    'brinjal (egg plant)': { standard: 'Brinjal (Eggplant)', query: 'fresh purple indian brinjal eggplant baingan vegetable', localImage: '/produce/brinjal.jpg' },
    'egg plant': { standard: 'Brinjal (Eggplant)', query: 'fresh purple indian brinjal eggplant baingan vegetable', localImage: '/produce/brinjal.jpg' },
    'ladies finger (okra)': { standard: 'Ladies Finger (Okra)', query: 'fresh indian ladies finger okra green vegetable bhindi', localImage: '/produce/ladies-finger.jpg' },
    'green banana (kachha kela)': { standard: 'Green Banana (kachha kela)', query: 'fresh raw green banana plantain cooking vegetable', localImage: '/produce/green-banana.jpg' },
    'raw banana (kachha kela)': { standard: 'Raw Banana (kachha kela)', query: 'fresh raw green banana plantain cooking vegetable', localImage: '/produce/green-banana.jpg' },
    'spinach (palak)': { standard: 'Spinach (Palak)', query: 'fresh green spinach palak leaves indian vegetable', localImage: '/produce/spinach.jpg' },
};

// Levenshtein implementation for typo tolerance
function levenshtein(a: string, b: string): number {
    const matrix = [];
    let i, j;
    for (i = 0; i <= b.length; i++) matrix[i] = [i];
    for (j = 0; j <= a.length; j++) matrix[0][j] = j;
    for (i = 1; i <= b.length; i++) {
        for (j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) == a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1));
            }
        }
    }
    return matrix[b.length][a.length];
}

export function normalizeItemInput(input: string): NormalizedItem {
    if (!input || input.length < 2) {
        return { standardName: input, imageQuery: input + ' vegetable', confidence: 0, isCorrection: false };
    }

    const lowerInput = input.trim().toLowerCase();

    // 1. Direct Match (O(1))
    if (VEGETABLE_MAP[lowerInput]) {
        return {
            standardName: VEGETABLE_MAP[lowerInput].standard,
            imageQuery: VEGETABLE_MAP[lowerInput].query,
            confidence: 1.0,
            isCorrection: lowerInput !== VEGETABLE_MAP[lowerInput].standard.toLowerCase(),
            localImage: VEGETABLE_MAP[lowerInput].localImage
        };
    }

    // 1b. Check without parentheses or inside parentheses, e.g. "Brinjal (Eggplant)" -> "brinjal" or "eggplant"
    const baseName = lowerInput.split(/[\(\[\/]/)[0].trim();
    if (baseName && VEGETABLE_MAP[baseName]) {
        return {
            standardName: VEGETABLE_MAP[baseName].standard,
            imageQuery: VEGETABLE_MAP[baseName].query,
            confidence: 0.95,
            isCorrection: false,
            localImage: VEGETABLE_MAP[baseName].localImage
        };
    }
    const insideParen = lowerInput.match(/[\(\[](.*?)[\)\]]/)?.[1]?.trim();
    if (insideParen && VEGETABLE_MAP[insideParen]) {
        return {
            standardName: VEGETABLE_MAP[insideParen].standard,
            imageQuery: VEGETABLE_MAP[insideParen].query,
            confidence: 0.95,
            isCorrection: false,
            localImage: VEGETABLE_MAP[insideParen].localImage
        };
    }

    // 2. Fuzzy Match (O(N)) - Search for closest key
    let bestMatchKey = '';
    let minDistance = Infinity;

    Object.keys(VEGETABLE_MAP).forEach(key => {
        const dist = levenshtein(lowerInput, key);
        if (dist < minDistance) {
            minDistance = dist;
            bestMatchKey = key;
        }
    });

    // Tolerance threshold: Allow 1 typo for short words, 2 for long
    const threshold = lowerInput.length > 4 ? 2 : 1;

    if (minDistance <= threshold) {
        return {
            standardName: VEGETABLE_MAP[bestMatchKey].standard,
            imageQuery: VEGETABLE_MAP[bestMatchKey].query,
            confidence: 0.8, // High confidence for typo fix
            isCorrection: true,
            localImage: VEGETABLE_MAP[bestMatchKey].localImage
        };
    }

    // 3. Fallback: Return original input but try to make the query smart
    return {
        standardName: input, // Keep original if unknown to avoid wrong correction
        imageQuery: `fresh organic ${input} vegetable fruit realistic`,
        confidence: 0.2,
        isCorrection: false
    };
}
