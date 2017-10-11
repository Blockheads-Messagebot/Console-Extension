import typescript from 'rollup-plugin-typescript2'
import string from 'rollup-plugin-string'
import { existsSync, unlinkSync } from 'fs'

for (let file of ['history', 'index']) {
    if (existsSync(`./${file}.d.ts`)) unlinkSync(`./${file}.d.ts`)
}


export default {
    input: 'src/index.ts',
    output: {
        file: 'index.js',
        format: 'es',
    },
    plugins: [
        typescript(),
        string({ include: ['**/*.html', '**/*.css'] })
    ],
    external: [
        '@bhmb/bot'
    ],
    globals: {
        '@bhmb/bot': '@bhmb/bot'
    }
}
