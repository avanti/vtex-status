const express = require('express')
const fetch = require('node-fetch')
const xmlConvert = require('object-to-xml')

const app = express()

const VTEX_MODULES = 'https://apigateway.vtex.com/healthcheck/api/pub/modules'

async function getModules() {
  let data

  try {
    data = await fetch(VTEX_MODULES)
  } catch (err) {
    console.log('Error:', err)
    throw new Error(err)
  }

  return data.json()
}

function getResponse(modules) {
  const xml = {
    '?xml version="1.0" encoding="UTF-8"?': null,
    rss: {
      '@': {
        version: '2.0'
      },
      '#': {
        modules: {
          '#': {
            title: 'VTEX modules status',
            description: 'XML VTEX modules status',
            item: []
          }
        }
      }
    }
  }

  modules.map(item => {
    return xml.rss['#'].modules['#'].item.push(item)
  })

  return xmlConvert(xml)
}

app.get('/', async (req, res) => {
  let modules

  try {
    modules = await getModules()
  } catch (err) {
    console.log('Error:', err)
    throw new Error(err)
  }

  const response = getResponse(modules)

  res
    .status(200)
    .set('Content-Type', 'text/xml')
    .send(response)
})

const port = process.env.PORT || 3000

app.listen(port, () => {
  console.log(`Listening on port ${port}.`)
})
