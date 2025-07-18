
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Customer, Agent, Disposition } from '../types';

if (!import.meta.env.VITE_API_KEY) {
  console.warn("VITE_API_KEY environment variable not set for Gemini. AI features will be disabled.");
}

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_API_KEY || '');

export const generateReportSummary = async (
    reportData: { customers: Customer[], agents: Agent[], dispositions: Disposition[] },
    reportType: string
): Promise<string> => {
    if (!import.meta.env.VITE_API_KEY) {
        return "Gemini API key is not configured. Please set the VITE_API_KEY environment variable.";
    }

    const prompt = `
        You are a data analyst for a fundraising company called PFFPNC.
        Analyze the following data for a "${reportType}" report and provide a concise summary with actionable insights.

        Data Overview:
        - Total Customers: ${reportData.customers.length}
        - Total Agents: ${reportData.agents.length}
        - Total Dispositions: ${reportData.dispositions.length}

        Key agents:
        ${reportData.agents.slice(0, 5).map(a => `- Agent ${a.agentNumber}: ${a.firstName} ${a.lastName}`).join('\n')}

        Key dispositions:
        ${reportData.dispositions.slice(0, 5).map(d => `- ${d.name} (Modifiers: ${d.modifiers.join(', ') || 'None'})`).join('\n')}

        Based on this data, what are the key trends, top-performing agents or strategies, and potential areas for improvement?
        Keep the summary under 200 words. Be professional and data-driven.
    `;

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Error generating report summary from Gemini:", error);
        return "An error occurred while generating the AI summary. Please check the console for details.";
    }
};

export const generateDashboardSummaryFromPrompt = async (
    prompt: string
): Promise<string> => {
    if (!import.meta.env.VITE_API_KEY) {
        return "Gemini API key is not configured. Please set the VITE_API_KEY environment variable.";
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Error generating dashboard summary from Gemini:", error);
        return "An error occurred while generating the AI summary. The model may have generated a response that could not be processed. Please check the console for details.";
    }
};
