/**
 *
 * @copyright(c) 2017
 * @created by  shelwin
 * @package dbaas-ui
 * @version :  2017-04-05 18:04 $
 */

import 'babel-polyfill'
import expect from 'expect.js';
import { Cache } from '../src/utils/'

describe('utils.cache.localstorage', function() {
    it('get/put', function() {
        const cache = new Cache()
        cache.put('aa', { a: 'b' }, 1)
        expect(cache.get('aa')).to.eql({ a: 'b' })
    })

    it('expires', function(done) {
        const cache = new Cache()
        cache.put('aa', { a: 'b' }, 1/12)
        expect(cache.get('aa')).to.eql({ a: 'b' })

        console.log('waiting 5 seconds')
        setTimeout(()=>{
            console.log('waiting over.')
            expect(cache.get('aa')).to.eql('')
            done()
        }, 5000)
    })

    it('forget', function() {
        const cache = new Cache()
        cache.put('aa', { a: 'b' }, 1)
        cache.forget('aa')
        expect(cache.get('aa')).to.eql('')
    })

    it('has', function() {
        const cache = new Cache()
        cache.put('aa', { a: 'b' }, 1)

        expect(cache.has('aa')).to.eql(true)
        expect(cache.has('bb')).to.eql(false)
    })

    it('flush', function() {
        const cache = new Cache()
        cache.put('aa', { a: 'b' }, 1)
        cache.put('bb', { bb: 'cc' }, 1)

        cache.flush()

        expect(cache.has('aa')).to.eql(false)
        expect(cache.has('bb')).to.eql(false)
    })
});

