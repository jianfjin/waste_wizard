
import React, { useState, useEffect, useRef, useContext } from 'react';
import { Chat } from '@google/genai';
import { LanguageContext } from '../App';
import { createChatSession, sendMessageStreamWithImage } from '../services/geminiService';
import { Message } from '../types';
import { LoadingIcon, SendIcon, SourceIcon, PhotoIcon, XMarkIcon } from './Icons';

const ChatAgent: React.FC = () => {
  const { language, t } = useContext(LanguageContext);
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [accessKeyInput, setAccessKeyInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check for persisted access key on mount
  useEffect(() => {
    const storedKey = localStorage.getItem('chat_access_key');
    const envKey = import.meta.env.VITE_ACCESS_KEY;

    if (storedKey && storedKey === envKey) {
      setIsAuthenticated(true);

      // Load history
      const storedHistory = localStorage.getItem('chat_history');
      if (storedHistory) {
        try {
          setMessages(JSON.parse(storedHistory));
        } catch (e) {
          console.error("Failed to parse chat history", e);
          setMessages([{ sender: 'bot', text: t('chatIntro') }]);
        }
      } else {
        setMessages([{ sender: 'bot', text: t('chatIntro') }]);
      }
    }
  }, [t]);

  // Initialize Chat Session when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const newChat = createChatSession(language);
      setChat(newChat);
    }
  }, [isAuthenticated, language]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAuthenticated]);

  // Save history whenever messages change
  useEffect(() => {
    if (isAuthenticated && messages.length > 0) {
      localStorage.setItem('chat_history', JSON.stringify(messages));
    }
  }, [messages, isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const envKey = import.meta.env.VITE_ACCESS_KEY;

    if (accessKeyInput === envKey) {
      localStorage.setItem('chat_access_key', accessKeyInput);
      setIsAuthenticated(true);
      setAuthError('');

      if (messages.length === 0) {
        setMessages([{ sender: 'bot', text: t('chatIntro') }]);
      }
    } else {
      setAuthError('Invalid Access Key. Please try again.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('chat_access_key');
    setIsAuthenticated(false);
    setAccessKeyInput('');
    setChat(null);
  };

  const handleClearChat = () => {
    if (window.confirm('Are you sure you want to clear the chat history?')) {
      const initialMsg: Message = { sender: 'bot', text: t('chatIntro') };
      setMessages([initialMsg]);
      localStorage.setItem('chat_history', JSON.stringify([initialMsg]));
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setSelectedImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !selectedImage) || !chat || isLoading) return;

    const userMessage: Message = {
      sender: 'user',
      text: input || 'What type of waste is this and how should I dispose of it?',
      image: selectedImage || undefined
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    const messageText = input;
    setInput('');
    setIsLoading(true);
    setSelectedImage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    try {
      const stream = await sendMessageStreamWithImage(chat, messageText, userMessage.image);

      let botResponse = '';
      let currentBotMessage: Message = { sender: 'bot', text: '' };
      setMessages(prev => [...prev, currentBotMessage]);

      for await (const chunk of stream) {
        botResponse += chunk.text;
        const groundingChunks = chunk.candidates?.[0]?.groundingMetadata?.groundingChunks;

        const sources = groundingChunks
          ?.map((c: any) => c.web)
          .filter((web: any) => web && web.uri && web.title) || [];

        setMessages(prev => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          if (lastMessage.sender === 'bot') {
            lastMessage.text = botResponse;
            if (sources.length > 0) {
              lastMessage.sources = sources;
            }
          }
          return newMessages;
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { sender: 'bot', text: 'Oops! Something went wrong. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col h-[70vh] items-center justify-center p-6 bg-gray-50 rounded-lg">
        <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-md">
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Waste Wizard Login</h2>
          <p className="text-gray-600 text-center mb-6">Please enter the Access Key to start chatting.</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                value={accessKeyInput}
                onChange={(e) => setAccessKeyInput(e.target.value)}
                placeholder="Enter Access Key..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {authError && (
              <p className="text-red-500 text-sm text-center">{authError}</p>
            )}

            <button
              type="submit"
              className="w-full bg-green-600 text-white p-3 rounded-lg font-bold hover:bg-green-700 transition-colors"
            >
              Unlock Chat
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[70vh]">
      {/* Header with actions */}
      <div className="flex justify-between items-center px-4 py-2 bg-gray-100 rounded-t-lg border-b border-gray-200">
        <span className="text-sm font-semibold text-gray-500">Waste Wizard AI</span>
        <div className="flex space-x-2">
          <button
            onClick={handleClearChat}
            className="text-xs text-gray-600 hover:text-red-600 px-2 py-1 rounded hover:bg-gray-200 transition-colors"
          >
            Clear Chat
          </button>
          <button
            onClick={handleLogout}
            className="text-xs text-gray-600 hover:text-gray-900 px-2 py-1 rounded hover:bg-gray-200 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-lg p-3 rounded-2xl ${msg.sender === 'user' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
              {msg.image && (
                <div className="mb-2">
                  <img
                    src={msg.image}
                    alt="Uploaded waste"
                    className="rounded-lg max-w-full h-auto max-h-64 object-contain"
                  />
                </div>
              )}
              <p className="whitespace-pre-wrap">{msg.text}</p>
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-2 border-t pt-2">
                  <h4 className="text-xs font-bold mb-1">{t('sources')}</h4>
                  <ul className="space-y-1">
                    {msg.sources.map((source, i) => (
                      <li key={i} className="text-xs">
                        <a href={source.uri} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:underline">
                          <SourceIcon />
                          <span>{source.title || new URL(source.uri).hostname}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && messages[messages.length - 1].sender === 'user' && (
          <div className="flex justify-start">
            <div className="max-w-lg p-3 rounded-2xl bg-gray-200 text-gray-800 flex items-center">
              <LoadingIcon />
              <span className="ml-2 animate-pulse">Wizard is thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className="mt-auto p-4 bg-white border-t border-gray-200 rounded-b-lg">
        {selectedImage && (
          <div className="mb-4 relative inline-block">
            <img
              src={selectedImage}
              alt="Selected waste"
              className="max-h-32 rounded-lg border-2 border-gray-300"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        )}
        <div className="flex items-center space-x-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelect}
            accept="image/*"
            className="hidden"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="bg-blue-500 text-white p-3 rounded-full hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            title="Upload image"
          >
            <PhotoIcon className="w-6 h-6" />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t('chatPlaceholder')}
            className="flex-grow p-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || (!input.trim() && !selectedImage)}
            className="bg-green-600 text-white p-3 rounded-full hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            title="Send message"
          >
            <SendIcon />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatAgent;
