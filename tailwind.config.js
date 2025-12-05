module.exports = {
    content: [
        "./pages/**/*.{vue,js}",
        "./components/**/*.{vue,js}",
        "./layouts/**/*.{vue,js}",
        "./plugins/**/*.{js,ts}",
        "./nuxt.config.{js,ts}"
    ],
    darkMode: '.p-dark',
    theme: {
        container: {
            center: true,
            padding: {
                DEFAULT: '16px',   // по умолчанию (мобилки)
                sm: '20px',
                md: '24px',
                lg: '30px',
                xl: '40px',
                '2xl': '48px'
            },
            screens: {
                sm: '640px',
                md: '768px',
                lg: '1024px',
                xl: '1240px',
                '2xl': '1440px'
            }
        },
        extend: {
            colors: {
                primary: '#1c39d5', // Добавляем свой основной цвет
                secondary: '#9333EA', // Добавляем второй цвет
                customGray: '#B0B0B0', // Добавляем пользовательский серый
            },
        },
    },
    plugins: [require('tailwindcss-primeui')]
}
