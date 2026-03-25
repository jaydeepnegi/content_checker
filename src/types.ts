import { Type } from "@google/genai";

export enum Verdict {
  REAL = "Real",
  MISLEADING = "Misleading",
  FAKE = "Fake",
  UNVERIFIED = "Unverified"
}

export enum RiskLevel {
  LOW = "Low",
  MEDIUM = "Medium",
  HIGH = "High"
}

export interface AnalysisResult {
  verdict: Verdict;
  confidenceScore: number;
  toneAnalysis: string;
  suspiciousStatements: string[];
  missingInformation: string[];
  riskLevel: RiskLevel;
  explanation: string;
  verifiability: string;
}

export const AnalysisSchema = {
  type: Type.OBJECT,
  properties: {
    verdict: {
      type: Type.STRING,
      enum: Object.values(Verdict),
      description: "The classification of the article."
    },
    confidenceScore: {
      type: Type.NUMBER,
      description: "Confidence score from 0 to 100."
    },
    toneAnalysis: {
      type: Type.STRING,
      description: "Analysis of the article's tone (neutral, biased, sensational)."
    },
    suspiciousStatements: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of specific sentences or phrases that raise suspicion."
    },
    missingInformation: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of missing sources or weak evidence."
    },
    riskLevel: {
      type: Type.STRING,
      enum: Object.values(RiskLevel),
      description: "The risk level of the article."
    },
    explanation: {
      type: Type.STRING,
      description: "A brief but clear explanation of the verdict."
    },
    verifiability: {
      type: Type.STRING,
      description: "Check if claims appear verifiable or vague."
    }
  },
  required: [
    "verdict",
    "confidenceScore",
    "toneAnalysis",
    "suspiciousStatements",
    "missingInformation",
    "riskLevel",
    "explanation",
    "verifiability"
  ]
};
