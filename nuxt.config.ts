import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: '2025-07-15',
    app: {
        head: {
            title: "نوشتا",
            charset: "utf-8",
            viewport: "width=device-width, initial-scale=1",
            meta: [
                {name: "viewport", content: "width=device-width, initial-scale=1,maximum-scale=1.0, user-scalable=no"},
                {name: "HandheldFriendly", content: "true"},
                {name: "version", content: "0.1"}
            ],
            link: [
                {rel: "icon", type: "image/png", href: "/img/logo.ico"},
            ]
        },
        pageTransition: {name: "page", mode: "out-in"},
        layoutTransition: {name: "layout", mode: "out-in"},
    },
    ssr: false,
    devtools: {enabled: false},
    modules: ['cap-module', '@nuxt/ui', "nuxt-marquee"],
    css: ["@/assets/css/main.css", "@/assets/css/font.css"],
    vite: {
        plugins: [
            tailwindcss(),
        ],
    },
    devServer: {
        port: 2000,
    },
})