import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/lara';

const CompactLight = definePreset(Aura, {
    semantic: {
        primary: {
            50: '#fffbeb',
            100: '#fef3c7',
            200: '#fde68a',
            300: '#fcd34d',
            400: '#fbbf24',
            500: '#f59e0b', // основной
            600: '#d97706',
            700: '#b45309',
            800: '#92400e',
            900: '#78350f',
            950: '#451a03'
        },
        colorScheme: {
            light: {
                primary: {
                    color: '#f59e0b',          // основной цвет
                    inverseColor: '#ffffff',
                    hoverColor: '#d97706',
                    activeColor: '#b45309'
                },
                highlight: {
                    background: '#fef3c7',
                    focusBackground: '#fde68a',
                    color: '#78350f',
                    focusColor: '#78350f'
                }
            },
            dark: {
                primary: {
                    color: '#fde68a',
                    inverseColor: '#78350f',
                    hoverColor: '#fef3c7',
                    activeColor: '#f59e0b'
                },
                highlight: {
                    background: 'rgba(255, 251, 235, .08)',
                    focusBackground: 'rgba(255, 251, 235, .12)',
                    color: 'rgba(255,251,235,.95)',
                    focusColor: 'rgba(255,251,235,.95)'
                }
            }
        }
    },
    rules: {
        global: {
            fontSize: '0.75rem',
            borderRadius: '0.2rem'
        },
        button: {
            fontSize: '0.75rem',
            padding: '0.25rem 0.5rem',
            gap: '0.3rem'
        },
        input: {
            fontSize: '0.75rem',
            padding: '0.3rem 0.5rem'
        },
        dropdown: {
            fontSize: '0.75rem',
            itemPadding: '0.25rem 0.5rem'
        },
        datatable: {
            cellPadding: '0.25rem 0.5rem',
            fontSize: '0.75rem'
        },
        dialog: {
            padding: '0.75rem',
            headerFontSize: '0.9rem',
            contentFontSize: '0.75rem'
        },
        card: {
            padding: '0.75rem'
        },
        tabview: {
            fontSize: '0.75rem'
        },
        checkbox: {
            size: '1rem'
        },
        radiobutton: {
            size: '1rem'
        }
    }
});

export default {
    preset: CompactLight,
    options: {
        darkModeSelector: '.p-dark'
    }
};
