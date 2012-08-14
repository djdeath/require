
/**
 * Module dependencies.
 */

var fs = require('fs')
  , vm = require('vm')
  , r = require('..')
  , read = fs.readFileSync;

function fixture(name) {
  return read('test/fixtures/' + name, 'utf8');
}

function eval(js, ctx) {
  ctx.console = console;
  return vm.runInNewContext(r + js + '\n', ctx);
}

describe('require.register(name, fn)', function(){
  it('should define a module', function(){
    var js = fixture('define.js');
    var ret = eval(js + 'require("foo")', {});
    ret.foo.should.equal('foo');
  })

  it('should support module.exports', function(){
    var js = fixture('define.js');
    var ret = eval(js + 'require("bar")', {});
    ret.should.equal('bar');
  })

  it('should support nested require()s', function(){
    var js = fixture('nested.js');
    var ret = eval(js + 'require("foo")', {});
    ret.bar.should.equal('baz');
    ret.baz.should.equal('baz');
  })

  it('should support index.js', function(){
    var js = fixture('index.js');
    var ret = eval(js + 'require("foo")', {});
    ret.bar.should.equal('baz');
    ret.baz.should.equal('baz');
  })

  it('should support ./deps', function(){
    var js = fixture('deps.js');
    var ret = eval(js + 'require("foo")', {});
    ret.should.equal('baz');
  })

  it('should report errors relative to the parent', function(done){
    try {
      var js = fixture('error.js');
      var ret = eval(js + 'require("foo")', {});
    } catch (err) {
      err.message.should.equal('failed to require "./baz" from "foo/bar"');
      done();
    }
  })

  it('should report dep errors relative to the parent', function(done){
    try {
      var js = fixture('deps-error.js');
      var ret = eval(js + 'require("foo")', {});
    } catch (err) {
      err.message.should.equal('failed to require "doesnt-exist" from "foo/deps/bar"');
      done();
    }
  })
})

describe('require.exists(name)', function(){
  it('should check if a module is defined', function(){
    var js = fixture('exists.js');
    var ret = eval(js + 'require("foo/bar")', {});
    ret.baz.should.be.true;
    ret.hey.should.be.false;
  })

  it('should work with ./deps', function(){
    var js = fixture('deps-exists.js');
    var ret = eval(js + 'require("foo")', {});
    ret.doesntExist.should.be.false;
    ret.baz.should.be.true;
  })
})
