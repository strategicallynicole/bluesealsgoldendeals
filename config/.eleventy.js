const { DateTime } = require('luxon')
const htmlmin = require('html-minifier')
const sanitizeHTML = require('sanitize-html')
//const filters = require('./src/assets/utils/filters.js')

module.exports = function (eleventyConfig) {


  // Filters for webmentions are added
  // **IN THAT SECTION BELOW!!**

  eleventyConfig.setQuietMode(true)

  eleventyConfig.addPassthroughCopy('robots.txt')
  eleventyConfig.addPassthroughCopy('favicon.ico')
  eleventyConfig.addPassthroughCopy('browserconfig.xml')

  eleventyConfig.addFilter("readableDate", dateObj => {
    return DateTime.fromJSDate(dateObj, {zone: 'utc'}).toFormat("dd LLL yyyy")
  })

  // https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-date-string
  eleventyConfig.addFilter('htmlDateString', dateObj => {
    return DateTime.fromJSDate(dateObj).toFormat('MMMM d, yyyy')
  })

  eleventyConfig.addFilter('dateStringISO', dateObj => {
    return DateTime.fromJSDate(dateObj).toFormat('yyyy-MM-dd')
  })

  eleventyConfig.addFilter('dateFromTimestamp', timestamp => {
    return DateTime.fromISO(timestamp, { zone: 'utc' }).toJSDate()
  })

  eleventyConfig.addFilter('dateFromRFC2822', timestamp => {
    return DateTime.fromJSDate(timestamp).toISO()
  })

  eleventyConfig.addFilter('readableDateFromISO', dateObj => {
    return DateTime.fromISO(dateObj).toFormat('LLL d, yyyy h:mm:ss a ZZZZ')
  })

  // https://github.com/11ty/eleventy-base-blog/blob/master/.eleventy.js
  eleventyConfig.addLayoutAlias("posts", "src/_includes/layouts/posts/singlepost.11ty.js")

  /* Markdown plugins */
  // https://www.11ty.dev/docs/languages/markdown/
  // --and-- https://github.com/11ty/eleventy-base-blog/blob/master/.eleventy.js
  // --and-- https://github.com/planetoftheweb/seven/blob/master/.eleventy.js
  let markdownIt = require("markdown-it")
  let markdownItFootnote = require("markdown-it-footnote")
  let markdownItPrism = require('markdown-it-prism')
  let markdownItAttrs = require('markdown-it-attrs')
  let markdownItBrakSpans = require('markdown-it-bracketed-spans')
  let markdownItLinkAttrs = require('markdown-it-link-attributes')
  let markdownItOpts = {
    html: true,
    linkify: false,
    typographer: true
  }
  const markdownEngine = markdownIt(markdownItOpts)
  markdownEngine.use(markdownItFootnote)
  markdownEngine.use(markdownItPrism)
  markdownEngine.use(markdownItAttrs)
  markdownEngine.use(markdownItBrakSpans)
  markdownEngine.use(markdownItLinkAttrs, {
    pattern: /^https:/,
    attrs: {
      target: '_blank',
      rel: 'noreferrer noopener'
    }
  })


  eleventyConfig.addTransform("htmlmin", function(content, outputPath) {
    if( outputPath.endsWith(".html") ) {
      let minified = htmlmin.minify(content, {
        useShortDoctype: true,
        removeComments: true,
        collapseWhitespace: true
      })
      return minified
    }
    return content
  })

  /* === START, webmentions stuff === */
  // https://mxb.dev/blog/using-webmentions-on-static-sites/
  // https://sia.codes/posts/webmentions-eleventy-in-depth/
  
  // Get the first `n` elements of a collection.
  eleventyConfig.addFilter('head', (array, n) => {
    if (n < 0) {
      return array.slice(n)
    }
    return array.slice(0, n)
  })

  
  // Webmentions Filter
  eleventyConfig.addFilter('webmentionsForUrl', (webmentions, url) => {
    const allowedTypes = [
      'like-of',
      'mention-of',
      'in-reply-to',
      'repost-of',
      'bookmark-of'
    ]

    const orderByDate = (a, b) =>
      new Date(a.published) - new Date(b.published)

    const clean = content =>
      sanitizeHTML(content, {
        allowedTags: [
          'b',
          'i',
          'em',
          'strong',
          'a'],
        allowedAttributes: {
          a: [
            'href'
          ]
        }
      })

    return webmentions
      .filter(entry => entry['wm-target'] === url)
      .filter(entry => allowedTypes.includes(entry['wm-property']))
      .sort(orderByDate)/*
      .filter(entry => !!entry.content)
      .map(entry => {
        const { html, text } = entry.content
        entry.content.value = html ? clean(html) : clean(text)
        return entry
      })*/
  })

  // next is based on the 'const filters' line at the top
  //Object.keys(filters).forEach(filterName => {
    //eleventyConfig.addFilter(filterName, filters[filterName])
  //})


  /* pathPrefix: "/"; */
  return {
    dir: {
      input: 'stage', // <--- everything else in 'dir' is relative to this directory! https://www.11ty.dev/docs/config/#directory-for-includes
      data: '_data',
      output: 'dist',
      includes: '_includes',
      layouts: '_includes/layouts'
    },
    templateFormats: [
      'html',
      'md',
      'njk',
      '11ty.js'
    ],
    passthroughFileCopy: true,
  }
}
