
import React, { useState, useEffect, useRef } from 'react';
import { analyzeSafety } from '../services/geminiService';
import { marked } from 'marked';

interface ChatMessage {
    id: string;
    role: 'user' | 'model';
    text: string;
}

export const SafetyAssistant: React.FC = () => {
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Scroll to bottom when new messages are added
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chatHistory]);


    const handleQuery = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim() || isLoading) return;

        const userMessage: ChatMessage = { id: `user-${Date.now()}`, role: 'user', text: query };
        setChatHistory(prev => [...prev, userMessage]);
        setIsLoading(true);
        const currentQuery = query;
        setQuery('');

        try {
            const responseText = await analyzeSafety(currentQuery);
            const modelMessage: ChatMessage = { id: `model-${Date.now()}`, role: 'model', text: responseText };
            setChatHistory(prev => [...prev, modelMessage]);
        } catch (error) {
            const errorMessage: ChatMessage = { id: `model-${Date.now()}`, role: 'model', text: "Ocorreu um erro. Por favor, tente novamente." };
            setChatHistory(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-12rem)] bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b flex items-center gap-3 bg-gray-50/50 rounded-t-lg">
                <div className="relative">
                    <i className="fa-solid fa-robot text-2xl text-tech-500"></i>
                    <span className="absolute -bottom-0.5 -right-0.5 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-white"></span>
                </div>
                <div>
                    <h2 className="font-bold text-gray-800">Assistente de Segurança</h2>
                    <p className="text-xs text-gray-500">Online • Gemini 2.5 Flash</p>
                </div>
            </div>
            <div ref={chatContainerRef} className="flex-1 p-6 overflow-y-auto">
                <div className="space-y-4">
                    {chatHistory.length === 0 && (
                        <div className="text-center text-gray-500 pt-8">
                           <i className="fa-solid fa-user-shield text-4xl mb-2 text-gray-400"></i>
                           <p className="font-medium">Assistente de Segurança SIRU-Safe</p>
                           <p className="text-sm">Faça perguntas sobre segurança, armazenamento ou descarte de reagentes.</p>
                        </div>
                    )}
                    {chatHistory.map(msg => (
                        <div key={msg.id} className={`flex gap-3 items-start ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                             {msg.role === 'model' && <i className="fa-solid fa-robot text-unilab-blue mt-2"></i>}
                            <div className={`max-w-xl p-3 rounded-lg ${msg.role === 'user' ? 'bg-unilab-blue text-white' : 'bg-gray-100'}`}>
                                <div className="prose max-w-none prose-sm" dangerouslySetInnerHTML={{ __html: marked.parse(msg.text) }}></div>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start gap-3 items-start">
                             <i className="fa-solid fa-robot text-unilab-blue mt-2"></i>
                             <div className="max-w-xl p-3 rounded-lg bg-gray-100">
                                <span className="animate-pulse">SIRU-Safe está pensando...</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div className="p-4 border-t bg-gray-50 rounded-b-lg">
                <form onSubmit={handleQuery} className="flex gap-2">
                    <input 
                        type="text" 
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Pergunte sobre segurança, ex: 'Como armazenar Ácido Sulfúrico?'"
                        className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-unilab-blue focus:border-unilab-blue"
                        disabled={isLoading}
                    />
                    <button type="submit" disabled={isLoading || !query.trim()} className="bg-unilab-blue text-white px-4 py-2 rounded-md hover:bg-unilab-green disabled:bg-gray-400 disabled:cursor-not-allowed">
                        {isLoading ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-paper-plane"></i>}
                    </button>
                </form>
            </div>
        </div>
    );
};