import cheerio from 'cheerio'
import { createNext, FileRef } from 'e2e-utils'
import { NextInstance } from 'test/lib/next-modes/base'
import { renderViaHTTP } from 'next-test-utils'
import { join } from 'path'

const mockedGoogleFontResponses = require.resolve(
  './google-font-mocked-responses.js'
)

const isDev = (global as any).isNextDev

describe('@next/font/google with-font-declarations-file', () => {
  let next: NextInstance

  if ((global as any).isNextDeploy) {
    it('should skip next deploy for now', () => {})
    return
  }

  beforeAll(async () => {
    next = await createNext({
      files: {
        pages: new FileRef(
          join(__dirname, 'with-font-declarations-file/pages')
        ),
        components: new FileRef(
          join(__dirname, 'with-font-declarations-file/components')
        ),
        'fonts.js': new FileRef(
          join(__dirname, 'with-font-declarations-file/fonts.js')
        ),
        'next.config.js': new FileRef(
          join(__dirname, 'with-font-declarations-file/next.config.js')
        ),
      },
      dependencies: {
        '@next/font': 'canary',
      },
      env: {
        NEXT_FONT_GOOGLE_MOCKED_RESPONSES: mockedGoogleFontResponses,
      },
    })
  })
  afterAll(() => next.destroy())

  test('preload correct files at /inter', async () => {
    const html = await renderViaHTTP(next.url, '/inter')
    const $ = cheerio.load(html)

    // Preconnect
    expect($('link[rel="preconnect"]').length).toBe(0)

    if (isDev) {
      // In dev all fonts will be preloaded since it's before DCE
      expect($('link[as="font"]').length).toBe(3)
    } else {
      // Preload
      expect($('link[as="font"]').length).toBe(2)
      // From /_app
      expect($('link[as="font"]').get(0).attribs).toEqual({
        as: 'font',
        crossorigin: 'anonymous',
        href: '/_next/static/fonts/0812efcfaefec5ea.p.woff2',
        rel: 'preload',
        type: 'font/woff2',
      })
      // From /inter
      expect($('link[as="font"]').get(1).attribs).toEqual({
        as: 'font',
        crossorigin: 'anonymous',
        href: '/_next/static/fonts/4a7f86e553ee7e51.p.woff2',
        rel: 'preload',
        type: 'font/woff2',
      })
    }
  })

  test('preload correct files at /roboto', async () => {
    const html = await renderViaHTTP(next.url, '/roboto')
    const $ = cheerio.load(html)

    // Preconnect
    expect($('link[rel="preconnect"]').length).toBe(0)

    if (isDev) {
      // In dev all fonts will be preloaded since it's before DCE
      expect($('link[as="font"]').length).toBe(3)
    } else {
      // Preload
      expect($('link[as="font"]').length).toBe(2)
      // From /_app
      expect($('link[as="font"]').get(0).attribs).toEqual({
        as: 'font',
        crossorigin: 'anonymous',
        href: '/_next/static/fonts/0812efcfaefec5ea.p.woff2',
        rel: 'preload',
        type: 'font/woff2',
      })
      // From /roboto
      expect($('link[as="font"]').get(1).attribs).toEqual({
        as: 'font',
        crossorigin: 'anonymous',
        href: '/_next/static/fonts/9a7e84b4dd095b33.p.woff2',
        rel: 'preload',
        type: 'font/woff2',
      })
    }
  })
})
