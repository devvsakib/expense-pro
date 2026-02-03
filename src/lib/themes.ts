export type Theme = {
  name: string;
  mode: 'light' | 'dark';
  colors: {
    background: string;
    foreground: string;
    card: string;
    'card-foreground': string;
    popover: string;
    'popover-foreground': string;
    primary: string;
    'primary-foreground': string;
    secondary: string;
    'secondary-foreground': string;
    muted: string;
    'muted-foreground': string;
    accent: string;
    'accent-foreground': string;
    destructive: string;
    'destructive-foreground': string;
    border: string;
    input: string;
    ring: string;
  };
};

export const themes: Theme[] = [
  {
    name: 'Default',
    mode: 'light',
    colors: {
      background: '220 13% 94%',
      foreground: '222.2 84% 4.9%',
      card: '0 0% 100%',
      'card-foreground': '222.2 84% 4.9%',
      popover: '0 0% 100%',
      'popover-foreground': '222.2 84% 4.9%',
      primary: '210 40% 60%',
      'primary-foreground': '0 0% 98%',
      secondary: '0 0% 96.1%',
      'secondary-foreground': '222.2 47.4% 11.2%',
      muted: '0 0% 96.1%',
      'muted-foreground': '215.4 16.3% 46.9%',
      accent: '20 60% 55%',
      'accent-foreground': '0 0% 98%',
      destructive: '0 84.2% 60.2%',
      'destructive-foreground': '0 0% 98%',
      border: '0 0% 89.8%',
      input: '0 0% 89.8%',
      ring: '210 40% 60%',
    },
  },
  {
    name: 'Default Dark',
    mode: 'dark',
    colors: {
        background: '200 70% 12%',
        foreground: '210 15% 95%',
        card: '180 42% 18%',
        'card-foreground': '210 15% 95%',
        popover: '180 42% 18%',
        'popover-foreground': '210 15% 95%',
        primary: '159 30% 70%',
        'primary-foreground': '200 70% 12%',
        secondary: '180 42% 18%',
        'secondary-foreground': '210 15% 95%',
        muted: '180 42% 18%',
        'muted-foreground': '159 18% 44%',
        accent: '159 30% 70%',
        'accent-foreground': '200 70% 12%',
        destructive: '0 62.8% 30.6%',
        'destructive-foreground': '0 0% 98%',
        border: '159 18% 28%',
        input: '180 42% 18%',
        ring: '159 30% 70%',
    },
  },
  {
    name: 'Midnight',
    mode: 'dark',
    colors: {
      background: '0 0% 8%',
      foreground: '0 0% 95%',
      card: '0 0% 12%',
      'card-foreground': '0 0% 95%',
      popover: '0 0% 12%',
      'popover-foreground': '0 0% 95%',
      primary: '0 0% 98%',
      'primary-foreground': '0 0% 9%',
      secondary: '0 0% 15%',
      'secondary-foreground': '0 0% 95%',
      muted: '0 0% 15%',
      'muted-foreground': '0 0% 60%',
      accent: '0 0% 20%',
      'accent-foreground': '0 0% 98%',
      destructive: '0 72% 51%',
      'destructive-foreground': '0 0% 98%',
      border: '0 0% 15%',
      input: '0 0% 15%',
      ring: '0 0% 90%',
    },
  },
  {
    name: 'Midnight Dusk',
    mode: 'dark',
    colors: {
      background: '210 69.6% 12.2%', // #092635
      foreground: '158 31.9% 90%', // Lighter #9EC8B9
      card: '180 45.5% 18.2%', // #1B4242
      'card-foreground': '158 31.9% 90%',
      popover: '180 45.5% 18.2%',
      'popover-foreground': '158 31.9% 90%',
      primary: '158 19.5% 43.7%', // #5C8374
      'primary-foreground': '0 0% 98%',
      secondary: '180 45.5% 15%', // Darker #1B4242
      'secondary-foreground': '158 31.9% 90%',
      muted: '180 45.5% 15%',
      'muted-foreground': '158 19.5% 55%', // Lighter #5C8374
      accent: '158 31.9% 70%', // #9EC8B9
      'accent-foreground': '210 69.6% 12.2%',
      destructive: '0 62.8% 30.6%',
      'destructive-foreground': '0 0% 98%',
      border: '180 45.5% 25%',
      input: '180 45.5% 18.2%',
      ring: '158 31.9% 70%',
    },
  },
    {
    name: 'Ocean Breeze',
    mode: 'light',
    colors: {
      background: '197 54% 95%',
      foreground: '201 39% 23%',
      card: '197 60% 100%',
      'card-foreground': '201 39% 23%',
      popover: '197 60% 100%',
      'popover-foreground': '201 39% 23%',
      primary: '197 81% 51%',
      'primary-foreground': '0 0% 100%',
      secondary: '197 54% 90%',
      'secondary-foreground': '201 39% 23%',
      muted: '197 54% 90%',
      'muted-foreground': '197 30% 45%',
      accent: '197 81% 51%',
      'accent-foreground': '0 0% 100%',
      destructive: '0 84.2% 60.2%',
      'destructive-foreground': '0 0% 98%',
      border: '197 54% 85%',
      input: '197 54% 85%',
      ring: '197 81% 51%',
    },
  },
  {
    name: 'Forest',
    mode: 'dark',
    colors: {
      background: '120 30% 8%',
      foreground: '90 30% 90%',
      card: '120 25% 12%',
      'card-foreground': '90 30% 90%',
      popover: '120 25% 12%',
      'popover-foreground': '90 30% 90%',
      primary: '100 40% 40%',
      'primary-foreground': '90 30% 95%',
      secondary: '120 25% 15%',
      'secondary-foreground': '90 30% 90%',
      muted: '120 25% 15%',
      'muted-foreground': '90 20% 60%',
      accent: '100 50% 60%',
      'accent-foreground': '120 30% 8%',
      destructive: '0 62.8% 30.6%',
      'destructive-foreground': '0 0% 98%',
      border: '120 25% 20%',
      input: '120 25% 15%',
      ring: '100 50% 60%',
    },
  },
  {
    name: 'Rose Petal',
    mode: 'light',
    colors: {
      background: '350 100% 98%',
      foreground: '350 40% 20%',
      card: '0 0% 100%',
      'card-foreground': '350 40% 20%',
      popover: '0 0% 100%',
      'popover-foreground': '350 40% 20%',
      primary: '340 70% 60%',
      'primary-foreground': '0 0% 100%',
      secondary: '350 100% 95%',
      'secondary-foreground': '350 40% 20%',
      muted: '350 100% 95%',
      'muted-foreground': '350 20% 45%',
      accent: '340 80% 70%',
      'accent-foreground': '0 0% 100%',
      destructive: '0 84.2% 60.2%',
      'destructive-foreground': '0 0% 98%',
      border: '350 100% 90%',
      input: '350 100% 90%',
      ring: '340 70% 60%',
    },
  },
];
