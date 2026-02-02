'use client';

import { useTheme } from '@/context/ThemeContext';
import { themes } from '@/lib/themes';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

export default function ThemeSwitcher() {
  const { theme: currentTheme, setTheme } = useTheme();

  const lightThemes = themes.filter(t => t.mode === 'light');
  const darkThemes = themes.filter(t => t.mode === 'dark');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Theme</CardTitle>
        <CardDescription>Select a theme for your application.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Light Themes</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {lightThemes.map(theme => (
              <div key={theme.name}>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full h-auto justify-start p-2 border-2',
                    currentTheme.name === theme.name && 'border-primary'
                  )}
                  onClick={() => setTheme(theme.name)}
                >
                  <div className="flex items-center gap-2 w-full">
                    <div className="flex flex-col space-y-1">
                      <div className="flex gap-1">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: `hsl(${theme.colors.primary})` }} />
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: `hsl(${theme.colors.accent})` }} />
                      </div>
                       <div className="flex gap-1">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: `hsl(${theme.colors.background})`, border: `1px solid hsl(${theme.colors.border})` }} />
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: `hsl(${theme.colors.card})`, border: `1px solid hsl(${theme.colors.border})` }} />
                      </div>
                    </div>
                    <span className="text-sm font-medium">{theme.name}</span>
                    {currentTheme.name === theme.name && <Check className="ml-auto h-4 w-4 text-primary" />}
                  </div>
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Dark Themes</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {darkThemes.map(theme => (
              <div key={theme.name}>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full h-auto justify-start p-2 border-2',
                    currentTheme.name === theme.name && 'border-primary'
                  )}
                  onClick={() => setTheme(theme.name)}
                >
                  <div className="flex items-center gap-2 w-full">
                    <div className="flex flex-col space-y-1">
                      <div className="flex gap-1">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: `hsl(${theme.colors.primary})` }} />
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: `hsl(${theme.colors.accent})` }} />
                      </div>
                       <div className="flex gap-1">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: `hsl(${theme.colors.background})`, border: `1px solid hsl(${theme.colors.border})` }} />
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: `hsl(${theme.colors.card})`, border: `1px solid hsl(${theme.colors.border})` }} />
                      </div>
                    </div>
                    <span className="text-sm font-medium">{theme.name}</span>
                     {currentTheme.name === theme.name && <Check className="ml-auto h-4 w-4 text-primary" />}
                  </div>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
