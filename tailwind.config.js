/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			primary: {
  				DEFAULT: '#DD1A51',
  				50: '#FCEBF0',
  				100: '#F9D7E1',
  				200: '#F4AFC3',
  				300: '#EF87A6',
  				400: '#EA5F88',
  				500: '#DD1A51', 
  				600: '#B1143F',
  				700: '#850F2F',
  				800: '#59091F',
  				900: '#2C050F',
  				foreground: '#FFFFFF'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			tertiary: '#2C3E50',
  			background: 'hsl(var(--background))',
  			surface: '#FFFFFF',
  			error: '#DC3545',
  			success: '#28A745',
  			warning: '#FFC107',
  			info: '#17A2B8',
  			hover: '#FBE8D3',
  			border: 'hsl(var(--border))',
  			text: {
  				primary: '#1B4B8A',
  				secondary: '#E67E22',
  				disabled: '#BDBDBD'
  			},
  			statusActive: '#28A745',
  			statusExpiring: '#FFC107',
  			statusExpired: '#DC3545',
  			statusOther: '#ADB5BD',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		fontFamily: {
  			sans: [
  				'Inter var',
  				'sans-serif'
  			],
  			headline: [
  				'Inter',
  				'sans-serif'
  			],
  			body: [
  				'Roboto',
  				'sans-serif'
  			]
  		},
  		spacing: {
  			'18': '4.5rem',
  			'112': '28rem',
  			'128': '32rem',
  			xs: '0.25rem',
  			sm: '0.5rem',
  			md: '1rem',
  			lg: '1.5rem',
  			xl: '2rem',
  			xxl: '3rem'
  		},
  		borderRadius: {
  			sm: 'calc(var(--radius) - 4px)',
  			md: 'calc(var(--radius) - 2px)',
  			lg: 'var(--radius)',
  			full: '9999px'
  		},
  		boxShadow: {
  			sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  			md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  			lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
  		},
  		maxWidth: {
  			'8xl': '88rem',
  			'9xl': '96rem'
  		},
  		zIndex: {
  			'60': '60',
  			'70': '70',
  			'80': '80',
  			'90': '90',
  			'100': '100'
  		},
  		animation: {
  			'fade-in': 'fadeIn 0.3s ease-in-out',
  			'slide-in': 'slideIn 0.3s ease-in-out'
  		},
  		fontSize: {
  			headlineLarge: '2.5rem',
  			headlineMedium: '2rem',
  			body: '1rem',
  			caption: '0.875rem'
  		}
  	}
  },
  plugins: [
    require('@tailwindcss/forms'),
      require("tailwindcss-animate")
],
}
