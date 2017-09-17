'use strict'
/* eslint-env webextensions, mocha */
/* globals sinon, optionDefaults, should, state, onBeforeRequest */

var sandbox

const url2request = (string) => {
  return {url: string}
}

describe('onBeforeRequest', function () {
  beforeEach(() => {
    browser.flush()
    sandbox = sinon.sandbox.create()
    browser.storage.local.get.returns(Promise.resolve(optionDefaults))
    // redirect by default -- makes test code shorter
    state.redirect = true
    state.catchUnhandledProtocols = true
    state.gwURLString = 'http://127.0.0.1:8080'
  })

  afterEach(() => {
    sandbox.restore()
    browser.flush()
  })

  describe('request for a path matching /ipfs/{CIDv0}', function () {
    it('should be served from custom gateway if redirect is enabled', function () {
      const request = url2request('https://ipfs.io/ipfs/QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR?argTest#hashTest')
      onBeforeRequest(request).redirectUrl.should.equal('http://127.0.0.1:8080/ipfs/QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR?argTest#hashTest')
    })
    it('should be left untouched if redirect is disabled', function () {
      state.redirect = false
      const request = url2request('https://ipfs.io/ipfs/QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR?argTest#hashTest')
      should.not.exist(onBeforeRequest(request))
    })
  })

  describe('request for a path matching /ipns/{path}', function () {
    it('should be served from custom gateway if redirect is enabled', function () {
      const request = url2request('https://ipfs.io/ipns/ipfs.io/index.html?argTest#hashTest')
      onBeforeRequest(request).redirectUrl.should.equal('http://127.0.0.1:8080/ipns/ipfs.io/index.html?argTest#hashTest')
    })
    it('should be left untouched if redirect is disabled', function () {
      state.redirect = false
      const request = url2request('https://ipfs.io/ipns/ipfs.io?argTest#hashTest')
      should.not.exist(onBeforeRequest(request))
    })
  })

  describe('request made via "web+" handler from manifest.json/protocol_handlers', function () {
    it('should be normalized if URI is web+ipfs:/{CID}', function () {
      const request = url2request('https://ipfs.io/web%2Bipfs:/QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR%3FargTest%23hashTest')
      onBeforeRequest(request).redirectUrl.should.equal('https://ipfs.io/ipfs/QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR?argTest#hashTest')
    })
    it('should be normalized if URI is web+ipfs://{CID}', function () {
      const request = url2request('https://ipfs.io/web%2Bipfs://QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR%3FargTest%23hashTest')
      onBeforeRequest(request).redirectUrl.should.equal('https://ipfs.io/ipfs/QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR?argTest#hashTest')
    })
    it('should be normalized if URI is web+ipns:/{foo}', function () {
      const request = url2request('https://ipfs.io/web%2Bipns:/ipfs.io%3FargTest%23hashTest')
      onBeforeRequest(request).redirectUrl.should.equal('https://ipfs.io/ipns/ipfs.io?argTest#hashTest')
    })
    it('should be normalized if URI is web+ipns://{foo}', function () {
      const request = url2request('https://ipfs.io/web%2Bipns://ipfs.io%3FargTest%23hashTest')
      onBeforeRequest(request).redirectUrl.should.equal('https://ipfs.io/ipns/ipfs.io?argTest#hashTest')
    })
    it('should be normalized if URI is web+fs:/ipfs/{CID}', function () {
      const request = url2request('https://ipfs.io/web%2Bfs:/ipfs/QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR%3FargTest%23hashTest')
      onBeforeRequest(request).redirectUrl.should.equal('https://ipfs.io/ipfs/QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR?argTest#hashTest')
    })
    it('should be normalized if URI is web+fs://ipfs/{CID}', function () {
      const request = url2request('https://ipfs.io/web%2Bfs://ipfs/QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR%3FargTest%23hashTest')
      onBeforeRequest(request).redirectUrl.should.equal('https://ipfs.io/ipfs/QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR?argTest#hashTest')
    })
    it('should be normalized if URI is web+fs:/ipns/{foo}', function () {
      const request = url2request('https://ipfs.io/web%2Bfs:/ipns/ipfs.io%3FargTest%23hashTest')
      onBeforeRequest(request).redirectUrl.should.equal('https://ipfs.io/ipns/ipfs.io?argTest#hashTest')
    })
    it('should be normalized if URI is web+fs://ipns/{foo}', function () {
      const request = url2request('https://ipfs.io/web%2Bfs://ipns/ipfs.io%3FargTest%23hashTest')
      onBeforeRequest(request).redirectUrl.should.equal('https://ipfs.io/ipns/ipfs.io?argTest#hashTest')
    })
    it('should be normalized if URI is web+dweb:/ipfs/{CID}', function () {
      const request = url2request('https://ipfs.io/web%2Bdweb:/ipfs/QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR%3FargTest%23hashTest')
      onBeforeRequest(request).redirectUrl.should.equal('https://ipfs.io/ipfs/QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR?argTest#hashTest')
    })
    it('should be normalized if URI is web+dweb://ipfs/{CID}', function () {
      const request = url2request('https://ipfs.io/web%2Bdweb://ipfs/QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR%3FargTest%23hashTest')
      onBeforeRequest(request).redirectUrl.should.equal('https://ipfs.io/ipfs/QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR?argTest#hashTest')
    })
    it('should be normalized if URI is web+dweb:/ipns/{foo}', function () {
      const request = url2request('https://ipfs.io/web%2Bdweb:/ipns/ipfs.io%3FargTest%23hashTest')
      onBeforeRequest(request).redirectUrl.should.equal('https://ipfs.io/ipns/ipfs.io?argTest#hashTest')
    })
    it('should be normalized if URI is web+dweb://ipns/{foo}', function () {
      const request = url2request('https://ipfs.io/web%2Bdweb://ipns/ipfs.io%3FargTest%23hashTest')
      onBeforeRequest(request).redirectUrl.should.equal('https://ipfs.io/ipns/ipfs.io?argTest#hashTest')
    })
    it('should be normalized if URI is web+{foo}:/bar', function () {
      const request = url2request('https://ipfs.io/web%2Bfoo:/bar%3FargTest%23hashTest')
      onBeforeRequest(request).redirectUrl.should.equal('https://ipfs.io/foo/bar?argTest#hashTest')
    })
    it('should be normalized if URI is web+{foo}://bar', function () {
      const request = url2request('https://ipfs.io/web%2Bfoo://bar%3FargTest%23hashTest')
      onBeforeRequest(request).redirectUrl.should.equal('https://ipfs.io/foo/bar?argTest#hashTest')
    })
  })

  // TODO: add tests for unhandled protocol schemes:
  // - google, duck duck go, bing, baidu, yandex
  describe('unhandled custom protocol request', function () {
    it('should be normalized if URI is ipfs:/{CID}', function () {
      const request = url2request('https://duckduckgo.com/?q=ipfs%3A%2FQmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR%3FargTest%23hashTest&foo=bar')
      onBeforeRequest(request).redirectUrl.should.equal('https://ipfs.io/ipfs/QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR?argTest#hashTest')
    })
    it('should be normalized if URI is ipfs://{CID}', function () {
      const request = url2request('https://duckduckgo.com/?q=ipfs%3A%2F%2FQmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR%3FargTest%23hashTest&foo=bar')
      onBeforeRequest(request).redirectUrl.should.equal('https://ipfs.io/ipfs/QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR?argTest#hashTest')
    })
    it('should be normalized if URI is ipns:/{foo}', function () {
      const request = url2request('https://duckduckgo.com/?q=ipns%3A%2Fipns.io%2Findex.html%3Farg%3Dfoo%26bar%3Dbuzz%23hashTest')
      onBeforeRequest(request).redirectUrl.should.equal('https://ipfs.io/ipns/ipns.io/index.html?arg=foo&bar=buzz#hashTest')
    })
    it('should be normalized if URI is ipns://{foo}', function () {
      const request = url2request('https://duckduckgo.com/?q=ipns%3A%2F%2Fipns.io%2Findex.html%3Farg%3Dfoo%26bar%3Dbuzz%23hashTest')
      onBeforeRequest(request).redirectUrl.should.equal('https://ipfs.io/ipns/ipns.io/index.html?arg=foo&bar=buzz#hashTest')
    })
    it('should be normalized if URI is fs:/ipfs/{CID}', function () {
      const request = url2request('https://duckduckgo.com/?q=fs%3A%2Fipfs%2FQmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR%3Farg%3Dfoo%26bar%3Dbuzz%23hash&ia=software')
      onBeforeRequest(request).redirectUrl.should.equal('https://ipfs.io/ipfs/QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR?arg=foo&bar=buzz#hash')
    })
    it('should be normalized if URI is fs://ipfs/{CID}', function () {
      const request = url2request('https://duckduckgo.com/?q=fs%3A%2F%2Fipfs%2FQmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR%3Farg%3Dfoo%26bar%3Dbuzz%23hash&ia=software')
      onBeforeRequest(request).redirectUrl.should.equal('https://ipfs.io/ipfs/QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR?arg=foo&bar=buzz#hash')
    })
    it('should be normalized if URI is fs:/ipns/{foo}', function () {
      const request = url2request('https://duckduckgo.com/?q=fs%3A%2F%2Fipns%2Fipfs.io%2Findex.html%3Farg%3Dfoo%26bar%3Dbuzz%23hash&ia=web')
      onBeforeRequest(request).redirectUrl.should.equal('https://ipfs.io/ipns/ipfs.io/index.html?arg=foo&bar=buzz#hash')
    })
    it('should be normalized if URI is fs://ipns/{foo}', function () {
      const request = url2request('https://duckduckgo.com/?q=fs%3A%2Fipns%2Fipfs.io%2Findex.html%3Farg%3Dfoo%26bar%3Dbuzz%23hash&ia=web')
      onBeforeRequest(request).redirectUrl.should.equal('https://ipfs.io/ipns/ipfs.io/index.html?arg=foo&bar=buzz#hash')
    })
    it('should be normalized if URI is dweb:/ipfs/{CID}', function () {
      const request = url2request('https://duckduckgo.com/?q=dweb%3A%2Fipfs%2FQmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR%3Farg%3Dfoo%26bar%3Dbuzz%23hash&ia=software')
      onBeforeRequest(request).redirectUrl.should.equal('https://ipfs.io/ipfs/QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR?arg=foo&bar=buzz#hash')
    })
    it('should be normalized if URI is dweb://ipfs/{CID}', function () {
      const request = url2request('https://duckduckgo.com/?q=dweb%3A%2F%2Fipfs%2FQmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR%3Farg%3Dfoo%26bar%3Dbuzz%23hash&ia=software')
      onBeforeRequest(request).redirectUrl.should.equal('https://ipfs.io/ipfs/QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR?arg=foo&bar=buzz#hash')
    })
    it('should be normalized if URI is dweb:/ipns/{foo}', function () {
      const request = url2request('https://duckduckgo.com/?q=dweb%3A%2F%2Fipns%2Fipfs.io%2Findex.html%3Farg%3Dfoo%26bar%3Dbuzz%23hash&ia=web')
      onBeforeRequest(request).redirectUrl.should.equal('https://ipfs.io/ipns/ipfs.io/index.html?arg=foo&bar=buzz#hash')
    })
    it('should be normalized if URI is dweb://ipns/{foo}', function () {
      const request = url2request('https://duckduckgo.com/?q=dweb%3A%2Fipns%2Fipfs.io%2Findex.html%3Farg%3Dfoo%26bar%3Dbuzz%23hash&ia=web')
      onBeforeRequest(request).redirectUrl.should.equal('https://ipfs.io/ipns/ipfs.io/index.html?arg=foo&bar=buzz#hash')
    })

    it('should be normalized if URI is web+ipfs:/{CID}', function () {
      const request = url2request('https://duckduckgo.com/?q=web%2Bipfs%3A%2FQmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR%3FargTest%23hashTest&foo=bar')
      onBeforeRequest(request).redirectUrl.should.equal('https://ipfs.io/ipfs/QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR?argTest#hashTest')
    })
    it('should be normalized if URI is web+ipfs://{CID}', function () {
      const request = url2request('https://duckduckgo.com/?q=web%2Bipfs%3A%2F%2FQmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR%3FargTest%23hashTest&foo=bar')
      onBeforeRequest(request).redirectUrl.should.equal('https://ipfs.io/ipfs/QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR?argTest#hashTest')
    })
    it('should be normalized if URI is web+ipns:/{foo}', function () {
      const request = url2request('https://duckduckgo.com/?q=web%2Bipns%3A%2Fipns.io%2Findex.html%3Farg%3Dfoo%26bar%3Dbuzz%23hashTest')
      onBeforeRequest(request).redirectUrl.should.equal('https://ipfs.io/ipns/ipns.io/index.html?arg=foo&bar=buzz#hashTest')
    })
    it('should be normalized if URI is web+ipns://{foo}', function () {
      const request = url2request('https://duckduckgo.com/?q=web%2Bipns%3A%2F%2Fipns.io%2Findex.html%3Farg%3Dfoo%26bar%3Dbuzz%23hashTest')
      onBeforeRequest(request).redirectUrl.should.equal('https://ipfs.io/ipns/ipns.io/index.html?arg=foo&bar=buzz#hashTest')
    })
    it('should be normalized if URI is web+fs:/ipfs/{CID}', function () {
      const request = url2request('https://duckduckgo.com/?q=web%2Bfs%3A%2Fipfs%2FQmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR%3Farg%3Dfoo%26bar%3Dbuzz%23hash&ia=software')
      onBeforeRequest(request).redirectUrl.should.equal('https://ipfs.io/ipfs/QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR?arg=foo&bar=buzz#hash')
    })
    it('should be normalized if URI is web+fs://ipfs/{CID}', function () {
      const request = url2request('https://duckduckgo.com/?q=web%2Bfs%3A%2F%2Fipfs%2FQmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR%3Farg%3Dfoo%26bar%3Dbuzz%23hash&ia=software')
      onBeforeRequest(request).redirectUrl.should.equal('https://ipfs.io/ipfs/QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR?arg=foo&bar=buzz#hash')
    })
    it('should be normalized if URI is web+fs:/ipns/{foo}', function () {
      const request = url2request('https://duckduckgo.com/?q=web%2Bfs%3A%2F%2Fipns%2Fipfs.io%2Findex.html%3Farg%3Dfoo%26bar%3Dbuzz%23hash&ia=web')
      onBeforeRequest(request).redirectUrl.should.equal('https://ipfs.io/ipns/ipfs.io/index.html?arg=foo&bar=buzz#hash')
    })
    it('should be normalized if URI is web+fs://ipns/{foo}', function () {
      const request = url2request('https://duckduckgo.com/?q=web%2Bfs%3A%2Fipns%2Fipfs.io%2Findex.html%3Farg%3Dfoo%26bar%3Dbuzz%23hash&ia=web')
      onBeforeRequest(request).redirectUrl.should.equal('https://ipfs.io/ipns/ipfs.io/index.html?arg=foo&bar=buzz#hash')
    })
    it('should be normalized if URI is web+dweb:/ipfs/{CID}', function () {
      const request = url2request('https://duckduckgo.com/?q=web%2Bdweb%3A%2Fipfs%2FQmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR%3Farg%3Dfoo%26bar%3Dbuzz%23hash&ia=software')
      onBeforeRequest(request).redirectUrl.should.equal('https://ipfs.io/ipfs/QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR?arg=foo&bar=buzz#hash')
    })
    it('should be normalized if URI is web+dweb://ipfs/{CID}', function () {
      const request = url2request('https://duckduckgo.com/?q=web%2Bdweb%3A%2F%2Fipfs%2FQmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR%3Farg%3Dfoo%26bar%3Dbuzz%23hash&ia=software')
      onBeforeRequest(request).redirectUrl.should.equal('https://ipfs.io/ipfs/QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR?arg=foo&bar=buzz#hash')
    })
    it('should be normalized if URI is web+dweb:/ipns/{foo}', function () {
      const request = url2request('https://duckduckgo.com/?q=web%2Bdweb%3A%2F%2Fipns%2Fipfs.io%2Findex.html%3Farg%3Dfoo%26bar%3Dbuzz%23hash&ia=web')
      onBeforeRequest(request).redirectUrl.should.equal('https://ipfs.io/ipns/ipfs.io/index.html?arg=foo&bar=buzz#hash')
    })
    it('should be normalized if URI is web+dweb://ipns/{foo}', function () {
      const request = url2request('https://duckduckgo.com/?q=web%2Bdweb%3A%2Fipns%2Fipfs.io%2Findex.html%3Farg%3Dfoo%26bar%3Dbuzz%23hash&ia=web')
      onBeforeRequest(request).redirectUrl.should.equal('https://ipfs.io/ipns/ipfs.io/index.html?arg=foo&bar=buzz#hash')
    })

    it('should not be normalized if disabled in Preferences', function () {
      state.catchUnhandledProtocols = false
      const request = url2request('https://duckduckgo.com/?q=ipfs%3A%2FQmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR%3FargTest%23hashTest&foo=bar')
      should.not.exist(onBeforeRequest(request))
    })
    it('should not be normalized if CID is invalid', function () {
      state.catchUnhandledProtocols = false
      const request = url2request('https://duckduckgo.com/?q=ipfs%3A%2FnotARealIpfsPathWithCid%3FargTest%23hashTest&foo=bar')
      should.not.exist(onBeforeRequest(request))
    })
    it('should not be normalized if presence of %3A%2F is a false-positive', function () {
      state.catchUnhandledProtocols = false
      const request = url2request('https://duckduckgo.com/?q=foo%3A%2Fbar%3FargTest%23hashTest&foo=bar')
      should.not.exist(onBeforeRequest(request))
    })
  })
})