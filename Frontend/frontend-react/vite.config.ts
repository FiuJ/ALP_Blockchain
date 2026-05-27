import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
})
// import { defineConfig } from 'vite'
// import tailwindcss from '@tailwindcss/vite'
// import react, { reactCompilerPreset } from '@vitejs/plugin-react'
// import babel from '@rolldown/plugin-babel'

// export default defineConfig({
//   plugins: [
//     react(),
//     tailwindcss(),
//     babel({ presets: [reactCompilerPreset()] })
//   ],
// })
