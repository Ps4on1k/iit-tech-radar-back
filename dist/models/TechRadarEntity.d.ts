export declare class TechRadarEntity {
    id: string;
    name: string;
    version: string;
    versionReleaseDate?: string;
    type: string;
    subtype?: string;
    category: string;
    description?: string;
    firstAdded: string;
    lastUpdated?: string;
    owner: string;
    stakeholders?: string[];
    dependencies?: Array<{
        name: string;
        version: string;
        optional?: boolean;
    }>;
    maturity: string;
    riskLevel: string;
    license: string;
    usageExamples?: string[];
    documentationUrl?: string;
    internalGuideUrl?: string;
    adoptionRate?: number;
    recommendedAlternatives?: string[];
    relatedTechnologies?: string[];
    endOfLifeDate?: string;
    supportStatus: string;
    upgradePath?: string;
    performanceImpact?: string;
    resourceRequirements?: {
        cpu: 'низкие' | 'средние' | 'высокие' | 'очень высокие';
        memory: 'низкие' | 'средние' | 'высокие' | 'очень высокие';
        storage: 'минимальные' | 'низкие' | 'средние' | 'высокие';
    };
    securityVulnerabilities?: string[];
    complianceStandards?: string[];
    communitySize?: number;
    contributionFrequency?: string;
    popularityIndex?: number;
    compatibility?: {
        os?: string[];
        browsers?: string[];
        frameworks?: string[];
    };
    costFactor?: string;
    vendorLockIn: boolean;
    businessCriticality: string;
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=TechRadarEntity.d.ts.map