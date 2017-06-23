/* globals it describe */
import utils from '../lib/utils';
import { expect } from 'chai';
const compareAttributes = utils.compareAttributes;
const mapAttributes = utils.mapAttributes;

describe('compareAttributes', () => {

  it('should return an empty array if all attributes match', () => {
    expect(compareAttributes(
      {local1: 'e1', local2: 'e2', same: 'same'},
      {local1: 1, local2: 'b', same: 'c'},
      {e1: 1, e2: 'b', same: 'c'},
    )).to.be.empty;
  });

  it('should return an array of mismatched attributes', () => {
    expect(compareAttributes(
      {local1: 'e1', local2: 'e2', same: 'same'},
      {local1: 1, local2: 'b', same: 'c'},
      {e1: 9, e2: 'b', same: 'c'},
    )).to.eql(['local1']);
  });

  it('should return an array of missing remote attributes', () => {
    expect(compareAttributes(
      {local1: 'e1', local2: 'e2', same: 'same'},
      {local1: 1, local2: 'b', same: 'c'},
      {e1: 1,  same: 'c'},
    )).to.eql(['local2']);
  });

  it('should return an array of missing local attributes', () => {
    expect(compareAttributes(
      {local1: 'e1', local2: 'e2', same: 'same'},
      {local1: 1, same: 'c'},
      {e1: 1,  e2: 'b', same: 'c'},
    )).to.eql(['local2']);
  });

  it('should return an array of multiple mismatched attributes', () => {
    expect(compareAttributes(
      {local1: 'e1', local2: 'e2', same: 'same'},
      {local1: 'zz', local2: 'b', same: 'zz'},
      {e1: 1,  e2: 'b', same: 'c'},
    )).to.eql(['local1', 'same']);
  });

  it('should return an array of multiple mismatched attributes ignoring other attributes', () => {
    expect(compareAttributes(
      { name: 'external_name',
        zip: 'external_zip',
        magic_number: 'magic_number'},
      { id: 1,
        name: 'Company',
        zip: '98117',
        external_id: '1',
        magic_number: 40,
        createdAt: new Date(),
        updatedAt: new Date()},
      { external_name: 'CompanyNameUpdated',
        external_zip: '98117',
        magic_number: 40 }
    )).to.eql(['name']);
  });

  it('should throw an error if no attribute map is passed', () => {
    try { expect(compareAttributes({}, {}, {})).to.throw(); } catch (err) {}
    try { expect(compareAttributes(null, {}, {})).to.throw(); } catch (err) {}
  });

});

describe('mapAttributes', () => {

  it('should return an array of all mapped attributes', () => {
    expect(mapAttributes(
      {local1: 'e1', local2: 'e2', same: 'same'},
      {local1: 1, local2: 'b', same: 'c', unused: 'foo'}
    )).to.eql({
      e1: 1,
      e2: 'b',
      same: 'c',
    });
  });

  it('should throw an error if no attribute map is passed', () => {
    try { expect(mapAttributes({}, {})).to.throw(); } catch (err) {}
    try { expect(mapAttributes(null, {})).to.throw(); } catch (err) {}
  });

});
