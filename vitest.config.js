export default {
  test: {
    testTimeout: 10000,
    include: [
      'test/**/*.test.js',
      'test/**/*.test.ts',
    ],
    coverage: {
      include: [
        'src/**/*',
      ],
      exclude: [
        'src/index.mjs',
      ]
    },
    server: {
      deps: {
        inline: [
          'AssertionError: ts',
        ]
      }
    },
  },
}
