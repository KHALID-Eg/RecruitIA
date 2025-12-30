export interface AiMatchResult {
    extractedSkills: string[];
    matchScore: number;
    category: string;
    requiredSkills?: string[];
    matchedSkills?: string[];
    missingSkills?: string[];
}
