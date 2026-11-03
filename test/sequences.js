/**
 * rdf-array: RDFC-1.0 over sequences. rdf-tests-contrib's rdf/rdf-canon holds
 * the shared tests, which also check that results do not depend on labels;
 * these cover this API.
 */
const assert = require('node:assert');
const {canonize, _canonizeSync, NQuads} = require('..');

const options = {algorithm: 'RDFC-1.0'};
const S = '<http://example.org/s>';
const P = '<http://example.org/p>';

describe('sequences', () => {
  describe('N-Quads', () => {
    it('reads a sequence, nested and empty ones too', async () => {
      const [{object}] = NQuads.parse(`${S} ${P} ( _:x ( "a(b" ) () ) .\n`);
      assert.strictEqual(object.termType, 'Sequence');
      assert.deepStrictEqual(
        object.elements.map(element => element.termType),
        ['BlankNode', 'Sequence', 'Sequence']);
      assert.strictEqual(object.value, '(_:x ("a(b") ())');
    });
    it('writes one space between elements', async () => {
      const dataset = NQuads.parse(
        `${S} ${P} ( "a"  ( _:x ) ) <http://example.org/g> .\n`);
      assert.strictEqual(
        NQuads.serialize(dataset),
        `${S} ${P} ("a" (_:x)) <http://example.org/g> .\n`);
    });
    it('reads a sequence as a subject', async () => {
      assert.strictEqual(
        NQuads.parse(`("a") ${P} "b" .\n`)[0].subject.termType, 'Sequence');
    });
    it('drops a duplicate quad', async () => {
      assert.strictEqual(
        NQuads.parse(`${S} ${P} (_:x) .\n${S} ${P} ( _:x ) .\n`).length, 1);
    });
    for(const bad of [
      `${S} ${P} ("a" .`, `${S} ${P} "a") .`, `${S} ("a") "b" .`,
      `${S} ${P} ("a")`, `${S} ${P} ("a") ("b") .`, `"a" ${P} ("b") .`
    ]) {
      it(`refuses ${bad}`, async () => {
        assert.throws(
          () => NQuads.parse(`${bad}\n`), /N-Quads parse error on line 1/);
      });
    }
  });

  describe('canonize', () => {
    const input = `_:s ${P} (_:x (_:y) "a") _:g .\n(_:y) ${P} _:x .\n`;
    const expected = [
      `(_:c14n0) ${P} _:c14n2 .`,
      `_:c14n1 ${P} (_:c14n2 (_:c14n0) "a") _:c14n3 .`
    ];
    it('relabels blank nodes inside sequences', async () => {
      const actual = await canonize(NQuads.parse(input), options);
      assert.strictEqual(actual, expected.join('\n') + '\n');
    });
    it('gives the same in the synchronous algorithm', async () => {
      assert.strictEqual(
        _canonizeSync(NQuads.parse(input), options),
        await canonize(NQuads.parse(input), options));
    });
    it('takes a dataset of terms and a canonical id map', async () => {
      const canonicalIdMap = new Map();
      await canonize(NQuads.parse(input), {...options, canonicalIdMap});
      assert.deepStrictEqual(
        [...canonicalIdMap.keys()].sort(), ['g', 's', 'x', 'y']);
    });
    it('leaves a dataset without sequences as RDFC-1.0 has it', async () => {
      assert.strictEqual(
        await canonize(NQuads.parse(`_:x ${P} _:y .\n`), options),
        `_:c14n1 ${P} _:c14n0 .\n`);
    });
  });
});
