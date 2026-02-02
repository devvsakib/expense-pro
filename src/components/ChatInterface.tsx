'use client';

import { useState, useRef, useEffect } from 'react';
import type { UserProfile, Expense, ChatMessage } from '@/app/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Sparkles, Loader2 } from 'lucide-react';
import { financialChat } from '@/ai/flows/ai-financial-chat';
import { CompassIcon } from './icons';
import { cn } from '@/lib/utils';

interface ChatInterfaceProps {
  user: UserProfile;
  expenses: Expense[];
}

export default function ChatInterface({ user, expenses }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: `Hello ${user.name}! I'm XPNS AI, your financial assistant. How can I help you analyze your spending today? You can ask things like "How much did I spend on Food this month?" or "What were my biggest expenses last week?".`,
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTo({
            top: scrollAreaRef.current.scrollHeight,
            behavior: 'smooth'
        });
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessages: ChatMessage[] = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const result = await financialChat({
        user: { name: user.name, currency: user.currency, monthlyBudget: user.monthlyBudget },
        expenses: expenses.map(e => ({
            title: e.title,
            amount: e.amount,
            category: e.category,
            date: e.date.toISOString().split('T')[0] // Format as YYYY-MM-DD
        })),
        messages: newMessages.slice(-10), // Send last 10 messages for context
      });
      setMessages(prev => [...prev, { role: 'assistant', content: result.response }]);
    } catch (error) {
      console.error('AI chat error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full border rounded-lg">
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-6">
          {messages.map((message, index) => (
            <div key={index} className={cn('flex items-start gap-4', message.role === 'user' ? 'justify-end' : 'justify-start')}>
              {message.role === 'assistant' && (
                <Avatar className="w-8 h-8 border">
                    <div className="bg-primary h-full w-full flex items-center justify-center">
                        <CompassIcon className="h-5 w-5 text-primary-foreground" />
                    </div>
                </Avatar>
              )}
              <div className={cn(
                'max-w-md p-3 rounded-lg whitespace-pre-wrap',
                message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
              )}>
                {message.content}
              </div>
               {message.role === 'user' && (
                <Avatar className="w-8 h-8">
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          {isLoading && (
             <div className="flex items-start gap-4 justify-start">
                <Avatar className="w-8 h-8 border">
                    <div className="bg-primary h-full w-full flex items-center justify-center">
                        <CompassIcon className="h-5 w-5 text-primary-foreground" />
                    </div>
                </Avatar>
                <div className="max-w-md p-3 rounded-lg bg-muted flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin"/>
                    <span>Thinking...</span>
                </div>
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="p-4 border-t">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about your finances..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            <Send className="w-4 h-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
