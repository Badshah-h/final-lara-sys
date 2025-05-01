/**
 * AI Configuration Types
 */

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  version: string;
  description: string;
  isActive: boolean;
  apiKey?: string;
  configuration: AIModelConfiguration;
}

export interface AIModelConfiguration {
  temperature: number;
  maxTokens: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stopSequences?: string[];
}

export interface RoutingRule {
  id: string;
  name: string;
  description: string;
  modelId: string;
  conditions: RuleCondition[];
  priority: number;
}

export interface RuleCondition {
  field: string;
  operator: "equals" | "contains" | "startsWith" | "endsWith" | "regex";
  value: string;
}

export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  content: string;
  variables: string[];
  category: string;
  isDefault?: boolean;
}

export interface ResponseFormat {
  id: string;
  name: string;
  format: "conversational" | "structured" | "bullet-points" | "step-by-step";
  length: "concise" | "medium" | "detailed";
  tone: "professional" | "friendly" | "casual" | "technical";
  options: {
    useHeadings: boolean;
    useBulletPoints: boolean;
    includeLinks: boolean;
    formatCodeBlocks: boolean;
  };
}

export interface BrandVoice {
  brandName: string;
  positioning: "start" | "inline" | "end";
  signature: string;
}

export interface FollowUpSuggestion {
  id: string;
  text: string;
  description: string;
  order: number;
}
