import nextVitals from 'eslint-config-next/core-web-vitals';

const eslintConfig = [
  ...nextVitals,
  {
    ignores: [
      '.next/**',
      '.claude/**',
      'node_modules/**',
      'coverage/**',
      'next-env.d.ts',
    ],
  },
];

export default eslintConfig;
