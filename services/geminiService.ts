import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult, ThreatLevel } from "../types";

const ANALYSIS_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    verdict: {
      type: Type.STRING,
      enum: ["SAFE", "SUSPICIOUS", "MALICIOUS", "UNKNOWN"],
      description: "The overall safety verdict of the analyzed content."
    },
    confidence: {
      type: Type.NUMBER,
      description: "Confidence score between 0 and 100."
    },
    threatName: {
      type: Type.STRING,
      description: "If malicious, a potential name (e.g., 'Trojan.Win32.Generic', 'Reverse Shell'). Null if safe."
    },
    summary: {
      type: Type.STRING,
      description: "A brief, high-level summary of findings."
    },
    detectedPatterns: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of specific suspicious patterns found (e.g., 'Base64 Obfuscation', 'System Call Injection')."
    },
    recommendation: {
      type: Type.STRING,
      description: "Actionable advice for the user."
    },
    technicalDetails: {
      type: Type.STRING,
      description: "Deep technical explanation of why the verdict was chosen."
    }
  },
  required: ["verdict", "confidence", "summary", "detectedPatterns", "recommendation", "technicalDetails"]
};

export const analyzeContent = async (content: string, filename: string): Promise<AnalysisResult> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API Key missing");
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
      Act as a senior cybersecurity malware analyst. Analyze the following file content (filename: ${filename}) for potential security threats, malicious logic, Trojans, viruses, or suspicious obfuscation.

      Focus on:
      1. Dangerous system calls (exec, system, spawn).
      2. Obfuscation techniques (base64, packer signatures, eval).
      3. Network activity (reverse shells, data exfiltration).
      4. Persistence mechanisms (registry edits, startup folders).
      5. Common malware signatures.

      If the content is harmless code or plain text, mark it as SAFE.
      If it contains dangerous patterns but is ambiguous, mark as SUSPICIOUS.
      If it is clearly harmful, mark as MALICIOUS.

      FILE CONTENT START:
      ${content.slice(0, 30000)} 
      FILE CONTENT END
    `;

    // We restrict input to 30k chars to stay safe within token limits for this demo, 
    // though Gemini 1.5/2.0 can handle much more.

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: ANALYSIS_SCHEMA,
        temperature: 0.1, // Low temperature for analytical precision
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    return JSON.parse(text) as AnalysisResult;

  } catch (error) {
    console.error("Analysis failed", error);
    return {
      verdict: ThreatLevel.UNKNOWN,
      confidence: 0,
      threatName: "Analysis Failed",
      summary: "Could not complete analysis due to an error.",
      detectedPatterns: [],
      recommendation: "Check network connection or API key.",
      technicalDetails: error instanceof Error ? error.message : "Unknown error"
    };
  }
};