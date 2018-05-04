import typescript from 'rollup-plugin-typescript2'
import string from 'rollup-plugin-string'
import { existsSync, unlinkSync } from 'fs'

export default {
    input: 'src/index.ts',
    output: {
        file: 'index.js',
        format: 'es',
        globals: {
            '@bhmb/bot': '@bhmb/bot'
        }
    },
    plugins: [
        typescript(),
        string({ include: ['**/*.html', '**/*.css'] })
    ],
    external: [
        '@bhmb/bot'
    ],
}
