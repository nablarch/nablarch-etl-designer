'use strict';

var expect = require('chai').expect;

var messageUtil = require('../../etl/renderer/util/MessageUtil');

describe('message util test', function () {
  describe('en test', function () {
    before(function () {
      messageUtil.setLocale('en');
    });
    it('message with no arguments', function () {
      expect('Details:').to.equal(messageUtil.getMessage('Details:'));
    });

    it('message with an argument', function () {
      expect('File: file name').to.equal(messageUtil.getMessage('File: {0}', ['file name']));
    });

    it('message with two arguments', function () {
      expect('File: first second').to.equal(messageUtil.getMessage('File: {0} {1}', ['first', 'second']));
    });
  });

  describe('ja test', function () {
    before(function () {
      messageUtil.setLocale('ja');
    });
    after(function () {
      messageUtil.setLocale('en');
    });
    it('message with no arguments', function () {
      expect('詳細:').to.equal(messageUtil.getMessage('Details:'));
    });

    it('message with an argument', function () {
      expect('ファイル: ファイル名').to.equal(messageUtil.getMessage('File: {0}', ['ファイル名']));
    });
  });
});