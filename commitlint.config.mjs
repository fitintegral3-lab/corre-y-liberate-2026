/**
 * Conventional Commits, en ingles y con lineas de maximo 70 caracteres.
 *
 * La convencion completa —cuando usar cada tipo, que scopes existen y que no
 * va nunca en un mensaje— vive en `.claude/commands/commit.md` y esta resumida
 * en CONTRIBUTING.md. Esto solo la hace exigible: el hook `commit-msg` rechaza
 * lo que no cumple, para que el historial no dependa de que alguien recuerde.
 *
 * @type {import('@commitlint/types').UserConfig}
 */
const config = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'docs', 'style', 'refactor', 'test', 'chore', 'perf', 'ci', 'build'],
    ],
    // 70 y no 72: el titulo tiene que entrar entero en un `git log --oneline`
    // y en la lista de commits de GitHub sin cortarse.
    'header-max-length': [2, 'always', 70],
    'body-max-line-length': [2, 'always', 70],
    'footer-max-line-length': [2, 'always', 70],
    // Sin trailers: el mensaje termina en el cuerpo. La regla necesita el
    // literal que busca; con `never` y sin valor, commitlint rechaza todo
    // mensaje, tenga trailer o no.
    'signed-off-by': [2, 'never', 'Signed-off-by:'],
  },
};

export default config;
