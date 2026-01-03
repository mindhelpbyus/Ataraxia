
export type ResourceType = 'emergency' | 'suicide' | 'domestic_violence' | 'substance_use' | 'poison_control' | 'general';
export type ResourceMethod = 'call' | 'text' | 'chat' | 'call_text_chat';

export interface CrisisResource {
    id: string;
    name: string;
    number: string;
    description: string;
    type: ResourceType;
    method: ResourceMethod;
    availability: string;
    website?: string;
    languages?: string[];
}

export const CRISIS_RESOURCES: Record<string, CrisisResource[]> = {
    'US': [
        {
            id: 'us-988',
            name: 'Suicide & Crisis Lifeline',
            number: '988',
            description: 'Free and confidential support for people in distress, prevention and crisis resources.',
            type: 'suicide',
            method: 'call_text_chat',
            availability: '24/7',
            website: 'https://988lifeline.org',
            languages: ['English', 'Spanish']
        },
        {
            id: 'us-911',
            name: 'Emergency Services',
            number: '911',
            description: 'Police, Ambulance, and Fire services for immediate emergencies.',
            type: 'emergency',
            method: 'call',
            availability: '24/7'
        },
        {
            id: 'us-ctl',
            name: 'Crisis Text Line',
            number: 'Text HOME to 741741',
            description: 'Free, 24/7 support for those in crisis. Text from anywhere in the US.',
            type: 'general',
            method: 'text',
            availability: '24/7',
            website: 'https://www.crisistextline.org'
        },
        {
            id: 'us-dv',
            name: 'National Domestic Violence Hotline',
            number: '1-800-799-SAFE (7233)',
            description: 'Confidential support for anyone affected by domestic violence.',
            type: 'domestic_violence',
            method: 'call_text_chat',
            availability: '24/7',
            website: 'https://www.thehotline.org'
        },
        {
            id: 'us-samhsa',
            name: 'SAMHSA National Helpline',
            number: '1-800-662-HELP (4357)',
            description: 'Treatment referral and information service for substance use and mental health.',
            type: 'substance_use',
            method: 'call',
            availability: '24/7',
            languages: ['English', 'Spanish']
        }
    ],
    'IN': [
        {
            id: 'in-112',
            name: 'National Emergency Number',
            number: '112',
            description: 'All-in-one emergency number for Police, Fire, and Ambulance.',
            type: 'emergency',
            method: 'call',
            availability: '24/7'
        },
        {
            id: 'in-vandrevala',
            name: 'Vandrevala Foundation',
            number: '1860 266 2345',
            description: 'Free mental health counseling and crisis support.',
            type: 'suicide',
            method: 'call',
            availability: '24/7',
            languages: ['English', 'Hindi', 'Regional']
        },
        {
            id: 'in-icall',
            name: 'iCall',
            number: '9152987821',
            description: 'Psychosocial helpline run by TISS.',
            type: 'general',
            method: 'call',
            availability: 'Mon-Sat, 8 AM - 10 PM',
            languages: ['English', 'Hindi', 'Marathi']
        },
        {
            id: 'in-women',
            name: 'Women Helpline',
            number: '1091',
            description: 'Emergency helpline for women in distress.',
            type: 'domestic_violence',
            method: 'call',
            availability: '24/7'
        }
    ],
    'GB': [
        {
            id: 'gb-999',
            name: 'Emergency Services',
            number: '999',
            description: 'Police, Ambulance, Fire, and Coastguard.',
            type: 'emergency',
            method: 'call',
            availability: '24/7'
        },
        {
            id: 'gb-samaritans',
            name: 'Samaritans',
            number: '116 123',
            description: 'Whatever you\'re going through, a Samaritan will face it with you.',
            type: 'suicide',
            method: 'call',
            availability: '24/7'
        },
        {
            id: 'gb-shout',
            name: 'SHOUT',
            number: 'Text SHOUT to 85258',
            description: 'Free, confidential, 24/7 text messaging support service.',
            type: 'general',
            method: 'text',
            availability: '24/7'
        },
        {
            id: 'gb-refuge',
            name: 'National Domestic Abuse Helpline',
            number: '0808 2000 247',
            description: 'Free and confidential advice for women experiencing domestic abuse.',
            type: 'domestic_violence',
            method: 'call',
            availability: '24/7'
        }
    ],
    'default': [
        {
            id: 'def-112',
            name: 'International Emergency Number',
            number: '112',
            description: 'Common emergency number in many countries (EU and others).',
            type: 'emergency',
            method: 'call',
            availability: '24/7'
        },
        {
            id: 'def-befrienders',
            name: 'Befrienders Worldwide',
            number: 'befrienders.org',
            description: 'Visit website to find a helpline near you.',
            type: 'general',
            method: 'chat',
            availability: 'Varies',
            website: 'https://www.befrienders.org'
        }
    ]
};

export interface RiskFlags {
    suicide?: boolean;
    violence?: boolean;
    substance?: boolean;
}

export function getCrisisResources(countryCode: string, risks?: RiskFlags): CrisisResource[] {
    const allResources = CRISIS_RESOURCES[countryCode] || CRISIS_RESOURCES['default'];

    if (!risks) {
        // Return all if no specific risks provided (or maybe just emergency + general?)
        // For now, return all to be safe.
        return allResources;
    }

    // Filter based on risks
    return allResources.filter(resource => {
        // Always show emergency and general
        if (resource.type === 'emergency' || resource.type === 'general') return true;

        // Show suicide resources if suicide risk
        if (risks.suicide && resource.type === 'suicide') return true;

        // Show domestic violence resources if violence risk
        if (risks.violence && resource.type === 'domestic_violence') return true;

        // Show substance use resources if substance risk
        if (risks.substance && resource.type === 'substance_use') return true;

        return false;
    });
}
